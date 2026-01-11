import { Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

interface Props {
  sidebar: React.ReactNode;
  title: string;
}

export default function BaseAppLayout({ sidebar, title }: Props) {
  const { user, logout } = useAuthContext();

  return (
    <div className="sa-shell">
      {sidebar}

      <div className="sa-main">
        <header className="sa-topbar">
          <span className="sa-topbar-title">{title}</span>

          <div className="sa-topbar-actions">
            <span className="user-email-topbar">{user?.id}</span>
            <button className="sa-logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="sa-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}