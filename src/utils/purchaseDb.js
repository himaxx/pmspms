import { supabase } from './supabase';
import { addWorkingHours, calcDelay } from './workingHours';

// ─── Storage helpers ─────────────────────────────────────────────────────────
const BUCKET = 'purchase-images';

/**
 * Upload a fabric photo File to Supabase storage.
 * Returns the public URL string, or null on failure.
 */
export async function uploadPurchaseImage(file) {
  if (!file) return null;
  const ext = file.name.split('.').pop();
  const path = `fabrics/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(`uploadPurchaseImage: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

/** Serialize a Date (or null) to ISO string for Supabase */
function toISO(d) {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

/** Add calendar days (not working days) — used for lead-time GI planned date */
function addCalendarDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days || 0));
  return result;
}

/** snake_case → camelCase row mapper */
function snakeToCamel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v ?? null;
  }
  return out;
}

/**
 * Derive the current active stage for a Purchase FMS entry.
 * Works for both legacy data (status strings only) and new data (timestamps).
 *  2 → Order Done pending
 *  3 → Goods Inward pending
 *  4 → Party Follow-Up pending
 *  5 → Complete
 */
export function getPurchaseStage(item) {
  const hasStep2 = item.s2ActualAt || item.orderStatus;
  const hasStep3 = item.s3ActualAt || item.giStatus;
  const hasStep4 = item.s4ActualAt || item.followUpStatus;
  if (!hasStep2) return 2;
  if (!hasStep3) return 3;
  if (!hasStep4) return 4;
  return 5;
}

// ─── 1. Fetch all entries ────────────────────────────────────────────────────
export async function getPurchaseEntries() {
  const { data, error } = await supabase
    .from('purchase_fms')
    .select('*')
    .order('requirement_number', { ascending: false });

  if (error) throw new Error(`getPurchaseEntries: ${error.message}`);
  return (data ?? []).map(snakeToCamel);
}

// ─── 2. Get next requirement number ─────────────────────────────────────────
export async function getNextRequirementNumber() {
  const { data, error } = await supabase
    .from('purchase_fms')
    .select('requirement_number')
    .order('requirement_number', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`getNextRequirementNumber: ${error.message}`);
  }
  return (data?.requirement_number ?? 0) + 1;
}

// ─── 3. Create Step 1 — Requirement ──────────────────────────────────────────
/**
 * @param {{ fabricName, fabricQuantity, fabricPhotoFile, requiredItem, unit }} payload
 * fabricPhotoFile is a File object (from <input type="file">)
 */
export async function createPurchaseEntry({ fabricName, fabricQuantity, fabricPhotoFile, requiredItem, unit }) {
  const reqTimestamp = new Date();
  // TAT for Step 2 = 1 working day = 9 working hours
  const s2PlannedAt = addWorkingHours(reqTimestamp, 9);
  const requirementNumber = await getNextRequirementNumber();

  // Upload image first if provided
  const fabricPhotoUrl = fabricPhotoFile
    ? await uploadPurchaseImage(fabricPhotoFile)
    : null;

  const { data, error } = await supabase
    .from('purchase_fms')
    .insert({
      requirement_number: requirementNumber,
      fabric_name: fabricName || null,
      fabric_quantity: fabricQuantity ? Number(fabricQuantity) : null,
      fabric_photo_url: fabricPhotoUrl || null,
      required_item: requiredItem || null,
      unit: unit || null,
      req_timestamp: toISO(reqTimestamp),
      s2_planned_at: toISO(s2PlannedAt),
    })
    .select()
    .single();

  if (error) throw new Error(`createPurchaseEntry: ${error.message}`);
  return snakeToCamel(data);
}

// ─── 4. Update Step 2 — Order Done ───────────────────────────────────────────
export async function updatePurchaseStep2(id, { orderStatus, leadTimeDays, remark, agentName, rate, discountPercent }) {
  const { data: existing } = await supabase
    .from('purchase_fms')
    .select('s2_planned_at')
    .eq('id', id)
    .single();

  const s2ActualAt = new Date();
  const s2PlannedAt = existing?.s2_planned_at;
  const delay = calcDelay(s2PlannedAt, s2ActualAt);

  // Step 3 Planned = s2_actual + lead_time_days calendar days
  const s3PlannedAt = addCalendarDays(s2ActualAt, Number(leadTimeDays) || 7);

  const { error } = await supabase
    .from('purchase_fms')
    .update({
      order_status: orderStatus || 'Yes',
      lead_time_days: Number(leadTimeDays) || null,
      remark: remark || null,
      agent_name: agentName || null,
      rate: rate ? Number(rate) : null,
      discount_percent: discountPercent ? Number(discountPercent) : null,
      s2_actual_at: toISO(s2ActualAt),
      s2_delay_hours: delay > 0 ? delay : null,
      s3_planned_at: toISO(s3PlannedAt),
    })
    .eq('id', id);

  if (error) throw new Error(`updatePurchaseStep2: ${error.message}`);
}

// ─── 5. Update Step 3 — Goods Inward ─────────────────────────────────────────
export async function updatePurchaseStep3(id, { giStatus, giRemark, maalAaGaya, giQuantity }) {
  const { data: existing } = await supabase
    .from('purchase_fms')
    .select('s3_planned_at')
    .eq('id', id)
    .single();

  const s3ActualAt = new Date();
  const s3PlannedAt = existing?.s3_planned_at;
  const delay = calcDelay(s3PlannedAt, s3ActualAt);

  // Step 4 Planned = s3_actual + 1 working day = 9 working hours
  const s4PlannedAt = addWorkingHours(s3ActualAt, 9);

  const { error } = await supabase
    .from('purchase_fms')
    .update({
      gi_status: giStatus || 'Received',
      gi_remark: giRemark || null,
      maal_aa_gaya: maalAaGaya ?? true,
      gi_quantity: giQuantity ? Number(giQuantity) : null,
      s3_actual_at: toISO(s3ActualAt),
      s3_delay_hours: delay > 0 ? delay : null,
      s4_planned_at: toISO(s4PlannedAt),
    })
    .eq('id', id);

  if (error) throw new Error(`updatePurchaseStep3: ${error.message}`);
}

// ─── 6. Update Step 4 — Party Follow-Up ──────────────────────────────────────
export async function updatePurchaseStep4(id, { followUpStatus }) {
  const { data: existing } = await supabase
    .from('purchase_fms')
    .select('s4_planned_at')
    .eq('id', id)
    .single();

  const s4ActualAt = new Date();
  const s4PlannedAt = existing?.s4_planned_at;
  const delay = calcDelay(s4PlannedAt, s4ActualAt);

  const { error } = await supabase
    .from('purchase_fms')
    .update({
      follow_up_status: followUpStatus || 'Done',
      s4_actual_at: toISO(s4ActualAt),
      s4_delay_hours: delay > 0 ? delay : null,
    })
    .eq('id', id);

  if (error) throw new Error(`updatePurchaseStep4: ${error.message}`);
}
