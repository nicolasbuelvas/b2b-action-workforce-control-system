import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import SessionTimeoutNotification from './components/SessionTimeoutNotification';
import './styles/components.css';

export default function App() {
  return (
    <AuthProvider>
      <SessionTimeoutNotification />
      <AppRouter />
    </AuthProvider>
  );
}