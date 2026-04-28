import { supabase } from './supabase';
import { addWorkingHours, calcDelay } from './workingHours';

/** Serialize a Date (or null) to an ISO string for Supabase. */
function toISO(d) {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

/** Helper to convert snake_case DB columns to camelCase JS properties */
function snakeToCamel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v ?? '';
  }
  return out;
}

// ─── 1. Get all Bilty entries ────────────────────────────────────────────────
export async function getBiltyEntries() {
  const { data, error } = await supabase
    .from('bilty_fms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getBiltyEntries: ${error.message}`);
  return (data ?? []).map(snakeToCamel);
}

// ─── 2. Create new entry — Step 1: Parcel Dispatch ───────────────────────────
export async function createBiltyEntry({ dispatcherName, transport, parcelCount, parcelBearerName }) {
  const dispatchTimestamp = new Date();
  
  // Step 2 Planned = Step 1 + 18 working hours (2 working days)
  const receivingPlannedAt = addWorkingHours(dispatchTimestamp, 18);

  const { data, error } = await supabase
    .from('bilty_fms')
    .insert({
      dispatcher_name: dispatcherName,
      transport,
      parcel_count: Number(parcelCount) || 1,
      parcel_bearer_name: parcelBearerName,
      dispatch_timestamp: toISO(dispatchTimestamp),
      receiving_planned_at: toISO(receivingPlannedAt),
      receiving_status: 'Pending'
    })
    .select()
    .single();

  if (error) throw new Error(`createBiltyEntry: ${error.message}`);
  return snakeToCamel(data);
}

// ─── 3. Update Step 2 — Bilty Receiving ──────────────────────────────────────
export async function updateBiltyStep2(id, { status, remark }) {
  const { data: existing } = await supabase
    .from('bilty_fms')
    .select('receiving_planned_at')
    .eq('id', id)
    .single();

  const receivingActualAt = new Date();
  const receivingPlannedAt = existing?.receiving_planned_at;
  const delay = calcDelay(receivingPlannedAt, receivingActualAt);

  // Step 3 Planned = Step 2 Actual + 6 working hours
  const photoSendPlannedAt = addWorkingHours(receivingActualAt, 6);

  const { error } = await supabase
    .from('bilty_fms')
    .update({
      receiving_status: status || 'Received',
      receiving_remark: remark || null,
      receiving_actual_at: toISO(receivingActualAt),
      receiving_delay_hours: delay > 0 ? delay : null,
      photo_send_planned_at: toISO(photoSendPlannedAt),
      photo_send_status: 'Pending'
    })
    .eq('id', id);

  if (error) throw new Error(`updateBiltyStep2: ${error.message}`);
}

// ─── 4. Update Step 3 — Bilty & Bill Photo Send ─────────────────────────────
export async function updateBiltyStep3(id, { status, biltyNumber, photoUrl, remark }) {
  const { data: existing } = await supabase
    .from('bilty_fms')
    .select('photo_send_planned_at')
    .eq('id', id)
    .single();

  const photoSendActualAt = new Date();
  const photoSendPlannedAt = existing?.photo_send_planned_at;
  const delay = calcDelay(photoSendPlannedAt, photoSendActualAt);

  // Step 4 Planned = Step 3 Actual + 4 working hours
  const deliveryPlannedAt = addWorkingHours(photoSendActualAt, 4);

  const { error } = await supabase
    .from('bilty_fms')
    .update({
      photo_send_status: status || 'Sent',
      bilty_number: biltyNumber,
      photo_url: photoUrl,
      photo_send_remark: remark || null,
      photo_send_actual_at: toISO(photoSendActualAt),
      photo_send_delay_hours: delay > 0 ? delay : null,
      delivery_planned_at: toISO(deliveryPlannedAt),
      delivery_status: 'Pending'
    })
    .eq('id', id);

  if (error) throw new Error(`updateBiltyStep3: ${error.message}`);
}

// ─── 5. Update Step 4 — Bilty Delivered ─────────────────────────────────────
export async function updateBiltyStep4(id, { status, remark }) {
  const { data: existing } = await supabase
    .from('bilty_fms')
    .select('delivery_planned_at')
    .eq('id', id)
    .single();

  const deliveryActualAt = new Date();
  const deliveryPlannedAt = existing?.delivery_planned_at;
  const delay = calcDelay(deliveryPlannedAt, deliveryActualAt);

  const { error } = await supabase
    .from('bilty_fms')
    .update({
      delivery_status: status || 'Delivered',
      delivery_remark: remark || null,
      delivery_actual_at: toISO(deliveryActualAt),
      delivery_delay_hours: delay > 0 ? delay : null
    })
    .eq('id', id);

  if (error) throw new Error(`updateBiltyStep4: ${error.message}`);
}
