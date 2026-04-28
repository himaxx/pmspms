import { useState } from 'react';
import CuttingReports from './CuttingReports';
import ProductionReport from './ProductionReport';
import { useLanguage } from '../i18n/LanguageContext';

/* ─── Sub-nav icons ───────────────────────────────────────────────────────── */
const ScissorsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M8.128 9.155a3.751 3.751 0 11.713-1.321l1.136.656a.75.75 0 01.222.656l-.002.024.002.024a.75.75 0 01-.222.656l-1.136.656a3.752 3.752 0 11-.713-1.321l1.297-.75-1.297-.75zm-.936 1.626a2.25 2.25 0 10.001 1.498 2.25 2.25 0 00-.001-1.498zM19.64 9.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0 1.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM7.192 14.845a3.752 3.752 0 100 7.503 3.752 3.752 0 000-7.503zm0 1.5a2.252 2.252 0 100 4.503 2.252 2.252 0 000-4.503z" clipRule="evenodd" />
    <path d="M11.38 12l6.344-3.664a.75.75 0 00-.75-1.3l-6.994 4.04a.75.75 0 00.001 1.299l6.994 4.042a.75.75 0 10.75-1.299L11.381 12z" />
  </svg>
);

const FactoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
    <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

export default function Reports() {
  const { t } = useLanguage();
  const [active, setActive] = useState(null); // null = landing, 'cutting' | 'production' = detail

  const REPORT_TABS = [
    { id: 'cutting',    label: t('reports.cuttingReport'),    Icon: ScissorsIcon },
    { id: 'production', label: t('reports.productionReport'),  Icon: FactoryIcon  },
  ];

  /* ── Landing — pick a report ─────────────────────────────────────────── */
  if (active === null) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-136px)]">
        {/* Page header */}
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">{t('nav.reports')}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{t('reports.selectReportView')}</p>
        </div>

        {/* Report cards */}
        <div className="flex flex-col gap-3 px-4 pt-4">
          {REPORT_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="group w-full flex items-center gap-4 p-5 rounded-2xl border border-gray-100
                         bg-white shadow-sm hover:shadow-md hover:border-indigo-200
                         hover:bg-indigo-50/40 transition-all duration-200 text-left"
            >
              <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl
                               bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                <Icon />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {id === 'cutting'
                    ? t('reports.viewPendingCompleted')
                    : t('reports.trackProductionStages')}
                </p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                   className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0">
                <path fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Detail view — show the selected report with a back button ────────── */
  return (
    <div className="flex flex-col min-h-screen">
      {/* Back bar - 57px offset from layout header + 44px height = 101px total offset for next sticky */}
      <div className="sticky top-[57px] z-30 h-11 flex items-center gap-2 px-4
                      bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600
                     hover:text-indigo-800 transition-colors py-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd" />
          </svg>
          {t('reports.backToReports')}
        </button>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs font-bold text-gray-800 tracking-tight">
          {active === 'cutting' ? t('reports.cuttingReport') : t('reports.productionReport')}
        </span>
      </div>

      {/* The actual report content container */}
      <div className="flex-1">
        {active === 'cutting'    && <CuttingReports />}
        {active === 'production' && <ProductionReport />}
      </div>
    </div>
  );
}
