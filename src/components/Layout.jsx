import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
    <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
  </svg>
);

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474L8.687 19.5h6.626l1.015 1.737a.75.75 0 001.299-.75L16.43 19.5H17a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zM7.5 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm.75-3.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" clipRule="evenodd" />
  </svg>
);


export default function Layout() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const logout  = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { to: '/',        label: t('nav.dashboard'), Icon: HomeIcon    },
    { to: '/forms',   label: t('nav.forms'),     Icon: PencilIcon  },
    { to: '/reports', label: t('nav.reports'),   Icon: ReportsIcon },
  ];
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pb-16">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shadow-[0_1px_8px_-2px_rgba(0,0,0,0.08)]">
        <img 
          src="/ketan_logo.png" 
          alt="Ketan Logo" 
          className="h-7 sm:h-9 w-auto object-contain select-none"
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          {/* Live badge + admin button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden xs:flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-emerald-600">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
              </span>
              LIVE
            </span>

            {/* Admin access button */}
            {isAdmin ? (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5 sm:w-3 sm:h-3">
                  <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 1 3.5 3.5V7A1.5 1.5 0 0 1 13 8.5v5A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5v-5A1.5 1.5 0 0 1 4.5 7V4.5A3.5 3.5 0 0 1 8 1Zm0 1.5A2 2 0 0 0 6 4.5V7h4V4.5A2 2 0 0 0 8 2.5Z" clipRule="evenodd" />
                </svg>
                Admin
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin/login')}
                title="Admin Login"
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Admin login"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────────────────────── */}
      <main className="flex-1 w-full px-0">
        <Outlet />
      </main>

      {/* ── Bottom Navigation ──────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100
                      shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-semibold
                 transition-colors duration-150
                 ${isActive
                   ? 'text-indigo-600'
                   : 'text-gray-400 hover:text-gray-700'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`p-1.5 rounded-xl transition-all duration-150
                    ${isActive ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <Icon />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

    </div>
  );
}
