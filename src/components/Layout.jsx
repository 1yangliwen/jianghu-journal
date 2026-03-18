import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="app-container">
            <Sidebar />
            <main className={`main-content ${isHome ? 'no-padding' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
}
