import React from 'react';
import AppRouter from '@/routes/AppRouter';
import { Toaster } from '@/components/ui/sonner';
import ClickSpark from './components/shared/ClickSpark';

const App: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default App;
