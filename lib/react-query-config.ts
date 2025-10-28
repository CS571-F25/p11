import { QueryClient } from "@tanstack/react-query";

export const defaultQueryOptions = {
    staleTime: 0, // 30 minutes
    gcTime:0, // 60 minutes
    retry: (failureCount: number, error: Error) => {
      if (error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  };
  
  export const defaultMutationOptions = {
    retry: (failureCount: number, error: Error) => {
      if (error.message.includes('4')) {
        return false;
      }
      return failureCount < 2;
    },
  };
  
  export const createQueryClient = () => {
    return new QueryClient({
      defaultOptions: {
        queries: defaultQueryOptions,
        mutations: defaultMutationOptions,
      },
    });
  };
  