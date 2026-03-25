import { Link, useLocation } from "wouter";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/20">
      {!hideNav && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold text-lg tracking-tight text-foreground">TrimTime</span>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                href="/book" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === "/book" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Book
              </Link>
              <Link 
                href="/dashboard" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
      )}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}
