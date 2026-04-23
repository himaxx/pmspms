/**
 * AdminDashboard.jsx — Full Analytics Dashboard (Admin Only)
 *
 * Dark midnight theme. 10 analytics sections:
 *  1. Executive KPI bar
 *  2. Production Volume Trend (Area chart, 12 weeks)
 *  3. Live Pipeline Funnel (bar per step)
 *  4. Delay Heatmap by Step (grouped bar)
 *  5. Thekedar Performance (horizontal bar)
 *  6. Cutting Person Stats (donut + bar)
 *  7. Item Group Distribution (pie)
 *  8. Activity Calendar Heatmap (SVG grid)
 *  9. Bottleneck Jobs Table (live sortable)
 * 10. Approval & Rejection Flow (grouped bar)
 *
 * All data is sourced from the shared useJobs() TanStack Query cache.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { useJobs, useAdminUpdateJob } from '../hooks/useJobs';
import { useMasterData, useUpdateMasterData } from '../hooks/useMasterData';
import useAuthStore from '../store/useAuthStore';
import { getPendingStep } from '../utils/jobLogic';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const cls = (...classes) => classes.filter(Boolean).join(' ');

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/** Monday of the ISO week containing d */
function weekStart(d) {
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function fmt(d, opts = { month: 'short', day: 'numeric' }) {
  return d.toLocaleDateString('en-IN', opts);
}

function hoursToLabel(h) {
  if (!h || h <= 0) return '0h';
  return h < 24 ? `${Math.round(h)}h` : `${(h / 24).toFixed(1)}d`;
}

const STEP_NAMES = {
  1: 'New Req.',
  2: 'Approval',
  3: 'Cutting',
  4: 'Naame',
  5: 'Jama',
  6: 'Settle',
};
const STEP_COLORS = ['#818cf8', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];
const PIE_COLORS  = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

/** ─── CSV Export Helper ─────────────────────────────────────────────────── */
function convertToCSV(data) {
  if (!data || !data.length) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => {
      const str = String(val ?? '').replace(/"/g, '""');
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  ).join('\n');
  return `${headers}\n${rows}`;
}

function downloadCSV(data, filename = 'pms_jobs_export.csv') {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Styled primitives ────────────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`bg-gray-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-black text-white tracking-tight">{children}</h2>
      {sub && <p className="text-xs text-gray-500 font-medium mt-0.5">{sub}</p>}
    </div>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1e1e2e',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  color: '#e2e8f0',
  fontSize: 12,
  fontWeight: 600,
};

// ─── Section 1: KPI Cards ─────────────────────────────────────────────────────

function KpiBar({ jobs }) {
  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  const kpis = useMemo(() => {
    const active    = jobs.filter(j => getPendingStep(j) < 7);
    const completed = jobs.filter(j => {
      if (getPendingStep(j) !== 7) return false;
      const d = parseDate(j.s6SettleQty ? j.date : j.s5Actual);
      return d && d.getMonth() === month && d.getFullYear() === year;
    });
    const approved  = jobs.filter(j => j.s2YesNo === 'Yes');
    const submitted = jobs.filter(j => j.s2Actual);
    const approvalRate = submitted.length ? Math.round((approved.length / submitted.length) * 100) : 0;
    const totalPcs  = active.reduce((s, j) => s + (Number(j.s4CuttingPcs) || 0), 0);
    const delays    = jobs.flatMap(j => [j.s2Delay, j.s3Delay, j.s4Delay, j.s5Delay].filter(Boolean).map(Number));
    const avgDelay  = delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : 0;

    return [
      { label: 'Total Jobs',             value: jobs.length,   color: 'from-indigo-600 to-violet-600', icon: '📋' },
      { label: 'Active Jobs',            value: active.length, color: 'from-blue-600 to-cyan-600',     icon: '⚡' },
      { label: 'Completed This Month',   value: completed.length, color: 'from-emerald-600 to-teal-600', icon: '✅' },
      { label: 'Approval Rate',          value: `${approvalRate}%`, color: 'from-violet-600 to-pink-600', icon: '🎯' },
      { label: 'Pieces in Production',   value: totalPcs.toLocaleString(), color: 'from-amber-600 to-orange-600', icon: '🧵' },
      { label: 'Avg. Delay (hrs)',        value: hoursToLabel(avgDelay), color: 'from-rose-600 to-red-600', icon: '⏱️' },
    ];
  }, [jobs, month, year]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {kpis.map(({ label, value, color, icon }) => (
        <div key={label}
          className={`rounded-2xl bg-gradient-to-br ${color} p-4 shadow-lg relative overflow-hidden`}>
          <div className="absolute right-3 top-2 text-2xl opacity-20">{icon}</div>
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-white mt-1 leading-none">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Section 2: Production Volume Trend ──────────────────────────────────────

function VolumeTrend({ jobs }) {
  const data = useMemo(() => {
    const weeks = [];
    const now   = new Date();
    for (let w = 11; w >= 0; w--) {
      const start = weekStart(new Date(now.getTime() - w * 7 * 86400000));
      const end   = new Date(start.getTime() + 7 * 86400000);
      const created   = jobs.filter(j => { const d = parseDate(j.date); return d && d >= start && d < end; }).length;
      const completed = jobs.filter(j => {
        const d = parseDate(j.s5Actual || j.s4StartDate);
        return d && d >= start && d < end && getPendingStep(j) >= 6;
      }).length;
      weeks.push({ week: fmt(start, { month: 'short', day: 'numeric' }), created, completed });
    }
    return weeks;
  }, [jobs]);

  return (
    <Card>
      <SectionTitle sub="Last 12 weeks — new requirements vs completed jobs">
        📈 Production Volume Trend
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="grad-created" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-completed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#34d399" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <Area type="monotone" dataKey="created"   name="New Jobs"   stroke="#818cf8" strokeWidth={2} fill="url(#grad-created)" />
          <Area type="monotone" dataKey="completed" name="Completed"  stroke="#34d399" strokeWidth={2} fill="url(#grad-completed)" />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Section 3: Pipeline Funnel ───────────────────────────────────────────────

function PipelineFunnel({ jobs }) {
  const data = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map((step, i) => ({
      step: STEP_NAMES[step],
      count: jobs.filter(j => getPendingStep(j) === step).length,
      fill: STEP_COLORS[i],
    }));
  }, [jobs]);

  return (
    <Card>
      <SectionTitle sub="Jobs currently pending at each production stage">
        🔵 Live Pipeline — Jobs Per Stage
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="step" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={68} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" name="Jobs" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Section 4: Delay Heatmap ─────────────────────────────────────────────────

function DelayHeatmap({ jobs }) {
  const data = useMemo(() => {
    return [2, 3, 4, 5].map((step, i) => {
      const key    = `s${step}Delay`;
      const delays = jobs.map(j => Number(j[key])).filter(v => v > 0);
      const avg    = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
      const max    = delays.length ? Math.max(...delays) : 0;
      return { step: STEP_NAMES[step], avg: Math.round(avg), max: Math.round(max), fill: STEP_COLORS[i + 1] };
    });
  }, [jobs]);

  return (
    <Card>
      <SectionTitle sub="Average and maximum delay hours per step (higher = worse)">
        ⏱️ Delay Analysis by Step
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="step" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
                 tickFormatter={hoursToLabel} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => hoursToLabel(v)} />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
          <Bar dataKey="avg" name="Avg Delay" radius={[6, 6, 0, 0]} fill="#f59e0b" />
          <Bar dataKey="max" name="Max Delay" radius={[6, 6, 0, 0]} fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Section 5: Thekedar Performance ─────────────────────────────────────────

function ThekedarPerformance({ jobs }) {
  const data = useMemo(() => {
    const map = {};
    jobs.forEach(j => {
      if (!j.s4Thekedar) return;
      const th = j.s4Thekedar.trim();
      if (!map[th]) map[th] = { thekedar: th, total: 0, active: 0, pieces: 0, leadTimes: [] };
      map[th].total++;
      if (getPendingStep(j) < 7) map[th].active++;
      map[th].pieces += Number(j.s4CuttingPcs) || 0;
      if (j.s4LeadTime) map[th].leadTimes.push(Number(j.s4LeadTime));
    });
    return Object.values(map)
      .map(t => ({
        ...t,
        avgLead: t.leadTimes.length
          ? Math.round(t.leadTimes.reduce((a, b) => a + b, 0) / t.leadTimes.length)
          : 0,
      }))
      .filter(t => t.total > 0)
      .sort((a, b) => b.active - a.active)
      .slice(0, 12);
  }, [jobs]);

  return (
    <Card>
      <SectionTitle sub="Top thekedars by active jobs — pieces and avg. lead time">
        👷 Thekedar Performance
      </SectionTitle>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {data.map((t, i) => (
          <div key={t.thekedar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <span className="text-xs font-black text-gray-500 w-5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">{t.thekedar}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {t.pieces.toLocaleString()} pcs · Avg lead {t.avgLead}h
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400">{t.total} total</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full
                ${t.active > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {t.active} active
              </span>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-6">No thekedar data yet</p>
        )}
      </div>
    </Card>
  );
}

// ─── Section 6: Cutting Person Stats ─────────────────────────────────────────

function CuttingStats({ jobs }) {
  const { donutData, weekData } = useMemo(() => {
    const personMap = {};
    const weekMap   = {};

    jobs.forEach(j => {
      const person = j.s3CuttingPerson;
      const pcs    = Number(j.s3DukanCutting) || 0;
      const date   = parseDate(j.s3Actual);
      if (!person || !pcs) return;

      personMap[person] = (personMap[person] || 0) + pcs;

      if (date) {
        const ws = fmt(weekStart(date), { month: 'short', day: 'numeric' });
        if (!weekMap[ws]) weekMap[ws] = {};
        weekMap[ws][person] = (weekMap[ws][person] || 0) + pcs;
      }
    });

    const donutData = Object.entries(personMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const allPersons = Object.keys(personMap);
    const now        = new Date();
    const weekData   = [];
    for (let w = 7; w >= 0; w--) {
      const start = weekStart(new Date(now.getTime() - w * 7 * 86400000));
      const label = fmt(start, { month: 'short', day: 'numeric' });
      const entry = { week: label };
      allPersons.forEach(p => { entry[p] = weekMap[label]?.[p] || 0; });
      weekData.push(entry);
    }

    return { donutData, weekData };
  }, [jobs]);

  return (
    <Card>
      <SectionTitle sub="Pieces cut per person — total share and weekly trend">
        ✂️ Cutting Person Stats
      </SectionTitle>
      <div className="flex gap-4">
        {/* Donut */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                   dataKey="value" nameKey="name" paddingAngle={3}>
                {donutData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v.toLocaleString()} pcs`} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Weekly bar */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              {donutData.map((entry, i) => (
                <Bar key={entry.name} dataKey={entry.name} stackId="a" fill={PIE_COLORS[i % PIE_COLORS.length]}
                     radius={i === donutData.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

// ─── Section 7: Item Group Distribution ──────────────────────────────────────

function ItemGroupChart({ jobs }) {
  const data = useMemo(() => {
    const map = {};
    jobs.forEach(j => {
      const g = j.itemGroup || 'Other';
      if (!map[g]) map[g] = { name: g, count: 0, pieces: 0 };
      map[g].count++;
      map[g].pieces += Number(j.qty) || 0;
    });
    return Object.values(map).sort((a, b) => b.pieces - a.pieces);
  }, [jobs]);

  return (
    <Card>
      <SectionTitle sub="Job count and total pieces by garment category">
        🏷️ Item Group Distribution
      </SectionTitle>
      <div className="flex gap-4">
        <ResponsiveContainer width="50%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="name" paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v} jobs`, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-48 justify-center flex flex-col">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              <p className="text-xs text-gray-300 font-semibold truncate flex-1">{d.name}</p>
              <p className="text-xs text-gray-500 font-bold shrink-0">{d.count}j · {d.pieces.toLocaleString()}p</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Section 8: Activity Heatmap ──────────────────────────────────────────────

function ActivityHeatmap({ jobs }) {
  const { cells, maxCount } = useMemo(() => {
    const map = {};
    const bump = (dateStr) => {
      const d = parseDate(dateStr);
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      map[key] = (map[key] || 0) + 1;
    };
    jobs.forEach(j => {
      bump(j.date);
      bump(j.s2Actual);
      bump(j.s3Actual);
      bump(j.s4StartDate);
      bump(j.s5Actual);
    });

    // Build last 18 weeks × 7 days grid
    const now   = new Date();
    const cells = [];
    const WEEKS = 18;
    const start = weekStart(new Date(now.getTime() - (WEEKS - 1) * 7 * 86400000));
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
      const key   = d.toISOString().slice(0, 10);
      const count = map[key] || 0;
      cells.push({ date: key, count, label: fmt(d, { weekday: 'short', month: 'short', day: 'numeric' }) });
    }
    const maxCount = Math.max(...cells.map(c => c.count), 1);
    return { cells, maxCount };
  }, [jobs]);

  function cellColor(count) {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    const intensity = count / maxCount;
    if (intensity < 0.25) return '#312e81';
    if (intensity < 0.5)  return '#4338ca';
    if (intensity < 0.75) return '#6366f1';
    return '#818cf8';
  }

  // Group into week columns
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <Card>
      <SectionTitle sub="Production activity over 18 weeks — darker = more activity">
        📅 Activity Heatmap
      </SectionTitle>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pt-5">
            {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
              <div key={d} className="h-4 text-[9px] text-gray-600 font-bold leading-none flex items-center w-4">{d}</div>
            ))}
          </div>
          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              <div className="text-[9px] text-gray-600 font-medium h-4 leading-none flex items-start">
                {wi % 3 === 0 ? week[0]?.date.slice(5, 10) : ''}
              </div>
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={`${cell.label}: ${cell.count} activity`}
                  className="w-4 h-4 rounded-sm transition-colors cursor-default"
                  style={{ background: cellColor(cell.count) }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-[10px] text-gray-600 font-medium">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map(v => (
            <div key={v} className="w-3.5 h-3.5 rounded-sm" style={{ background: cellColor(Math.round(v * maxCount)) }} />
          ))}
          <span className="text-[10px] text-gray-600 font-medium">More</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Section 9: Bottleneck Jobs Table ────────────────────────────────────────

function BottleneckTable({ jobs }) {
  const [sort, setSort] = useState('delay');
  
  const delayed = useMemo(() => {
    return jobs
      .filter(j => getPendingStep(j) < 7)
      .map(j => {
        const step  = getPendingStep(j);
        const key   = `s${step}Delay`;
        const delay = Number(j[key]) || 0;
        const activeSince = parseDate(
          step === 2 ? j.s2Planned :
          step === 3 ? j.s3Planned :
          step === 4 ? j.s4Planned :
          step === 5 ? j.s5JamaPlanned : j.date
        );
        return { ...j, _step: step, _delay: delay, _activeSince: activeSince };
      })
      .filter(j => j._delay > 0)
      .sort((a, b) => sort === 'delay' ? b._delay - a._delay : b._step - a._step)
      .slice(0, 20);
  }, [jobs, sort]);

  function severityColor(delay) {
    if (delay > 48) return 'text-red-400 bg-red-500/10';
    if (delay > 24) return 'text-amber-400 bg-amber-500/10';
    return 'text-yellow-400 bg-yellow-500/10';
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle sub="Active jobs with delays — most critical first">
          📋 Bottleneck Jobs
        </SectionTitle>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-xs bg-white/5 border border-white/10 text-gray-400 rounded-xl px-3 py-1.5 outline-none"
        >
          <option value="delay">Sort: Most Delayed</option>
          <option value="step">Sort: Latest Step</option>
        </select>
      </div>
      {delayed.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm text-gray-500 font-medium">No delayed jobs! All on track.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest">
                <th className="text-left pb-2 font-bold">Job #</th>
                <th className="text-left pb-2 font-bold">Item</th>
                <th className="text-left pb-2 font-bold">Step</th>
                <th className="text-left pb-2 font-bold">Thekedar</th>
                <th className="text-right pb-2 font-bold">Delay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {delayed.map(j => (
                <tr key={j.jobNo} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 font-black text-indigo-400">#{j.jobNo}</td>
                  <td className="py-2.5 text-gray-300 font-medium max-w-[100px] truncate">{j.item}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-bold text-[10px]">
                      {STEP_NAMES[j._step] || `S${j._step}`}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-400 max-w-[80px] truncate">{j.s4Thekedar || '—'}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${severityColor(j._delay)}`}>
                      +{hoursToLabel(j._delay)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ─── Section 11: Raw Data Explorer ──────────────────────────────────────────

function RawDataExplorer({ jobs }) {
  const [search, setSearch] = useState('');
  
  const filtered = useMemo(() => {
    if (!search) return jobs;
    const lower = search.toLowerCase();
    return jobs.filter(j => 
      String(j.jobNo).toLowerCase().includes(lower) ||
      String(j.item).toLowerCase().includes(lower) ||
      String(j.s4Thekedar).toLowerCase().includes(lower) ||
      String(j.itemGroup).toLowerCase().includes(lower)
    );
  }, [jobs, search]);

  return (
    <Card className="col-span-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <SectionTitle sub={`Viewing all ${jobs.length} jobs with full database columns`}>
            🌐 Raw Data Explorer
          </SectionTitle>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search by Job#, Item, Thekedar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-violet-500 transition-all"
            />
          </div>
          <button
            onClick={() => downloadCSV(jobs)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-900/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-[10px] border-collapse min-w-[1200px]">
          <thead>
            <tr className="text-gray-500 uppercase tracking-widest border-b border-white/5">
              <th className="text-left py-3 px-2 font-black text-indigo-400">Job No</th>
              <th className="text-left py-3 px-2">Date</th>
              <th className="text-left py-3 px-2">Group</th>
              <th className="text-left py-3 px-2">Item</th>
              <th className="text-left py-3 px-2">Qty</th>
              <th className="text-left py-3 px-2">Prog By</th>
              <th className="text-left py-3 px-2">S2 Status</th>
              <th className="text-left py-3 px-2">S3 Person</th>
              <th className="text-left py-3 px-2">S4 Thekedar</th>
              <th className="text-left py-3 px-2">S5 Status</th>
              <th className="text-right py-3 px-2">Delay Tot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(j => {
              const totalDelay = (Number(j.s2Delay) || 0) + (Number(j.s3Delay) || 0) + (Number(j.s4Delay) || 0) + (Number(j.s5Delay) || 0);
              return (
                <tr key={j.jobNo} className="hover:bg-white/5 transition-colors group">
                  <td className="py-3 px-2 font-black text-white">#{j.jobNo}</td>
                  <td className="py-3 px-2 text-gray-400">{j.date ? new Date(j.date).toLocaleDateString() : '—'}</td>
                  <td className="py-3 px-2 text-gray-300 font-medium">{j.itemGroup || '—'}</td>
                  <td className="py-3 px-2 text-gray-300 truncate max-w-[120px]">{j.item}</td>
                  <td className="py-3 px-2 font-bold text-violet-400">{j.qty || 0}</td>
                  <td className="py-3 px-2 text-gray-400">{j.progBy || '—'}</td>
                  <td className="py-3 px-2">
                    <span className={`px-1.5 py-0.5 rounded ${j.s2YesNo === 'Yes' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {j.s2YesNo || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-400">{j.s3CuttingPerson || '—'}</td>
                  <td className="py-3 px-2 text-gray-300">{j.s4Thekedar || '—'}</td>
                  <td className="py-3 px-2">
                    <span className={`px-1.5 py-0.5 rounded ${j.s5Status === 'Complete' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {j.s5Status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`font-black ${totalDelay > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                      {totalDelay > 0 ? `+${hoursToLabel(totalDelay)}` : '0h'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
            No jobs found matching your search
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Section 12: Master Data Settings ─────────────────────────────────────────

function MasterDataSettings() {
  const { data: masterData, isLoading } = useMasterData();
  const updateMutation = useUpdateMasterData();
  
  const [progByInput, setProgByInput] = useState('');
  const [cuttingInput, setCuttingInput] = useState('');
  const [thekedarInput, setThekedarInput] = useState('');

  if (isLoading) return <div className="text-gray-400 py-4 animate-pulse">Loading settings...</div>;

  const progByList = masterData?.progBy || [];
  const cuttingNamesList = masterData?.cuttingNames || [];
  const thekedarNamesList = masterData?.thekedarNames || [];

  const handleAdd = async (category, currentList, input, setInput) => {
    if (!input.trim()) return;
    const nameStr = input.trim();
    if (currentList.includes(nameStr)) return;
    
    const newNames = [...currentList, nameStr];
    await updateMutation.mutateAsync({ category, names: newNames });
    setInput('');
  };

  const handleRemove = async (category, currentList, nameToRemove) => {
    const newNames = currentList.filter(n => n !== nameToRemove);
    await updateMutation.mutateAsync({ category, names: newNames });
  };

  const renderListEditor = (title, category, list, input, setInput) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <h3 className="text-sm font-bold text-white mb-3">{title}</h3>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Add new ${title}...`}
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(category, list, input, setInput)}
        />
        <button 
          onClick={() => handleAdd(category, list, input, setInput)}
          disabled={updateMutation.isPending || !input.trim()}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
        {list.map(name => (
          <div key={name} className="flex items-center gap-1 bg-black/40 rounded-lg px-2 py-1 border border-white/5">
            <span className="text-xs text-gray-300 font-medium">{name}</span>
            <button 
              onClick={() => handleRemove(category, list, name)}
              className="text-gray-500 hover:text-red-400 p-0.5 rounded transition-colors"
              title="Remove"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ))}
        {list.length === 0 && <span className="text-xs text-gray-500 italic">No names added yet.</span>}
      </div>
    </div>
  );

  return (
    <Card className="col-span-full">
      <SectionTitle sub="Manage drop-down lists used in production forms">
        ⚙️ Master Data Settings
      </SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {renderListEditor('Prog. By Names (Step 1)', 'prog_by', progByList, progByInput, setProgByInput)}
        {renderListEditor('Inhouse Cutting Names (Step 3)', 'cutting_names', cuttingNamesList, cuttingInput, setCuttingInput)}
        {renderListEditor('Thekedar Names (Step 4)', 'thekedar_names', thekedarNamesList, thekedarInput, setThekedarInput)}
      </div>
    </Card>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

function ApprovalFlow({ jobs }) {
  const [period, setPeriod] = useState('month');

  const data = useMemo(() => {
    const now   = new Date();
    const weeks = period === 'week' ? 1 : period === 'month' ? 4 : 52;
    const cutoff = new Date(now.getTime() - weeks * 7 * 86400000);

    const relevant = jobs.filter(j => {
      const d = parseDate(j.s2Actual);
      return d && d >= cutoff;
    });

    const approved   = relevant.filter(j => j.s2YesNo === 'Yes').length;
    const rejected   = relevant.filter(j => j.s2YesNo === 'No').length;
    const inhouse    = relevant.filter(j => j.s2Inhouse === 'Yes').length;
    const thekedar   = approved - inhouse;

    return [
      { label: 'Approved', value: approved, fill: '#34d399' },
      { label: 'Rejected', value: rejected, fill: '#ef4444' },
      { label: '→ Inhouse Cutting', value: inhouse, fill: '#818cf8' },
      { label: '→ To Thekedar', value: Math.max(thekedar, 0), fill: '#f59e0b' },
    ];
  }, [jobs, period]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle sub="Approval decisions and routing for the selected period">
          🔄 Approval & Rejection Flow
        </SectionTitle>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="text-xs bg-white/5 border border-white/10 text-gray-400 rounded-xl px-3 py-1.5 outline-none"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" name="Jobs" radius={[8, 8, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function CatalogSettings() {
  const { data: masterData, isLoading } = useMasterData();
  const updateMutation = useUpdateMasterData();
  
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [newItemInput, setNewItemInput] = useState('');

  if (isLoading) return <div className="text-gray-400 py-4 animate-pulse">Loading catalog...</div>;

  const catalog = masterData?.catalog || [];

  const handleUpdateCatalog = async (newCatalog) => {
    await updateMutation.mutateAsync({ category: 'catalog', names: newCatalog });
  };

  const handleAddCategory = () => {
    const name = prompt('Enter new category name:');
    if (!name || !name.trim()) return;
    const catName = name.trim().toUpperCase();
    if (catalog.some(c => c.category === catName)) return alert('Category already exists!');
    
    const newCatalog = [...catalog, { category: catName, subcategories: [] }];
    handleUpdateCatalog(newCatalog);
  };

  const handleEditCategory = (oldName) => {
    const name = prompt('Enter new category name:', oldName);
    if (!name || !name.trim() || name.trim() === oldName) return;
    const catName = name.trim().toUpperCase();
    if (catalog.some(c => c.category === catName)) return alert('Category already exists!');
    
    const newCatalog = catalog.map(c => 
      c.category === oldName ? { ...c, category: catName } : c
    );
    handleUpdateCatalog(newCatalog);
    if (selectedCat === oldName) setSelectedCat(catName);
  };

  const handleDeleteCategory = (catName) => {
    if (!window.confirm(`Delete category "${catName}" and all its subcategories/items?`)) return;
    const newCatalog = catalog.filter(c => c.category !== catName);
    handleUpdateCatalog(newCatalog);
    if (selectedCat === catName) {
      setSelectedCat(null);
      setSelectedSub(null);
    }
  };

  const handleAddSubcategory = () => {
    if (!selectedCat) return;
    const name = prompt('Enter new subcategory name:');
    if (!name || !name.trim()) return;
    const subName = name.trim().toUpperCase();
    
    const cIdx = catalog.findIndex(c => c.category === selectedCat);
    if (cIdx === -1) return;
    if (catalog[cIdx].subcategories.some(s => s.subcategory === subName)) return alert('Subcategory already exists!');
    
    const newCatalog = [...catalog];
    newCatalog[cIdx].subcategories = [...newCatalog[cIdx].subcategories, { subcategory: subName, items: [] }];
    handleUpdateCatalog(newCatalog);
  };

  const handleEditSubcategory = (oldName) => {
    if (!selectedCat) return;
    const name = prompt('Enter new subcategory name:', oldName);
    if (!name || !name.trim() || name.trim() === oldName) return;
    const subName = name.trim().toUpperCase();
    
    const cIdx = catalog.findIndex(c => c.category === selectedCat);
    if (cIdx === -1) return;
    if (catalog[cIdx].subcategories.some(s => s.subcategory === subName)) return alert('Subcategory already exists!');
    
    const newCatalog = [...catalog];
    newCatalog[cIdx].subcategories = newCatalog[cIdx].subcategories.map(s => 
      s.subcategory === oldName ? { ...s, subcategory: subName } : s
    );
    handleUpdateCatalog(newCatalog);
    if (selectedSub === oldName) setSelectedSub(subName);
  };

  const handleDeleteSubcategory = (subName) => {
    if (!selectedCat) return;
    if (!window.confirm(`Delete subcategory "${subName}" and all its items?`)) return;
    
    const cIdx = catalog.findIndex(c => c.category === selectedCat);
    if (cIdx === -1) return;
    
    const newCatalog = [...catalog];
    newCatalog[cIdx].subcategories = newCatalog[cIdx].subcategories.filter(s => s.subcategory !== subName);
    handleUpdateCatalog(newCatalog);
    if (selectedSub === subName) setSelectedSub(null);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedCat || !selectedSub || !newItemInput.trim()) return;
    const itemName = newItemInput.trim().toUpperCase();
    
    const cIdx = catalog.findIndex(c => c.category === selectedCat);
    if (cIdx === -1) return;
    const sIdx = catalog[cIdx].subcategories.findIndex(s => s.subcategory === selectedSub);
    if (sIdx === -1) return;
    if (catalog[cIdx].subcategories[sIdx].items.includes(itemName)) return alert('Item already exists!');
    
    const newCatalog = [...catalog];
    newCatalog[cIdx].subcategories[sIdx].items = [...newCatalog[cIdx].subcategories[sIdx].items, itemName];
    handleUpdateCatalog(newCatalog);
    setNewItemInput('');
  };

  const handleEditItem = (oldItemName) => {
    if (!selectedCat || !selectedSub) return;
    const name = prompt('Enter new item name:', oldItemName);
    if (!name || !name.trim() || name.trim() === oldItemName) return;
    const itemName = name.trim().toUpperCase();
    
    const cIdx = catalog.findIndex(c => c.category === selectedCat);
    if (cIdx === -1) return;
    const sIdx = catalog[cIdx].subcategories.findIndex(s => s.subcategory === selectedSub);
    if (sIdx === -1) return;
    
    if (catalog[cIdx].subcategories[sIdx].items.includes(itemName)) return alert('Item already exists!');
    
    const newCatalog = [...catalog];
    newCatalog[cIdx].subcategories[sIdx].items = newCatalog[cIdx].subcategories[sIdx].items.map(i => 
      i === oldItemName ? itemName : i
    );
    handleUpdateCatalog(newCatalog);
  };

  const handleDeleteItem = (itemName) => {
    if (!selectedCat || !selectedSub) return;
    
    const cIdx = catalog.findIndex(c => c.category === selectedCat);
    if (cIdx === -1) return;
    const sIdx = catalog[cIdx].subcategories.findIndex(s => s.subcategory === selectedSub);
    if (sIdx === -1) return;
    
    const newCatalog = [...catalog];
    newCatalog[cIdx].subcategories[sIdx].items = newCatalog[cIdx].subcategories[sIdx].items.filter(i => i !== itemName);
    handleUpdateCatalog(newCatalog);
  };

  const currentCatObj = catalog.find(c => c.category === selectedCat);
  const currentSubObj = currentCatObj?.subcategories?.find(s => s.subcategory === selectedSub);

  return (
    <Card className="col-span-full">
      <SectionTitle sub="Manage hierarchical Categories > Subcategories > Items">
        🗂️ Catalog Master Data
      </SectionTitle>

      {/* Responsive Explorer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 lg:h-[480px]">

        {/* ── Categories ── */}
        <div className="flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden h-[350px] lg:h-full">
          <div className="p-4 border-bottom border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
            <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Categories ({catalog.length})</span>
            <button onClick={handleAddCategory} className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-lg px-3 py-1.5 cursor-pointer font-bold transition-colors">+ Add</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {catalog.map(c => (
              <div
                key={c.category}
                onClick={() => { setSelectedCat(c.category); setSelectedSub(null); }}
                className={cls('flex items-center justify-between p-2.5 rounded-xl cursor-pointer mb-1 transition-all group', 
                  selectedCat === c.category ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent')}
              >
                <span className={cls('text-xs flex-1 truncate pr-2 font-medium', selectedCat === c.category ? 'text-indigo-200' : 'text-gray-400')}>{c.category}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); handleEditCategory(c.category); }} className="bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 p-1.5 rounded-lg text-xs leading-none transition-colors">✎</button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteCategory(c.category); }} className="bg-red-400/10 hover:bg-red-400/20 text-red-400 p-1.5 rounded-lg text-xs leading-none transition-colors">✕</button>
                </div>
              </div>
            ))}
            {catalog.length === 0 && <div className="text-center text-gray-600 text-[11px] mt-10">No categories added</div>}
          </div>
        </div>

        {/* ── Subcategories ── */}
        <div className="flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden h-[350px] lg:h-full">
          <div className="p-4 border-bottom border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
            <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Subcategories {selectedCat ? `(${currentCatObj?.subcategories?.length || 0})` : ''}</span>
            {selectedCat && <button onClick={handleAddSubcategory} className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-lg px-3 py-1.5 cursor-pointer font-bold transition-colors">+ Add</button>}
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {!selectedCat && <div className="text-center text-gray-700 text-xs mt-10">← Select a category</div>}
            {currentCatObj?.subcategories.map(s => (
              <div
                key={s.subcategory}
                onClick={() => setSelectedSub(s.subcategory)}
                className={cls('flex items-center justify-between p-2.5 rounded-xl cursor-pointer mb-1 transition-all group', 
                  selectedSub === s.subcategory ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent')}
              >
                <span className={cls('text-xs flex-1 truncate pr-2 font-medium', selectedSub === s.subcategory ? 'text-indigo-200' : 'text-gray-400')}>{s.subcategory}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); handleEditSubcategory(s.subcategory); }} className="bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 p-1.5 rounded-lg text-xs leading-none transition-colors">✎</button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteSubcategory(s.subcategory); }} className="bg-red-400/10 hover:bg-red-400/20 text-red-400 p-1.5 rounded-lg text-xs leading-none transition-colors">✕</button>
                </div>
              </div>
            ))}
            {selectedCat && currentCatObj?.subcategories?.length === 0 && <div className="text-center text-gray-600 text-[11px] mt-10">No subcategories added</div>}
          </div>
        </div>

        {/* ── Items ── */}
        <div className="flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden h-[350px] lg:h-full">
          <div className="p-4 border-bottom border-white/5 bg-white/[0.02] shrink-0">
            <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Items {selectedSub ? `(${currentSubObj?.items?.length || 0})` : ''}</span>
          </div>
          {selectedCat && selectedSub && (
            <form onSubmit={handleAddItem} className="p-3 border-b border-white/5 flex gap-2 shrink-0 bg-black/20">
              <input 
                type="text" 
                value={newItemInput} 
                onChange={e => setNewItemInput(e.target.value)} 
                placeholder="New Item Name..." 
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all" 
              />
              <button 
                type="submit" 
                disabled={!newItemInput.trim() || updateMutation.isPending} 
                className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-xl px-4 py-2 cursor-pointer font-bold transition-all disabled:opacity-50"
              >
                Add
              </button>
            </form>
          )}
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {(!selectedCat || !selectedSub) && <div className="text-center text-gray-700 text-xs mt-10">← Select a subcategory</div>}
            {currentSubObj?.items.map((item, idx) => (
              <div
                key={item}
                className="flex items-center justify-between p-2.5 rounded-xl mb-1 hover:bg-white/[0.02] border border-transparent group transition-all"
              >
                <span className="text-xs flex-1 truncate pr-2 text-gray-400 font-medium">{item}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditItem(item)} className="bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 p-1.5 rounded-lg text-xs leading-none transition-colors">✎</button>
                  <button onClick={() => handleDeleteItem(item)} className="bg-red-400/10 hover:bg-red-400/20 text-red-400 p-1.5 rounded-lg text-xs leading-none transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Card>
  );
}

// ─── Section 14: Job Data Correction ──────────────────────────────────────────

// camelCase → snake_case helper
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

// Field definitions for each step
const STEP_FIELDS = {
  1: [
    { key: 'progBy',             label: 'Prog. By',               type: 'text',     dbCol: 'prog_by' },
    { key: 'item',               label: 'Item Name',              type: 'text',     dbCol: 'item' },
    { key: 'itemGroup',          label: 'Item Group',             type: 'text',     dbCol: 'item_group' },
    { key: 'size',               label: 'Size',                   type: 'text',     dbCol: 'size' },
    { key: 'qty',                label: 'Quantity',               type: 'number',   dbCol: 'qty' },
    { key: 'reason',             label: 'Reason',                 type: 'text',     dbCol: 'reason' },
    { key: 'specialInstruction', label: 'Special Instruction',    type: 'textarea', dbCol: 'special_instruction' },
    { key: 'date',               label: 'Initiation Date',        type: 'datetime', dbCol: 'date' },
  ],
  2: [
    { key: 's2YesNo',       label: 'Approved?',              type: 'yesno',    dbCol: 's2_yes_no' },
    { key: 's2Instructions', label: 'Instructions',           type: 'textarea', dbCol: 's2_instructions' },
    { key: 's2Inhouse',     label: 'Inhouse Cutting?',       type: 'yesno',    dbCol: 's2_inhouse' },
    { key: 's2Actual',      label: 'Approval Date',          type: 'datetime', dbCol: 's2_actual' },
  ],
  3: [
    { key: 's3CuttingPerson', label: 'Cutting Person',       type: 'text',     dbCol: 's3_cutting_person' },
    { key: 's3DukanCutting',  label: 'Cutting Pieces',       type: 'number',   dbCol: 's3_dukan_cutting' },
    { key: 's3SizeDetails',   label: 'Size Details',         type: 'text',     dbCol: 's3_size_details' },
    { key: 's3Actual',        label: 'Cutting Date',         type: 'datetime', dbCol: 's3_actual' },
  ],
  4: [
    { key: 's4Thekedar',    label: 'Thekedar Name',          type: 'text',     dbCol: 's4_thekedar' },
    { key: 's4CutToPack',   label: 'Cut to Pack?',           type: 'yesno',    dbCol: 's4_cut_to_pack' },
    { key: 's4LeadTime',    label: 'Lead Time (hrs)',        type: 'number',   dbCol: 's4_lead_time' },
    { key: 's4CuttingPcs',  label: 'Cutting Pieces',        type: 'number',   dbCol: 's4_cutting_pcs' },
    { key: 's4StartDate',   label: 'Start Date',            type: 'datetime', dbCol: 's4_start_date' },
  ],
  5: [
    { key: 's5JamaQty',   label: 'Jama Quantity',           type: 'number',   dbCol: 's5_jama_qty' },
    { key: 's5Press',     label: 'Press Hua?',              type: 'yesno',    dbCol: 's5_press' },
    { key: 's5Status',    label: 'Status',                  type: 'text',     dbCol: 's5_status' },
  ],
  6: [
    { key: 's6SettleQty', label: 'Settle Quantity',         type: 'number',   dbCol: 's6_settle_qty' },
    { key: 's6Reason',    label: 'Reason',                  type: 'textarea', dbCol: 's6_reason' },
    { key: 's6Name',      label: 'Your Name',               type: 'text',     dbCol: 's6_name' },
  ],
};

const STEP_LABELS_ADMIN = {
  1: { icon: '📝', name: 'New Requirement', color: 'indigo' },
  2: { icon: '✅', name: 'Production Approval', color: 'blue' },
  3: { icon: '✂️', name: 'Inhouse Cutting', color: 'orange' },
  4: { icon: '🏭', name: 'Naame — On Production', color: 'purple' },
  5: { icon: '📦', name: 'Finished Maal Jama', color: 'green' },
  6: { icon: '💰', name: 'Settle', color: 'gray' },
};

const STEP_ACCENT = {
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', dot: 'bg-indigo-500' },
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400',   dot: 'bg-blue-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-500' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  dot: 'bg-green-500' },
  gray:   { bg: 'bg-gray-500/10',   border: 'border-gray-500/30',   text: 'text-gray-400',   dot: 'bg-gray-500' },
};

function formatDateForInput(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  // "YYYY-MM-DDTHH:MM" for datetime-local
  return d.toISOString().slice(0, 16);
}

function JobDataCorrection() {
  const { data: allJobs = [], isLoading: jobsLoading } = useJobs();
  const adminMutation = useAdminUpdateJob();

  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [openSteps, setOpenSteps] = useState({ 1: true });
  const [confirmDiff, setConfirmDiff] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return allJobs
      .filter(j => 
        String(j.jobNo).toLowerCase().includes(q) ||
        String(j.item || '').toLowerCase().includes(q) ||
        String(j.progBy || '').toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [search, allJobs]);

  // When a job is selected, populate edit values with current data
  function selectJob(job) {
    setSelectedJob(job);
    const vals = {};
    Object.values(STEP_FIELDS).flat().forEach(f => {
      let val = job[f.key];
      if (f.type === 'datetime') val = formatDateForInput(val);
      else if (f.type === 'number') val = val === '' || val === null || val === undefined ? '' : String(val);
      else val = val ?? '';
      vals[f.key] = String(val);
    });
    setEditValues(vals);
    setOpenSteps({ 1: true });
    setSaveSuccess(false);
    setSearch('');
  }

  // Track which fields have changed
  const changedFields = useMemo(() => {
    if (!selectedJob) return {};
    const changes = {};
    Object.values(STEP_FIELDS).flat().forEach(f => {
      const original = f.type === 'datetime' 
        ? formatDateForInput(selectedJob[f.key])
        : String(selectedJob[f.key] ?? '');
      const current = editValues[f.key] ?? '';
      if (original !== current) {
        changes[f.key] = { label: f.label, original, current, dbCol: f.dbCol, type: f.type };
      }
    });
    return changes;
  }, [selectedJob, editValues]);

  const changeCount = Object.keys(changedFields).length;

  function handleFieldChange(key, value) {
    setEditValues(prev => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  }

  function handleSaveClick() {
    if (changeCount === 0) return;
    setConfirmDiff(changedFields);
  }

  async function executeSave() {
    if (!selectedJob || changeCount === 0) return;
    
    // Build snake_case updates object
    const updates = {};
    Object.entries(changedFields).forEach(([key, info]) => {
      let val = info.current;
      if (info.type === 'number') val = val === '' ? null : Number(val);
      else if (info.type === 'datetime') val = val === '' ? null : new Date(val).toISOString();
      else if (val === '') val = null;
      updates[info.dbCol] = val;
    });

    try {
      await adminMutation.mutateAsync({ jobNo: selectedJob.jobNo, updates });
      setConfirmDiff(null);
      setSaveSuccess(true);
      // Refresh the selected job data
      setTimeout(() => {
        const fresh = allJobs.find(j => j.jobNo === selectedJob.jobNo);
        if (fresh) selectJob(fresh);
      }, 1500);
    } catch (err) {
      alert('Save failed: ' + err.message);
      setConfirmDiff(null);
    }
  }

  function toggleStep(step) {
    setOpenSteps(prev => ({ ...prev, [step]: !prev[step] }));
  }

  function renderField(field) {
    const val = editValues[field.key] ?? '';
    const isChanged = field.key in changedFields;
    const baseCls = 'w-full bg-black/40 border rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all';
    const borderCls = isChanged ? 'border-amber-500/60 ring-1 ring-amber-500/20' : 'border-white/10';

    if (field.type === 'textarea') {
      return (
        <textarea
          rows={2}
          value={val}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className={cls(baseCls, borderCls, 'resize-none')}
        />
      );
    }
    if (field.type === 'yesno') {
      return (
        <div className="flex gap-2">
          {['Yes', 'No', ''].map(v => (
            <button
              key={v || 'clear'}
              type="button"
              onClick={() => handleFieldChange(field.key, v)}
              className={cls(
                'flex-1 py-2 rounded-lg text-[11px] font-bold border transition-all',
                val === v
                  ? (v === 'Yes' ? 'bg-green-500/20 border-green-500/40 text-green-400'
                    : v === 'No' ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : 'bg-gray-500/20 border-gray-500/40 text-gray-400')
                  : 'bg-black/20 border-white/5 text-gray-600'
              )}
            >
              {v || 'Clear'}
            </button>
          ))}
        </div>
      );
    }
    if (field.type === 'datetime') {
      return (
        <input
          type="datetime-local"
          value={val}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className={cls(baseCls, borderCls)}
        />
      );
    }
    return (
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={val}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        className={cls(baseCls, borderCls)}
      />
    );
  }

  const pendingStep = selectedJob ? getPendingStep(selectedJob) : 0;

  return (
    <Card className="col-span-full">
      <SectionTitle sub="Search any job, inspect all steps, and correct data entries">
        🔧 Job Data Correction
      </SectionTitle>

      {/* ── Search Bar ── */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedJob(null); setSaveSuccess(false); }}
              placeholder="Search by Job No, Item Name, or Prog By..."
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-indigo-500 placeholder:text-gray-600 transition-all"
            />
          </div>
          {selectedJob && (
            <button
              onClick={() => { setSelectedJob(null); setSearch(''); setSaveSuccess(false); }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold rounded-xl transition-colors border border-white/5"
            >
              ← Back
            </button>
          )}
        </div>

        {/* ── Search Results Dropdown ── */}
        {search.trim() && !selectedJob && (
          <div className="mt-2 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
            {jobsLoading ? (
              <div className="p-4 text-center text-gray-500 text-xs animate-pulse">Loading...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-600 text-xs">No jobs found for "{search}"</div>
            ) : (
              searchResults.map(job => (
                <button
                  key={job.jobNo}
                  onClick={() => selectJob(job)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-400">#{job.jobNo}</span>
                      <span className="text-xs font-bold text-white truncate">{job.item}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 font-medium">
                      {job.progBy} · {job.size} · {job.qty} pcs · Step {getPendingStep(job) === 7 ? '✓ Done' : getPendingStep(job)}
                    </div>
                  </div>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-700 group-hover:text-indigo-400 transition-colors">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Success Banner ── */}
      {saveSuccess && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-2">
          <span className="text-lg">✅</span>
          <span className="text-xs font-bold text-green-400">Corrections saved successfully! Data will refresh shortly.</span>
        </div>
      )}

      {/* ── Job Inspector ── */}
      {selectedJob && (
        <div className="mt-5 space-y-3">
          {/* Job Header */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-400">Job #{selectedJob.jobNo}</span>
                  <span className={cls(
                    'text-[9px] font-black uppercase px-2 py-0.5 rounded-full',
                    pendingStep === 7 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                  )}>
                    {pendingStep === 7 ? 'Completed' : `At Step ${pendingStep}`}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{selectedJob.item}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {selectedJob.size} · {selectedJob.qty} pcs · {selectedJob.progBy}
                </p>
              </div>
              {changeCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {changeCount} field{changeCount > 1 ? 's' : ''} modified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Step Accordions */}
          {[1, 2, 3, 4, 5, 6].map(step => {
            const meta = STEP_LABELS_ADMIN[step];
            const accent = STEP_ACCENT[meta.color];
            const fields = STEP_FIELDS[step];
            const isOpen = openSteps[step];
            const stepChanges = fields.filter(f => f.key in changedFields).length;
            const hasData = fields.some(f => {
              const val = selectedJob[f.key];
              return val !== null && val !== undefined && val !== '';
            });

            return (
              <div key={step} className={cls('border rounded-2xl overflow-hidden transition-all', accent.border, accent.bg)}>
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step)}
                  className="w-full flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className={cls('w-8 h-8 rounded-xl flex items-center justify-center text-sm', accent.bg)}>
                      {meta.icon}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className={cls('text-xs font-black', accent.text)}>Step {step}</span>
                        {!hasData && <span className="text-[9px] font-bold text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">Empty</span>}
                        {stepChanges > 0 && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {stepChanges} edit{stepChanges > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium">{meta.name}</p>
                    </div>
                  </div>
                  <svg
                    className={cls('w-4 h-4 text-gray-500 transition-transform', isOpen && 'rotate-180')}
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Step Fields */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                    {fields.map(field => {
                      const isChanged = field.key in changedFields;
                      return (
                        <div key={field.key} className="pt-3">
                          <label className={cls(
                            'block text-[10px] font-black uppercase tracking-widest mb-1.5',
                            isChanged ? 'text-amber-400' : 'text-gray-500'
                          )}>
                            {field.label}
                            {isChanged && <span className="ml-1 text-amber-500">• modified</span>}
                          </label>
                          {renderField(field)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSaveClick}
              disabled={changeCount === 0 || adminMutation.isPending}
              className={cls(
                'w-full py-4 rounded-2xl font-bold text-sm transition-all',
                changeCount > 0
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-900/30 hover:from-amber-500 hover:to-orange-400'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              )}
            >
              {adminMutation.isPending
                ? 'Saving Corrections...'
                : changeCount > 0
                  ? `Save ${changeCount} Correction${changeCount > 1 ? 's' : ''}`
                  : 'No Changes to Save'
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm Diff Popup ── */}
      {confirmDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-base font-black text-white">Confirm Data Corrections</h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Review the changes below for <strong className="text-indigo-400">Job #{selectedJob?.jobNo}</strong>. This will overwrite the database.
              </p>
            </div>
            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4">
              {Object.entries(confirmDiff).map(([key, info]) => (
                <div key={key} className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{info.label}</p>
                  <div className="mt-1.5 grid grid-cols-1 gap-1">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded shrink-0">OLD</span>
                      <span className="text-xs text-red-300 break-all">{info.original || '(empty)'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded shrink-0">NEW</span>
                      <span className="text-xs text-green-300 break-all">{info.current || '(empty)'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-black/20 border-t border-white/5 flex gap-3">
              <button
                onClick={() => setConfirmDiff(null)}
                disabled={adminMutation.isPending}
                className="flex-1 py-3 rounded-2xl border border-white/10 text-gray-400 font-bold text-xs hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeSave}
                disabled={adminMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50"
              >
                {adminMutation.isPending ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedJob && !search.trim() && (
        <div className="mt-6 text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm text-gray-500 font-bold">Search for a job to start correcting data</p>
          <p className="text-[11px] text-gray-700 mt-1">Type a job number, item name, or person name above</p>
        </div>
      )}
    </Card>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: jobs = [], isLoading, refetch, dataUpdatedAt, error } = useJobs();
  const logout   = useAuthStore((s) => s.logout);
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <img 
              src="/ketan_logo.png" 
              alt="Ketan Logo" 
              className="h-8 w-auto object-contain select-none mb-1 brightness-0 invert"
            />
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] text-gray-600 font-medium">
                {jobs.length} jobs total
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                DB Sync Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-gray-600 font-medium hidden md:block">
              Last refresh: {lastUpdated}
            </p>
            {/* View Standard Dashboard */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold transition-colors border border-indigo-500/20"
              title="Return to standard dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Standard Mode
            </button>
            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
              title="Refresh data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                   className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}>
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.243a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.928a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
              </svg>
            </button>
            {/* User pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[9px] font-black">
                A
              </div>
              <span className="text-xs text-gray-400 font-semibold hidden sm:block">
                {user?.email?.split('@')[0] || 'Admin'}
              </span>
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-xl hover:bg-red-500/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-12">
        {/* ── Tabs ── */}
        <div className="flex space-x-1 bg-black/40 p-1 rounded-2xl mb-6 border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'system' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚙️ System Modifications
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 text-center">
                <h2 className="text-red-400 font-bold mb-2">Error Fetching Data</h2>
                <p className="text-gray-400 text-sm mb-4">{error.message || String(error)}</p>
                <button onClick={() => refetch()} className="px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30">Retry</button>
              </div>
            ) : isLoading && jobs.length === 0 ? (
              // Loading skeleton
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 text-center">
                 <h2 className="text-amber-400 font-bold mb-2">0 Jobs Found</h2>
                 <p className="text-gray-400 text-sm mb-4">
                   If your public dashboard shows jobs but this admin dashboard shows 0, this is due to <strong>Supabase Row Level Security (RLS)</strong>.
                 </p>
                 <div className="text-left text-xs bg-black/30 p-4 rounded-xl text-gray-300 space-y-2">
                    <p><strong>To fix this in Supabase:</strong></p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Go to your Supabase project dashboard → <strong>Authentication</strong> → <strong>Policies</strong></li>
                      <li>Find the <code>jobs</code> table and click "New Policy"</li>
                      <li>Click "Create a policy from scratch"</li>
                      <li>Name: <code>Enable ALL for authenticated users</code></li>
                      <li>Allowed operation: <code>ALL</code>, Target roles: <code>authenticated</code></li>
                      <li>Write expression: <code>true</code> and Save.</li>
                    </ol>
                 </div>
              </div>
            ) : (
              <div className="space-y-5">
                <KpiBar jobs={jobs} />
                <VolumeTrend jobs={jobs} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <PipelineFunnel jobs={jobs} />
                  <DelayHeatmap   jobs={jobs} />
                </div>
                <ThekedarPerformance jobs={jobs} />
                <CuttingStats jobs={jobs} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <ItemGroupChart jobs={jobs} />
                  <ApprovalFlow   jobs={jobs} />
                </div>
                <ActivityHeatmap jobs={jobs} />
                <BottleneckTable jobs={jobs} />
                <RawDataExplorer jobs={jobs} />
              </div>
            )}
          </>
        )}

        {activeTab === 'system' && (
          <div className="space-y-5">
            <JobDataCorrection />
            <MasterDataSettings />
            <CatalogSettings />
          </div>
        )}
      </div>
    </div>
  );
}
