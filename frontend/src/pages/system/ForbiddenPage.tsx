import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div style={{ padding: 60 }}>
      <h1>403 – Access Denied</h1>
      <p>You do not have permission to access this page.</p>

      <Link to="/super-admin/dashboard">
        Back to Dashboard
      </Link>
    </div>
  );
}