import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@shared/api/queryClient";
import { ReactNode } from "react";

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
