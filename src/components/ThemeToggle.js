'use client';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '@/store/themeSlice';
import { HiSun, HiMoon } from 'react-icons/hi';

export default function ThemeToggle() {
  const theme = useSelector((state) => state.theme.value);
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      type="button"
      className="p-2.5 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-300 hover:text-dark-100 hover:border-dark-700 transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center cursor-pointer relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'dark' ? (
          <HiSun className="w-5 h-5 text-amber-400 transition-transform duration-500 rotate-0 scale-100 group-hover:rotate-45" />
        ) : (
          <HiMoon className="w-5 h-5 text-indigo-600 transition-transform duration-500 rotate-0 scale-100 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
}
