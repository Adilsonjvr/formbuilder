import { Variants, Transition } from 'framer-motion'

/**
 * Standard Transitions
 */
export const transitions = {
  fast: {
    duration: 0.15,
    ease: [0, 0, 0.2, 1], // ease-out
  },
  base: {
    duration: 0.2,
    ease: [0, 0, 0.2, 1], // ease-out
  },
  slow: {
    duration: 0.3,
    ease: [0, 0, 0.2, 1], // ease-out
  },
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
  springGentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
  },
} satisfies Record<string, Transition>

/**
 * Fade Animations
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

/**
 * Slide Animations
 */
export const slideInRight: Variants = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 },
}

export const slideInLeft: Variants = {
  initial: { x: -300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 },
}

export const slideInBottom: Variants = {
  initial: { y: 300, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 300, opacity: 0 },
}

/**
 * Scale Animations
 */
export const scaleIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
}

export const scaleInCenter: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
}

/**
 * Combined Animations
 */
export const modalVariants: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
}

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const drawerVariants: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
}

export const toastVariants: Variants = {
  initial: { x: 400, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 400, opacity: 0 },
}

/**
 * Stagger Children Animation
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

/**
 * Hover Animations (use with whileHover prop)
 */
export const hoverScale = {
  scale: 1.05,
  transition: transitions.fast,
}

export const hoverLift = {
  y: -4,
  transition: transitions.fast,
}

export const hoverGlow = {
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  transition: transitions.base,
}

/**
 * Tap Animations (use with whileTap prop)
 */
export const tapScale = {
  scale: 0.98,
}

/**
 * Hook for checking reduced motion preference
 */
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Helper to conditionally apply motion variants
 */
export function getMotionVariants<T extends Variants>(
  variants: T,
  prefersReducedMotion: boolean
): T | undefined {
  return prefersReducedMotion ? undefined : variants
}
