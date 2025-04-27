"use client"

import { createContext, useContext } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children, value }) {
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  return session;
} 