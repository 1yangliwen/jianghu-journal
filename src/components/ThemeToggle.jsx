import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    const getLabel = () => {
        if (theme === 'light') return '人间';
        if (theme === 'dark') return '幽都';
        return '循天时';
    };

    return (
        <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`当前：${getLabel()} (点击切换)`}
        >
            <span className="theme-icon" aria-hidden="true">
                {theme === 'light' ? '昼' : theme === 'dark' ? '夜' : '衡'}
            </span>
            <span className="theme-label">{getLabel()}</span>
        </button>
    );
}
