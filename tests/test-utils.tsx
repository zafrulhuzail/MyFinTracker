import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SidebarProvider } from '../client/src/contexts/SidebarContext';
import { AuthProvider } from '../client/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom wrapper with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Custom render function
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Export testing-library utilities
export * from '@testing-library/react';
export { customRender as render };