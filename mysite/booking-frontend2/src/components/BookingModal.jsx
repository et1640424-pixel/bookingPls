import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { money, nightsBetween, plural, todayISO } from '../utils.js';
import { Check } from './Icons.jsx';
import Modal from './Modal.jsx';

export default function BookingModal({ room, hotelName, onClose }) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const maxGuests = room.capacity || 1;
  const nights = nightsBetween(checkIn, checkOut);
  const total = nights > 0 ? nights * room.price_per_night : 0;

  const changeCheckIn = (value) => {
    setCheckIn(value);
    if (checkOut && checkOut <= value) setCheckOut('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (nights < 1) {
      setError('Дата выезда должна быть позже даты заезда.');
      return;
    }
    setBusy(true);
    try {
      await api.book({
        room: room.id,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Modal title="Бронирование отправлено" onClose={onClose}>
        <div className="success">
          <span className="success-icon"><Check width={28} height={28} /></span>
          <h2>Заявка отправлена</h2>
          <p className="muted">
            {hotelName}, номер {room.room_number}, {nights} {plural(nights, ['ночь', 'ночи', 'ночей'])}.
            Статус бронирования можно посмотреть в профиле.
          </p>
          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/profile', { state: { tab: 'bookings' } })}
            >
              Мои бронирования
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Бронирование" onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <div>
          <h2>Бронирование</h2>
          <p className="muted">{hotelName}, номер {room.room_number}</p>
        </div>

        <div className="row-2">
          <label className="field">
            <span>Заезд</span>
            <input
              type="date"
              min={todayISO()}
              value={checkIn}
              required
              onChange={(e) => changeCheckIn(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Выезд</span>
            <input
              type="date"
              min={checkIn || todayISO()}
              value={checkOut}
              required
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>
        </div>

        <div className="field">
          <span>Гостей (до {maxGuests})</span>
          <div className="stepper">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
              aria-label="Меньше гостей"
            >
              −
            </button>
            <output>{guests}</output>
            <button
              type="button"
              onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
              disabled={guests >= maxGuests}
              aria-label="Больше гостей"
            >
              +
            </button>
          </div>
        </div>

        <div className="summary">
          {nights > 0 ? (
            <>
              <div>
                <span>{money(room.price_per_night)} × {nights} {plural(nights, ['ночь', 'ночи', 'ночей'])}</span>
                <span>{money(total)}</span>
              </div>
              <div className="summary-total">
                <span>Итого</span>
                <span>{money(total)}</span>
              </div>
            </>
          ) : (
            <p className="muted">Выберите даты, чтобы увидеть стоимость.</p>
          )}
        </div>

        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Отправляем…' : 'Забронировать'}
        </button>
      </form>
    </Modal>
  );
}
