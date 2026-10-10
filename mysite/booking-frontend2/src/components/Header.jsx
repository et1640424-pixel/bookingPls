import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Avatar from './Avatar.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          Stay
        </Link>

        <nav className="nav">
          <NavLink to="/" end className="nav-link">Отели</NavLink>
        </nav>

        <div className="header-right">
          <ThemeToggle />
          {loading ? (
            <span className="avatar sk-circle" style={{ width: 36, height: 36 }} />
          ) : user ? (
            <Link to="/profile" className="me" aria-label="Мой профиль">
              <Avatar user={user} size={36} />
              <span className="me-name">{user.first_name || user.username}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-link">Войти</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
