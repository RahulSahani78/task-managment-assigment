import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';
import Icon from './Icon';

const titleFor = (path) => {
  if (path === '/') return 'Dashboard';
  if (path.startsWith('/projects')) return path === '/projects' ? 'Projects' : 'Project';
  if (path.startsWith('/my-tasks')) return 'My Tasks';
  return 'TaskFlow';
};

export default function TopBar({ onMenuOpen }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn topbar-menu"
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <Icon name="menu" size={20} />
      </button>
      <div className="topbar-title">{titleFor(pathname)}</div>
      <div className="topbar-spacer" />
      <ThemeToggle />
      {user && (
        <div className="user-pill">
          <Avatar name={user.name} size="sm" />
          <span className="user-pill-name">{user.name}</span>
        </div>
      )}
    </header>
  );
}
