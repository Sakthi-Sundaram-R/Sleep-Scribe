import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

// Wraps the app in Lenis for buttery, weighted smooth scrolling.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      // Short enough that the page doesn't feel like it trails the wheel,
      // long enough to keep the weighted, cinematic glide.
      duration: 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Make in-page anchor links (#features etc.) use Lenis too.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length > 1) {
        e.preventDefault();
        lenis.scrollTo(id, { offset: -80 });
      }
    };
    document.addEventListener("click", onClick);

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
