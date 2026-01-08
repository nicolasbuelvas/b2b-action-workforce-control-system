import { useAuthContext } from '../../context/AuthContext';

export default function DashboardPage() {
  const { logout } = useAuthContext();

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}