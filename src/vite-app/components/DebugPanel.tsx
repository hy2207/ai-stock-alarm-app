import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function DebugPanel() {
  const { debugEvents } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
      <div className="bg-slate-900 text-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 px-3 py-2 w-full hover:bg-slate-800"
        >
          <span className="text-xs">Debug Events ({debugEvents.length})</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {isOpen && (
          <div className="max-h-64 overflow-y-auto p-2 text-xs space-y-1">
            {debugEvents.length === 0 ? (
              <div className="text-slate-400 p-2">No events yet</div>
            ) : (
              debugEvents.slice().reverse().map((event, index) => (
                <div key={index} className="bg-slate-800 p-2 rounded">
                  <div className="text-slate-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-green-400">{event.eventName}</div>
                  {event.data && (
                    <div className="text-slate-300 text-xs">
                      {JSON.stringify(event.data)}
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
