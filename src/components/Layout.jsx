import { NavLink, Outlet } from 'react-router-dom';

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

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard', Icon: HomeIcon    },
  { to: '/forms',     label: 'Forms',     Icon: PencilIcon  },
  { to: '/cutting',   label: 'Cutting',   Icon: ScissorsIcon },
  { to: '/production',label: 'Production',Icon: FactoryIcon  },
];

/* ─── Layout ─────────────────────────────────────────────────────────────── */
export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-[0_1px_8px_-2px_rgba(0,0,0,0.08)]">
        <img 
          src="/ketan_logo.png" 
          alt="Ketan Logo" 
          className="h-9 w-auto object-contain select-none"
        />

        {/* Live badge */}
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  style={{ animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          LIVE
        </span>
      </header>

      {/* ── Page Content ───────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20 px-0">
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
                 transition-colors duration-${150}
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
