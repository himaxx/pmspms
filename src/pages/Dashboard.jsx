import React, { useState, useMemo, useEffect } from 'react';
import { bulkSyncJobs, pullSheetsToDatabase } from '../utils/sync';
import StepBadge from '../components/StepBadge';
import { JobCardSkeleton } from '../components/Skeleton';
import AnalyticsHub from '../components/AnalyticsHub';
import { useToast, ToastContainer } from '../components/Toast';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { getPendingStep as detectStep, isJobDelayed as isDelayed, getJobStatus } from '../utils/jobLogic';
import JobManagement from '../components/JobManagement';
import { useJobs } from '../hooks/useJobs';
import useUIStore from '../store/useUIStore';
import { useLanguage } from '../i18n/LanguageContext';
import { STEP_PEOPLE } from '../utils/constants';

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
const JobRowCard = React.memo(({ job, onClick, viewMode = 'comfortable' }) => {
  const { t } = useLanguage();
  const step   = detectStep(job);
  const status = getJobStatus(job);
  const isCompact = viewMode === 'compact';

  return (
    <button type="button" onClick={() => onClick(job)}
      className={cls(
        'w-full text-left anim-slideUp bg-white rounded-[1.25rem] border-2 border-gray-200 shadow-md flex items-center transition-all hover:shadow-lg hover:border-indigo-200 active:scale-[0.98] btn-press',
        isCompact ? 'p-2 sm:p-2.5 gap-2 sm:gap-3' : 'p-3.5 sm:p-4 gap-3 sm:gap-4'
      )}>
      <div className="flex flex-col gap-1 shrink-0">
        <span className={cls('font-bold text-gray-800', isCompact ? 'text-[10px]' : 'text-xs')}>#{job.jobNo}</span>
        <StepBadge step={step} size={isCompact ? "xs" : "sm"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cls('font-semibold text-gray-900 truncate', isCompact ? 'text-xs' : 'text-sm')}>{job.item || '—'}</p>
        <p className={cls('text-gray-400 mt-0.5 flex gap-2 flex-wrap', isCompact ? 'text-[10px]' : 'text-[11px]')}>
          {job.size && <span>{job.size}</span>}
          {job.qty  && <span className="font-medium text-gray-600">{job.qty} pcs</span>}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusDot status={status} />
        {!isCompact && (
          <>
            {status === 'late'     && <span className="text-[9px] font-bold text-red-500   uppercase">{t('dashboard.late')}</span>}
            {status === 'complete' && <span className="text-[9px] font-bold text-green-600 uppercase">{t('dashboard.complete')}</span>}
          </>
        )}
      </div>
    </button>
  );
});

// ─── Timeline Row ─────────────────────────────────────────────────────────────
function TimelineRow({ step, title, done, active, date, plannedDate, person, extra, isLast, isDelayed }) {
  const { t } = useLanguage();
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cls(
                 'text-[9px] font-black uppercase tracking-wider mb-0.5',
                 active ? 'text-indigo-500' : done ? 'text-green-500' : 'text-gray-400'
              )}>
                 {t('dashboard.step')} {step}
              </span>
              {done && isDelayed && (
                <span className="flex items-center gap-0.5 bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ring-1 ring-red-100 animate-pulse">
                  ⚠️ {t('common.late') || 'Late'}
                </span>
              )}
            </div>
            <h4 className={cls(
              'text-sm font-bold leading-tight truncate',
              active ? 'text-indigo-900' : done ? 'text-gray-900' : 'text-gray-500'
            )}>
              {title}
            </h4>
          </div>
          <div className="flex flex-col items-end shrink-0">
            {date && (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                {date}
              </span>
            )}
            {!done && plannedDate && (
              <span className="text-[9px] font-black text-amber-500 mt-1 whitespace-nowrap">
                {t('common.due') || 'Expected'}: {plannedDate}
              </span>
            )}
          </div>
        </div>
        
        {(person || extra) && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100/50 space-y-1.5 overflow-hidden">
             {person && (
               <div className={cls(
                 "flex items-center gap-1.5 text-xs font-medium tracking-tight",
                 step === 2 ? "text-gray-900 text-[13px] font-black" : "text-gray-700"
               )}>
                  <span className={cls(
                    "w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px]",
                    step === 2 && "w-5 h-5 text-[10px] bg-indigo-50"
                  )}>👤</span>
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
          <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-wider">{t('jobDetail.pending')}</p>
        )}
      </div>
    </div>
  );
}

// ─── Job Detail Bottom Sheet ──────────────────────────────────────────────────
function JobDetailSheet({ job, onClose }) {
  const { t } = useLanguage();
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const timeDelay = String(job.s5Delay ?? '').trim();
  const hasDelay  = timeDelay && timeDelay !== '0' && timeDelay !== '';
  const currentStep = detectStep(job);

  const STEPS = [
    { 
      step: 1, 
      title: t('steps.1'), 
      done: Boolean(job.date),        
      date: fmtDate(job.date),        
      person: job.progBy,           
      extra: job.reason ? `${t('common.reason')}: ${job.reason}` : null,
      isDelayed: false
    },
    { 
      step: 2, 
      title: t('steps.2'), 
      done: Boolean(job.s2Actual),    
      date: fmtDate(job.s2Actual),    
      plannedDate: fmtDate(job.s2Planned),
      person: job.s2Approver || null, 
      extra: job.s2Instructions || null,
      isDelayed: (Number(job.s2Delay) || 0) > 0
    },
    { 
      step: 3, 
      title: t('steps.3'), 
      done: Boolean(job.s3Actual),    
      date: fmtDate(job.s3Actual),    
      plannedDate: fmtDate(job.s3Planned),
      person: job.s3CuttingPerson,  
      extra: job.s3DukanCutting ? `${job.s3DukanCutting} ${t('common.pcs')} cut` : null,
      isDelayed: (Number(job.s3Delay) || 0) > 0
    },
    { 
      step: 4, 
      title: t('steps.4'), 
      done: Boolean(job.s4StartDate), 
      date: fmtDate(job.s4StartDate), 
      plannedDate: fmtDate(job.s4Planned),
      person: job.s4Thekedar,       
      extra: job.s4LeadTime ? `${t('common.lead')}: ${job.s4LeadTime} ${t('common.hrs')}` : null,
      isDelayed: (Number(job.s4Delay) || 0) > 0
    },
    { 
      step: 5, 
      title: t('steps.5'), 
      done: Boolean(job.s5JamaQty),   
      date: fmtDate(job.updatedAt), 
      plannedDate: fmtDate(job.s5JamaPlanned),
      person: null,                 
      extra: job.s5JamaQty ? `Jama: ${job.s5JamaQty} ${t('common.pcs')}` : null,
      isDelayed: (Number(job.s5Delay) || 0) > 0
    },
    { 
      step: 6, 
      title: t('steps.6'), 
      done: Boolean(job.s6SettleQty), 
      date: null,                     
      person: job.s6Name,           
      extra: job.s6SettleQty ? `Settled: ${job.s6SettleQty}` : null,
      isDelayed: false
    },
    { 
      step: 7, 
      title: t('steps.7'), 
      done: detectStep(job) === 7,    
      date: null,                     
      person: null,                 
      extra: null,
      isDelayed: false
    },
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
            <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{t('common.jobNo')} #{job.jobNo}</p>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">{job.item || '—'}</h2>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
              {job.size      && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">{job.size}</span>}
              {job.qty       && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">{job.qty} {t('common.pcs')}</span>}
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
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">{t('jobDetail.timeline')}</p>
          <div className="pl-1">
            {STEPS.map(({ step, title, done, date, plannedDate, person, extra, isDelayed }, index) => (
              <TimelineRow 
                key={step} 
                step={step} 
                title={title}
                done={done} 
                active={step === currentStep}
                date={date} 
                plannedDate={plannedDate}
                person={person} 
                extra={extra}
                isDelayed={isDelayed}
                isLast={index === STEPS.length - 1}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3"
               style={{ animation: 'slideUp 400ms cubic-bezier(0.22,1,0.36,1) both', animationDelay: '500ms' }}>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('jobDetail.balanceQty')}</p>
              <p className="text-xl font-black text-gray-900 mt-1">{job.s5Balance || '—'}</p>
            </div>
            <div className={cls('rounded-2xl p-4 border', hasDelay ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100')}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('jobDetail.timeDelay')}</p>
              <p className={cls('text-xl font-black mt-1', hasDelay ? 'text-red-600' : 'text-gray-400')}>
                {timeDelay || '—'}
              </p>
            </div>
          </div>
          {job.specialInstruction?.trim() && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-4"
                 style={{ animation: 'slideUp 400ms cubic-bezier(0.22,1,0.36,1) both', animationDelay: '600ms' }}>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                 <span className="text-sm">⚠️</span> {t('jobDetail.specialInstruction')}
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
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const naameRecords = useMemo(() => {
    return jobs.filter(j => {
      if (!j.s4StartDate) return false;
      return j.s4StartDate.slice(0, 10) === selectedDate;
    }).sort((a, b) => b.jobNo - a.jobNo);
  }, [jobs, selectedDate]);

  return (
    <div className="px-4 mt-8 pb-4">
      <div className="flex flex-col gap-4 bg-white rounded-[2rem] border-2 border-gray-200 p-5 sm:p-6 shadow-md shadow-gray-100/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-none">{t('dashboard.aajKeNaame')}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{t('dashboard.dispatchLogs')}</p>
          </div>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto text-xs font-bold border-2 border-gray-100 p-2.5 rounded-xl bg-gray-50 outline-none focus:border-indigo-400 transition-all"
          />
        </div>

        <div className="space-y-3 mt-2">
          {naameRecords.length === 0 ? (
            <div className="py-8 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              <span className="text-2xl opacity-50">🚚</span>
              <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-tight">{t('dashboard.noDispatch')}</p>
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
                  <span className="block text-[9px] font-black text-gray-400 uppercase">{t('dashboard.pieces')}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {naameRecords.length > 0 && (
          <div className="pt-2 border-t-2 border-gray-50 flex justify-between items-center px-1">
            <span className="text-[11px] font-black text-gray-400 uppercase">{t('dashboard.totalDispatch')}</span>
            <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              {naameRecords.reduce((acc, r) => acc + (Number(r.s4CuttingPcs) || 0), 0)} {t('common.pcs')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Requirements Component ──────────────────────────────────────────────────
function Requirements({ jobs }) {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPerson, setSelectedPerson] = useState('All');

  // Use fixed list from constants for filtering
  const personNames = useMemo(() => {
    return ['All', ...STEP_PEOPLE[1]];
  }, []);

  const requirementRecords = useMemo(() => {
    return jobs.filter(j => {
      if (!j.date) return false;
      const jobDate = j.date.slice(0, 10);
      const isDateMatch = jobDate === selectedDate;
      const isPersonMatch = selectedPerson === 'All' || j.progBy === selectedPerson;
      return isDateMatch && isPersonMatch;
    }).sort((a, b) => b.jobNo - a.jobNo); // Latest to oldest
  }, [jobs, selectedDate, selectedPerson]);

  return (
    <div className="px-4 mt-8 pb-4">
      <div className="flex flex-col gap-4 bg-white rounded-[2rem] border-2 border-gray-200 p-6 shadow-md shadow-gray-100/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-none">{t('dashboard.requirements')}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{t('dashboard.requirementLogs')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="text-[11px] font-black text-indigo-600 bg-indigo-50 border-2 border-indigo-100 p-2 rounded-xl outline-none focus:border-indigo-400 transition-all appearance-none pr-8 relative"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234f46e5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, 
                backgroundRepeat: 'no-repeat', 
                backgroundPosition: 'right 0.5rem center', 
                backgroundSize: '1rem' 
              }}
            >
              {personNames.map(name => (
                <option key={name} value={name}>{name === 'All' ? (t('common.all') || 'All') : name}</option>
              ))}
            </select>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold border-2 border-gray-100 p-2 rounded-xl bg-gray-50 outline-none focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3 mt-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
          {requirementRecords.length === 0 ? (
            <div className="py-8 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              <span className="text-2xl opacity-50">📋</span>
              <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-tight">{t('dashboard.noRequirements')}</p>
            </div>
          ) : (
            requirementRecords.map(record => (
              <div key={record.jobNo} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-2xl border-2 border-gray-100 hover:border-indigo-100 transition-all group">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-gray-400 leading-none uppercase">#{record.jobNo}</span>
                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">REQ</span>
                  </div>
                  <span className="text-sm font-black text-gray-800 mt-1 truncate">{record.item}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-gray-600">{record.progBy || 'Unknown'}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{record.itemGroup}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-gray-900 leading-none">{record.qty || 0}</span>
                  <span className="block text-[9px] font-black text-gray-400 uppercase">{t('dashboard.pieces')}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {requirementRecords.length > 0 && (
          <div className="pt-2 border-t-2 border-gray-50 flex justify-between items-center px-1">
            <span className="text-[11px] font-black text-gray-400 uppercase">{t('dashboard.totalRequirements')}</span>
            <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              {requirementRecords.reduce((acc, r) => acc + (Number(r.qty) || 0), 0)} {t('common.pcs')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
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
  const viewMode         = useUIStore((s) => s.dashViewMode);
  const setViewMode      = useUIStore((s) => s.setDashViewMode);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilters, setShowFilters]   = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  const { containerRef, handlers, pullProgress, isRefreshing } = usePullToRefresh(refetch);


  // Jobs with pre-parsed dates for faster filtering
  const jobsWithDates = useMemo(() => {
    return jobs.map(j => ({
      ...j,
      _parsedDate: parseDate(j.date),
      _detectStep: detectStep(j),
      _jobStatus: getJobStatus(j)
    }));
  }, [jobs]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const start = dashStartDate ? new Date(dashStartDate) : null;
    const end   = dashEndDate   ? new Date(dashEndDate)   : null;
    if (end) end.setHours(23, 59, 59, 999);

    return jobsWithDates.filter((j) => {
      if (q && !String(j.jobNo || '').toLowerCase().includes(q) &&
                !String(j.item || '').toLowerCase().includes(q)) return false;
      
      const jobDate = j._parsedDate;
      if (start && (!jobDate || jobDate < start)) return false;
      if (end   && (!jobDate || jobDate > end))   return false;

      if (stepFilter !== 'All' && j._detectStep !== Number(stepFilter)) return false;
      if (statusFilter !== 'All' && j._jobStatus !== statusFilter) return false;
      return true;
    });
  }, [jobsWithDates, search, stepFilter, statusFilter, dashStartDate, dashEndDate]);

  const STEP_OPTS   = ['All', '1', '2', '3', '4', '5', '6', '7'];
  const STATUS_OPTS = [
    { label: t('common.all'), value: 'All' },
    { label: t('dashboard.onTrack'), value: 'on-track' },
    { label: t('dashboard.late'), value: 'late' },
    { label: t('dashboard.complete'), value: 'complete' }
  ];

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
              {t('dashboard.subtitle')}
            </span>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{t('dashboard.title').split(' ')[1]}</span>
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
                {t('dashboard.description')}
              </p>
              {lastRefresh && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-gray-100 text-[9px] font-bold text-gray-400 ml-auto uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="anim-slideUp" style={{ animationDelay: '100ms' }}>
          <JobManagement jobs={jobs} onSelectJob={setSelectedJob} />
        </div>

        <div className="anim-slideUp" style={{ animationDelay: '200ms' }}>
          <AajKeNaame jobs={jobs} />
        </div>

        <div className="anim-slideUp" style={{ animationDelay: '300ms' }}>
          <Requirements jobs={jobs} />
        </div>

        <div className="px-2 sm:px-4 mt-16 space-y-6 border-t-4 border-white pt-12 pb-10 bg-gray-50/50">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 sm:px-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter leading-tight">{t('dashboard.allJobs') || 'All Production Jobs'}</h2>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest leading-relaxed">
                  {loading ? t('common.loading') : `${filtered.length} entries found`}
                </p>
              </div>
              {(search || stepFilter !== 'All' || statusFilter !== 'All') && (
                <button onClick={clearDashFilters}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm btn-press">
                  {t('dashboard.clearFilters')}
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 anim-slideUp">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                  <input type="search" placeholder={t('dashboard.searchPlaceholder')}
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 rounded-[2rem] border border-gray-200 text-sm bg-white
                               outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 placeholder:text-gray-400 font-medium transition-all shadow-sm" />
                </div>

                {(() => {
                  const activeCount = [
                    search           ? 1 : 0,
                    dashStartDate    ? 1 : 0,
                    dashEndDate      ? 1 : 0,
                    stepFilter   !== 'All' ? 1 : 0,
                    statusFilter !== 'All' ? 1 : 0,
                  ].reduce((a, b) => a + b, 0);
                  return (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowFilters(v => !v)}
                        className={cls(
                          'shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl border-2 text-sm font-bold transition-all shadow-sm btn-press',
                          showFilters
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                        )}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
                        </svg>
                        {t('dashboard.filters')}
                        {activeCount > 0 && (
                          <span className={cls(
                            'text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center',
                            showFilters ? 'bg-white/25 text-white' : 'bg-indigo-600 text-white'
                          )}>{activeCount}</span>
                        )}
                      </button>

                      <div className="flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm shrink-0">
                        <button
                          type="button"
                          onClick={() => setViewMode('comfortable')}
                          className={cls(
                            'p-2 rounded-xl transition-all',
                            viewMode === 'comfortable' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'
                          )}
                          title="Comfortable View"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('compact')}
                          className={cls(
                            'p-2 rounded-xl transition-all',
                            viewMode === 'compact' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'
                          )}
                          title="Compact List View"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 3.5A.75.75 0 012.75 6.5h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 7.25zm0 3.5A.75.75 0 012.75 10h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10.75zm0 3.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2.75 16.5a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: showFilters ? '1fr' : '0fr',
                  transition: 'grid-template-rows 280ms cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div className="space-y-3 pb-1 pt-0.5">
                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-[1.5rem] border border-gray-100 shadow-sm">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('common.startDate')}</label>
                        <input type="date" value={dashStartDate} onChange={(e) => setDashStartDate(e.target.value)}
                               className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-2 text-[11px] font-bold outline-none focus:border-indigo-400 transition-all text-gray-700" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('common.endDate')}</label>
                        <input type="date" value={dashEndDate} onChange={(e) => setDashEndDate(e.target.value)}
                               className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-2 text-[11px] font-bold outline-none focus:border-indigo-400 transition-all text-gray-700" />
                      </div>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                      {STEP_OPTS.map((s) => (
                        <button key={s} type="button" onClick={() => setStepFilter(s)}
                          className={cls('shrink-0 px-4 py-2 rounded-full text-xs font-bold border btn-press transition-all',
                            stepFilter === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300')}>
                          {s === 'All' ? t('dashboard.allSteps') : `${t('dashboard.step')} ${s}`}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {STATUS_OPTS.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => setStatusFilter(opt.value)}
                          className={cls('shrink-0 px-4 py-2 rounded-full text-xs font-bold border btn-press transition-all',
                            statusFilter === opt.value ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300')}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* List Results */}
            <div className="space-y-4 px-1 pb-10">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => <JobCardSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-inner">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-100">
                    <span className="text-4xl opacity-40">🔍</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">{t('dashboard.noResults')}</h3>
                  <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">{t('dashboard.tryAdjustingFilters')}</p>
                </div>
              ) : (
                <div className={cls(
                  'grid gap-4',
                  viewMode === 'compact' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'
                )}>
                  {filtered.map(j => (
                    <JobRowCard key={j.jobNo} job={j} onClick={setSelectedJob} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Hub */}
        <div className="px-4 mt-8 pb-12">
           <div className="px-6 mb-3">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{t('dashboard.liveInsights')}</h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t('dashboard.systemHealth')}</p>
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
