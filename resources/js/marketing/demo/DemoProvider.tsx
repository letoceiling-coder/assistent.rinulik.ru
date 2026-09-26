import {createContext, useContext, useRef, type ReactNode, type RefObject} from 'react';
import {useDemoSession, type DemoSessionApi} from './useDemoSession';

export type DemoSurfaceHandle = {
  /** Brings the composer into view and focuses it. */
  focusInput: () => void;
  /** Brings the conversation into view, focuses it and marks it briefly. */
  reveal: () => void;
};

type DemoContextValue = DemoSessionApi & {
  /** The single demo surface rendered on the current page registers here; CTAs elsewhere call it. */
  surface: RefObject<DemoSurfaceHandle | null>;
};

const DemoContext = createContext<DemoContextValue | null>(null);

/** One demo engine per page: homepage hero, final CTA and /demo all share it (and the tab's session). */
export function DemoProvider({children}: {children: ReactNode}) {
  const api = useDemoSession();
  const surface = useRef<DemoSurfaceHandle | null>(null);
  return <DemoContext.Provider value={{...api, surface}}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used inside <DemoProvider>.');
  return value;
}
