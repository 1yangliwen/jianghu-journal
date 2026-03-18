/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'theme';
const HOME_MODE_STORAGE_KEY = 'home_mode';

const ThemeContext = createContext();

const resolveSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || 'system');
    const [homeMode, setHomeMode] = useState(() => localStorage.getItem(HOME_MODE_STORAGE_KEY) || 'dossier');

    useEffect(() => {
        const root = document.documentElement;
        const effectiveTheme = theme === 'system' ? resolveSystemTheme() : theme;

        if (effectiveTheme === 'light') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', effectiveTheme);
        }

        localStorage.setItem(THEME_STORAGE_KEY, theme);

        if (theme !== 'system') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event) => {
            if (event.matches) {
                root.setAttribute('data-theme', 'dark');
            } else {
                root.removeAttribute('data-theme');
            }
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(HOME_MODE_STORAGE_KEY, homeMode);
    }, [homeMode]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, homeMode, setHomeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
