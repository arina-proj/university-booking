import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">🎓 Бронирование аудиторий</div>
        <nav>
          <NavLink to="/" end>Аудитории</NavLink>
          <NavLink to="/book">Забронировать</NavLink>
          <NavLink to="/my">Мои бронирования</NavLink>
        </nav>
        <div className="user">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="btn-secondary">Выйти</button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}