import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./QueryProvider";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      <QueryProvider>{children}</QueryProvider>
    </BrowserRouter>
  );
};
