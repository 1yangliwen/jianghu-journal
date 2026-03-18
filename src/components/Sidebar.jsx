import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
    const navItems = [
        { path: '/', index: '壹', label: '归墟', note: '总卷' },
        { path: '/moments', index: '贰', label: '浮生录', note: '往事' },
        { path: '/grudges', index: '叁', label: '恩仇簿', note: '人物' },
        { path: '/settings', index: '肆', label: '藏经阁', note: '馆藏' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="sidebar-title">江湖恩怨录</h1>
                <p className="sidebar-subtitle">纸墨为卷，记人间往来</p>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-index">{item.index}</span>
                        <span className="nav-copy">
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-note">{item.note}</span>
                        </span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <ThemeToggle />
            </div>
        </aside>
    );
}
