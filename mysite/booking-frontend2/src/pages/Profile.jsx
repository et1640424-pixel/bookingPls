import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { formatDate, formatShort, list, money, nightsBetween, plural } from '../utils.js';
import Avatar from '../components/Avatar.jsx';
import ProfileForm from '../components/ProfileForm.jsx';

const STATUS = {
  pending: { text: 'Ожидает подтверждения', cls: 'pill-wait' },
  confirmed: { text: 'Подтверждено', cls: 'pill-ok' },
  cancelled: { text: 'Отменено', cls: 'pill-off' },
};

function Info({ label, value }) {
  return (
    <div className="info">
      <dt>{label}</dt>
      <dd>{value || <span className="muted">Не указано</span>}</dd>
    </div>
  );
}

export default function Profile() {
  const { user, loading, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [tab, setTab] = useState(location.state?.tab || 'profile');
  const [editing, setEditing] = useState(false);
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    api
      .bookings()
      .then((d) => {
        if (!cancelled) setBookings(list(d));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) return <div className="sk-line" style={{ height: 120 }} />;
  if (!user) return <Navigate to="/login" state={{ from: '/profile' }} replace />;

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;

  const onLogout = () => {
    logout();
    toast('Вы вышли из аккаунта');
    navigate('/');
  };

  const onDelete = async () => {
    if (!window.confirm('Удалить аккаунт? Это действие нельзя отменить.')) return;
    try {
      await deleteAccount();
      toast('Аккаунт удалён');
      navigate('/');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="profile">
      <section className="profile-card">
        <Avatar user={user} size={96} />
        <div className="profile-id">
          <h1>{name}</h1>
          <p className="muted">@{user.username}, {user.email}</p>
          {user.date_joined && <p className="muted">С нами с {formatDate(user.date_joined)}</p>}
        </div>
        <div className="profile-actions">
          {tab === 'profile' && !editing && (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Редактировать</button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Выйти</button>
        </div>
      </section>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'profile'} className={tab === 'profile' ? 'on' : ''} onClick={() => setTab('profile')}>
          Профиль
        </button>
        <button role="tab" aria-selected={tab === 'bookings'} className={tab === 'bookings' ? 'on' : ''} onClick={() => setTab('bookings')}>
          Бронирования{bookings ? ` (${bookings.length})` : ''}
        </button>
      </div>

      {tab === 'profile' && (
        <section className="panel">
          {editing ? (
            <ProfileForm user={user} onDone={() => setEditing(false)} />
          ) : (
            <>
              <dl className="info-grid">
                <Info label="Имя" value={user.first_name} />
                <Info label="Фамилия" value={user.last_name} />
                <Info label="Имя пользователя" value={user.username} />
                <Info label="Email" value={user.email} />
                <Info label="Страна" value={user.country} />
                <Info label="Телефон" value={user.phone_number} />
              </dl>
              <div className="danger">
                <div>
                  <h3>Удаление аккаунта</h3>
                  <p className="muted">Профиль и все данные будут удалены безвозвратно.</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={onDelete}>Удалить аккаунт</button>
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'bookings' && (
        <section className="panel">
          {error && <p className="error">{error}</p>}
          {!bookings && !error && <div className="sk-line" style={{ height: 80 }} />}
          {bookings && bookings.length === 0 && (
            <div className="empty">
              <p>Пока нет бронирований.</p>
              <Link to="/" className="btn btn-primary btn-sm">Посмотреть отели</Link>
            </div>
          )}
          <ul className="bookings">
            {(bookings || []).map((b) => {
              const nights = nightsBetween(b.check_in, b.check_out);
              const st = STATUS[b.status] || { text: b.status, cls: 'pill-wait' };
              return (
                <li key={b.id}>
                  <div>
                    <h3>{b.hotel_name || 'Отель'}{b.room_number ? `, номер ${b.room_number}` : ''}</h3>
                    <p className="muted">
                      {formatShort(b.check_in)} – {formatShort(b.check_out)}
                      {nights > 0 && `, ${nights} ${plural(nights, ['ночь', 'ночи', 'ночей'])}`}
                      {b.guests_count ? `, гостей: ${b.guests_count}` : ''}
                    </p>
                  </div>
                  <div className="booking-right">
                    {b.total_price != null && <p className="price">{money(b.total_price)}</p>}
                    <span className={`pill ${st.cls}`}>{st.text}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
