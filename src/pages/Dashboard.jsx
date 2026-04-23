import { useState, useMemo, useEffect } from 'react';
import { bulkSyncJobs, pullSheetsToDatabase } from '../utils/sync';
import StepBadge from '../components/StepBadge';
import { JobCardSkeleton } from '../components/Skeleton';
import AnalyticsHub from '../components/AnalyticsHub';
import { useToast, ToastContainer } from '../components/Toast';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { getPendingStep as detectStep, isJobDelayed as isDelayed, getJobStatus } from '../utils/jobLogic';
import { useJobs } from '../hooks/useJobs';
import useUIStore from '../store/useUIStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function fmtDate(str) {
  const d = parseDate(str);
  if (!d) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function isToday(str) {
  const d = parseDate(str);
  if (!d) return false;
  const t = new Date();
  return d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear();
}

function cls(...p) { return p.filter(Boolean).join(' '); }




// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const map = { late: 'bg-red-500', 'on-track': 'bg-amber-400', complete: 'bg-green-500' };
  return <span className={cls('inline-block w-2 h-2 rounded-full shrink-0', map[status] ?? 'bg-gray-300')} />;
}

// ─── Job Row Card ─────────────────────────────────────────────────────────────
function JobRowCard({ job, onClick }) {
  const step   = detectStep(job);
  const status = getJobStatus(job);
  return (
    <button type="button" onClick={() => onClick(job)}
      className="w-full text-left anim-slideUp bg-white rounded-[1.25rem] border-2 border-gray-200
                 shadow-md p-4 flex items-center gap-4 btn-press transition-all
                 hover:shadow-lg hover:border-indigo-200 active:scale-[0.98]">
      <div className="flex flex-col gap-1 shrink-0">
        <span className="text-xs font-bold text-gray-800">#{job.jobNo}</span>
        <StepBadge step={step} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{job.item || '—'}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 flex gap-2 flex-wrap">
          {job.size && <span>{job.size}</span>}
          {job.qty  && <span className="font-medium text-gray-600">{job.qty} pcs</span>}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusDot status={status} />
        {status === 'late'     && <span className="text-[9px] font-bold text-red-500   uppercase">Late</span>}
        {status === 'complete' && <span className="text-[9px] font-bold text-green-600 uppercase">Done</span>}
      </div>
    </button>
  );
}

// ─── Timeline Row ─────────────────────────────────────────────────────────────
function TimelineRow({ step, title, done, active, date, person, extra, isLast }) {
  return (
    <div 
      className="relative flex gap-4 pb-3"
      style={{
        animation: 'slideUp 400ms cubic-bezier(0.22,1,0.36,1) both',
        animationDelay: `${step * 75}ms`
      }}
    >
      {/* Absolute positioned connecting line */}
      {!isLast && (
        <div className={cls(
          'absolute left-[13px] top-8 bottom-0 w-[2px] -ml-px',
          done ? 'bg-green-400' : 'bg-gray-100'
        )} />
      )}

      {/* Circle Indicator */}
      <div className="relative z-10 flex flex-col items-center shrink-0 mt-1">
        <div className={cls(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all duration-300',
          active ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 border-2 border-indigo-600 scale-110'
          : done ? 'bg-green-500 text-white border-2 border-green-500'
                 : 'bg-white text-gray-300 border-2 border-gray-200'
        )}>
          {done && !active ? (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          ) : step}
        </div>
      </div>

      {/* Content Card */}
      <div className={cls(
        'flex-1 min-w-0 rounded-2xl p-3.5 mb-2 transition-all duration-300 border-2',
        active ? 'bg-indigo-50/50 border-indigo-100 shadow-sm'
        : done ? 'bg-white border-gray-50 shadow-sm'
               : 'bg-transparent border-transparent opacity-60'
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className={cls(
               'text-[9px] font-black uppercase tracking-wider mb-0.5',
               active ? 'text-indigo-500' : done ? 'text-green-500' : 'text-gray-400'
            )}>
               Step {step}
            </span>
            <h4 className={cls(
              'text-sm font-bold leading-tight',
              active ? 'text-indigo-900' : done ? 'text-gray-900' : 'text-gray-500'
            )}>
              {title}
            </h4>
          </div>
          {date && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0">
              {date}
            </span>
          )}
        </div>
        
        {(person || extra) && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100/50 space-y-1.5 overflow-hidden">
             {person && (
               <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium tracking-tight">
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px]">👤</span>
                  {person}
               </div>
             )}
             {extra && (
               <div className="flex items-start gap-1.5 text-xs text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px] shrink-0 mt-px">📝</span> 
                  <span className="leading-snug break-words whitespace-normal break-all line-clamp-3">{extra}</span>
               </div>
             )}
          </div>
        )}
        
        {!done && !active && (
          <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-wider">Pending</p>
        )}
      </div>
    </div>
  );
}

// ─── Job Detail Bottom Sheet ──────────────────────────────────────────────────
function JobDetailSheet({ job, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const timeDelay = String(job.s5Delay ?? '').trim();
  const hasDelay  = timeDelay && timeDelay !== '0' && timeDelay !== '';
  const currentStep = detectStep(job);

  const STEPS = [
    { step: 1, title: 'New Requirement',     done: Boolean(job.date),        date: fmtDate(job.date),        person: job.progBy,           extra: job.reason ? `Reason: ${job.reason}` : null },
    { step: 2, title: 'Production Approval', done: Boolean(job.s2Actual),    date: fmtDate(job.s2Actual),    person: null,                 extra: job.s2Instructions || null },
    { step: 3, title: 'Inhouse Cutting',     done: Boolean(job.s3Actual),    date: fmtDate(job.s3Actual),    person: job.s3CuttingPerson,  extra: job.s3DukanCutting ? `${job.s3DukanCutting} pcs cut` : null },
    { step: 4, title: 'Naame (Prod.)',       done: Boolean(job.s4StartDate), date: fmtDate(job.s4StartDate), person: job.s4Thekedar,       extra: job.s4LeadTime ? `Lead: ${job.s4LeadTime} days` : null },
    { step: 5, title: 'Jama',                done: Boolean(job.s5JamaQty),   date: null,                     person: null,                 extra: job.s5JamaQty ? `Jama: ${job.s5JamaQty} pcs` : null },
    { step: 6, title: 'Settle',              done: Boolean(job.s6SettleQty), date: null,                     person: job.s6Name,           extra: job.s6SettleQty ? `Settled: ${job.s6SettleQty}` : null },
    { step: 7, title: 'Complete',            done: detectStep(job) === 7,    date: null,                     person: null,                 extra: null },
  ];

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
           style={{ animation: 'slideUp 350ms cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-gray-200" />
        </div>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-4 pt-2 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">Job #{job.jobNo}</p>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">{job.item || '—'}</h2>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
              {job.size      && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">{job.size}</span>}
              {job.qty       && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">{job.qty} pcs</span>}
              {job.itemGroup && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold">{job.itemGroup}</span>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="p-2 rounded-full hover:bg-gray-100 bg-gray-50 btn-press text-gray-400 shrink-0 mt-0.5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Production Timeline</p>
          <div className="pl-1">
            {STEPS.map(({ step, title, done, date, person, extra }, index) => (
              <TimelineRow 
                key={step} 
                step={step} 
                title={title}
                done={done} 
                active={step === currentStep}
                date={date} 
                person={person} 
                extra={extra}
                isLast={index === STEPS.length - 1}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3"
               style={{ animation: 'slideUp 400ms cubic-bezier(0.22,1,0.36,1) both', animationDelay: '500ms' }}>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Balance Qty</p>
              <p className="text-xl font-black text-gray-900 mt-1">{job.s5Balance || '—'}</p>
            </div>
            <div className={cls('rounded-2xl p-4 border', hasDelay ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100')}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time Delay</p>
              <p className={cls('text-xl font-black mt-1', hasDelay ? 'text-red-600' : 'text-gray-400')}>
                {timeDelay || '—'}
              </p>
            </div>
          </div>
          {job.specialInstruction?.trim() && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-4"
                 style={{ animation: 'slideUp 400ms cubic-bezier(0.22,1,0.36,1) both', animationDelay: '600ms' }}>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                 <span className="text-sm">⚠️</span> Special Instruction
              </p>
              <p className="text-sm text-amber-900 font-medium leading-snug">{job.specialInstruction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pull-to-Refresh Indicator ────────────────────────────────────────────────
function PullIndicator({ progress, isRefreshing }) {
  const scale = 0.5 + progress * 0.5;
  const opacity = progress;
  return (
    <div className="flex justify-center py-2 overflow-hidden" style={{ height: `${progress * 44}px` }}>
      <div style={{ transform: `scale(${scale})`, opacity, transition: isRefreshing ? 'none' : undefined }}>
        {isRefreshing ? (
          <svg className="animate-spin w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
               className="w-6 h-6 text-indigo-400"
               style={{ transform: `rotate(${progress * 360}deg)` }}>
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.243a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.928a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function AajKeNaame({ jobs }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const naameRecords = useMemo(() => {
    return jobs.filter(j => {
      if (!j.s4StartDate) return false;
      return j.s4StartDate.slice(0, 10) === selectedDate;
    }).sort((a, b) => b.jobNo - a.jobNo);
  }, [jobs, selectedDate]);

  return (
    <div className="px-4 mt-8 pb-4">
      <div className="flex flex-col gap-4 bg-white rounded-[2rem] border-2 border-gray-200 p-6 shadow-md shadow-gray-100/50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-none">Aaj Ke Naame</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Production Dispatch Logs</p>
          </div>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold border-2 border-gray-100 p-2 rounded-xl bg-gray-50 outline-none focus:border-indigo-400 transition-all"
          />
        </div>

        <div className="space-y-3 mt-2">
          {naameRecords.length === 0 ? (
            <div className="py-8 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              <span className="text-2xl opacity-50">🚚</span>
              <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-tight">No dispatch on this date</p>
            </div>
          ) : (
            naameRecords.map(record => (
              <div key={record.jobNo} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-2xl border-2 border-gray-100 hover:border-indigo-100 transition-all group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 leading-none uppercase">#{record.jobNo}</span>
                  <span className="text-sm font-black text-gray-800 mt-1">{record.item}</span>
                  <span className="text-[11px] font-bold text-indigo-600 mt-0.5">{record.s4Thekedar || 'Unknown Karigar'}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-gray-900 leading-none">{record.s4CuttingPcs || 0}</span>
                  <span className="block text-[9px] font-black text-gray-400 uppercase">Pieces</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {naameRecords.length > 0 && (
          <div className="pt-2 border-t-2 border-gray-50 flex justify-between items-center px-1">
            <span className="text-[11px] font-black text-gray-400 uppercase">Total Dispatch</span>
            <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              {naameRecords.reduce((acc, r) => acc + (Number(r.s4CuttingPcs) || 0), 0)} Pcs
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  // ── Server state via TanStack Query (shared cache with all other pages) ──────
  const { data: jobs = [], isLoading: loading, dataUpdatedAt, refetch } = useJobs();
  const lastRefresh = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  // ── UI state persisted in Zustand (survives page navigation) ────────────────
  const search          = useUIStore((s) => s.dashSearch);
  const stepFilter      = useUIStore((s) => s.dashStepFilter);
  const statusFilter    = useUIStore((s) => s.dashStatusFilter);
  const setSearch       = useUIStore((s) => s.setDashSearch);
  const setStepFilter   = useUIStore((s) => s.setDashStepFilter);
  const setStatusFilter = useUIStore((s) => s.setDashStatusFilter);
  const dashStartDate   = useUIStore((s) => s.dashStartDate);
  const dashEndDate     = useUIStore((s) => s.dashEndDate);
  const setDashStartDate = useUIStore((s) => s.setDashStartDate);
  const setDashEndDate   = useUIStore((s) => s.setDashEndDate);
  const clearDashFilters = useUIStore((s) => s.clearDashFilters);

  const [selectedJob, setSelectedJob] = useState(null);
  const { toasts, addToast, dismiss } = useToast();

  const { containerRef, handlers, pullProgress, isRefreshing } = usePullToRefresh(refetch);


  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const start = dashStartDate ? new Date(dashStartDate) : null;
    const end   = dashEndDate   ? new Date(dashEndDate)   : null;
    if (end) end.setHours(23, 59, 59, 999);

    return jobs.filter((j) => {
      if (q && !String(j.jobNo).toLowerCase().includes(q) &&
                !(j.item ?? '').toLowerCase().includes(q)) return false;
      
      const jobDate = parseDate(j.date);
      if (start && (!jobDate || jobDate < start)) return false;
      if (end   && (!jobDate || jobDate > end))   return false;

      if (stepFilter !== 'All' && detectStep(j) !== Number(stepFilter)) return false;
      if (statusFilter !== 'All') {
        const s = getJobStatus(j);
        if (statusFilter === 'On Track' && s !== 'on-track') return false;
        if (statusFilter === 'Late'     && s !== 'late')     return false;
        if (statusFilter === 'Complete' && s !== 'complete') return false;
      }
      return true;
    });
  }, [jobs, search, stepFilter, statusFilter, dashStartDate, dashEndDate]);

  const STEP_OPTS   = ['All', '1', '2', '3', '4', '5', '6', '7'];
  const STATUS_OPTS = ['All', 'On Track', 'Late', 'Complete'];

  return (
    <div className="flex flex-col min-h-screen pb-8 bg-gray-100/30">
      {/* Pull-to-refresh scroll container */}
      <div className="flex-1" ref={containerRef} {...handlers}>
        <PullIndicator progress={pullProgress} isRefreshing={isRefreshing} />

        {/* Fancy Heading */}
        <div className="px-6 pt-10 pb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 block">
              Real-time Production
            </span>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Processes</span>
              </h1>
              <div className="flex gap-1">
                {/* PULL from Sheets */}
                <button onClick={async () => {
                  if (!window.confirm('Pull all edits from Google Sheets? This will update the database.')) return;
                  addToast('Pulling from Sheets…', 'info');
                  try {
                    const count = await pullSheetsToDatabase();
                    await refetch();
                    addToast(`Successfully pulled ${count} jobs from Sheets!`, 'success');
                  } catch (e) {
                    addToast('Pull failed: ' + e.message, 'error');
                  }
                }}
                  className="p-2.5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-amber-500" title="Pull from Sheets">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v6.638l1.965-1.903a.75.75 0 111.04 1.08l-3.25 3.146a.75.75 0 01-1.04 0l-3.25-3.147a.75.75 0 111.04-1.08l1.965 1.903V3.75A.75.75 0 0110 3zM3.5 15a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.25A.75.75 0 013.5 15z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* PUSH to Sheets */}
                <button onClick={async () => {
                  if (!window.confirm('Sync all jobs to Google Sheets? This might take a moment.')) return;
                  addToast('Pushing to Sheets…', 'info');
                  try {
                    const count = await bulkSyncJobs(jobs);
                    addToast(`Successfully pushed ${count} jobs to Sheets!`, 'success');
                  } catch (e) {
                    addToast('Push failed: ' + e.message, 'error');
                  }
                }}
                  className="p-2.5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-indigo-500" title="Push to Sheets">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V9.612L7.285 11.515a.75.75 0 11-1.04-1.08l3.25-3.146a.75.75 0 011.04 0l3.25 3.147a.75.75 0 01-1.04 1.08L10.75 9.612v6.638A.75.75 0 0110 17zM3.5 5a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.25A.75.75 0 013.5 5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[200px]">
                Monitoring every step from requirement to settlement.
              </p>
              {lastRefresh && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-[9px] font-bold text-gray-400 ml-auto uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 mt-2 space-y-4">
          <div className="relative anim-slideUp" style={{ animationDelay: '100ms' }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input type="search" placeholder="Search job no or item…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-gray-200 text-sm bg-white
                         outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 placeholder:text-gray-400 font-medium transition-all shadow-sm" />
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-2 gap-2 bg-white/50 p-3 rounded-[1.5rem] border-2 border-gray-200 shadow-sm anim-slideUp" style={{ animationDelay: '150ms' }}>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
              <input type="date" value={dashStartDate} onChange={(e) => setDashStartDate(e.target.value)} 
                     className="w-full bg-white border-2 border-gray-100 rounded-xl px-2 py-2 text-[11px] font-bold outline-none focus:border-indigo-400 transition-all text-gray-700" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
              <input type="date" value={dashEndDate} onChange={(e) => setDashEndDate(e.target.value)} 
                     className="w-full bg-white border-2 border-gray-100 rounded-xl px-2 py-2 text-[11px] font-bold outline-none focus:border-indigo-400 transition-all text-gray-700" />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar anim-slideUp" style={{ animationDelay: '200ms' }}>
            {STEP_OPTS.map((s) => (
              <button key={s} type="button" onClick={() => setStepFilter(s)}
                className={cls('shrink-0 px-4 py-2 rounded-full text-xs font-bold border-2 btn-press transition-all',
                  stepFilter === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300')}>
                {s === 'All' ? 'All Steps' : `Step ${s}`}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap anim-slideUp" style={{ animationDelay: '250ms' }}>
            {STATUS_OPTS.map((s) => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)}
                className={cls('shrink-0 px-4 py-2 rounded-full text-xs font-bold border-2 btn-press transition-all',
                  statusFilter === s ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300')}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="px-4 mt-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">
              {loading ? 'Loading…' : `${filtered.length} job${filtered.length !== 1 ? 's' : ''}`}
            </p>
            {(search || stepFilter !== 'All' || statusFilter !== 'All') && (
              <button onClick={clearDashFilters}
                className="text-xs text-indigo-600 font-semibold hover:underline">Clear filters</button>
            )}
          </div>

          <div className="max-h-[450px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200" id="jobs-scroll-container">
            <div className="space-y-2.5 pb-2">
              {loading ? (
                [0, 1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-2 text-center">
                  <span className="text-4xl">🔍</span>
                  <p className="text-gray-500 text-sm font-medium">No jobs match your filters.</p>
                  <p className="text-gray-400 text-xs">Try adjusting the step or status filter.</p>
                </div>
              ) : (
                filtered.map((job) => <JobRowCard key={job.jobNo} job={job} onClick={setSelectedJob} />)
              )}
            </div>
          </div>
        </div>

        {/* Aaj Ke Naame Dispatch Log */}
        <AajKeNaame jobs={jobs} />

        {/* Interactive Analytics Hub */}
        <div className="mt-8 mb-4 border-t border-gray-100 pt-6">
           <div className="px-6 mb-3">
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Live Insights</h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time system health</p>
           </div>
           {!loading && <AnalyticsHub jobs={filtered} />}
        </div>
      </div>

      {/* Bottom Sheet */}
      {selectedJob && <JobDetailSheet job={selectedJob} onClose={() => setSelectedJob(null)} />}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
