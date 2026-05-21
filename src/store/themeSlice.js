import { createSlice } from '@reduxjs/toolkit';

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    value: 'light', // Always start with 'light' to prevent hydration mismatches
  },
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.value === 'light' ? 'dark' : 'light';
      state.value = nextTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', nextTheme);
      }
    },
    setTheme: (state, action) => {
      state.value = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
