import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import StepBadge from './StepBadge';
import { detectStep } from '../utils/jobLogic';
import ApprovalForm from './ApprovalForm';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// ─── Icons (Inline SVGs for stability) ────────────────────────────────────────
const ArrowLeft = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);

const Package = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2.125a.75.75 0 01.375.1l7.5 4.33a.75.75 0 01.375.65v5.59a.75.75 0 01-.375.65l-7.5 4.33a.75.75 0 01-.75 0l-7.5-4.33A.75.75 0 012 12.795v-5.59a.75.75 0 01.375-.65l7.5-4.33a.75.75 0 01.375-.1z" />
  </svg>
);

const Users = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0110.908-2.677 5.18 5.18 0 00-3.413 1.244 6.212 6.212 0 00-3.483 2.608zm11.444-2.557a5.5 5.5 0 015.827 5.129 1.225 1.225 0 01-1.112 1.325h-9.544a1.225 1.225 0 01-1.112-1.325 5.499 5.499 0 015.941-5.129z" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
);

// ─── Modal Component ──────────────────────────────────────────────────────────
function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
      />
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{ willChange: 'transform, opacity' }}
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
      >
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
        <div className="p-6 overflow-y-auto scrollbar-none flex-1">
          {children}
        </div>
      </motion.div>
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
              <div 
                className={`
                  rounded-full flex items-center justify-center font-black transition-all duration-300
                  w-5 h-5 sm:w-7 sm:h-7 text-[8px] sm:text-[10px]
                  ${isCompleted ? 'bg-green-500 text-white shadow-sm' : 
                    isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-md' : 
                    'bg-gray-100 text-gray-400'}
                `}>
                {isCompleted ? (
                  <svg className="w-3 h-3 sm:w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : s}
              </div>
              <div className="absolute -top-6 scale-0 group-hover:scale-100 transition-transform bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded pointer-events-none z-10 whitespace-nowrap font-bold uppercase tracking-tighter shadow-xl">
                {t('dashboard.step') || 'Step'} {s}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-[2px] transition-colors duration-300 ${isCompleted ? 'bg-green-400' : 'bg-gray-100'}`} />
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
    { id: 'Full Bottom/FB', label: 'Full Bottoms', image: 'https://ik.imagekit.io/pxrljukon/items/full%20bottom.png' },
    { id: 'Tops/Tshirts/HT', label: 'Tops', image: 'https://ik.imagekit.io/pxrljukon/items/tops.png' },
    { id: 'Capri/CP', label: 'Capri', image: 'https://ik.imagekit.io/pxrljukon/items/capri.png' },
    { id: 'Shorts/SH', label: 'Shorts', image: 'https://ik.imagekit.io/pxrljukon/items/shorts.png' },
    { id: 'Skirts', label: 'Skirts', image: 'https://ik.imagekit.io/pxrljukon/items/skirt.png' },
    { id: 'Aline/Frock/Long Tops', label: 'Aline/Frock/Long Tops', image: 'https://ik.imagekit.io/pxrljukon/items/alinefrock.png' },
    { id: 'Sets', label: 'Sets', image: 'https://ik.imagekit.io/pxrljukon/items/sets.png' },
    { id: 'Boys', label: 'Boys', image: 'https://ik.imagekit.io/pxrljukon/items/boys.png' },
  ];

  /**
   * Refined isMatch utility for expert-grade categorization.
   * Now handles industry-standard abbreviations (HT, FB, CP, etc.)
   */
  const isMatch = (job, categoryId) => {
    const jobGroup = (job.itemGroup || '').toLowerCase().trim();
    const itemName = (job.item || '').toLowerCase().trim();
    const catId = categoryId.toLowerCase().trim();
    
    // 1. Direct group match or abbreviation match
    const catParts = catId.split(/[\/\s]+/).filter(Boolean);
    const jobParts = jobGroup.split(/[\/\s]+/).filter(Boolean);
    
    // Check if any part of the category ID matches any part of the job group
    const hasGroupMatch = catParts.some(cp => 
      jobParts.some(jp => jp === cp || jp.startsWith(cp) || cp.startsWith(jp))
    );
    
    if (hasGroupMatch) return true;

    // 2. Special industry mapping (HT -> Tops, FB -> Bottoms)
    const industryMapping = {
      'ht': ['tops', 'tshirts', 'ht'],
      'fb': ['full bottom', 'fb'],
      'cp': ['capri', 'cp'],
      'sh': ['shorts', 'sh']
    };

    for (const [key, aliases] of Object.entries(industryMapping)) {
      const isJobThisKey = jobParts.some(jp => jp === key || jp.startsWith(key));
      const isCatThisKey = catParts.some(cp => aliases.includes(cp));
      if (isJobThisKey && isCatThisKey) return true;
    }

    // 3. Item name heuristic (if group is missing or "Other")
    if (!jobGroup || jobGroup === 'other') {
      return catParts.some(part => itemName.includes(part));
    }

    return false;
  };

  const filteredJobs = useMemo(() => {
    if (!selectedCategory) return [];
    return jobs.filter(j => {
      return isMatch(j, selectedCategory) && detectStep(j) === 2;
    }).sort((a, b) => b.jobNo - a.jobNo);
  }, [jobs, selectedCategory]);

  const handleApproveClick = (e, job) => {
    e.stopPropagation();
    setApprovalJob(job);
  };

  if (selectedCategory) {
    const catInfo = categories.find(c => c.id === selectedCategory);
    return (
      <motion.div 
        key="category-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="will-change-transform"
      >
        <div className="flex items-center gap-4 mb-6 bg-white/90 p-3 rounded-[2rem] border border-gray-100 shadow-sm sticky top-0 z-10">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedCategory(null)}
            className="p-3 rounded-2xl bg-white text-gray-500 shadow-sm border border-gray-100 active:bg-indigo-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex flex-col">
            <motion.h3 
              layoutId={`title-${selectedCategory}`} 
              className="font-black text-gray-900 leading-none text-base uppercase tracking-tight"
            >
              {catInfo?.label}
            </motion.h3>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
              {filteredJobs.length} {t('common.pending')}
            </span>
          </div>

          <motion.div 
            layoutId={`img-${selectedCategory}`}
            className="ml-auto w-12 h-12 rounded-2xl overflow-hidden border-2 border-white"
          >
            <img src={catInfo?.image} alt={catInfo?.label} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="space-y-3 pb-24">
          <AnimatePresence>
            {filteredJobs.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('common.noData')}</p>
              </motion.div>
            ) : (
              filteredJobs.map((job, index) => (
                <motion.div 
                  key={job.jobNo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                  className="bg-white rounded-[2rem] border-2 border-gray-100 p-5 shadow-sm active:border-indigo-200 transition-all cursor-pointer group will-change-transform"
                  onClick={() => onSelectJob(job)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">#{job.jobNo}</span>
                        <h4 className="text-base font-black text-gray-900 truncate tracking-tight">{job.item}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100 truncate">{job.size}</span>
                        <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100/50">{job.qty} {t('common.pcs')}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleApproveClick(e, job)}
                      className="bg-indigo-600 text-white text-[10px] font-black px-5 py-3 rounded-2xl active:bg-indigo-700 transition-all uppercase tracking-[0.1em] shrink-0"
                    >
                      {t('forms.approve')}
                    </button>
                  </div>
                  
                  <HorizontalTrail job={job} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <Modal 
          isOpen={!!approvalJob} 
          onClose={() => setApprovalJob(null)}
          title={t('forms.productionApproval')}
        >
          {approvalJob && (
            <ApprovalForm 
              job={approvalJob} 
              onSuccess={() => setApprovalJob(null)}
              onCancel={() => setApprovalJob(null)}
            />
          )}
        </Modal>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 15, stiffness: 300 }
    }
  };

  return (
    <motion.div 
      key="category-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4 will-change-transform"
    >
      {categories.map((cat) => {
        const count = jobs.filter(j => isMatch(j, cat.id) && detectStep(j) === 2).length;
        
        return (
          <motion.button
            key={cat.id}
            variants={itemVariants}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedCategory(cat.id)}
            className="relative group bg-white rounded-[2.5rem] border-2 border-gray-100 p-6 text-center transition-all active:border-indigo-100 overflow-hidden"
          >
            <motion.div 
              layoutId={`img-${cat.id}`}
              className="w-20 h-20 mx-auto rounded-3xl overflow-hidden mb-5 border-2 border-white shadow-lg"
            >
              <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
            </motion.div>
            <motion.span 
              layoutId={`title-${cat.id}`}
              className="text-xs font-black text-gray-900 uppercase tracking-wider leading-tight block mb-1"
            >
              {cat.label}
            </motion.span>
            
            <div className="flex items-center justify-center gap-1.5 opacity-60">
              <div className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{count} {t('common.pending')}</span>
            </div>

            {count > 0 && (
              <div className="absolute top-4 right-4">
                <div className="bg-indigo-600 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                  {count}
                </div>
              </div>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

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

  if (selectedWorker) {
    const workerData = groupedByWorker.find(w => w.name === selectedWorker);
    return (
      <motion.div 
        key="worker-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6 will-change-transform"
      >
        <div className="flex items-center gap-4 bg-white/95 p-4 rounded-[2.5rem] border-2 border-gray-100 shadow-lg sticky top-0 z-10">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedWorker(null)}
            className="p-3 rounded-2xl bg-gray-50 text-gray-500 border border-gray-100 active:bg-indigo-50 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          
          <div className="flex-1">
            <motion.h3 
              layoutId={`worker-name-${selectedWorker}`} 
              className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none"
            >
              {selectedWorker}
            </motion.h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{workerData?.jobs.length} {t('dashboard.activeJobs')}</span>
              <span className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{workerData?.pendingQty} {t('common.pending')}</span>
            </div>
          </div>

          <motion.div 
            layoutId={`worker-avatar-${selectedWorker}`}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100"
          >
            {selectedWorker.charAt(0).toUpperCase()}
          </motion.div>
        </div>

        <div className="space-y-3 pb-20">
          <AnimatePresence>
            {workerData?.jobs.map((job, index) => (
              <motion.div 
                key={job.jobNo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                onClick={() => onSelectJob(job)}
                className="bg-white rounded-[2rem] border-2 border-gray-100 p-5 shadow-sm active:border-indigo-300 transition-all cursor-pointer group will-change-transform"
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter shrink-0">#{job.jobNo}</span>
                      <h4 className="text-base font-black text-gray-900 truncate tracking-tight">{job.item}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100 truncate">{job.size}</span>
                      <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl shrink-0 border border-indigo-100">{job.qty} Pcs</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StepBadge step={detectStep(job)} size="sm" />
                  </div>
                </div>
                <HorizontalTrail job={job} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 15, stiffness: 300 }
    }
  };

  return (
    <motion.div 
      key="worker-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <div className="relative group">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
        <input 
          type="text" 
          placeholder="Explore workers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-[2rem] border-2 border-gray-100 text-sm bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-800 shadow-inner"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20 will-change-transform"
      >
        <AnimatePresence>
          {groupedByWorker.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No workers found</p>
            </motion.div>
          ) : (
            groupedByWorker.map((worker) => (
              <motion.button
                key={worker.name}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedWorker(worker.name)}
                className="group relative flex items-center gap-4 bg-white p-5 rounded-[2.5rem] border-2 border-gray-100 shadow-sm transition-all active:border-indigo-200 text-left overflow-hidden"
              >
                <motion.div 
                  layoutId={`worker-avatar-${worker.name}`}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg"
                >
                  {worker.name.charAt(0).toUpperCase()}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h4 
                    layoutId={`worker-name-${worker.name}`} 
                    className="text-sm font-black text-gray-900 uppercase tracking-tight truncate"
                  >
                    {worker.name}
                  </motion.h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{worker.jobs.length} Active</span>
                    <span className="w-1 h-1 rounded-full bg-gray-200" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{worker.pendingQty} Pcs</span>
                  </div>
                </div>
                
                <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 active:bg-indigo-600 active:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Job Management Tabs ────────────────────────────────────────────────
export default function JobManagement({ jobs, onSelectJob }) {
  const [activeTab, setActiveTab] = useState('product'); // 'product' or 'worker'
  const { t } = useLanguage();

  return (
    <LayoutGroup>
      <div className="px-4 mt-8">
        <div className="bg-white rounded-[3.5rem] border-2 border-gray-200 p-6 sm:p-10 shadow-2xl shadow-gray-200/40 overflow-hidden relative min-h-[500px]">
          {/* Background circles (simplified for mobile performance) */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-50 rounded-full -ml-40 -mb-40 pointer-events-none" />
          
          {/* Tab Headers */}
          <div className="flex p-2 bg-gray-100 rounded-[2rem] mb-10 relative z-10 max-w-sm mx-auto shadow-inner border border-gray-200/50">
            {['product', 'worker'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative z-10 ${
                  activeTab === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white rounded-[1.5rem] shadow-lg shadow-indigo-100 ring-1 ring-black/5 z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab === 'product' ? 'Product Wise' : 'Worker Wise'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'product' ? (
                <ProductWiseJobs 
                  key="product-panel"
                  jobs={jobs} 
                  onSelectJob={onSelectJob} 
                />
              ) : (
                <JobWorkerWiseJobs 
                  key="worker-panel"
                  jobs={jobs} 
                  onSelectJob={onSelectJob} 
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
