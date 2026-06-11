import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsFetching } from '@tanstack/react-query';
import { usePokemonStore } from '../store/usePokemonStore';

export const FloatingPokeballCursor: React.FC = () => {
  const isEnabled = usePokemonStore((state) => state.customCursor);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // TanStack Query fetch indicator
  const isFetching = useIsFetching();
  const isSpinning = isFetching > 0;

  // Mouse Coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth Springs
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Detect mobile/tablet devices
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (isMobile || !isEnabled) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 12);
      mouseY.set(e.clientY - 12);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Hover detection for clickable items
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.classList.contains('clickable');

      setIsHovered(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isEnabled, isMobile, isVisible, mouseX, mouseY]);

  if (isMobile || !isEnabled || !isVisible) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        position: 'fixed',
        top: 0,
        left: 0,
        width: 24,
        height: 24,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      animate={{
        scale: isHovered ? 1.8 : 1,
        // Continuous rotation loop if fetching, otherwise tilt or rotate on hover
        rotate: isSpinning ? [0, 360] : (isHovered ? 180 : 0),
      }}
      transition={{
        rotate: isSpinning
          ? { repeat: Infinity, ease: 'linear', duration: 1.2 }
          : { type: 'spring', damping: 20, stiffness: 200 },
        scale: { type: 'spring', damping: 20, stiffness: 200 }
      }}
    >
      {/* Pokeball SVG Follower */}
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(255,203,5,0.4)]"
      >
        {/* Upper Half (Red) */}
        <path
          d="M 12 2 C 6.48 2 2 6.48 2 12 C 2 12.34 2.03 12.67 2.07 13 L 21.93 13 C 21.97 12.67 22 12.34 22 12 C 22 6.48 17.52 2 12 2 Z"
          fill="#EF4444"
        />
        {/* Bottom Half (White) */}
        <path
          d="M 2.07 13 C 2.45 17.72 6.38 21.55 11.12 21.93 C 11.41 21.96 11.71 22 12 22 C 17.52 22 22 17.52 22 12 C 22 12.34 21.97 12.01 21.93 11.67 L 2.07 11.67 Z"
          fill="#F3F4F6"
        />
        {/* Center Line (Black/Slate) */}
        <rect x="1" y="11" width="22" height="2" fill="#1E293B" rx="0.5" />
        {/* Outer Ring */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="#1E293B" strokeWidth="1.5" />
        {/* Center Button Outer */}
        <circle cx="12" cy="12" r="4.5" fill="#1E293B" />
        {/* Center Button Inner */}
        <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
      </svg>
    </motion.div>
  );
};
export default FloatingPokeballCursor;
