import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

interface WrapperProps {
  children: React.ReactNode;
}

// Custom render function that wraps components with BrowserRouter
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  const Wrapper = ({ children }: WrapperProps) => (
    <BrowserRouter>{children}</BrowserRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

// Render with MemoryRouter for specific route testing
function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...renderOptions }: { route?: string } & Omit<RenderOptions, 'wrapper'> = {}
): RenderResult {
  const Wrapper = ({ children }: WrapperProps) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper to wait for loading states to resolve
async function waitForLoadingToFinish(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

// Helper to create mock image elements that don't error
function createMockImageSrc(name: string): string {
  return `test-image-${name}.jpg`;
}

export * from '@testing-library/react';
export { customRender as render, renderWithRouter, waitForLoadingToFinish, createMockImageSrc };
