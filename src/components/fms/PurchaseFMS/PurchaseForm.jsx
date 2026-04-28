import { useState } from 'react';
import { getPurchaseStage } from '../../../utils/purchaseDb';
import ImagePickerCrop from './ImagePickerCrop';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}
function fmtDelay(hours) {
  if (!hours || hours <= 0) return null;
  const days = (hours / 9).toFixed(1);
  return `${days} day(s) late`;
}

/* ─── Shared UI Atoms ─────────────────────────────────────────────────────── */
const Label = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-600 mb-1">
    {children}{required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50
               text-sm text-gray-900 placeholder-gray-300
               outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-400
               transition-all"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50
               text-sm text-gray-900
               outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-400
               transition-all"
  >
    {children}
  </select>
);

const Textarea = (props) => (
  <textarea
    {...props}
    rows={2}
    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50
               text-sm text-gray-900 placeholder-gray-300 resize-none
               outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-400
               transition-all"
  />
);

/* ─── History Card — completed stage summary ──────────────────────────────── */
function CompletedStageCard({ stepNum, title, color, children }) {
  return (
    <div className={`rounded-2xl border p-3.5 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-full bg-white/80 flex items-center justify-center text-[10px] font-black text-gray-600">
          {stepNum}
        </span>
        <span className="text-xs font-bold text-gray-700">{title}</span>
        <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Done ✓</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-600">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <>
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-gray-700 truncate">{value || '—'}</span>
    </>
  );
}

/* ─── Step Forms ──────────────────────────────────────────────────────────── */
function Step1Form({ form, setForm }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label required>Fabric Name</Label>
          <Input
            placeholder="e.g. लाईकरा, रिप चेकस..."
            value={form.fabricName}
            onChange={e => setForm(f => ({ ...f, fabricName: e.target.value }))}
          />
        </div>
        <div>
          <Label>Fabric Quantity</Label>
          <Input
            type="number"
            placeholder="0"
            value={form.fabricQuantity}
            onChange={e => setForm(f => ({ ...f, fabricQuantity: e.target.value }))}
          />
        </div>
        <div>
          <Label>Unit</Label>
          <Select
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
          >
            <option value="">Select unit</option>
            <option value="Meter">Meter</option>
            <option value="Kilo">Kilo</option>
            <option value="Piece">Piece</option>
          </Select>
        </div>
        <div className="col-span-2">
          <Label required>Required Item</Label>
          <Input
            placeholder="What is needed?"
            value={form.requiredItem}
            onChange={e => setForm(f => ({ ...f, requiredItem: e.target.value }))}
          />
        </div>

        {/* ── Fabric Photo (upload + camera + crop) ── */}
        <div className="col-span-2">
          <Label>Fabric Photo</Label>
          <ImagePickerCrop
            previewUrl={null}
            file={form.fabricPhotoFile}
            preview={form.fabricPhotoPreview}
            onChange={(file, previewUrl) =>
              setForm(f => ({ ...f, fabricPhotoFile: file, fabricPhotoPreview: previewUrl }))
            }
            onClear={() => {
              if (form.fabricPhotoPreview) URL.revokeObjectURL(form.fabricPhotoPreview);
              setForm(f => ({ ...f, fabricPhotoFile: null, fabricPhotoPreview: null }));
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Step2Form({ form, setForm, item }) {
  return (
    <div className="space-y-3">
      {/* Planned info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
        <span className="text-amber-500 text-sm">📅</span>
        <span className="text-xs text-amber-700">
          <span className="font-bold">Planned By:</span> {fmtDate(item?.s2PlannedAt)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Order Status</Label>
          <Select
            value={form.orderStatus}
            onChange={e => setForm(f => ({ ...f, orderStatus: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="Yes">Yes — Ordered</option>
            <option value="No">No — Not Ordered</option>
            <option value="Partial">Partial</option>
          </Select>
        </div>
        <div>
          <Label required>Lead Time (days)</Label>
          <Input
            type="number"
            placeholder="e.g. 7"
            value={form.leadTimeDays}
            onChange={e => setForm(f => ({ ...f, leadTimeDays: e.target.value }))}
          />
        </div>
        <div>
          <Label>Agent Name</Label>
          <Input
            placeholder="Agent / Vendor"
            value={form.agentName}
            onChange={e => setForm(f => ({ ...f, agentName: e.target.value }))}
          />
        </div>
        <div>
          <Label>Rate (₹)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={form.rate}
            onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
          />
        </div>
        <div>
          <Label>Discount %</Label>
          <Input
            type="number"
            placeholder="0"
            value={form.discountPercent}
            onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <Label>Remark</Label>
          <Textarea
            placeholder="Any notes..."
            value={form.remark}
            onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}

function Step3Form({ form, setForm, item }) {
  return (
    <div className="space-y-3">
      {/* Planned info from lead time */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
        <span className="text-blue-500 text-sm">📅</span>
        <span className="text-xs text-blue-700">
          <span className="font-bold">Expected Arrival:</span> {fmtDate(item?.s3PlannedAt)}
          {item?.leadTimeDays && <span className="ml-1 text-blue-500">(Lead: {item.leadTimeDays}d)</span>}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>GI Status</Label>
          <Select
            value={form.giStatus}
            onChange={e => setForm(f => ({ ...f, giStatus: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="Received">Received</option>
            <option value="Partial">Partial Receipt</option>
            <option value="Pending">Still Pending</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </div>
        <div>
          <Label>Received Quantity</Label>
          <Input
            type="number"
            placeholder="0"
            value={form.giQuantity}
            onChange={e => setForm(f => ({ ...f, giQuantity: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <Label>Maal Aa Gaya?</Label>
          <div className="flex gap-3 mt-1">
            {[true, false].map(val => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setForm(f => ({ ...f, maalAaGaya: val }))}
                className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all
                            ${form.maalAaGaya === val
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                {val ? '✅ हाँ (Yes)' : '❌ नहीं (No)'}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <Label>GI Remark</Label>
          <Textarea
            placeholder="Condition, quality notes..."
            value={form.giRemark}
            onChange={e => setForm(f => ({ ...f, giRemark: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}

function Step4Form({ form, setForm, item }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-100 rounded-xl">
        <span className="text-violet-500 text-sm">📅</span>
        <span className="text-xs text-violet-700">
          <span className="font-bold">Follow-Up Planned:</span> {fmtDate(item?.s4PlannedAt)}
        </span>
      </div>

      <div>
        <Label required>Order Follow-Up Status</Label>
        <Select
          value={form.followUpStatus}
          onChange={e => setForm(f => ({ ...f, followUpStatus: e.target.value }))}
        >
          <option value="">Select</option>
          <option value="Done">Done — Closed</option>
          <option value="Pending">Pending</option>
          <option value="Issue Raised">Issue Raised</option>
        </Select>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Mark this follow-up to close the procurement cycle for this requirement.
      </p>
    </div>
  );
}

/* ─── Main PurchaseForm Modal ─────────────────────────────────────────────── */
export default function PurchaseForm({ item, onClose, onSubmit, isSubmitting }) {
  const stage = item ? getPurchaseStage(item) : 1;

  // Determine which step form to show
  const activeStep = item ? stage : 1;

  const [form, setForm] = useState({
    // Step 1
    fabricName: '',
    fabricQuantity: '',
    fabricPhotoFile: null,     // File object from input
    fabricPhotoPreview: null,  // local blob URL for preview
    requiredItem: '',
    unit: '',
    // Step 2
    orderStatus: '',
    leadTimeDays: '',
    remark: '',
    agentName: '',
    rate: '',
    discountPercent: '',
    // Step 3
    giStatus: '',
    giRemark: '',
    maalAaGaya: null,
    giQuantity: '',
    // Step 4
    followUpStatus: '',
  });

  const STEP_CONFIG = [
    { num: 1, label: 'Requirement',    color: 'bg-gray-50 border-gray-200',     icon: '📋' },
    { num: 2, label: 'Order Done',     color: 'bg-amber-50 border-amber-200',   icon: '🛒' },
    { num: 3, label: 'Goods Inward',   color: 'bg-blue-50 border-blue-200',     icon: '📦' },
    { num: 4, label: 'Party Follow-Up',color: 'bg-violet-50 border-violet-200', icon: '📞' },
  ];

  const isNew = !item;
  const isComplete = stage === 5;

  const modalTitle = isNew
    ? 'New Requirement'
    : isComplete
    ? `Req #${item.requirementNumber} — Complete`
    : `Req #${item?.requirementNumber} — ${STEP_CONFIG.find(s => s.num === activeStep)?.label}`;

  function handleSubmit(e) {
    e.preventDefault();
    if (isNew) {
      // Pass the File object — purchaseDb will upload it
      onSubmit({
        fabricName: form.fabricName,
        fabricQuantity: form.fabricQuantity,
        fabricPhotoFile: form.fabricPhotoFile,
        requiredItem: form.requiredItem,
        unit: form.unit,
      });
    } else if (activeStep === 2) {
      onSubmit({ id: item.id, orderStatus: form.orderStatus, leadTimeDays: form.leadTimeDays, remark: form.remark, agentName: form.agentName, rate: form.rate, discountPercent: form.discountPercent });
    } else if (activeStep === 3) {
      onSubmit({ id: item.id, giStatus: form.giStatus, giRemark: form.giRemark, maalAaGaya: form.maalAaGaya, giQuantity: form.giQuantity });
    } else if (activeStep === 4) {
      onSubmit({ id: item.id, followUpStatus: form.followUpStatus });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl
                      shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-gray-900 truncate">{modalTitle}</h3>
            {item?.fabricName && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.fabricName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center
                       hover:bg-gray-200 transition-colors text-gray-500 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        {item && (
          <div className="flex items-center gap-1 px-5 py-3 border-b border-gray-50">
            {STEP_CONFIG.map((s, i) => {
              const done  = stage > s.num || isComplete;
              const active = !isComplete && stage === s.num;
              return (
                <div key={s.num} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black transition-all
                    ${done   ? 'bg-emerald-500 text-white'
                    : active ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                    :          'bg-gray-100 text-gray-400'}`}>
                    {done ? '✓' : s.num}
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all
                      ${done ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-3">

            {/* ── Completed steps history (when viewing existing item) ── */}
            {item && stage >= 3 && (
              <CompletedStageCard stepNum={2} title="Order Done" color="bg-emerald-50 border-emerald-100">
                <InfoRow label="Status"  value={item.orderStatus} />
                <InfoRow label="Agent"   value={item.agentName} />
                <InfoRow label="Rate"    value={item.rate ? `₹${item.rate}` : null} />
                <InfoRow label="Lead"    value={item.leadTimeDays ? `${item.leadTimeDays} days` : null} />
                <InfoRow label="Done on" value={fmtDate(item.s2ActualAt)} />
                {item.s2DelayHours > 0 && (
                  <><span className="text-red-400">Delay:</span><span className="text-red-600 font-medium">{fmtDelay(item.s2DelayHours)}</span></>
                )}
              </CompletedStageCard>
            )}
            {item && stage >= 4 && (
              <CompletedStageCard stepNum={3} title="Goods Inward" color="bg-blue-50 border-blue-100">
                <InfoRow label="Status"   value={item.giStatus} />
                <InfoRow label="Qty"      value={item.giQuantity ? `${item.giQuantity} ${item.unit || ''}` : null} />
                <InfoRow label="Maal"     value={item.maalAaGaya ? 'हाँ ✅' : 'नहीं ❌'} />
                <InfoRow label="Done on"  value={fmtDate(item.s3ActualAt)} />
                {item.s3DelayHours > 0 && (
                  <><span className="text-red-400">Delay:</span><span className="text-red-600 font-medium">{fmtDelay(item.s3DelayHours)}</span></>
                )}
              </CompletedStageCard>
            )}

            {/* ── Active / Completed Stage Form ── */}
            {isNew && <Step1Form form={form} setForm={setForm} />}
            {!isNew && activeStep === 2 && <Step2Form form={form} setForm={setForm} item={item} />}
            {!isNew && activeStep === 3 && <Step3Form form={form} setForm={setForm} item={item} />}
            {!isNew && activeStep === 4 && <Step4Form form={form} setForm={setForm} item={item} />}

            {/* ── Completed view ── */}
            {isComplete && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm font-bold text-emerald-700">All stages complete!</p>
                <p className="text-xs text-emerald-500 mt-1">
                  Follow-up done on {fmtDate(item.s4ActualAt)}
                </p>
                {item.s4DelayHours > 0 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ {fmtDelay(item.s4DelayHours)}</p>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        {!isComplete && (
          <div className="px-5 py-4 border-t border-gray-100 bg-white">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold
                         shadow-lg shadow-emerald-600/20 hover:bg-emerald-700
                         hover:-translate-y-0.5 active:translate-y-0
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : isNew ? (
                '+ Create Requirement'
              ) : activeStep === 2 ? (
                '✓ Confirm Order Done'
              ) : activeStep === 3 ? (
                '✓ Mark Goods Inward'
              ) : (
                '✓ Close Follow-Up'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

