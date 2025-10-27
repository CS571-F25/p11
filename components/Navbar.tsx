import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Film } from "lucide-react"
import { ModeToggle } from "./theme-toggle";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };


  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-10">
      <div className="container mx-auto">
        <div className="flex h-24 items-center justify-between">
          {/* Logo/Brand */}
           <div className="flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-balance">ReelFindr</h1>
          </div>

          {/* Right side - Navigation Links and Theme toggle */}
          <div className="flex items-center justify-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/catalog"
                className="text-sm transition-colors hover:text-primary"
              >
                Trending
              </Link>
              <Link
                href="/cart"
                className="text-sm transition-colors hover:text-primary"
              >
                Search
              </Link>
              <Link
                href="/login"
                className="text-sm transition-colors hover:text-primary"
              >
                Login
              </Link>
            </div>

            {/* Theme toggle and mobile menu */}
            <div className="flex items-center space-x-4">
              {/*<ModeToggle />*/}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

            </div>
          </div>
        </div>

        {/* Mobile menu - conditionally shown */}
        <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link
              href="/catalog"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={closeMobileMenu}
            >
              Trending
            </Link>
            <Link
              href="/cart"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={closeMobileMenu}
            >
              Search
            </Link>
            <Link
              href="/login"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={closeMobileMenu}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}