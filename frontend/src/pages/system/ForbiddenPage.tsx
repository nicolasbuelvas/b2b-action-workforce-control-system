import { useNavigate } from 'react-router-dom';
import './forbiddenPage.css';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  // Esta función utiliza el historial del navegador para regresar 1 paso atrás
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="forbidden-wrapper">
      <div className="forbidden-content">
        <div className="forbidden-icon">🚫</div>
        <h1 className="forbidden-title">403 – Access Denied</h1>
        <p className="forbidden-text">
          You do not have the required permissions to view this section. 
          If you believe this is an error, please contact the Super Admin.
        </p>
          
          <button 
            onClick={() => navigate('/')} 
            className="btn-home-link"
          >
            Go Back to Previous Page
          </button>
        </div>
      </div>
  
  );
}