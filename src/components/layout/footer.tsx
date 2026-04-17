import Link from "next/link";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Where Should I Move?
            </span>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/rankings"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Rankings
            </Link>
            <Link
              href="/compare"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Compare
            </Link>
            <Link
              href="/map"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Map
            </Link>
            <Link
              href="/quiz"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Quiz
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            Data from US Census, BLS, FBI, Walk Score, and Open-Meteo.
          </p>
        </div>
      </div>
    </footer>
  );
}
