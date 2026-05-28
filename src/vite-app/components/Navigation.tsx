import { Home, Archive, Settings } from 'lucide-react';

interface NavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function Navigation({ currentRoute, onNavigate }: NavigationProps) {
  const navItems = [
    { route: '/', label: '홈', icon: Home },
    { route: '/archive', label: '이력', icon: Archive },
    { route: '/settings', label: '설정', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:static md:border-0 md:bg-transparent">
      <div className="flex justify-around md:justify-start md:gap-6 md:px-6 md:py-4">
        {navItems.map(({ route, label, icon: Icon }) => (
          <button
            key={route}
            onClick={() => onNavigate(route)}
            className={`flex flex-col items-center gap-1 py-3 px-6 md:flex-row md:gap-2 ${
              currentRoute === route
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs md:text-sm">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
