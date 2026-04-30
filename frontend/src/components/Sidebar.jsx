import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function Sidebar({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-brand">
          <span className="logo">T</span>
          <span>TaskFlow</span>
        </div>
        <button
          type="button"
          className="icon-btn sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="sidebar-section-label">Workspace</div>
      <NavLink to="/" end className="sidebar-link" onClick={onClose}>
        <Icon name="dashboard" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/projects" className="sidebar-link" onClick={onClose}>
        <Icon name="projects" />
        <span>Projects</span>
      </NavLink>
      <NavLink to="/my-tasks" className="sidebar-link" onClick={onClose}>
        <Icon name="tasks" />
        <span>My Tasks</span>
      </NavLink>

      <div className="sidebar-footer">
        <button
          onClick={onLogout}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
        >
          <Icon name="logout" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
