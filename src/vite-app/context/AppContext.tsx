import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { RiskProfile, DebugEvent } from '../types';
import { mockUser, defaultWatchlist } from '../mockData';

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  watchlist: string[];
  setWatchlist: (value: string[]) => void;
  riskProfile: RiskProfile;
  setRiskProfile: (value: RiskProfile) => void;
  pushEnabled: boolean;
  setPushEnabled: (value: boolean) => void;
  debugEvents: DebugEvent[];
  addDebugEvent: (eventName: string, data?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  isLoggedIn: 'ai-stock-alarm:isLoggedIn',
  watchlist: 'ai-stock-alarm:watchlist',
  riskProfile: 'ai-stock-alarm:riskProfile',
  pushEnabled: 'ai-stock-alarm:pushEnabled',
} as const;

function readStoredBoolean(key: string, fallback: boolean) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

function readStoredStringArray(key: string, fallback: string[]) {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every(item => typeof item === 'string')
      ? parsed
      : fallback;
  } catch {
    return fallback;
  }
}

function readStoredRiskProfile(key: string, fallback: RiskProfile) {
  try {
    const value = window.localStorage.getItem(key);
    return value === 'conservative' || value === 'balanced' || value === 'aggressive'
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

/**
 * @component AppProvider
 * @description
 * [Developer] Provides the global state for the application. Syncs values like 
 * `isLoggedIn`, `watchlist`, `riskProfile`, and `pushEnabled` with localStorage
 * to persist user preferences across sessions.
 * 
 * [AI Agent] Use this context to manage any new global state that needs to be 
 * accessed by multiple pages. Add new properties to the `AppContextType` interface,
 * implement the state here with a corresponding `useEffect` for localStorage sync if necessary.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    typeof window === 'undefined' ? false : readStoredBoolean(STORAGE_KEYS.isLoggedIn, false)
  );
  const [watchlist, setWatchlist] = useState<string[]>(() =>
    typeof window === 'undefined'
      ? defaultWatchlist
      : readStoredStringArray(STORAGE_KEYS.watchlist, defaultWatchlist)
  );
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(() =>
    typeof window === 'undefined'
      ? mockUser.defaultRiskProfile
      : readStoredRiskProfile(STORAGE_KEYS.riskProfile, mockUser.defaultRiskProfile)
  );
  const [pushEnabled, setPushEnabled] = useState(() =>
    typeof window === 'undefined'
      ? mockUser.pushEnabled
      : readStoredBoolean(STORAGE_KEYS.pushEnabled, mockUser.pushEnabled)
  );
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.isLoggedIn, String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.riskProfile, riskProfile);
  }, [riskProfile]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.pushEnabled, String(pushEnabled));
  }, [pushEnabled]);

  const addDebugEvent = (eventName: string, data?: any) => {
    const event: DebugEvent = {
      timestamp: new Date().toISOString(),
      eventName,
      data,
    };
    setDebugEvents(prev => [...prev.slice(-19), event]);
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        watchlist,
        setWatchlist,
        riskProfile,
        setRiskProfile,
        pushEnabled,
        setPushEnabled,
        debugEvents,
        addDebugEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * @hook useApp
 * @description
 * [Developer] Custom hook to consume the AppContext. Throws an error if used outside AppProvider.
 * 
 * [AI Agent] Always use this hook instead of `useContext(AppContext)` to access global state.
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
