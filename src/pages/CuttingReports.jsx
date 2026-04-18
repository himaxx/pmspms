import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllJobs, updateStep3 } from '../utils/db';
import { STEP_PEOPLE } from '../utils/constants';
import { JobCardSkeleton } from '../components/Skeleton';
import { useToast, ToastContainer } from '../components/Toast';
import usePullToRefresh from '../hooks/usePullToRefresh';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parseSets, formatSets } from '../utils/helpers';

// helper functions
function parseDate(str) {
  if (!str) return null;
  // Handle DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{2}[-/]\d{2}[-/]\d{4}/.test(str)) {
    const parts = str.substr(0, 10).split(/[-/]/);
    const timePart = str.substr(10);
    const isoStr = `${parts[2]}-${parts[1]}-${parts[0]}${timePart}`;
    const d = new Date(isoStr);
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function daysDiff(from) {
  if (!from) return null;
  const diff = Date.now() - from.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function fmtDate(str) {
  const d = parseDate(str);
  if (!d) return '-';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function cls(...p) { return p.filter(Boolean).join(' '); }

function Chip({ children, color = 'gray' }) {
  const colors = {
    yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    red:    'bg-red-50 text-red-600 ring-red-200',
    green:  'bg-green-50 text-green-700 ring-green-200',
    blue:   'bg-blue-50 text-blue-700 ring-blue-200',
    gray:   'bg-gray-100 text-gray-600 ring-gray-200',
  };
  return (
    <span className={cls(
      'inline-flex items-center text-[10px] font-semibold rounded-full ring-1 px-2 py-0.5',
      colors[color] ?? colors.gray
    )}>
      {children}
    </span>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  );
}

function PendingTab({ jobs, loading, onJobClick }) {
  const [search, setSearch] = useState('');

  const pending = useMemo(() => {
    return jobs
      .filter((j) => {
        const isPending = String(j.s2YesNo ?? '').toLowerCase() === 'yes' &&
               String(j.s2Inhouse ?? '').toLowerCase() === 'yes' &&
               !String(j.s3Actual ?? '').trim();
        if (!isPending) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          String(j.jobNo).toLowerCase().includes(q) ||
          String(j.item).toLowerCase().includes(q) ||
          String(j.size).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const da = parseDate(a.s2Actual);
        const db = parseDate(b.s2Actual);
        const tA = da ? da.getTime() : 0;
        const tB = db ? db.getTime() : 0;
        if (tB !== tA) return tB - tA;
        return String(b.jobNo).localeCompare(String(a.jobNo), undefined, { numeric: true });
      });
  }, [jobs, search]);

  if (loading) return <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <JobCardSkeleton key={i} />)}</div>;

  return (
    <div className="space-y-3 p-4">
      <div className="sticky top-0 z-10 bg-gray-50 pb-2">
        <input 
          type="text" 
          placeholder="Search pending jobs..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border-gray-200 border-2 p-3 rounded-xl bg-white focus:border-indigo-400 outline-none text-sm transition-colors"
        />
      </div>

      {!pending.length && search && <div className="text-center text-sm text-gray-500 py-8">No matching jobs found.</div>}
      {!pending.length && !search && <EmptyState icon="S" message="No pending cutting jobs." />}

      {pending.map((job) => (
        <article key={job.jobNo} onClick={() => onJobClick(job)} className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-sm cursor-pointer hover:border-indigo-200 animate-slideUp">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Job #{job.jobNo}</p>
              <h3 className="font-bold text-gray-900">{job.item}</h3>
            </div>
            <Chip color="gray">{daysDiff(parseDate(job.s2Actual))}d</Chip>
          </div>
          <div className="text-sm text-gray-500 mt-2 font-medium">Qty: {job.qty} | Size: {job.size}</div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[10px] font-bold text-orange-500 uppercase">Awaiting Cutting</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function CompletedTab({ jobs, loading }) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const completed = useMemo(() => {
    const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);
    
    return jobs
      .filter(j => j.s3Actual)
      .filter(j => {
        if (showAll) return true;
        const d = parseDate(j.s3Actual);
        return d && d.getTime() >= tenDaysAgo;
      })
      .filter(j => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          String(j.jobNo).toLowerCase().includes(q) ||
          String(j.item).toLowerCase().includes(q) ||
          String(j.s3CuttingPerson).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const dA = parseDate(a.s3Actual);
        const dB = parseDate(b.s3Actual);
        const tA = dA ? dA.getTime() : 0;
        const tB = dB ? dB.getTime() : 0;
        
        if (tB !== tA) return tB - tA;
        return String(b.jobNo).localeCompare(String(a.jobNo), undefined, { numeric: true });
      });
  }, [jobs, search, showAll]);

  if (loading) return <div className="space-y-3 p-4"></div>;

  return (
    <div className="space-y-3 p-4">
      <div className="sticky top-0 z-10 bg-gray-50 pb-2 space-y-3">
        <input 
          type="text" 
          placeholder="Search by Job #, Item, or Person..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border-gray-200 border-2 p-3 rounded-xl bg-white focus:border-indigo-400 outline-none text-sm transition-colors"
        />
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {showAll ? 'Showing All Records' : 'Showing Last 10 Days'}
          </p>
          <button 
            onClick={() => setShowAll(!showAll)}
            className={cls(
              "text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 transition-all",
              showAll ? "bg-indigo-600 border-indigo-600 text-white" : "text-indigo-600 border-indigo-100 hover:border-indigo-200"
            )}
          >
            {showAll ? 'View Recent only' : 'View All Data'}
          </button>
        </div>
      </div>
      
      {!completed.length && (search || !showAll) && (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100">
          <p className="text-sm font-bold text-gray-500 italic">
            {search ? `No results found for "${search}"` : 'No records in the last 10 days.'}
          </p>
          {!showAll && !search && (
            <button onClick={() => setShowAll(true)} className="mt-2 text-xs text-indigo-600 font-bold hover:underline">Check all time data →</button>
          )}
        </div>
      )}
      {!completed.length && !search && showAll && <EmptyState icon="C" message="No completed jobs found." />}

      {completed.map(job => (
        <article key={job.jobNo} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-slideUp">
          <div className="flex justify-between">
            <div>
              <p className="text-[10px] text-gray-400 font-bold">Job #{job.jobNo}</p>
              <h3 className="font-bold text-gray-900">{job.item}</h3>
            </div>
            <div className="text-right">
              <Chip color="green">Done</Chip>
              <p className="text-[9px] text-gray-400 mt-0.5 font-bold">{fmtDate(job.s3Actual)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Cut: <span className="font-bold text-gray-700">{job.s3DukanCutting} pcs</span> by {job.s3CuttingPerson}</p>
        </article>
      ))}
    </div>
  );
}

function HisabTab({ jobs, loading }) {
  const [rates, setRates] = useState({});
  const [start, setStart] = useState(new Date(Date.now() - 7*864e5).toISOString().slice(0,10));
  const [end, setEnd]     = useState(new Date().toISOString().slice(0,10));
  const [personFilter, setPersonFilter] = useState('');

  const filtered = useMemo(() => {
    return jobs
      .filter(j => {
        if (!j.s3Actual) return false;
        if (personFilter && String(j.s3CuttingPerson).toLowerCase() !== personFilter.toLowerCase()) return false;
        const d = j.s3Actual.slice(0,10);
        return d >= start && d <= end;
      })
      .sort((a, b) => {
        const da = parseDate(a.s3Actual);
        const db = parseDate(b.s3Actual);
        return (db || 0) - (da || 0);
      });
  }, [jobs, start, end, personFilter]);

  const total = useMemo(() => {
    let p = 0, a = 0;
    filtered.forEach(j => {
      const pcs = Number(j.s3DukanCutting) || 0;
      const rate = Number(rates[j.jobNo]) || 0;
      p += pcs; a += pcs * rate;
    });
    return { p, a };
  }, [filtered, rates]);

  const uniquePeople = useMemo(() => {
    const people = new Set(jobs.filter(j => j.s3Actual && j.s3CuttingPerson).map(j => j.s3CuttingPerson));
    return Array.from(people).sort();
  }, [jobs]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Cutting Hisab', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Cutting Person: ${personFilter || 'All'}`, 14, 32);
    doc.text(`Date Range: ${fmtDate(start)} to ${fmtDate(end)}`, 14, 38);
    
    const tableData = filtered.map(j => [
      fmtDate(j.s3Actual),
      j.item,
      j.jobNo,
      j.s3DukanCutting || 0,
      rates[j.jobNo] || 0,
      (Number(j.s3DukanCutting)||0) * (Number(rates[j.jobNo])||0)
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Item', 'Job #', 'Pieces', 'Rate', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // indigo-600
      foot: [['', '', 'Total', String(total.p), '', `Rs ${total.a}`]],
      footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
    });
    
    doc.save(`Hisab_${personFilter || 'All'}_${start}_${end}.pdf`);
  };

  const allRatesFilled = filtered.length > 0 && filtered.every(j => Number(rates[j.jobNo]) > 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex gap-2">
          <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="flex-1 border p-2 rounded-xl text-xs bg-white" title="Start Date" />
          <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="flex-1 border p-2 rounded-xl text-xs bg-white" title="End Date" />
        </div>
        <select 
          value={personFilter} 
          onChange={e=>setPersonFilter(e.target.value)} 
          className="w-full border p-2.5 rounded-xl text-sm bg-white"
        >
          <option value="">All Cutting Persons</option>
          {uniquePeople.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_3rem_4rem_4rem] gap-2 text-[10px] uppercase font-bold text-gray-400 border-b pb-2 mb-2">
          <span>Item</span><span className="text-right">Pcs</span><span className="text-right">Rate</span><span className="text-right">Amt</span>
        </div>
        {filtered.map(j => (
          <div key={j.jobNo} className="grid grid-cols-[1fr_3rem_4rem_4rem] gap-2 items-center py-2 border-b border-gray-50 text-sm">
            <span className="truncate font-medium flex flex-col">
              <span className="truncate">{j.item}</span>
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <span className="font-bold">#{j.jobNo}</span>
                {personFilter === '' && j.s3CuttingPerson && <span>· {j.s3CuttingPerson}</span>}
              </span>
            </span>
            <span className="text-right">{j.s3DukanCutting}</span>
            <input type="number" value={rates[j.jobNo] || ''} onChange={e=>setRates({...rates, [j.jobNo]: e.target.value})} className="text-right border rounded p-1 w-full text-xs" />
            <span className="text-right font-bold text-indigo-600">{(Number(j.s3DukanCutting)||0)*(Number(rates[j.jobNo])||0)}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-gray-400 text-sm italic">No cut records in this range</p>}
        {filtered.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 flex flex-col gap-4">
            <div className="flex justify-between font-black text-indigo-700 text-base">
              <span>Total: {total.p} pcs</span>
              <span>Rs {total.a}</span>
            </div>
            
            <button 
              onClick={handleDownloadPDF}
              disabled={!allRatesFilled || !personFilter}
              className={cls(
                "w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2",
                (!allRatesFilled || !personFilter) ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              { !personFilter ? 'Select Person to Download' : 
                !allRatesFilled ? 'Fill All Rates to Download' : 
                'Download Hisab PDF' }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CuttingFormSheet({ job, isOpen, onClose, onRefresh }) {
  const [sets, setSets] = useState([{ size: '', qty: '' }]);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (job) {
      setSets(parseSets(job.size, job.qty));
      setName('');
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const totalPcs = sets.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);

  const handleSub = async (e) => {
    e.preventDefault();
    if (!name) return addToast('Please select cutting person', 'error');
    if (totalPcs <= 0) return addToast('Total pieces must be greater than 0', 'error');

    setSubmitting(true);
    try {
      const sizeDetails = formatSets(sets);
      await updateStep3(job.jobNo, { 
        cuttingPcs: totalPcs, 
        name, 
        sizeDetails 
      });
      addToast('Cutting Logged!', 'success');
      onRefresh();
      onClose();
    } catch (err) { 
      addToast(err.message, 'error'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const updateSet = (index, field, val) => {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: val } : s));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 space-y-6 animate-slideUp shadow-2xl border-t-4 border-indigo-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none">Log Cutting</h2>
            <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">#{job.jobNo} | {job.item}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSub} className="space-y-5">
          {/* Multi-set input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Size & Quantity Breakdown</label>
            {sets.map((set, idx) => (
              <div key={idx} className="flex gap-3 animate-slideUp" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex-1">
                  <input type="text" placeholder="Size" value={set.size} onChange={e => updateSet(idx, 'size', e.target.value)}
                    className="w-full border-gray-200 border-2 p-3.5 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold" />
                </div>
                <div className="flex-1">
                  <input type="number" placeholder="Qty" value={set.qty} onChange={e => updateSet(idx, 'qty', e.target.value)}
                    className="w-full border-gray-200 border-2 p-3.5 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold" />
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center px-1">
              <p className="text-sm font-black text-indigo-600">Total: {totalPcs} pcs</p>
              {sets.length < 3 && (
                <button type="button" onClick={() => setSets([...sets, { size: '', qty: '' }])}
                        className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700">+ Add Set</button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">Cutting Person *</label>
            <select required value={name} onChange={e=>setName(e.target.value)} 
                    className="w-full border-gray-200 border-2 p-3.5 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold">
              <option value="">Select Person</option>
              {STEP_PEOPLE[3].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <button disabled={submitting} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition-all text-white p-4.5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 disabled:opacity-50">
              {submitting ? 'Updating Data...' : 'Confirm Cutting Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CuttingReports() {
  const [tab, setTab] = useState('pending');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const { toasts, addToast, dismiss } = useToast();
  const fetch = useCallback(async () => {
    setLoading(true);
    const d = await getAllJobs();
    setJobs(d);
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const { containerRef, handlers } = usePullToRefresh(fetch);

  return (
    <div className="min-h-full bg-gray-50" ref={containerRef} {...handlers}>
      <div className="p-4 bg-white border-b sticky top-0 z-20">
        <h1 className="text-xl font-black">Cutting Reports</h1>
        <div className="flex gap-4 mt-2">
          {['pending', 'completed', 'hisab'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={cls('capitalize font-bold text-sm pb-1 border-b-2', tab===t?'text-indigo-600 border-indigo-600':'text-gray-400 border-transparent')}>{t}</button>
          ))}
        </div>
      </div>
      <div className="pb-20">
        {tab==='pending' && <PendingTab jobs={jobs} loading={loading} onJobClick={setSel} />}
        {tab==='completed' && <CompletedTab jobs={jobs} loading={loading} />}
        {tab==='hisab' && <HisabTab jobs={jobs} loading={loading} />}
      </div>
      <CuttingFormSheet job={sel} isOpen={!!sel} onClose={()=>setSel(null)} onRefresh={fetch} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
