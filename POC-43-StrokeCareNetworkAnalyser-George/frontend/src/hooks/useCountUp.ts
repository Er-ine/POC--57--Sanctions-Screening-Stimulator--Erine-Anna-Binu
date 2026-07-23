"use client";

import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  const targetRef = useRef(target);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset when target changes
    targetRef.current = target;
    startTimeRef.current = null;
    
    // If target is 0, just set to 0 immediately
    if (target === 0) {
      setCount(0);
      countRef.current = 0;
      return;
    }

    const animate = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }
      
      const progress = time - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      const currentCount = Math.floor(easeOut * targetRef.current);
      
      if (currentCount !== countRef.current) {
        setCount(currentCount);
        countRef.current = currentCount;
      }
      
      if (percentage < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [target, duration]);

  return count;
}
