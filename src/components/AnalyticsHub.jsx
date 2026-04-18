import React, { useMemo } from 'react';
import { 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell, Legend 
} from 'recharts';

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function detectStep(job) {
  if (!job) return 1;
  if (String(job.s6SettleQty ?? '').trim()) return 6;
  if (String(job.s5Status ?? '').trim().toLowerCase() === 'complete' || 
      String(job.s5JamaQty ?? '').trim())   return 5;
  if (String(job.s4StartDate ?? '').trim()) return 4;
  if (String(job.s3Actual ?? '').trim())    return 3;
  if (String(job.s2Actual ?? '').trim())    return 2;
  return 1;
}

function daysDiff(from) {
  if (!from) return null;
  return Math.floor((Date.now() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function daysInStep(job, step) {
  if (!job) return 0;
  const dateFields = {
    1: job.date,
    2: job.s2Actual,
    3: job.s3Actual,
    4: job.s4StartDate,
    5: job.s5JamaPlanned,
    6: null,
  };
  if (step === 6) return 0;
  return daysDiff(parseDate(dateFields[step]));
}

const DELAY_THRESHOLDS = { 1: 3, 2: 2, 3: 2, 4: 14, 5: 3 };

function isDelayed(job, step) {
  const days = daysInStep(job, step);
  if (days === null) return false;
  return days > (DELAY_THRESHOLDS[step] ?? 7);
}

const PIPELINE_STAGES = {
  1: { id: 1, name: 'Approval', short: 'Awaits Appr', color: '#f59e0b' },
  2: { id: 2, name: 'Fabric/Cut', short: 'Needs Cut', color: '#3b82f6' },
  3: { id: 3, name: 'Naame', short: 'Wait Naame', color: '#a855f7' },
  4: { id: 4, name: 'Production', short: 'In Prod', color: '#6366f1' },
  5: { id: 5, name: 'Jama/Settle', short: 'Need Settle', color: '#14b8a6' }
};

export default function AnalyticsHub({ jobs }) {
  // 1. Compute Bottleneck Data (Active Jobs by Stage)
  const bottleneckData = useMemo(() => {
     return [1,2,3,4,5].map(id => {
        const stageJobs = jobs.filter(j => detectStep(j) === id);
        return {
           name: PIPELINE_STAGES[id].name,
           'Active Jobs': stageJobs.length,
           fill: PIPELINE_STAGES[id].color,
        };
     });
  }, [jobs]);

  // 2. Compute Delay Pulse (On-Time vs Late per active stage)
  const delayData = useMemo(() => {
     return [1,2,3,4,5].map(id => {
        const stageJobs = jobs.filter(j => detectStep(j) === id);
        const late = stageJobs.filter(j => isDelayed(j, id)).length;
        const onTime = stageJobs.length - late;
        return {
           name: PIPELINE_STAGES[id].short,
           'On Time': onTime,
           'Delayed': late
        };
     });
  }, [jobs]);
  // Shared Tooltip styling
  const customTooltipStyle = {
     borderRadius: '1.25rem', 
     border: '2px solid #e5e7eb', 
     boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', 
     fontWeight: 800,
     padding: '12px 16px'
  };

  return (
    <div className="space-y-6 px-4 py-2">
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Chart 1: Bottleneck Tunnel */}
          <div className="bg-white rounded-[2rem] p-6 shadow-md border-2 border-gray-200 group hover:shadow-lg transition-all hover:border-indigo-100">
             <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 leading-none">Stage Bottlenecks</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">Where are jobs piling up?</p>
             </div>
             <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={bottleneckData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" tick={{fontSize: 11, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{fontSize: 11, fontWeight: 800, fill: '#4b5563'}} axisLine={false} tickLine={false} width={80} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={customTooltipStyle} />
                      <Bar dataKey="Active Jobs" radius={[0, 8, 8, 0]} barSize={32}>
                         {bottleneckData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Chart 2: Health & Delay Pulse */}
          <div className="bg-white rounded-[2rem] p-6 shadow-md border-2 border-gray-200 group hover:shadow-lg transition-all hover:border-indigo-100">
             <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 leading-none">Stage Health</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">Where are jobs getting delayed?</p>
             </div>
             <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={delayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 800, fill: '#6b7280'}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{fontSize: 11, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={customTooltipStyle} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '15px' }} />
                      <Bar dataKey="On Time" stackId="a" fill="#14b8a6" radius={[0, 0, 6, 6]} barSize={40} />
                      <Bar dataKey="Delayed" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>
    </div>
  );
}
