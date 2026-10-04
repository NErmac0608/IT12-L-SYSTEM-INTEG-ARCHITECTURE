export default function AnimatedGridBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Subtle Warm Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[350px] bg-[#f97316]/5 rounded-full blur-[90px]" />
      
      {/* 
        High-Performance Static Grid: 
        Pure CSS pattern without continuous JS transforms or 300% oversized containers.
        Uses pure CSS background pattern with hardware-accelerated mask.
      */}
      <div
        className="absolute inset-0 w-full h-full opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(249, 115, 22, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(249, 115, 22, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          WebkitMaskImage: "radial-gradient(ellipse at top, black 35%, transparent 75%)",
          maskImage: "radial-gradient(ellipse at top, black 35%, transparent 75%)"
        }}
      />
    </div>
  );
}
