// pages/_app.tsx (Next.js Pages Router)
import type { AppProps } from "next/app";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
// If you truly need TanStack Query for other APIs, keep it:
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/react-query-config";
import { MovieListsProvider } from "@/lib/movie-lists-context";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);
const queryClient = createQueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConvexProvider client={convex}>
        <ConvexAuthProvider client={convex}>
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            <MovieListsProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow mb-20">
                <Navbar />
                <Toaster position="top-center" richColors theme="dark" />
                <Component {...pageProps} />
              </div>
              <Footer />
            </div>
            </MovieListsProvider>
          </ThemeProvider>
        </ConvexAuthProvider>
      </ConvexProvider>
    </QueryClientProvider>
  );
}
