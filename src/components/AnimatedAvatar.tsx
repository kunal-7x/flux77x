import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedAvatarProps {
  size?: number;
  className?: string;
  ariaLabel?: string;
}

const MOUTHS = [
  "M 32 58 Q 50 72 68 58", // wide friendly smile
  "M 36 60 Q 50 70 64 60", // normal smile
  "M 40 62 Q 50 64 60 62", // neutral
  "M 44 64 Q 50 68 56 64", // tiny smile
  "M 46 62 Q 50 58 54 62", // thinking
];

export const AnimatedAvatar = ({ size = 80, className, ariaLabel = "AI Assistant" }: AnimatedAvatarProps) => {
  const [mouthIdx, setMouthIdx] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking values
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Springs for smooth movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transformations for 3D effect
  const headRotateX = useTransform(smoothY, [0, 1], [15, -15]);
  const headRotateY = useTransform(smoothX, [0, 1], [-25, 25]);
  
  // Parallax for face elements
  const faceTranslateX = useTransform(smoothX, [0, 1], [-8, 8]);
  const faceTranslateY = useTransform(smoothY, [0, 1], [-6, 6]);
  const eyeTranslateX = useTransform(smoothX, [0, 1], [-12, 12]);
  const eyeTranslateY = useTransform(smoothY, [0, 1], [-8, 8]);
  
  // Antenna motion
  const antennaRotate = useTransform(smoothX, [0, 1], [-15, 15]);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener?.("change", h);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      m.removeEventListener?.("change", h);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (reduced) return;
    
    const behaviorTimer = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.25) {
        // Double blink
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
        setTimeout(() => {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 120);
        }, 250);
      } else if (rand < 0.5) {
        // Single blink
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      } else if (rand < 0.8) {
        // Change mouth
        setMouthIdx(Math.floor(Math.random() * MOUTHS.length));
      }
    }, 2500);

    return () => {
      clearInterval(behaviorTimer);
    };
  }, [reduced]);

  return (
    <motion.div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={cn("inline-block relative overflow-visible transition-all duration-300 drop-shadow-2xl hover:drop-shadow-[0_15px_30px_hsl(var(--primary)/0.4)]", className)}
      style={{ 
        width: size, 
        height: size,
        perspective: "1000px"
      }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="block"
        aria-hidden="true"
        style={{
          rotateX: headRotateX,
          rotateY: headRotateY,
          transformStyle: "preserve-3d"
        }}
        animate={{ y: reduced ? 0 : [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="head-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--card))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
          
          <linearGradient id="screen-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <clipPath id="screen-clip">
            <rect x="15" y="25" width="70" height="50" rx="22" />
          </clipPath>

          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cute little antenna */}
        <motion.g style={{ rotate: antennaRotate, transformOrigin: "50% 15px" }}>
          <path d="M48 15 L52 15 L50 6 Z" fill="hsl(var(--muted-foreground))" />
          <circle cx="50" cy="6" r="4" fill="hsl(var(--primary))" filter="url(#soft-glow)" />
        </motion.g>

        {/* Robot Head Base - very friendly pill shape */}
        <rect x="5" y="15" width="90" height="70" rx="35" fill="url(#head-grad)" stroke="hsl(var(--border))" strokeWidth="2" />

        {/* Ear details */}
        <rect x="1" y="40" width="8" height="20" rx="4" fill="hsl(var(--muted-foreground))" />
        <rect x="91" y="40" width="8" height="20" rx="4" fill="hsl(var(--muted-foreground))" />

        {/* The Dark Visor / Screen */}
        <rect x="15" y="25" width="70" height="50" rx="22" fill="url(#screen-grad)" />
        
        {/* The Face Elements inside the Screen */}
        <g clipPath="url(#screen-clip)">
          <motion.g style={{ x: faceTranslateX, y: faceTranslateY }}>
            
            {/* Eyes Holder */}
            <motion.g style={{ x: eyeTranslateX, y: eyeTranslateY }}>
              {/* Left Eye (Big and friendly) */}
              <g transform="translate(32, 45)">
                 <motion.g animate={{ scaleY: isBlinking ? 0.1 : 1 }} style={{ transformOrigin: "center" }}>
                   {/* Eye base */}
                   <circle r="7" fill="hsl(var(--primary))" filter="url(#soft-glow)" />
                   {/* Eye highlight for cuteness */}
                   <circle cx="-2.5" cy="-2.5" r="2.5" fill="#ffffff" opacity="0.85" />
                 </motion.g>
              </g>
              {/* Right Eye */}
              <g transform="translate(68, 45)">
                 <motion.g animate={{ scaleY: isBlinking ? 0.1 : 1 }} style={{ transformOrigin: "center" }}>
                   <circle r="7" fill="hsl(var(--primary))" filter="url(#soft-glow)" />
                   <circle cx="-2.5" cy="-2.5" r="2.5" fill="#ffffff" opacity="0.85" />
                 </motion.g>
              </g>
            </motion.g>

            {/* Mouth */}
            <motion.path
              d={MOUTHS[mouthIdx]}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#soft-glow)"
              animate={{ d: MOUTHS[mouthIdx] }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </motion.g>
        </g>

        {/* Glass Reflection on the screen (drawn over the face) */}
        <path d="M 18 28 Q 50 20 82 28 Q 75 42 25 42 Z" fill="#ffffff" opacity="0.06" />

      </motion.svg>
    </motion.div>
  );
};

export default AnimatedAvatar;
