import React, { useEffect } from 'react';
import AppRouter from '@/routes/AppRouter';
import { Toaster } from '@/components/ui/sonner';
import ClickSpark from './components/shared/ClickSpark';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthBootstrap } from '@/providers/AuthBootstrap';
import { RealtimeNotifications } from '@/providers/RealtimeNotifications';
import { useAuthStore } from '@/store/authStore';

const UnauthorizedSync: React.FC = () => {
  useEffect(() => {
    const on401 = () => {
      useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
    };
    window.addEventListener('vendex:unauthorized', on401);
    return () => window.removeEventListener('vendex:unauthorized', on401);
  }, []);
  return null;
};

const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthBootstrap />
      <UnauthorizedSync />
      <RealtimeNotifications />
      <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
        easing='ease-out'
        extraScale={1.0}
      >
        <AppRouter />
        <Toaster richColors position="top-right" />
      </ClickSpark>
    </QueryProvider>
  );
};

export default App;
