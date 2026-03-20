import { useEffect, useRef, useState } from "react";

import { SoundPlayer } from "@web-speed-hackathon-2026/client/src/components/foundation/SoundPlayer";

interface Props {
  sound: Models.Sound;
}

export const SoundArea = ({ sound }: Props) => {
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
      className="border-cax-border relative h-full w-full overflow-hidden rounded-lg border"
      data-sound-area
      ref={containerRef}
    >
      {inView && <SoundPlayer sound={sound} />}
    </div>
  );
};
