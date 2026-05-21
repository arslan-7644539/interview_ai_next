'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setTheme } from './themeSlice';

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

  // Sync theme state with HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  return children;
}
