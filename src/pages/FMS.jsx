import { useState } from 'react';
import BiltyFMSPage from './fms/BiltyFMSPage';

/* ─── FMS Icons ─────────────────────────────────────────────────────────── */
const BiltyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
  </svg>
);

const PurchaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .315.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
  </svg>
);

const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
  </svg>
);

const FMS_TABS = [
  { 
    id: 'bilty', 
    label: 'Bilty FMS', 
    Icon: BiltyIcon, 
    desc: 'Manage transit documents and logistics tracking',
    color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100/50'
  },
  { 
    id: 'purchase', 
    label: 'Purchase FMS', 
    Icon: PurchaseIcon, 
    desc: 'Streamline procurement and vendor management',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50'
  },
  { 
    id: 'order2delivery', 
    label: 'Order 2 Delivery FMS', 
    Icon: BoxIcon, 
    desc: 'End-to-end order tracking from placement to door',
    color: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/50'
  },
];

export default function FMS() {
  const [activeTab, setActiveTab] = useState(null);

  if (activeTab) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-136px)]">
         <div className="sticky top-[57px] z-30 h-11 flex items-center gap-2 px-4
                        bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600
                       hover:text-indigo-800 transition-colors py-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd" />
            </svg>
            FMS
          </button>
          <span className="text-gray-300 text-xs">/</span>
          <span className="text-xs font-bold text-gray-800 tracking-tight">
            {FMS_TABS.find(t => t.id === activeTab)?.label}
          </span>
        </div>
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            {activeTab === 'bilty' ? (
              <BiltyFMSPage />
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-6 anim-slideUp">
                      {(() => {
                        const Icon = FMS_TABS.find(t => t.id === activeTab)?.Icon;
                        return Icon ? <Icon /> : <BoxIcon />;
                      })()}
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight anim-slideUp" style={{ animationDelay: '100ms' }}>
                    {FMS_TABS.find(t => t.id === activeTab)?.label}
                  </h2>
                  <p className="text-gray-400 mt-2 max-w-xs mx-auto anim-slideUp" style={{ animationDelay: '200ms' }}>
                    This module is currently being configured for your workflow.
                  </p>
                  <div className="mt-8 anim-slideUp" style={{ animationDelay: '300ms' }}>
                    <span className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase border border-indigo-100">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-136px)] p-6 bg-gray-50/30">
      <div className="mb-8 anim-slideUp">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">FMS</h1>
        <p className="text-sm text-gray-400 mt-1">Flow Management System</p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-2xl">
        {FMS_TABS.map(({ id, label, Icon, desc, color }, index) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`group relative flex items-center gap-5 p-6 rounded-3xl border 
                       bg-white shadow-sm hover:shadow-xl transition-all duration-300
                       text-left overflow-hidden anim-slideUp ag-lift btn-press`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl 
                            ${color.split(' ')[0]} ${color.split(' ')[1]} transition-colors duration-300`}>
              <Icon />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {label}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">
                {desc}
              </p>
            </div>

            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-400">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Decorative background gradient */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-indigo-50/0 to-indigo-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          </button>
        ))}
      </div>
    </div>
  );
}

