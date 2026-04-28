import { getPurchaseStage } from '../../../utils/purchaseDb';
import { useLanguage } from '../../../i18n/LanguageContext';

const STAGE_COLORS = {
  2: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   labelKey: 'orderPending' },
  3: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',    labelKey: 'giPending' },
  4: { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400',  labelKey: 'followUpDue' },
  5: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', labelKey: 'completed' },
};

export default function PurchaseStats({ data = [] }) {
  const { t } = useLanguage();
  
  const total   = data.length;
  const pending2 = data.filter(d => getPurchaseStage(d) === 2).length;
  const pending3 = data.filter(d => getPurchaseStage(d) === 3).length;
  const pending4 = data.filter(d => getPurchaseStage(d) === 4).length;
  const complete  = data.filter(d => getPurchaseStage(d) === 5).length;

  // Delayed entries: any stage where delay_hours > 0
  const delayed = data.filter(d =>
    (d.s2DelayHours > 0) || (d.s3DelayHours > 0) || (d.s4DelayHours > 0)
  ).length;

  const stats = [
    {
      label: t('purchaseFms.stats.totalRequirements'),
      value: total,
      icon: '📋',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-800',
      sub: t('purchaseFms.stats.allTime'),
    },
    {
      label: t('purchaseFms.stats.orderPending'),
      value: pending2,
      icon: '🛒',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      sub: t('purchaseFms.stats.awaitingOrder'),
    },
    {
      label: t('purchaseFms.stats.giPending'),
      value: pending3,
      icon: '📦',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      sub: t('purchaseFms.stats.goodsInTransit'),
    },
    {
      label: t('purchaseFms.stats.followUpDue'),
      value: pending4,
      icon: '📞',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-800',
      sub: t('purchaseFms.stats.partyFollowUp'),
    },
    {
      label: t('purchaseFms.stats.completed'),
      value: complete,
      icon: '✅',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      sub: t('purchaseFms.stats.allStagesDone'),
    },
    {
      label: t('purchaseFms.stats.delayed'),
      value: delayed,
      icon: '⚠️',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      sub: t('purchaseFms.stats.lateOnAnyStep'),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
      {stats.map(({ label, value, icon, bg, border, text, sub }) => (
        <div
          key={label}
          className={`rounded-2xl border ${bg} ${border} p-3 flex flex-col gap-1`}
        >
          <span className="text-lg leading-none">{icon}</span>
          <span className={`text-2xl font-black ${text} leading-none mt-1`}>{value}</span>
          <span className="text-[10px] font-bold text-gray-600 leading-tight">{label}</span>
          <span className="text-[9px] text-gray-400 leading-tight">{sub}</span>
        </div>
      ))}
    </div>
  );
}
