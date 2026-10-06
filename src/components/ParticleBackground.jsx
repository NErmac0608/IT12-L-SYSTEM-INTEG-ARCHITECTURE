import { useEffect, useRef } from "react";

const MAX_PARTICLES = 720;
const BASE_SPACING = 36;
const INTERACTION_RADIUS = 132;
const MAX_REPULSION = 76;
const SPRING_STRENGTH = 0.035;
const FRICTION = 0.82;

function createParticles(width, height) {
  const spacing = Math.max(
    BASE_SPACING,
    Math.sqrt((width * height) / MAX_PARTICLES)
  );
  const columns = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  const particles = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const homeX = column * spacing + spacing / 2 + (row % 2) * spacing / 2;
      const homeY = row * spacing + spacing / 2;

      if (homeX > width || homeY > height) continue;

      particles.push({
        homeX,
        homeY,
        x: homeX,
        y: homeY,
        velocityX: 0,
        velocityY: 0,
        radius: 0.7 + Math.random() * 1.5,
        opacity: 0.18 + Math.random() * 0.42,
      });
    }
  }

  return particles;
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !container || !context) return undefined;

    const motionPreference = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    );
    let reducedMotion = motionPreference?.matches ?? false;
    let particles = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let particleGradient;
    let pointer = null;
    let frameId = 0;
    let previousTime = 0;

    const draw = (time = 0) => {
      const frameScale = previousTime
        ? Math.min(Math.max((time - previousTime) / 16.67, 0.5), 2)
        : 1;
      previousTime = time;

      context.clearRect(0, 0, width, height);
      context.fillStyle = particleGradient;

      for (const particle of particles) {
        if (!reducedMotion) {
          let targetX = particle.homeX;
          let targetY = particle.homeY;

          if (pointer) {
            const deltaX = particle.x - pointer.x;
            const deltaY = particle.y - pointer.y;
            const distance = Math.hypot(deltaX, deltaY);

            if (distance < INTERACTION_RADIUS) {
              const angle =
                distance > 0.001
                  ? Math.atan2(deltaY, deltaX)
                  : Math.atan2(particle.homeY - pointer.y, particle.homeX - pointer.x);
              const intensity = 1 - distance / INTERACTION_RADIUS;
              const displacement = MAX_REPULSION * intensity * intensity;

              targetX += Math.cos(angle) * displacement;
              targetY += Math.sin(angle) * displacement;
            }
          }

          particle.velocityX +=
            (targetX - particle.x) * SPRING_STRENGTH * frameScale;
          particle.velocityY +=
            (targetY - particle.y) * SPRING_STRENGTH * frameScale;
          const friction = FRICTION ** frameScale;
          particle.velocityX *= friction;
          particle.velocityY *= friction;
          particle.x += particle.velocityX * frameScale;
          particle.y += particle.velocityY * frameScale;
        }

        context.globalAlpha = particle.opacity;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    const resizeCanvas = () => {
      const bounds = container.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particleGradient = context.createLinearGradient(0, 0, width, height);
      particleGradient.addColorStop(0, "#fbbf24");
      particleGradient.addColorStop(0.52, "#f97316");
      particleGradient.addColorStop(1, "#c2410c");
      particles = createParticles(width, height);
      pointer = null;
      previousTime = 0;

      if (reducedMotion) draw();
    };

    const handlePointerMove = (event) => {
      const bounds = container.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      pointer =
        x >= 0 && x <= bounds.width && y >= 0 && y <= bounds.height
          ? { x, y }
          : null;
    };

    const handlePointerOut = (event) => {
      if (!event.relatedTarget) pointer = null;
    };

    const handleWindowBlur = () => {
      pointer = null;
    };

    const handleMotionPreferenceChange = (event) => {
      reducedMotion = event.matches;

      if (reducedMotion) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
        draw();
      } else if (!frameId) {
        previousTime = 0;
        frameId = window.requestAnimationFrame(draw);
      }
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resizeCanvas)
        : null;

    resizeObserver?.observe(container);
    if (!resizeObserver) window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", handleWindowBlur);
    motionPreference?.addEventListener?.("change", handleMotionPreferenceChange);
    if (motionPreference && !motionPreference.addEventListener) {
      motionPreference.addListener(handleMotionPreferenceChange);
    }

    resizeCanvas();
    if (!reducedMotion) frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", handleWindowBlur);
      motionPreference?.removeEventListener?.(
        "change",
        handleMotionPreferenceChange
      );
      if (motionPreference && !motionPreference.removeEventListener) {
        motionPreference.removeListener(handleMotionPreferenceChange);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}
