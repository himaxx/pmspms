import { useState } from 'react';
import { getPurchaseStage } from '../../../utils/purchaseDb';
import { useLanguage } from '../../../i18n/LanguageContext';

/* ─── Stage Metadata ────────────────────────────────────────────────────────── */
const STAGES = {
  2: { labelKey: 'purchaseFms.stages.orderDone', shortKey: 'purchaseFms.list.order',     color: 'bg-amber-100 text-amber-800',    dot: 'bg-amber-400' },
  3: { labelKey: 'purchaseFms.stages.goodsInward', shortKey: 'purchaseFms.list.gi',        color: 'bg-blue-100 text-blue-800',      dot: 'bg-blue-400' },
  4: { labelKey: 'purchaseFms.stages.followUp',     shortKey: 'purchaseFms.list.followUp', color: 'bg-violet-100 text-violet-800',  dot: 'bg-violet-400' },
  5: { labelKey: 'purchaseFms.stages.complete',      shortKey: 'purchaseFms.list.done',      color: 'bg-emerald-100 text-emerald-800',dot: 'bg-emerald-400' },
};

const FILTER_TABS = [
  { id: 'all',      labelKey: 'common.all',        stages: [2, 3, 4, 5] },
  { id: 'pending2', labelKey: 'purchaseFms.list.order',      stages: [2] },
  { id: 'pending3', labelKey: 'purchaseFms.list.gi',         stages: [3] },
  { id: 'pending4', labelKey: 'purchaseFms.list.followUp',  stages: [4] },
  { id: 'complete', labelKey: 'purchaseFms.list.done',   stages: [5] },
];

function fmtDate(v, language) {
  if (!v) return '—';
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  return new Date(v).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: '2-digit' });
}

function DelayBadge({ hours, t }) {
  if (!hours || hours <= 0) return null;
  const days = (hours / 9).toFixed(1);
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
      ⚠️ +{days}{t('common.dayShort')}
    </span>
  );
}

function StagePill({ stage, t }) {
  const s = STAGES[stage] || STAGES[5];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {t(s.shortKey)}
    </span>
  );
}

/* ─── Single Row ─────────────────────────────────────────────────────────────── */
function PurchaseRow({ item, onSelect, t, language }) {
  const stage = getPurchaseStage(item);
  const hasDelay = (item.s2DelayHours > 0) || (item.s3DelayHours > 0) || (item.s4DelayHours > 0);

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-50
                 hover:bg-emerald-50/40 transition-colors duration-150 group"
    >
      {/* Thumbnail or Req Number */}
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden
                      border-2 border-gray-100 bg-emerald-50 relative
                      group-hover:border-emerald-300 transition-colors duration-200 shadow-sm">
        {item.fabricPhotoUrl ? (
          <img
            src={item.fabricPhotoUrl}
            alt={item.fabricName || 'fabric'}
            className="w-full h-full object-cover object-center"
            loading="lazy"
            style={{ imageRendering: 'auto' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
            <span className="text-xl">🧵</span>
            <span className="text-[9px] font-black text-emerald-700 leading-none">#{item.requirementNumber}</span>
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-gray-900 truncate">
            {item.fabricName || '—'}
          </p>
          {hasDelay && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" title="Delayed" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] text-gray-400">{item.requiredItem || '—'}</span>
          {item.fabricQuantity && (
            <span className="text-[10px] text-gray-400">
              {item.fabricQuantity} {item.unit || ''}
            </span>
          )}
          {item.agentName && (
            <span className="text-[10px] text-emerald-600 font-medium">{item.agentName}</span>
          )}
          {/* Req number when photo is present */}
          {item.fabricPhotoUrl && (
            <span className="text-[10px] text-gray-300 font-medium">#{item.requirementNumber}</span>
          )}
        </div>
      </div>

      {/* Right: Stage + Date */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <StagePill stage={stage} t={t} />
        {stage === 5 ? (
          <span className="text-[10px] text-gray-400">{fmtDate(item.s4ActualAt, language)}</span>
        ) : item.s3PlannedAt && stage === 3 ? (
          <span className="text-[10px] text-gray-400">{t('purchaseFms.list.due')} {fmtDate(item.s3PlannedAt, language)}</span>
        ) : item.s2PlannedAt && stage === 2 ? (
          <span className="text-[10px] text-gray-400">{t('purchaseFms.list.due')} {fmtDate(item.s2PlannedAt, language)}</span>
        ) : (
          <span className="text-[10px] text-gray-400">{fmtDate(item.createdAt, language)}</span>
        )}
      </div>

      {/* Arrow */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
        className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors flex-shrink-0">
        <path fillRule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clipRule="evenodd" />
      </svg>
    </button>
  );
}

/* ─── Main List ──────────────────────────────────────────────────────────────── */
export default function PurchaseList({ data = [], onSelect }) {
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch]             = useState('');

  const filterStages = FILTER_TABS.find(t => t.id === activeFilter)?.stages ?? [2, 3, 4, 5];

  const filtered = data
    .filter(item => filterStages.includes(getPurchaseStage(item)))
    .filter(item => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        String(item.requirementNumber).includes(q) ||
        (item.fabricName || '').toLowerCase().includes(q) ||
        (item.requiredItem || '').toLowerCase().includes(q) ||
        (item.agentName || '').toLowerCase().includes(q)
      );
    });

  /* tab counts */
  const counts = {};
  FILTER_TABS.forEach(tab => {
    counts[tab.id] = tab.id === 'all'
      ? data.length
      : data.filter(d => tab.stages.includes(getPurchaseStage(d))).length;
  });

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide border-b border-gray-50">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                        transition-all duration-200
                        ${activeFilter === tab.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            {t(tab.labelKey)}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black
                              ${activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-2.5 border-b border-gray-50">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2">
            <path fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-xl border border-gray-100
                       outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
                       placeholder-gray-300 text-gray-800"
          />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-sm font-bold text-gray-400">{t('purchaseFms.list.noEntries')}</p>
            <p className="text-xs text-gray-300 mt-1">{t('common.noData')}</p>
          </div>
        ) : (
          filtered.map(item => (
            <PurchaseRow key={item.id} item={item} onSelect={onSelect} t={t} language={language} />
          ))
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/50">
          <p className="text-[11px] text-gray-400">
            {t('common.showing')} <span className="font-bold text-gray-600">{filtered.length}</span> {t('common.of')} {data.length} {t('purchaseFms.stats.totalRequirements')}
          </p>
        </div>
      )}
    </div>
  );
}
