'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useLayoutEffect } from 'react';
import { setTheme } from './themeSlice';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ThemeSynchronizer({ children }) {
  const theme = useSelector((state) => state.theme.value);
  const dispatch = useDispatch();

  // On mount, load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved && (saved === 'light' || saved === 'dark')) {
      dispatch(setTheme(saved));
    } else {
      // Default theme is 'light'
      dispatch(setTheme('light'));
    }
  }, [dispatch]);

  // Sync theme state with HTML element synchronously before paint, disabling transitions temporarily
  useIsomorphicLayoutEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('no-transitions');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Force browser reflow to apply styles instantly
    window.getComputedStyle(root).opacity;

    const raf = requestAnimationFrame(() => {
      root.classList.remove('no-transitions');
    });

    return () => cancelAnimationFrame(raf);
  }, [theme]);

  return children;
}
