
import { useScroll } from 'framer-motion';

export function useScrollAnimation() {
  // Using framer-motion's built-in useScroll hook which returns MotionValues
  const { scrollY, scrollYProgress } = useScroll();
  
  return { scrollY, scrollYProgress };
}
