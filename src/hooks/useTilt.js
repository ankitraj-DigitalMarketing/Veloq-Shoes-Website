import { useRef, useCallback } from 'react';

export default function useTilt(strength = 15) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `
      perspective(1000px)
      rotateY(${x * strength}deg)
      rotateX(${-y * strength}deg)
      scale3d(1.03, 1.03, 1.03)
    `;
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)`;
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
