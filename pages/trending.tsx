import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { getTrendingMoviesQueryAdvanced } from "@/lib/external";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { genresList } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

export default function TrendingPage() {
  const router = useRouter();
  const { query } = router;

  const [page, setPage] = useState<number>(() => {
    const p = parseInt((query.page as string) || "1", 10);
    return Number.isNaN(p) ? 1 : Math.max(1, p);
  });
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>(
    ((query.window as string) === 'day' || (query.window as string) === 'week') ? (query.window as 'day' | 'week') : 'week'
  );
  const [minRating, setMinRating] = useState<number>(() => {
    const r = parseFloat((query.minRating as string) || "0");
    return Number.isNaN(r) ? 0 : Math.min(10, Math.max(0, r));
  });
  const [maxRating, setMaxRating] = useState<number>(() => {
    const r = parseFloat((query.maxRating as string) || "10");
    return Number.isNaN(r) ? 10 : Math.min(10, Math.max(0, r));
  });
  const [genreIds, setGenreIds] = useState<number[]>(() => {
    const raw = (query.genre as string) || "";
    if (!raw) return [];
    return raw.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
  });

  // Draft filter state: changes here do not affect results until Search
  const [draftTimeWindow, setDraftTimeWindow] = useState<'day' | 'week'>(timeWindow);
  const [draftMinRating, setDraftMinRating] = useState<number>(minRating);
  const [draftMaxRating, setDraftMaxRating] = useState<number>(maxRating);
  const [draftGenreIds, setDraftGenreIds] = useState<number[]>(genreIds);

  const hasUnapplied = useMemo(() => {
    if (draftTimeWindow !== timeWindow) return true;
    if (draftMinRating !== minRating) return true;
    if (draftMaxRating !== maxRating) return true;
    if (draftGenreIds.length !== genreIds.length) return true;
    const a = [...draftGenreIds].sort((x, y) => x - y);
    const b = [...genreIds].sort((x, y) => x - y);
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return true;
    }
    return false;
  }, [draftTimeWindow, draftMinRating, draftMaxRating, draftGenreIds, timeWindow, minRating, maxRating, genreIds]);

  const { data: entries, isLoading } = getTrendingMoviesQueryAdvanced(page, timeWindow);

  const filtered = useMemo(() => {
    const list = entries ?? [];
    return list.filter((m) => {
      const rating = m.vote_average ?? 0;
      const withinRange = rating >= Math.min(minRating, maxRating) && rating <= Math.max(minRating, maxRating);
      const movieGenres = m.genre_ids || [];
      const matchesGenres = genreIds.length === 0 || movieGenres.some((id) => genreIds.includes(id));
      return withinRange && matchesGenres;
    });
  }, [entries, minRating, maxRating, genreIds]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => p + 1);

  return (
    <>
      <Head>
        <title>Trending Movies - ReelFindr</title>
      </Head>
      <div className="min-h-screen">
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Trending</h1>
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Filters */}
            <aside className="col-span-12 md:col-span-3">
              <div className="rounded-lg border border-border/50 p-4 space-y-6 bg-card">
                <div className="space-y-2">
                  <span id="timeWindow-label">Time Window</span>
                  <Select value={draftTimeWindow} onValueChange={(v) => setDraftTimeWindow(v as 'day' | 'week')}>
                    <SelectTrigger aria-labelledby="timeWindow-label" id="timeWindow" className="w-full">
                      <SelectValue placeholder="Window" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <span id="genres-label">Genres</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-labelledby="genres-label" variant="outline" className="w-full justify-between">
                        {draftGenreIds.length === 0
                          ? "All genres"
                          : (() => {
                            const selectedGenres = genresList.filter(g => draftGenreIds.includes(g.id));
                            if (selectedGenres.length === 1) {
                              return selectedGenres[0].name;
                            } else if (selectedGenres.length === 2) {
                              return `${selectedGenres[0].name}, ${selectedGenres[1].name}`;
                            } else {
                              return `${selectedGenres[0].name}, ${selectedGenres[1].name} + ${selectedGenres.length - 2} more`;
                            }
                          })()
                        }
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
                      {genresList.map((g) => {
                        const checked = draftGenreIds.includes(g.id);
                        return (
                          <DropdownMenuCheckboxItem
                            key={g.id}
                            checked={checked}
                            onCheckedChange={(val) => {
                              setDraftGenreIds((prev) => {
                                const isChecked = Boolean(val);
                                if (isChecked) {
                                  if (prev.includes(g.id)) return prev;
                                  return [...prev, g.id];
                                } else {
                                  return prev.filter((id) => id !== g.id);
                                }
                              });
                            }}
                          >
                            {g.name}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <span>Rating Range</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="min-rating" className="sr-only">Minimum Rating</Label>
                      <Input
                        id="min-rating"
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={draftMinRating}
                        onChange={(e) => setDraftMinRating(() => {
                          const v = parseFloat(e.target.value);
                          if (Number.isNaN(v)) return 0;
                          return Math.max(0, Math.min(10, v));
                        })}
                        aria-label="Minimum rating"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">to</span>
                    <div className="flex-1">
                      <Label htmlFor="max-rating" className="sr-only">Maximum Rating</Label>
                      <Input
                        id="max-rating"
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={draftMaxRating}
                        onChange={(e) => setDraftMaxRating(() => {
                          const v = parseFloat(e.target.value);
                          if (Number.isNaN(v)) return 10;
                          return Math.max(0, Math.min(10, v));
                        })}
                        aria-label="Maximum rating"
                      />
                    </div>
                  </div>
                </div>


                {hasUnapplied && (
                  <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1">
                    You have unapplied changes. Press Apply to apply.
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      // Apply draft -> applied
                      setTimeWindow(draftTimeWindow);
                      setMinRating(draftMinRating);
                      setMaxRating(draftMaxRating);
                      setGenreIds(draftGenreIds);
                      setPage(1);
                      // Update URL only on explicit search
                      const params = new URLSearchParams();
                      if (draftTimeWindow !== 'week') params.set('window', draftTimeWindow);
                      if (draftMinRating > 0) params.set('minRating', String(draftMinRating));
                      if (draftMaxRating < 10) params.set('maxRating', String(draftMaxRating));
                      if (draftGenreIds.length > 0) params.set('genre', draftGenreIds.join(','));
                      router.replace({ pathname: '/trending', query: Object.fromEntries(params) }, undefined, { shallow: true });
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // Reset draft and applied to defaults
                      setDraftTimeWindow('week');
                      setDraftMinRating(0);
                      setDraftMaxRating(10);
                      setDraftGenreIds([]);
                      setTimeWindow('week');
                      setMinRating(0);
                      setMaxRating(10);
                      setGenreIds([]);
                      setPage(1);
                      router.replace({ pathname: '/trending', query: {} }, undefined, { shallow: true });
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </aside>

            {/* Results */}
            <main className="col-span-12 md:col-span-9">
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" aria-label="Loading" />
                  <span className="block text-lg">Loading…</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filtered.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-4 mt-8">
                <Button variant="outline" onClick={handlePrev} disabled={page === 1}>Prev</Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button onClick={handleNext}>Next</Button>
              </div>
            </main>
          </div>
          </div>
        </section>
      </div>
    </>
  );
}


