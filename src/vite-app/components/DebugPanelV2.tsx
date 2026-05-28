import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { getRouteFromHash, ROUTES } from '../routes';

export function DebugPanelV2() {
  const { debugEvents } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(() =>
    typeof window === 'undefined' ? ROUTES.landing : getRouteFromHash(window.location.hash)
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentRoute === ROUTES.landing) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-4">
      <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-3 px-4 py-3 w-full hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Debug ({debugEvents.length})</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {isOpen && (
          <div className="max-h-80 overflow-y-auto p-3 text-xs space-y-2 bg-slate-950/50">
            {debugEvents.length === 0 ? (
              <div className="text-slate-400 p-3 text-center">No events yet</div>
            ) : (
              debugEvents.slice().reverse().map((event, index) => (
                <div key={index} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-green-400 font-mono">{event.eventName}</div>
                    <div className="text-slate-500 text-xs">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {event.data && (
                    <div className="text-slate-400 text-xs font-mono bg-slate-900/50 p-2 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(event.data, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
