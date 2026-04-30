import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">Team Tasks</NavLink>
      <div className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/my-tasks">My Tasks</NavLink>
        <span className="muted" style={{ marginLeft: 8 }}>{user?.name}</span>
        <button className="btn btn-sm btn-ghost" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
