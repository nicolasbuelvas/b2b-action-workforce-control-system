import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin.api';
import StatCard from '../../components/cards/StatCard';

interface DashboardData {
  usersCount: number;
  subAdminsCount: number;
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>No dashboard data</div>;

  return (
    <div className="dashboard-container">
      <header className="welcome-banner">
        <h2>Welcome back, Super Admin</h2>
        <p>System-wide overview of workforce and task execution.</p>
      </header>

      <section className="stats-grid">
        <StatCard title="Total Users" value={data.usersCount} />
        <StatCard title="Sub Admins" value={data.subAdminsCount} />
      </section>
    </div>
  );
}