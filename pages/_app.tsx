import React from 'react'
import type { AppProps } from 'next/app'
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from 'sonner';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

export default function MyApp({ Component, pageProps }: AppProps) {
    // const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

    return (
        // <ConvexProvider client={convex}>
        //     <ConvexAuthProvider client={convex}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    disableTransitionOnChange
                >
                    <div className="flex flex-col min-h-screen">
                        <div className="flex-grow mb-20">
                            <Navbar />
                            <Toaster position="top-center" richColors theme="dark" />
                            <Component {...pageProps} />
                        </div>
                        <Footer />
                    </div>
                </ThemeProvider>
        //     </ConvexAuthProvider>
        // </ConvexProvider>
    )
}