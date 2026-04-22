import { useState, useMemo, useRef } from 'react';
import { parseSets, formatSets } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { STEP_PEOPLE, STEP_LABELS, ITEM_GROUPS, SHEET_NAMES } from '../utils/constants';
import { getJobFromFMS } from '../utils/db';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeleton';
import StepBadge from '../components/StepBadge';
import { getPendingStep as detectStep } from '../utils/jobLogic';
import { useJobs, useCreateJob, useUpdateStep2, useUpdateStep3, useUpdateStep4, useUpdateStep5, useUpdateStep6 } from '../hooks/useJobs';
// ─── Step Selector Config ─────────────────────────────────────────────────────
const STEP_META = [
  { step: 1, hindiName: 'नई आवश्यकता',        englishName: 'New Requirement',       color: 'indigo' },
  { step: 2, hindiName: 'प्रोडक्शन अप्रूवल',  englishName: 'Production Approval',   color: 'blue'   },
  { step: 3, hindiName: 'इनहाउस कटिंग',       englishName: 'Inhouse Cutting',       color: 'orange' },
  { step: 4, hindiName: 'नामे',                englishName: 'Naame — On Production', color: 'purple' },
  { step: 5, hindiName: 'माल जमा',            englishName: 'Finished Maal Jama',    color: 'green'  },
  { step: 6, hindiName: 'सेटल',               englishName: 'Settle',                color: 'gray'   },
];

const CARD_COLORS = {
  indigo: 'border-indigo-100 bg-indigo-50  hover:bg-indigo-100',
  blue:   'border-blue-100   bg-blue-50    hover:bg-blue-100',
  orange: 'border-orange-100 bg-orange-50  hover:bg-orange-100',
  purple: 'border-purple-100 bg-purple-50  hover:bg-purple-100',
  green:  'border-green-100  bg-green-50   hover:bg-green-100',
  gray:   'border-gray-200   bg-gray-50    hover:bg-gray-100',
};
const NUM_COLORS = {
  indigo: 'text-indigo-400', blue: 'text-blue-400', orange: 'text-orange-400',
  purple: 'text-purple-400', green: 'text-green-400', gray: 'text-gray-300',
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
function nowISO() { return new Date().toISOString(); }

function cls(...parts) { return parts.filter(Boolean).join(' '); }

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function InputBase({ error, className, ...props }) {
  return (
    <input
      className={cls(
        'w-full rounded-xl border px-4 py-3 text-base text-gray-900 bg-white',
        'placeholder:text-gray-400 outline-none transition-shadow',
        'focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400 input-error' : 'border-gray-200',
        className
      )}
      {...props}
    />
  );
}

function SelectBase({ error, children, className, ...props }) {
  return (
    <select
      className={cls(
        'w-full rounded-xl border px-4 py-3 text-base text-gray-900 bg-white',
        'outline-none transition-shadow appearance-none',
        'focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400 input-error' : 'border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

function TextAreaBase({ error, className, ...props }) {
  return (
    <textarea
      className={cls(
        'w-full rounded-xl border px-4 py-3 text-base text-gray-900 bg-white',
        'placeholder:text-gray-400 outline-none transition-shadow resize-none',
        'focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400 input-error' : 'border-gray-200',
        className
      )}
      {...props}
    />
  );
}

function YesNoToggle({ value, onChange, yesLabel = 'Yes', noLabel = 'No' }) {
  return (
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={cls(
            'flex-1 py-3 rounded-xl text-sm font-semibold border-2 btn-press transition-colors duration-150',
            value === v
              ? (v ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white')
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
          )}
        >
          {v ? yesLabel : noLabel}
        </button>
      ))}
    </div>
  );
}

function SubmitButton({ loading, label = 'Submit Entry' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r
                 from-indigo-600 to-blue-500 shadow-lg shadow-indigo-200
                 hover:from-indigo-700 hover:to-blue-600
                 disabled:opacity-60 disabled:cursor-not-allowed btn-press transition-all"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Submitting…
        </span>
      ) : label}
    </button>
  );
}

function FormSection({ title }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ jobNo, item, onNewEntry, onHome }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-6 anim-slideUp text-center">
      {/* Animated checkmark */}
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center
                      ring-8 ring-green-50"
           style={{ animation: 'slideUp 400ms cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <svg className="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Entry Submitted!</h2>
        {(jobNo || item) && (
          <p className="text-gray-500 mt-1.5 text-sm">
            {jobNo && <span className="font-semibold text-gray-700">Job #{jobNo}</span>}
            {jobNo && item && ' · '}
            {item && <span>{item}</span>}
          </p>
        )}
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onNewEntry}
          className="flex-1 py-3.5 rounded-2xl border-2 border-indigo-200 text-indigo-600
                     font-bold text-sm hover:bg-indigo-50 btn-press transition-colors"
        >
          New Entry
        </button>
        <button
          onClick={onHome}
          className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm
                     hover:bg-indigo-700 btn-press transition-colors shadow-md shadow-indigo-200"
        >
          Home
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function PendingJobCard({ job, onClick }) {
  return (
    <button type="button" onClick={() => onClick(job)}
      className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-sm 
                 hover:border-indigo-300 btn-press transition-all flex justify-between items-center group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">#{job.jobNo}</span>
          <span className="text-xs font-bold text-gray-900 truncate">{job.item}</span>
        </div>
        <div className="text-[10px] text-gray-400 font-semibold mt-1 flex gap-2">
          <span>{job.size}</span><span>·</span><span>{job.qty} pcs</span>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
      </div>
    </button>
  );
}

// ─── Step 1 Form ─────────────────────────────────────────────────────────────
function Step1Form({ onSuccess }) {
  const init = { name: '', item: '', itemGroup: '', reason: 'Order', specialInstruction: '' };
  const [form, setForm]     = useState(init);
  const [sets, setSets]     = useState([{ size: '', qty: '' }]);
  const [errors, setErrors] = useState({});

  // Read existing item names directly from the shared jobs cache — no extra fetch
  const { data: allJobs = [] } = useJobs();
  const existingItems = useMemo(() => {
    return [...new Set(allJobs.map(j => j.item).filter(Boolean))];
  }, [allJobs]);

  const createJobMutation = useCreateJob();
  const loading = createJobMutation.isPending;

  const set    = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setRaw = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addSet = () => { if (sets.length < 3) setSets([...sets, { size: '', qty: '' }]); };
  const removeSet = (i) => { if (sets.length > 1) setSets(sets.filter((_, idx) => idx !== i)); };
  const updateSet = (i, k, v) => {
    const newSets = [...sets];
    newSets[i][k] = v;
    setSets(newSets);
  };

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = true;
    if (!form.item.trim())  e.item  = true;
    
    const setErrors = sets.map(s => ({
      size: !s.size.trim(),
      qty: !String(s.qty).trim()
    }));
    if (setErrors.some(se => se.size || se.qty)) e.sets = setErrors;
    
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e_ = validate();
    if (Object.keys(e_).length) { setErrors(e_); return; }
    setErrors({});
    try {
      const totalQty = sets.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
      const combinedSize = formatSets(sets);

      const newJob = await createJobMutation.mutateAsync({
        progBy:             form.name,
        item:               form.item,
        itemGroup:          form.itemGroup,
        size:               combinedSize,
        qty:                totalQty,
        reason:             form.reason,
        specialInstruction: form.specialInstruction,
      });
      onSuccess({ jobNo: newJob.jobNo, item: form.item });
    } catch (err) {
      alert('Submit failed: ' + err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 anim-slideUp">

      {/* Your Name */}
      <div>
        <FieldLabel required>Your Name (Prog. By)</FieldLabel>
        <SelectBase error={errors.name} value={form.name} onChange={set('name')}>
          <option value="">Select your name…</option>
          {STEP_PEOPLE[1].map((n) => <option key={n}>{n}</option>)}
        </SelectBase>
      </div>

      {/* Item Name with suggestions */}
      <div>
        <FieldLabel required>Item Name</FieldLabel>
        <InputBase 
          type="text" 
          list="existing-items-list"
          placeholder="e.g. Rib print plajo"
          value={form.item} 
          onChange={set('item')} 
          error={errors.item} 
        />
        <datalist id="existing-items-list">
          {existingItems.map(it => <option key={it} value={it} />)}
        </datalist>
        <p className="text-[10px] text-gray-400 mt-1 pl-1">
          💡 Expert Tip: Using consistent names helps in accurate reporting.
        </p>
      </div>

      {/* Item Group */}
      <div>
        <FieldLabel>Item Group</FieldLabel>
        <SelectBase value={form.itemGroup} onChange={set('itemGroup')}>
          <option value="">Select group…</option>
          {ITEM_GROUPS.map((g) => <option key={g}>{g}</option>)}
        </SelectBase>
      </div>

      {/* Size and Quantity Sets */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <FieldLabel required>Size & Quantity Details</FieldLabel>
          {sets.length < 3 && (
            <button type="button" onClick={addSet} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
              Add Set
            </button>
          )}
        </div>
        
        {sets.map((s, i) => (
          <div key={i} className="flex gap-3 items-start anim-slideUp">
            <div className="flex-1">
              <InputBase 
                placeholder="Size" 
                value={s.size} 
                onChange={(e) => updateSet(i, 'size', e.target.value)}
                error={errors.sets?.[i]?.size}
              />
            </div>
            <div className="flex-1">
              <InputBase 
                type="number" 
                placeholder="Qty" 
                value={s.qty} 
                onChange={(e) => updateSet(i, 'qty', e.target.value)}
                error={errors.sets?.[i]?.qty}
              />
            </div>
            {sets.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeSet(i)}
                className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4H5a2 2 0 00-2 2v.092c0 .355.034.708.102 1.054l1.168 5.84a3.75 3.75 0 003.703 3.014h4.054a3.75 3.75 0 003.703-3.014l1.168-5.84A5.041 5.041 0 0017 6.092V6a2 2 0 00-2-2h-1V3.75A2.75 2.75 0 0011.25 1h-2.5zM8 3.75A1.25 1.25 0 019.25 2.5h2.5A1.25 1.25 0 0113 3.75V4H8v-.25zM4.5 6.092V6h11v.092c0 .178-.017.356-.051.532l-1.168 5.84a2.25 2.25 0 01-2.222 1.809H7.941a2.25 2.25 0 01-2.222-1.81l-1.168-5.84A3.541 3.541 0 014.5 6.092z" clipRule="evenodd" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Reason toggle */}
      <div>
        <FieldLabel>Reason</FieldLabel>
        <div className="flex gap-2">
          {['Order', 'Refill'].map((r) => (
            <button key={r} type="button"
              onClick={() => setRaw('reason', r)}
              className={cls(
                'flex-1 py-3 rounded-xl text-sm font-semibold border-2 btn-press transition-colors',
                form.reason === r
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              )}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Special Instruction */}
      <div>
        <FieldLabel>Special Instruction <span className="text-gray-400 font-normal">(optional)</span></FieldLabel>
        <TextAreaBase rows={2} placeholder="Any special instructions…"
          value={form.specialInstruction} onChange={set('specialInstruction')} />
      </div>

      <SubmitButton loading={loading} />
    </form>
  );
}

// ─── Step 2 Form ─────────────────────────────────────────────────────────────
function Step2Form({ job, onSuccess }) {
  const init = { name: '', yesNo: null, instructions: '', inhouseCutting: null };
  const [form, setForm] = useState(init);
  const updateStep2Mutation = useUpdateStep2();
  const loading = updateStep2Mutation.isPending;

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateStep2Mutation.mutateAsync({
        jobNo:          job.jobNo,
        yesNo:          form.yesNo,
        instructions:   form.instructions,
        inhouseCutting: form.inhouseCutting,
      });
      onSuccess({ jobNo: job.jobNo, item: job.item });
    } catch (err) { alert('Submit failed: ' + err.message); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 anim-slideUp">
      <div>
        <FieldLabel required>Your Name</FieldLabel>
        <SelectBase value={form.name} onChange={set('name')}>
          <option value="">Select…</option>
          {STEP_PEOPLE[2].map((n) => <option key={n}>{n}</option>)}
        </SelectBase>
      </div>
      <div>
        <FieldLabel>Approve for Production?</FieldLabel>
        <YesNoToggle value={form.yesNo}
          onChange={(v) => setForm((p) => ({ ...p, yesNo: v }))}
          yesLabel="✅ Approve" noLabel="❌ Reject" />
      </div>
      <div>
        <FieldLabel>Instructions / Reason</FieldLabel>
        <TextAreaBase rows={3} placeholder="Add any instructions or rejection reason…"
          value={form.instructions} onChange={set('instructions')} />
      </div>
      <div>
        <FieldLabel>Inhouse Cutting?</FieldLabel>
        <YesNoToggle value={form.inhouseCutting}
          onChange={(v) => setForm((p) => ({ ...p, inhouseCutting: v }))} />
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

// ─── Step 3 Form ─────────────────────────────────────────────────────────────
function Step3Form({ job, onSuccess }) {
  const [sets, setSets] = useState(() => parseSets(job.size, job.qty));
  const [form, setForm] = useState({ name: '' });
  const updateStep3Mutation = useUpdateStep3();
  const loading = updateStep3Mutation.isPending;
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const updateSetQty = (i, v) => {
    const newSets = [...sets];
    newSets[i].qty = v;
    setSets(newSets);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const totalCutting = sets.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
      const combinedDetails = formatSets(sets);

      await updateStep3Mutation.mutateAsync({
        jobNo:       job.jobNo,
        cuttingPcs:  totalCutting,
        sizeDetails: combinedDetails,
        name:        form.name,
      });
      onSuccess({ jobNo: job.jobNo, item: job.item });
    } catch (err) { alert('Submit failed: ' + err.message); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 anim-slideUp">
      <div>
        <FieldLabel required>Your Name</FieldLabel>
        <SelectBase value={form.name} onChange={set('name')}>
          <option value="">Select…</option>
          {STEP_PEOPLE[3].map((n) => <option key={n}>{n}</option>)}
        </SelectBase>
      </div>

      <FormSection title="Actual Cutting (Size Wise)" />
      
      <div className="space-y-4">
        {sets.map((s, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="flex-1">
              <FieldLabel>Size: <span className="text-indigo-600">{s.size}</span></FieldLabel>
              <InputBase 
                type="number" 
                placeholder="Cutting Qty" 
                value={s.qty} 
                onChange={(e) => updateSetQty(i, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

// ─── Step 4 Form ─────────────────────────────────────────────────────────────
function Step4Form({ job, onSuccess }) {
  const [sets, setSets] = useState(() => parseSets(job.s3SizeDetails || job.size, job.s3DukanCutting || job.qty));
  const [form, setForm] = useState({ thekedarName: '', cutToPack: null, leadTime: '' });
  const updateStep4Mutation = useUpdateStep4();
  const loading = updateStep4Mutation.isPending;
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const updateSetQty = (i, v) => {
    const newSets = [...sets];
    newSets[i].qty = v;
    setSets(newSets);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const totalCutting = sets.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
      await updateStep4Mutation.mutateAsync({
        jobNo:        job.jobNo,
        thekedarName: form.thekedarName,
        cutToPack:    form.cutToPack,
        leadTime:     form.leadTime,
        cuttingPcs:   totalCutting,
      });
      onSuccess({ jobNo: job.jobNo, item: job.item });
    } catch (err) { alert('Submit failed: ' + err.message); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 anim-slideUp">
      <div>
        <FieldLabel required>Thekedar / Karigar Name</FieldLabel>
        <SelectBase value={form.thekedarName} onChange={set('thekedarName')}>
          <option value="">Select Thekedar…</option>
          {STEP_PEOPLE[4].map((n) => <option key={n}>{n}</option>)}
        </SelectBase>
      </div>
      <div>
        <FieldLabel>Cut to Pack?</FieldLabel>
        <YesNoToggle value={form.cutToPack}
          onChange={(v) => setForm((p) => ({ ...p, cutToPack: v }))} />
      </div>
      <div>
        <FieldLabel>Lead Time (working hours for Jama)</FieldLabel>
        <InputBase type="number" inputMode="numeric" placeholder="e.g. 72"
          value={form.leadTime} onChange={set('leadTime')} />
        <p className="text-[10px] text-gray-400 mt-1 pl-1">
          ⏱ Enter working hours (10AM–7PM, Mon–Sat). Example: 72 hrs = ~8 working days.
        </p>
      </div>

      <FormSection title="Cutting Pieces (Size Wise)" />
      
      <div className="space-y-4">
        {sets.map((s, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="flex-1">
              <FieldLabel>Size: <span className="text-indigo-600">{s.size}</span></FieldLabel>
              <InputBase 
                type="number" 
                placeholder="Cutting Qty" 
                value={s.qty} 
                onChange={(e) => updateSetQty(i, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

// ─── Step 5 Form ─────────────────────────────────────────────────────────────
function Step5Form({ job, onSuccess }) {
  const [form, setForm] = useState({ 
    jamaQty: job.s5JamaQty || '', 
    pressHua: job.s5Press ? (job.s5Press === 'Yes') : null 
  });
  const updateStep5Mutation = useUpdateStep5();
  const loading = updateStep5Mutation.isPending;
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateStep5Mutation.mutateAsync({
        jobNo:    job.jobNo,
        jamaQty:  form.jamaQty,
        pressHua: form.pressHua,
      });
      onSuccess({ jobNo: job.jobNo, item: job.item });
    } catch (err) { alert('Submit failed: ' + err.message); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 anim-slideUp">
      <div>
        <FieldLabel required>Jama Quantity</FieldLabel>
        <InputBase type="number" inputMode="numeric" placeholder="0"
          value={form.jamaQty} onChange={set('jamaQty')} />
      </div>
      <div>
        <FieldLabel>Press Hua ya Nahi?</FieldLabel>
        <YesNoToggle value={form.pressHua}
          onChange={(v) => setForm((p) => ({ ...p, pressHua: v }))}
          yesLabel="✅ Press Hua" noLabel="❌ Nahi" />
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

// ─── Step 6 Form ─────────────────────────────────────────────────────────────
function Step6Form({ job, onSuccess }) {
  const [form, setForm] = useState({ 
    settleQty: job.s6SettleQty || '', 
    reason: job.s6Reason || '', 
    yourName: job.s6Name || '' 
  });
  const updateStep6Mutation = useUpdateStep6();
  const loading = updateStep6Mutation.isPending;
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const reqQty = Number(job.qty || 0);
  const jamaQty = Number(job.s5JamaQty || 0);
  const curSettle = Number(form.settleQty || 0);
  const balance = reqQty - jamaQty - curSettle;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateStep6Mutation.mutateAsync({
        jobNo:     job.jobNo,
        settleQty: form.settleQty,
        reason:    form.reason,
        yourName:  form.yourName,
      });
      onSuccess({ jobNo: job.jobNo, item: job.item });
    } catch (err) { alert('Submit failed: ' + err.message); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 anim-slideUp">
      <div className="bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calculated Balance</span>
          <span className={cls(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
            balance <= 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          )}>
            {balance <= 0 ? '✓ Cleared' : 'Pending'}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
           <div className="text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase">Requirement</p>
              <p className="text-sm font-black text-gray-900">{reqQty}</p>
           </div>
           <div className="text-center border-x border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase">Jama</p>
              <p className="text-sm font-black text-indigo-600">{jamaQty}</p>
           </div>
           <div className="text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase">Balance</p>
              <p className={cls("text-sm font-black", balance <= 0 ? "text-green-600" : "text-red-500")}>
                {reqQty - jamaQty}
              </p>
           </div>
        </div>

        <div className="pt-3 border-t border-gray-50 flex justify-between items-end">
           <div>
              <p className="text-[10px] font-bold text-gray-500">Remaining After Settle</p>
              <p className={cls("text-2xl font-[900] leading-none mt-1", balance <= 0 ? "text-green-600" : "text-gray-900")}>
                {balance}
              </p>
           </div>
           {balance > 0 && (
             <button 
               type="button"
               onClick={() => setForm(p => ({ ...p, settleQty: (reqQty - jamaQty).toString() }))}
               className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
             >
               SETTLE ALL
             </button>
           )}
        </div>
      </div>

      <div>
        <FieldLabel required>Settle Quantity</FieldLabel>
        <InputBase type="number" inputMode="numeric" placeholder={`Enter ${reqQty - jamaQty} to clear...`}
          value={form.settleQty} onChange={set('settleQty')} />
        <p className="text-[10px] text-gray-400 mt-1.5 font-medium italic leading-tight">
          Enter the number needed to bring the balance to zero.
        </p>
      </div>
      <div>
        <FieldLabel>Reason</FieldLabel>
        <TextAreaBase rows={3} placeholder="Why are we settling? Any notes…"
          value={form.reason} onChange={set('reason')} />
      </div>
      <div>
        <FieldLabel>Your Name</FieldLabel>
        <InputBase type="text" placeholder="Your name (free text)"
          value={form.yourName} onChange={set('yourName')} />
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

// ─── Step Form Container (Steps 2–6) ──────────────────────────────────────────
const STEP_FORM_MAP = { 2: Step2Form, 3: Step3Form, 4: Step4Form, 5: Step5Form, 6: Step6Form };

function StepFormWithFetch({ step, onSuccess }) {
  // Use shared cache — no independent getAllJobs() call
  const { data: allJobs = [], isLoading: loading } = useJobs();
  const [selJob, setSelJob] = useState(null);
  const [search, setSearch] = useState('');

  // Reset selected job when step changes
  useState(() => { setSelJob(null); }, [step]);

  const jobs = useMemo(() => allJobs.filter(j => detectStep(j) === step), [allJobs, step]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jobs
      .filter(j => !q || String(j.jobNo).toLowerCase().includes(q) || String(j.item).toLowerCase().includes(q))
      .sort((a, b) => {
        // Sort by 'move into step' time
        let timeA = 0, timeB = 0;
        if (step === 4) {
          timeA = new Date(a.s3Actual || a.s2Actual || 0).getTime();
          timeB = new Date(b.s3Actual || b.s2Actual || 0).getTime();
        } else if (step === 3) {
          timeA = new Date(a.s2Actual || 0).getTime();
          timeB = new Date(b.s2Actual || 0).getTime();
        } else if (step === 5) {
          timeA = new Date(a.s4StartDate || 0).getTime();
          timeB = new Date(b.s4StartDate || 0).getTime();
        } else if (step === 6) {
          timeA = new Date(a.s5Actual || 0).getTime();
          timeB = new Date(b.s5Actual || 0).getTime();
        } else {
          timeA = new Date(a.date || 0).getTime();
          timeB = new Date(b.date || 0).getTime();
        }
        
        if (timeB !== timeA) return timeB - timeA;
        return String(b.jobNo).localeCompare(String(a.jobNo), undefined, { numeric: true });
      });
  }, [jobs, search, step]);

  const StepForm = STEP_FORM_MAP[step];

  if (selJob) {
    return (
      <div className="space-y-5">
        <button onClick={() => setSelJob(null)} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">← Back to list</button>
        <JobCard job={selJob} showSteps />
        <FormSection title={`Logging Step ${step}`} />
        <StepForm job={selJob} onSuccess={(data) => {
           // After mutation, TanStack Query auto-invalidates the cache
           // The job list will re-filter automatically when the cache updates
           setSelJob(null);
           onSuccess(data);
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
        <input type="search" placeholder="Search pending jobs..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-400 text-sm transition-all shadow-sm" />
      </div>

      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{loading ? 'Searching...' : `Pending Jobs (${filtered.length})`}</h3>
      </div>

      <div className="space-y-3">
        {loading ? (
          [0,1,2].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse border-2 border-gray-100" />)
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <span className="text-3xl block mb-2">🎉</span>
            <p className="text-sm font-bold text-gray-500">No pending jobs for this step!</p>
          </div>
        ) : (
          filtered.map(j => <PendingJobCard key={j.jobNo} job={j} onClick={setSelJob} />)
        )}
      </div>
    </div>
  );
}

// ─── Step Selector ────────────────────────────────────────────────────────────
function StepSelector({ onSelect }) {
  return (
    <div className="p-4 space-y-4">
      <div className="mb-2">
        <h2 className="text-2xl font-[900] text-gray-900 tracking-tight">Production Workflow</h2>
        <p className="text-sm text-gray-500 font-medium">Select a stage to manage pending tasks</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {STEP_META.map(({ step, hindiName, englishName, color }) => {
          const people = STEP_PEOPLE[step];
          return (
            <button
              key={step}
              type="button"
              onClick={() => onSelect(step)}
              className={cls(
                'ag-lift btn-press text-left rounded-3xl border-2 p-5 transition-all duration-200 group',
                CARD_COLORS[color]
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cls('text-5xl font-black leading-none group-hover:scale-110 transition-transform origin-left', NUM_COLORS[color])}>
                  {step}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
              <p className="mt-4 text-lg font-[800] text-gray-900 leading-tight">{hindiName}</p>
              <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-tighter opacity-70 group-hover:opacity-100">{englishName}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Forms Page ──────────────────────────────────────────────────────────
export default function Forms() {
  const navigate = useNavigate();
  const [view, setView] = useState('selector');  // 'selector' | 'form'
  const [activeStep, setActiveStep] = useState(null);
  const [successData, setSuccessData] = useState(null); // { jobNo, item }

  function handleSelectStep(step) {
    setActiveStep(step);
    setSuccessData(null);
    setView('form');
  }

  function handleSuccess(data) {
    setSuccessData(data);
  }

  function handleNewEntry() {
    setSuccessData(null);
  }

  function handleHome() {
    navigate('/');
  }

  // ── Success screen
  if (successData) {
    return (
      <SuccessScreen
        jobNo={successData.jobNo}
        item={successData.item}
        onNewEntry={handleNewEntry}
        onHome={handleHome}
      />
    );
  }

  // ── Selector
  if (view === 'selector') {
    return <StepSelector onSelect={handleSelectStep} />;
  }

  // ── Active form
  const stepMeta = STEP_META.find((s) => s.step === activeStep);

  return (
    <div className="p-4 space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setView('selector')}
          className="p-2 rounded-xl hover:bg-gray-100 btn-press transition-colors text-gray-500"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StepBadge step={activeStep} size="md" />
            <h2 className="font-extrabold text-gray-900 text-base leading-tight">
              {stepMeta?.hindiName}
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 pl-px">{stepMeta?.englishName}</p>
        </div>
      </div>

      {/* Form */}
      {activeStep === 1 ? (
        <Step1Form onSuccess={handleSuccess} />
      ) : (
        <StepFormWithFetch
          step={activeStep}
          onSuccess={handleSuccess}
          onBack={() => setView('selector')}
        />
      )}
    </div>
  );
}
