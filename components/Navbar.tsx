import Link from "next/link";
import { useState } from "react";
import { Film, User, Loader2, Eye, List } from "lucide-react"
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          <Link href="/" className="flex items-center gap-2"> <Film className="h-8 w-8 text-primary" aria-label="ReelFindr logo" /> <h1 className="text-2xl font-bold text-balance">ReelFindr</h1> </Link>

          {/* Right side - Navigation Links and Theme toggle */}
          <div className="flex items-center justify-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/trending"
                className="text-sm transition-colors hover:text-primary"
              >
                Trending
              </Link>
              <Link
                href="/search"
                className="text-sm transition-colors hover:text-primary"
              >
                Search
              </Link>
              <Authenticated>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-sm transition-colors hover:text-primary p-2 rounded-md hover:bg-accent">
                      <User className="h-6 w-6" aria-label="Profile menu" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile-page" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/watched" className="flex items-center gap-2 cursor-pointer">
                        <Eye className="h-4 w-4" />
                        <span>Watched Movies</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/watch-queue" className="flex items-center gap-2 cursor-pointer">
                        <List className="h-4 w-4" />
                        <span>Movie Queue</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Authenticated>
              <Unauthenticated>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              </Unauthenticated>
              <AuthLoading>
                <div className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading" />
                </div>
              </AuthLoading>
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
              href="/trending"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={closeMobileMenu}
            >
              Trending
            </Link>
            <Link
              href="/search"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={closeMobileMenu}
            >
              Search
            </Link>
            <Authenticated>
              <div className="space-y-1">
                <Link
                  href="/profile-page"
                  className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                </Link>
                <Link
                  href="/watched"
                  className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Watched Movies</span>
                  </div>
                </Link>
                <Link
                  href="/watch-queue"
                  className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>Movie Queue</span>
                  </div>
                </Link>
              </div>
            </Authenticated>
            <Unauthenticated>
              <Link
                href="/login"
                className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            </Unauthenticated>
            <AuthLoading>
              <div className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary">
                <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading" />
              </div>
            </AuthLoading>
          </div>
        </div>
      </div>
    </nav>
  );
}
