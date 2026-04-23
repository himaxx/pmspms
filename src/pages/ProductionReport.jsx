import { useState, useMemo, useEffect } from 'react';
import { ITEM_GROUPS } from '../utils/constants';
import { JobCardSkeleton } from '../components/Skeleton';
import { useToast, ToastContainer } from '../components/Toast';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { getPendingStep as detectStep, isJobDelayed as isDelayed, getDaysInStep } from '../utils/jobLogic';
import { useJobs } from '../hooks/useJobs';
import useUIStore from '../store/useUIStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function daysDiff(from) {
  if (!from) return null;
  return Math.floor((Date.now() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDate(str) {
  const d = parseDate(str);
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function cls(...p) { return p.filter(Boolean).join(' '); }



const CATEGORIES = ['All', ...ITEM_GROUPS];

// ─── Pipeline Definitions (NO S1/S2 NOTATION) ──────────────────────────────────
const PIPELINE_STAGES = {
  2: { id: 2, name: 'Awaiting Production Approval', short: 'Needs Approval', icon: '📝', color: 'text-amber-700 bg-amber-50 ring-amber-200 border-amber-100', bg: 'bg-amber-500' },
  3: { id: 3, name: 'Fabric Ready (Awaiting Cut)',  short: 'Needs Cutting',  icon: '🧵', color: 'text-blue-700 bg-blue-50 ring-blue-200 border-blue-100', bg: 'bg-blue-500' },
  4: { id: 4, name: 'Inhouse Cut (Wait For Naame)', short: 'Needs Naame',    icon: '📦', color: 'text-purple-700 bg-purple-50 ring-purple-200 border-purple-100', bg: 'bg-purple-500' },
  5: { id: 5, name: 'In Production (Working)',      short: 'In Prod',        icon: '🏭', color: 'text-indigo-700 bg-indigo-50 ring-indigo-200 border-indigo-100', bg: 'bg-indigo-500' },
  6: { id: 6, name: 'Jama Complete (Unsettled)',    short: 'Needs Settle',   icon: '✅', color: 'text-teal-700 bg-teal-50 ring-teal-200 border-teal-100', bg: 'bg-teal-500' }
};

// ─── Stage Group Card ─────────────────────────────────────────────────────────
function StageGroupCard({ stage, jobs, onClick }) {
   const count = jobs.length;
   const lateCount = jobs.filter(j => isDelayed(j)).length;

   return (
     <button 
       type="button" 
       onClick={onClick}
       disabled={count === 0}
       className={cls(
         'w-full text-left bg-white rounded-[2rem] p-5 border shadow-sm transition-all flex items-center justify-between group btn-press',
         count === 0 ? 'border-gray-50 opacity-60 grayscale' : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'
       )}
     >
       <div className="flex items-center gap-4">
         <div className={cls('w-[3.25rem] h-[3.25rem] rounded-[1rem] flex items-center justify-center text-3xl shrink-0 ring-1 shadow-inner', stage.color)}>
           {stage.icon}
         </div>
         <div className="pr-4">
            <h3 className="text-[17px] font-black text-gray-900 leading-tight tracking-tight">{stage.name}</h3>
            {count > 0 ? (
               <div className="flex items-center gap-2 mt-2 flex-wrap">
                 <span className="text-xs font-bold text-gray-500">{count} Active</span>
                 {lateCount > 0 && (
                   <span className="flex items-center gap-1.5 text-[10px] font-black text-white bg-red-500 px-2.5 py-0.5 rounded-full shadow-sm ring-2 ring-red-50">
                     <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/>
                     {lateCount} Late
                   </span>
                 )}
               </div>
            ) : (
               <span className="text-[11px] font-bold text-gray-400 mt-1 block tracking-wide uppercase">Empty Stage</span>
            )}
         </div>
       </div>
       <div className={cls(
         'w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0',
         count > 0 ? 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:translate-x-1' : 'bg-gray-50 text-gray-200'
       )}>
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
           <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
         </svg>
       </div>
     </button>
   )
}

// ─── Generic Detail Bottom Sheet ────────────────────────────────────────────────
function DetailSheet({ detail, jobs, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Sort jobs: Late first, then Latest Job No first
  const sortedJobs = [...jobs].sort((a,b) => {
     // Because this sheet is used for both Stage & Thekedar, we check step individually
     const stepA = detectStep(a);
     const stepB = detectStep(b);
     const aLate = isDelayed(a);
     const bLate = isDelayed(b);
     if (aLate && !bLate) return -1;
     if (!aLate && bLate) return 1;
     if (aLate && bLate) {
         return (getDaysInStep(b) || 0) - (getDaysInStep(a) || 0);
     }
     return String(b.jobNo).localeCompare(String(a.jobNo), undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-gray-50/80 rounded-t-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.1)] h-[90vh] flex flex-col relative"
           style={{ animation: 'slideUp 350ms cubic-bezier(0.22,1,0.36,1) both' }}>
         <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-gray-300 opacity-50" />
         
         {/* Sheet Header */}
         <div className="pt-8 pb-5 px-5 bg-white rounded-t-[2.5rem] border-b border-gray-100 shrink-0 flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] relative z-10">
            <div className="flex items-center gap-3.5">
               <div className={cls('w-[3.5rem] h-[3.5rem] rounded-[1.25rem] flex items-center justify-center text-3xl ring-1 shadow-inner', detail.color || 'bg-gray-50 border-gray-200')}>
                 {detail.icon}
               </div>
               <div>
                  <h2 className="text-[17px] font-black text-gray-900 leading-tight pr-4">{detail.name}</h2>
                  <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">{jobs.length} Active Jobs</p>
               </div>
            </div>
            <button onClick={onClose} aria-label="Close"
              className="p-3 rounded-full hover:bg-gray-100 bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors btn-press shrink-0 -mt-1 -mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
         </div>

         {/* Content List */}
         <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {sortedJobs.map((job, idx) => (
              <div key={job.jobNo} style={{ animation: 'slideUp 400ms both', animationDelay: `${idx * 40}ms` }}>
                <PipelineCard job={job} />
              </div>
            ))}
            <div className="h-4" /> {/* Bottom padding */}
         </div>
      </div>
    </div>
  )
}

// ─── Unified Detailed Pipeline Card ───────────────────────────────────────────
function PipelineCard({ job }) {
  const step = detectStep(job);
  const stage = PIPELINE_STAGES[step];
  if (!stage) return null;

  const delayDays = getDaysInStep(job);
  const isLate = isDelayed(job);
  
  // Progress visualization mapping (Total 5 active stages, steps 2 through 6)
  const progressPercent = ((step - 2) / 4) * 100;

  return (
    <article className={cls(
      'bg-white rounded-[1.75rem] p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border-2 relative overflow-hidden group',
      isLate ? 'border-red-200 bg-red-50/10' : 'border-white hover:border-gray-100'
    )}>
       {/* Background structural progress bar at the very top edge */}
       <div className="absolute top-0 left-0 w-full h-[4px] bg-gray-50">
         <div 
           className={cls('h-full transition-all duration-1000 ease-out', stage.bg)}
           style={{ width: `${Math.max(10, progressPercent)}%` }}
         />
       </div>

       <div className="mt-2 flex justify-between items-start mb-4">
          <div className="pr-2">
            <div className="flex items-center gap-1.5 mb-1.5">
               <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">#{job.jobNo}</span>
               <span className="text-gray-300">•</span>
               <span className="text-[10px] font-bold text-gray-400">{fmtDate(job.date)} <span className="font-medium opacity-60">Started</span></span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 leading-tight block pr-2">{job.item || '—'}</h3>
          </div>
          
          <div className={cls(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl ring-1 shrink-0',
            stage.color
          )}>
             <span className="text-[11px]">{stage.icon}</span>
             <span className="text-[9px] font-black uppercase tracking-wider">{stage.short}</span>
          </div>
       </div>

       {/* Tags */}
       <div className="flex flex-wrap gap-2 mb-4">
          {job.size && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-xl text-[10px] font-black">{job.size}</span>}
          {job.qty  && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-xl text-[10px] font-black">{job.qty} pcs</span>}
          {job.itemGroup && <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">{job.itemGroup}</span>}
       </div>

       {/* Special Instructions */}
       {(job.specialInstruction?.trim()) && (
          <div className="mb-4 bg-amber-50 text-amber-800 text-[11px] font-bold px-3.5 py-2.5 rounded-xl border border-amber-200/50 leading-relaxed shadow-sm">
             <span className="mr-1 text-sm">⚠️</span> {job.specialInstruction}
          </div>
       )}

       {/* Dynamic Status Footer */}
       <div className="bg-gray-50 rounded-2xl p-3.5 flex justify-between items-center border border-gray-100/80">
           <div className="flex flex-col flex-1 min-w-0 pr-3">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Assigned / Info</span>
              <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5 truncate">
                 {step >= 4 && job.s4Thekedar ? (
                     <span className="text-indigo-600 font-extrabold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md"><span className="text-[10px]">👷</span> {job.s4Thekedar}</span>
                 ) : (
                     <span className="text-gray-500 italic">No direct owner</span>
                 )}
              </span>
           </div>
           
           <div className="flex flex-col items-end shrink-0 pl-4 border-l-2 border-gray-200">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Time Elapsed</span>
              <span className={cls(
                 'text-[14px] font-black tracking-tight',
                 isLate ? 'text-red-500' : 'text-gray-700'
              )}>
                 {delayDays !== null ? (isLate ? `⚠️ ${delayDays}d LATE` : `${delayDays} Days`) : '—'}
              </span>
           </div>
       </div>
    </article>
  )
}

// ─── Pull indicator ───────────────────────────────────────────────────────────
function PullIndicator({ progress, isRefreshing }) {
  return (
    <div className="flex justify-center overflow-hidden" style={{ height: `${progress * 40}px` }}>
      <div style={{ opacity: progress, transform: `scale(${0.5 + progress * 0.5})` }}>
        {isRefreshing
          ? <svg className="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-400" style={{ transform: `rotate(${progress * 360}deg)` }}><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.243a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.928a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" /></svg>
        }
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductionReport() {
  const { data: jobs = [], isLoading: loading, refetch } = useJobs();

  // UI state persisted in Zustand
  const category        = useUIStore((s) => s.productionCategory);
  const viewMode        = useUIStore((s) => s.productionViewMode);
  const setCategory     = useUIStore((s) => s.setProductionCategory);
  const setViewMode     = useUIStore((s) => s.setProductionViewMode);

  const [searchThekedar, setSearchThekedar] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const { toasts, addToast, dismiss } = useToast();

  const { containerRef, handlers, pullProgress, isRefreshing } = usePullToRefresh(refetch);

  // Apply category filter
  const filtered = useMemo(() => {
    if (category === 'All') return jobs;
    return jobs.filter((j) =>
      String(j.itemGroup ?? '').trim().toLowerCase() === category.toLowerCase()
    );
  }, [jobs, category]);

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-gray-50/50">
      <div ref={containerRef} {...handlers}>
        <PullIndicator progress={pullProgress} isRefreshing={isRefreshing} />

        {/* Page header */}
        <div className="px-5 pt-5 pb-3">
           <h1 className="text-[26px] font-black text-gray-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Pipeline</h1>
           <p className="text-[13px] font-bold text-gray-400 mt-1.5 uppercase tracking-widest">Real-time Stage Summary</p>
        </div>

        {/* Category filter — horizontally scrolling */}
        <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-xl pb-2 pt-2 border-b border-gray-200/50">
          <div className="flex gap-2.5 overflow-x-auto px-5 scrollbar-none"
               style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={cls(
                  'shrink-0 px-4 py-2 rounded-xl text-xs font-black border transition-all duration-200',
                  category === cat
                    ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 btn-press'
                )}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="px-5 mt-4">
          <div className="flex bg-gray-200/60 rounded-xl p-1 shadow-inner">
             <button onClick={() => setViewMode('stage')}
               className={cls("flex-1 py-2 text-xs font-bold rounded-lg transition-all", viewMode === 'stage' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700 bg-transparent')}>
               Pipeline By Stage
             </button>
             <button onClick={() => setViewMode('thekedar')}
               className={cls("flex-1 py-2 text-xs font-bold rounded-lg transition-all", viewMode === 'thekedar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700 bg-transparent')}>
               Thekedar Insights
             </button>
          </div>
        </div>

        {/* Thekedar Search Bar */}
        {viewMode === 'thekedar' && (
          <div className="px-5 mt-3 animate-[slideDown_200ms_ease-out]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search Thekedar by name..."
                value={searchThekedar}
                onChange={(e) => setSearchThekedar(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-[13px] font-semibold rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="px-5 mt-4 space-y-3">
          {loading ? (
             [0, 1, 2, 3].map((i) => <JobCardSkeleton key={i} />)
          ) : viewMode === 'stage' ? (
             // PIPELINE BY STAGE
             Object.values(PIPELINE_STAGES).map(stage => {
                const groupJobs = filtered.filter(j => detectStep(j) === stage.id);
                return (
                   <StageGroupCard 
                      key={stage.id} 
                      stage={stage} 
                      jobs={groupJobs} 
                      onClick={() => setSelectedDetail({ ...stage, type: 'stage' })} 
                   />
                )
             })
          ) : (
             // THEKEDAR INSIGHTS
             (() => {
                // Group active jobs (steps 4,5,6) by thekedar
                const thekedarMap = {};
                filtered.forEach(j => {
                   const step = detectStep(j);
                   // Only count jobs currently assigned to a thekedar
                   if (step >= 4 && step <= 6 && j.s4Thekedar && j.s4Thekedar.trim() !== '') {
                      const name = j.s4Thekedar.trim();
                      if (!thekedarMap[name]) thekedarMap[name] = [];
                      thekedarMap[name].push(j);
                   }
                });
                
                let thekedarList = Object.keys(thekedarMap).map(name => ({
                   id: name,
                   name: name,
                   short: 'Thekedar',
                   icon: '👷',
                   color: 'text-emerald-700 bg-emerald-50 ring-emerald-200 border-emerald-100',
                   bg: 'bg-emerald-500',
                   type: 'thekedar'
                })).sort((a,b) => b.name.localeCompare(a.name)); // Alphabetical

                if (searchThekedar.trim()) {
                   const q = searchThekedar.toLowerCase();
                   thekedarList = thekedarList.filter(t => t.name.toLowerCase().includes(q));
                }

                if (thekedarList.length === 0) {
                   return (
                     <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                       <p className="text-gray-400 font-bold text-sm tracking-wide">
                         {searchThekedar.trim() ? 'No Thekedars found matching search.' : 'No active jobs assigned to Thekedars.'}
                       </p>
                     </div>
                   );
                }

                return thekedarList.map(t => (
                   <StageGroupCard 
                      key={t.id} 
                      stage={t} 
                      jobs={thekedarMap[t.name]} 
                      onClick={() => setSelectedDetail(t)} 
                   />
                ));
             })()
          )}
        </div>
      </div>

      {/* Render the details bottom sheet popup when a card is tapped */}
      {selectedDetail && (
         <DetailSheet 
            detail={selectedDetail}
            jobs={selectedDetail.type === 'stage' 
                ? filtered.filter(j => detectStep(j) === selectedDetail.id)
                : filtered.filter(j => {
                    const s = detectStep(j);
                    return s >= 4 && s <= 6 && j.s4Thekedar?.trim() === selectedDetail.name;
                  })
            }
            onClose={() => setSelectedDetail(null)}
         />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
