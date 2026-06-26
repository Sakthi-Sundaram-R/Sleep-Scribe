// Full-page ambient video background. Sits behind all content (the hero's
// opaque frame-canvas covers it at the very top, by design). A dark overlay
// keeps text and cards readable on every page.
export default function VideoBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0f1f]">
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      {/* readability veil */}
      <div className="absolute inset-0 bg-[#0b0f1f]/55" />
    </div>
  );
}
