import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { setAccessToken } from '@/lib/access-token';

/** Validates persisted JWT on app load (after zustand rehydration). */
export function AuthBootstrap() {
  useEffect(() => {
    const runBootstrap = () => {
      setAccessToken(useAuthStore.getState().token);
      void useAuthStore.getState().bootstrap();
    };
    const unsub = useAuthStore.persist.onFinishHydration((state) => {
      setAccessToken(state.token);
      void useAuthStore.getState().bootstrap();
    });
    if (useAuthStore.persist.hasHydrated()) {
      runBootstrap();
    }
    return unsub;
  }, []);

  return null;
}
