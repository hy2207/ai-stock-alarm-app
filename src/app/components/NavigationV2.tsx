import { Home, Archive, Settings } from 'lucide-react';
import { StockAlarmBrand } from './StockAlarmBrand';
import { ROUTES } from '../routes';

interface NavigationV2Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function NavigationV2({ currentRoute, onNavigate }: NavigationV2Props) {
  const navItems = [
    { route: ROUTES.home, label: '홈', icon: Home },
    { route: ROUTES.archive, label: '이력', icon: Archive },
    { route: ROUTES.settings, label: '설정', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:static md:z-auto">
      {/* Mobile Bottom Nav */}
      <div className="md:hidden border-t border-slate-200 bg-[#f7f8f5]/95 backdrop-blur shadow-sm">
        <div className="flex justify-around items-center px-4 pb-safe">
          {navItems.map(({ route, label, icon: Icon }) => {
            const isActive = currentRoute === route;
            return (
              <button
                key={route}
                onClick={() => onNavigate(route)}
                className="relative flex flex-col items-center gap-1 py-3 px-6 transition-all"
              >
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-600'
                  }`} />
                </div>
                <span className={`text-xs transition-colors ${
                  isActive ? 'text-slate-900 font-medium' : 'text-slate-600'
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Top Nav */}
      <div className="hidden md:block border-b border-slate-200 bg-[#f7f8f5]/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StockAlarmBrand variant="header" className="h-10 w-10 p-1" />
              <span className="text-xl font-semibold text-slate-950">StockAlarm</span>
            </div>
            <div className="flex gap-2">
              {navItems.map(({ route, label, icon: Icon }) => {
                const isActive = currentRoute === route;
                return (
                  <button
                    key={route}
                    onClick={() => onNavigate(route)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white hover:text-slate-950'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-600'
                    }`} />
                    <span className={`text-sm transition-colors ${
                      isActive ? 'text-white font-medium' : 'text-slate-600'
                    }`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
