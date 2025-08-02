import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip"
import ErrorBoundary from './components/ErrorBoundary';
import { setupGlobalErrorHandling } from './services/errorTracking';

import Index from './pages/Index';
import Testing from './pages/Testing';
import NotFound from './pages/NotFound';
import Support from './pages/Support';
import NeedSupportButton from './components/NeedSupportButton';

const queryClient = new QueryClient();

// Setup global error handling
setupGlobalErrorHandling();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <TooltipProvider>
          <Router>
            <NeedSupportButton />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/testing" element={<Testing />} />
              <Route path="/support" element={<Support />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
