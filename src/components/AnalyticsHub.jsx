import React, { useMemo } from 'react';
import { 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell, Legend 
} from 'recharts';
import { getPendingStep } from '../utils/jobLogic';

// ─── Local helpers ────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function daysDiff(from) {
  if (!from) return null;
  return Math.floor((Date.now() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function daysInStep(job, step) {
  if (!job) return 0;
  const dateFields = {
    2: job.date,
    3: job.s2Actual,
    4: job.s3Actual,
    5: job.s4StartDate,
    6: job.s5JamaPlanned,
  };
  return daysDiff(parseDate(dateFields[step]));
}

// Delay thresholds in days per step
const DELAY_THRESHOLDS = { 2: 3, 3: 2, 4: 2, 5: 14, 6: 3 };

function isDelayed(job, step) {
  const days = daysInStep(job, step);
  if (days === null) return false;
  return days > (DELAY_THRESHOLDS[step] ?? 7);
}

// Steps shown in analytics (step 2–6 in our system)
// Using a cohesive brand palette: Indigo, Blue, and Slate/Zinc for a premium feel
const PIPELINE_STAGES = {
  2: { name: 'Approval',    short: 'Awaits Appr', color: '#818cf8' }, // Indigo 400
  3: { name: 'Fabric/Cut',  short: 'Needs Cut',   color: '#6366f1' }, // Indigo 500
  4: { name: 'Naame',       short: 'In Naame',    color: '#3b82f6' }, // Blue 500
  5: { name: 'Production',  short: 'In Prod',     color: '#4338ca' }, // Indigo 700
  6: { name: 'Jama/Settle', short: 'Need Settle', color: '#1e293b' }, // Slate 800
};

const ACTIVE_STEPS = [2, 3, 4, 5, 6];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsHub({ jobs }) {
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  // 1. Bottleneck data — how many jobs per stage
  const bottleneckData = useMemo(() =>
    ACTIVE_STEPS.map(id => {
      const stageJobs = safeJobs.filter(j => getPendingStep(j) === id);
      return {
        name: PIPELINE_STAGES[id].name,
        'Active Jobs': stageJobs.length,
        fill: PIPELINE_STAGES[id].color,
      };
    }),
  [safeJobs]);

  // 2. Delay pulse — on-time vs late per stage
  const delayData = useMemo(() =>
    ACTIVE_STEPS.map(id => {
      const stageJobs = safeJobs.filter(j => getPendingStep(j) === id);
      const late   = stageJobs.filter(j => isDelayed(j, id)).length;
      const onTime = stageJobs.length - late;
      return {
        name: PIPELINE_STAGES[id].short,
        'On Time': onTime,
        'Delayed': late,
      };
    }),
  [safeJobs]);

  const customTooltipStyle = {
    borderRadius: '1.25rem',
    border: '2px solid #e5e7eb',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
    fontWeight: 800,
    padding: '12px 16px',
  };

  return (
    <div className="space-y-6 px-4 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Chart 1: Stage Bottlenecks */}
        <div className="bg-white rounded-[2rem] p-6 shadow-md border-2 border-gray-200 group hover:shadow-lg transition-all hover:border-indigo-100">
          <div className="mb-6">
            <h3 className="text-xl font-black text-gray-900 leading-none">Stage Bottlenecks</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">Where are jobs piling up?</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottleneckData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 800, fill: '#4b5563' }} axisLine={false} tickLine={false} width={80} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={customTooltipStyle} />
                <Bar dataKey="Active Jobs" radius={[0, 8, 8, 0]} barSize={32}>
                  {bottleneckData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Stage Health */}
        <div className="bg-white rounded-[2rem] p-6 shadow-md border-2 border-gray-200 group hover:shadow-lg transition-all hover:border-indigo-100">
          <div className="mb-6">
            <h3 className="text-xl font-black text-gray-900 leading-none">Stage Health</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">Where are jobs getting delayed?</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 800, fill: '#6b7280' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={customTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '15px' }} />
                <Bar dataKey="On Time" stackId="a" fill="#6366f1" radius={[0, 0, 6, 6]} barSize={40} />
                <Bar dataKey="Delayed"  stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
