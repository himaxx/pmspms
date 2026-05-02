import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import StepBadge from './StepBadge';
import { detectStep } from '../utils/jobLogic';
import ApprovalForm from './ApprovalForm';

// ─── Modal Component ──────────────────────────────────────────────────────────
function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm anim-fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden anim-slideUp max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-gray-200" />
        </div>
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto scrollbar-thin flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Horizontal Trail Component ───────────────────────────────────────────────
function HorizontalTrail({ job }) {
  const { t } = useLanguage();
  const currentStep = detectStep(job);
  const steps = [1, 2, 3, 4, 5, 6];
  
  return (
    <div className="flex items-center w-full gap-0.5 sm:gap-1 mt-6 px-1">
      {steps.map((s, idx) => {
        const isCompleted = currentStep > s || (currentStep === 7);
        const isActive = currentStep === s;
        
        return (
          <React.Fragment key={s}>
            <div className="relative flex flex-col items-center group">
              <div className={`
                rounded-full flex items-center justify-center font-black transition-all duration-500
                w-5 h-5 sm:w-7 sm:h-7 text-[8px] sm:text-[10px]
                ${isCompleted ? 'bg-green-500 text-white shadow-sm' : 
                  isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 scale-110 shadow-md' : 
                  'bg-gray-100 text-gray-400'}
              `}>
                {isCompleted ? (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : s}
              </div>
              <div className="absolute -top-6 scale-0 group-hover:scale-100 transition-transform bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded pointer-events-none z-10 whitespace-nowrap font-bold uppercase tracking-tighter shadow-xl">
                {t('dashboard.step') || 'Step'} {s}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-[2px] transition-colors duration-700 ${
                isCompleted ? 'bg-green-400' : 'bg-gray-100'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Product Wise Jobs ────────────────────────────────────────────────────────
function ProductWiseJobs({ jobs, onSelectJob }) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [approvalJob, setApprovalJob] = useState(null);

  const categories = [
    { id: 'Full Bottom', label: 'Full Bottoms', image: 'https://ik.imagekit.io/pxrljukon/items/full%20bottom.png' },
    { id: 'Tops/Tshirts', label: 'Tops', image: 'https://ik.imagekit.io/pxrljukon/items/tops.png' },
    { id: 'Capri', label: 'Capri', image: 'https://ik.imagekit.io/pxrljukon/items/capri.png' },
    { id: 'Shorts', label: 'Shorts', image: 'https://ik.imagekit.io/pxrljukon/items/shorts.png' },
    { id: 'Skirts', label: 'Skirts', image: 'https://ik.imagekit.io/pxrljukon/items/skirt.png' },
    { id: 'Aline/Frock/Long Tops', label: 'Aline/Frock/Long Tops', image: 'https://ik.imagekit.io/pxrljukon/items/alinefrock.png' },
    { id: 'Sets', label: 'Sets', image: 'https://ik.imagekit.io/pxrljukon/items/sets.png' },
    { id: 'Boys', label: 'Boys', image: 'https://ik.imagekit.io/pxrljukon/items/boys.png' },
  ];

  const filteredJobs = useMemo(() => {
    if (!selectedCategory) return [];
    return jobs.filter(j => {
      const isCorrectCategory = j.itemGroup?.split(' / ')[0] === selectedCategory;
      const isAwaitingApproval = detectStep(j) === 2;
      return isCorrectCategory && isAwaitingApproval;
    });
  }, [jobs, selectedCategory]);

  const handleApproveClick = (e, job) => {
    e.stopPropagation();
    setApprovalJob(job);
  };

  if (selectedCategory) {
    const catInfo = categories.find(c => c.id === selectedCategory);
    return (
      <div className="anim-slideUp">
        <div className="flex items-center gap-3 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="p-2.5 rounded-xl bg-white text-gray-500 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors btn-press"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border-2 border-white shrink-0">
            <img src={catInfo?.image} alt={catInfo?.label} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 leading-none">{catInfo?.label}</h3>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1.5">Awaiting Production Approval</p>
          </div>
          <span className="ml-auto bg-white text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
            {filteredJobs.length} {t('common.pending')}
          </span>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin pb-4">
          {filteredJobs.length === 0 ? (
            <div className="py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
              <span className="text-4xl opacity-30 block mb-4">✨</span>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('common.allCaughtUp') || 'All Caught Up!'}</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div 
                key={job.jobNo}
                onClick={() => onSelectJob(job)}
                className="bg-white rounded-[2rem] border-2 border-gray-100 p-5 shadow-sm hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div className="min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter shrink-0">#{job.jobNo}</span>
                      <h4 className="text-base font-black text-gray-900 truncate tracking-tight">{job.item}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 truncate max-w-[100px] sm:max-w-none">{job.size}</span>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg shrink-0">{job.qty} {t('common.pcs')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleApproveClick(e, job)}
                    className="w-full sm:w-auto bg-gradient-to-br from-green-500 to-emerald-600 text-white text-[11px] font-black px-5 py-3 sm:py-2.5 rounded-2xl shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-95 transition-all uppercase tracking-widest ring-4 ring-white"
                  >
                    {t('forms.approve')}
                  </button>
                </div>
                
                <HorizontalTrail job={job} />
              </div>
            ))
          )}
        </div>

        <Modal 
          isOpen={!!approvalJob} 
          onClose={() => setApprovalJob(null)}
          title={t('forms.productionApproval')}
        >
          {approvalJob && (
            <ApprovalForm 
              job={approvalJob} 
              onSuccess={() => {
                setApprovalJob(null);
                // The parent component will re-fetch data automatically via TanStack Query
              }}
              onCancel={() => setApprovalJob(null)}
            />
          )}
        </Modal>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 anim-slideUp">
      {categories.map((cat) => {
        const count = jobs.filter(j => 
          j.itemGroup?.split(' / ')[0] === cat.id && detectStep(j) === 2
        ).length;
        
        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className="relative group overflow-hidden bg-white rounded-3xl border-2 border-gray-100 p-5 text-center transition-all hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/50 active:scale-95 btn-press"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-4 shadow-xl group-hover:scale-110 transition-transform ring-4 ring-white/20">
              <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider leading-tight block">
              {cat.label}
            </span>
            {count > 0 && (
              <div className="absolute top-3 right-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-4 ring-white shadow-lg animate-pulse">
                  {count}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Job Worker Wise Jobs ─────────────────────────────────────────────────────
// ─── Job Worker Wise Jobs ─────────────────────────────────────────────────────
function JobWorkerWiseJobs({ jobs, onSelectJob }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);

  const groupedByWorker = useMemo(() => {
    const workers = {};
    jobs.forEach(j => {
      const worker = j.s4Thekedar || 'Unassigned';
      if (!workers[worker]) workers[worker] = { name: worker, jobs: [], totalQty: 0, pendingQty: 0 };
      workers[worker].jobs.push(j);
      workers[worker].totalQty += (Number(j.s4CuttingPcs) || Number(j.qty) || 0);
      const balance = Number(j.s5Balance);
      if (!isNaN(balance)) workers[worker].pendingQty += balance;
    });
    
    return Object.values(workers)
      .filter(w => w.name !== 'Unassigned' && w.jobs.length > 0)
      .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.jobs.length - a.jobs.length);
  }, [jobs, searchTerm]);

  // View 1: Detailed Jobs for a specific worker
  if (selectedWorker) {
    const workerData = groupedByWorker.find(w => w.name === selectedWorker);
    return (
      <div className="anim-slideUp space-y-6">
        <div className="flex items-center gap-4 bg-white p-5 rounded-[2.5rem] border-2 border-gray-100 shadow-xl shadow-gray-100/50">
          <button 
            onClick={() => setSelectedWorker(null)}
            className="p-3 rounded-2xl bg-gray-50 text-gray-500 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all btn-press"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{selectedWorker}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{workerData?.jobs.length} {t('dashboard.activeJobs') || 'Active Jobs'}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{workerData?.pendingQty} {t('common.pending')} Pcs</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin pb-10">
          {workerData?.jobs.map(job => (
            <div 
              key={job.jobNo}
              onClick={() => onSelectJob(job)}
              className="bg-white rounded-3xl border-2 border-gray-100 p-5 shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-center gap-4 relative z-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter shrink-0">#{job.jobNo}</span>
                    <h4 className="text-sm font-black text-gray-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">{job.item}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 truncate">{job.size}</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg shrink-0">{job.qty} Pcs</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <StepBadge step={detectStep(job)} size="xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // View 2: Worker Directory (Directory View)
  return (
    <div className="anim-slideUp space-y-6">
      <div className="relative group">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
        <input 
          type="text" 
          placeholder="Explore workers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 text-sm bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-800 shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin pb-10">
        {groupedByWorker.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <span className="text-4xl opacity-30 block mb-4">👷</span>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No workers found</p>
          </div>
        ) : (
          groupedByWorker.map(worker => (
            <button
              key={worker.name}
              onClick={() => setSelectedWorker(worker.name)}
              className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-6 flex items-center justify-between shadow-sm hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all text-left relative group active:scale-[0.98] btn-press"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                  {worker.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-1">{worker.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{worker.jobs.length} Active</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{worker.pendingQty} Pcs</span>
                  </div>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Job Management Tabs ────────────────────────────────────────────────
export default function JobManagement({ jobs, onSelectJob }) {
  const [activeTab, setActiveTab] = useState('product'); // 'product' or 'worker'
  const { t } = useLanguage();

  return (
    <div className="px-4 mt-8">
      <div className="bg-white rounded-[3rem] border-2 border-gray-200 p-6 sm:p-8 shadow-2xl shadow-gray-200/40 overflow-hidden relative">
        {/* Background blobs for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />
        
        {/* Tab Headers */}
        <div className="flex p-1.5 bg-gray-100/80 backdrop-blur rounded-[1.5rem] mb-8 relative z-10 max-w-sm mx-auto shadow-inner border border-gray-200/50">
          <button
            onClick={() => setActiveTab('product')}
            className={`flex-1 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === 'product' 
                ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100 ring-1 ring-black/5' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Product Wise
          </button>
          <button
            onClick={() => setActiveTab('worker')}
            className={`flex-1 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === 'worker' 
                ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100 ring-1 ring-black/5' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Worker Wise
          </button>
        </div>

        {/* Tab Content */}
        <div className="relative z-10">
          {activeTab === 'product' ? (
            <ProductWiseJobs jobs={jobs} onSelectJob={onSelectJob} />
          ) : (
            <JobWorkerWiseJobs jobs={jobs} onSelectJob={onSelectJob} />
          )}
        </div>
      </div>
    </div>
  );
}
