import { lazy, Suspense, useEffect, useRef, useState } from "react";

const PausableMovie = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/components/foundation/PausableMovie").then(
    (m) => ({ default: m.PausableMovie }),
  ),
);
import { getMoviePath } from "@web-speed-hackathon-2026/client/src/utils/get_path";

interface Props {
  movie: Models.Movie;
}

export const MovieArea = ({ movie }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="border-cax-border bg-cax-surface-subtle relative h-full w-full overflow-hidden rounded-lg border"
      data-movie-area
      ref={containerRef}
    >
      {inView && (
        <Suspense>
          <PausableMovie src={getMoviePath(movie.id)} />
        </Suspense>
      )}
    </div>
  );
};
