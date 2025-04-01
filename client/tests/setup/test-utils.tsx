import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Store } from "../../src/state/store";
import AuthContextProvider from "../../src/contexts/AuthContextProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "../../src/components/ui/toaster.tsx";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import App from "../../src/App";



// Create a customized render function
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", ...renderOptions }: CustomRenderOptions = {}
) {
  window.history.pushState({}, "Test page", route);

  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={Store}>
        <QueryClientProvider client={queryClient}>
          <AuthContextProvider>
            <TooltipProvider>
              <App />
              <Toaster />
            </TooltipProvider>
          </AuthContextProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
    Store,
    queryClient,
  };
}

export function mockUseNavigate() {
  const navigate = vi.fn();
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
      ...actual,
      useNavigate: () => navigate,
    };
  });
  return navigate;
}
