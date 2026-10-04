import { motion } from "framer-motion";
import { useState } from "react";

export default function FloatingDustBackground() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -30,
      xMovement: Math.random() * 60 - 30,
      blur: Math.random() * 2,
    }))
  );

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ 
            y: "-10vh", 
            opacity: [0, 0.4, 0.4, 0],
            x: [0, p.xMovement, 0]
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
            opacity: { duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay },
            x: { duration: p.duration * 1.5, repeat: Infinity, ease: "easeInOut", delay: p.delay },
          }}
          className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            filter: `blur(${p.blur}px)`
          }}
        />
      ))}
    </div>
  );
}
