import { createContext, useContext, useState, ReactNode } from "react";

interface AdmissionDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const AdmissionDrawerContext = createContext<AdmissionDrawerContextType | null>(null);

export function AdmissionDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AdmissionDrawerContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </AdmissionDrawerContext.Provider>
  );
}

export function useAdmissionDrawer() {
  const ctx = useContext(AdmissionDrawerContext);
  if (!ctx) throw new Error("useAdmissionDrawer must be used within AdmissionDrawerProvider");
  return ctx;
}
