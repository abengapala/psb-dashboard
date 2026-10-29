import { useEffect } from 'react';

export function useCursorHide(timeoutMs = 3000) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const show = () => {
      document.body.classList.remove('cursor-hidden');
      clearTimeout(timer);
      timer = setTimeout(() => {
        document.body.classList.add('cursor-hidden');
      }, timeoutMs);
    };

    document.addEventListener('mousemove', show);
    document.addEventListener('mousedown', show);
    show(); // start immediately

    return () => {
      document.removeEventListener('mousemove', show);
      document.removeEventListener('mousedown', show);
      clearTimeout(timer);
      document.body.classList.remove('cursor-hidden');
    };
  }, [timeoutMs]);
}

export function useReducedMotion() {
  const m = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  return m?.matches ?? false;
}
