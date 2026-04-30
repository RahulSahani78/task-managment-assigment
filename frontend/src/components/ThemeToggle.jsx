import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`icon-btn ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={18} />
    </button>
  );
}
