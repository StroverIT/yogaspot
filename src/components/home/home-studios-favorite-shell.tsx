"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AuthModal from "@/components/AuthModal";

type HomeStudiosAuthContextValue = {
  requestAuth: () => void;
};

const HomeStudiosAuthContext = createContext<HomeStudiosAuthContextValue | null>(null);

export function useHomeStudiosAuthRequest() {
  const ctx = useContext(HomeStudiosAuthContext);
  if (!ctx) {
    throw new Error("useHomeStudiosAuthRequest must be used within HomeStudiosFavoriteShell");
  }
  return ctx.requestAuth;
}

export function HomeStudiosFavoriteShell({ children }: { children: ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const requestAuth = useCallback(() => setAuthModalOpen(true), []);
  const value = useMemo(() => ({ requestAuth }), [requestAuth]);

  return (
    <HomeStudiosAuthContext.Provider value={value}>
      {children}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </HomeStudiosAuthContext.Provider>
  );
}
