import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { formatDate, mediaUrl, money, plural } from '../utils.js';
import BookingModal from '../components/BookingModal.jsx';
import Avatar from '../components/Avatar.jsx';
import { Car, Pin, Users, Wifi } from '../components/Icons.jsx';
import Stars from '../components/Stars.jsx';

function Room({ room, onBook }) {
  const [img, setImg] = useState(0);
  const images = room.room_images || [];
  const typeName =
    room.room_type_name || (typeof room.room_type === 'object' ? room.room_type?.name : '');

  return (
    <li className="room">
      <button
        className="room-img"
        onClick={() => images.length > 1 && setImg((img + 1) % images.length)}
        aria-label="Следующее фото"
      >
        {images[img] && (
          <img src={mediaUrl(images[img].image)} alt={`Номер ${room.room_number}`} loading="lazy" />
        )}
        {images.length > 1 && <span className="badge badge-bottom">{img + 1} / {images.length}</span>}
      </button>

      <div className="room-info">
        <h3>Номер {room.room_number}{typeName ? `, ${typeName}` : ''}</h3>
        <p className="muted with-icon"><Users width={15} height={15} />До {room.capacity} гостей</p>
        {room.description && <p className="room-desc">{room.description}</p>}
      </div>

      <div className="room-side">
        <p className="price">
          {money(room.price_per_night)}
          <span className="muted"> / ночь</span>
        </p>
        {room.is_available ? (
          <button className="btn btn-primary" onClick={() => onBook(room)}>Забронировать</button>
        ) : (
          <span className="pill pill-off">Недоступен</span>
        )}
      </div>
    </li>
  );
}

export default function Hotel() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setHotel(null);
    setError('');
    Promise.all([api.hotel(id), api.rooms(id).catch(() => ({ rooms: [] }))])
      .then(([h, r]) => {
        if (cancelled) return;
        setHotel(h);
        setRooms(r.rooms || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const startBooking = (room) => {
    if (!user) {
      toast('Войдите, чтобы забронировать номер');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setBooking(room);
  };

  if (error) return <p className="error">{error}</p>;
  if (!hotel) {
    return (
      <div aria-hidden="true">
        <div className="gallery"><div className="gallery-main sk" /></div>
        <div className="sk-line" style={{ width: '40%', height: 34, marginTop: 28 }} />
      </div>
    );
  }

  const reviews = hotel.hotel_review || [];
  const average = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : null;
  const open = rooms.filter((r) => r.is_available);
  const priceList = (open.length ? open : rooms).map((r) => r.price_per_night);
  const minPrice = priceList.length ? Math.min(...priceList) : null;
  const sideImages = rooms
    .flatMap((r) => (r.room_images || []).map((i) => i.image))
    .slice(0, 2);

  return (
    <article>
      <Link to="/" className="back">← Все отели</Link>

      <div className={`gallery ${sideImages.length ? 'has-side' : ''}`}>
        <div className="gallery-main">
          {hotel.photo && <img src={mediaUrl(hotel.photo)} alt={hotel.name} />}
        </div>
        {sideImages.length > 0 && (
          <div className="gallery-side">
            {sideImages.map((src, i) => (
              <div key={i} className="gallery-thumb">
                <img src={mediaUrl(src)} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hotel-layout">
        <div className="hotel-main">
          <header>
            <h1>{hotel.name}</h1>
            <div className="meta">
              <Stars value={hotel.stars} />
              {average && <span className="rating">{average}</span>}
              {reviews.length > 0 && (
                <span className="muted">
                  {reviews.length} {plural(reviews.length, ['отзыв', 'отзыва', 'отзывов'])}
                </span>
              )}
            </div>
            <p className="muted with-icon">
              <Pin width={16} height={16} />
              {hotel.address ? `${hotel.address}, ` : ''}{hotel.city}, {hotel.country}
            </p>
          </header>

          <p className="hotel-desc">{hotel.description}</p>

          {(hotel.has_parking || hotel.has_wif) && (
            <ul className="amenities">
              {hotel.has_wif && <li><Wifi /> Wi-Fi</li>}
              {hotel.has_parking && <li><Car /> Парковка</li>}
            </ul>
          )}

          <section id="rooms">
            <h2 className="section-title">Номера</h2>
            {rooms.length === 0 ? (
              <p className="empty">Номеров пока нет.</p>
            ) : (
              <ul className="rooms">
                {rooms.map((r) => <Room key={r.id ?? r.room_number} room={r} onBook={startBooking} />)}
              </ul>
            )}
          </section>

          <section>
            <h2 className="section-title">Отзывы</h2>
            {reviews.length === 0 ? (
              <p className="empty">Отзывов пока нет.</p>
            ) : (
              <ul className="reviews">
                {reviews.map((r, i) => (
                  <li key={i}>
                    <Avatar user={{ username: r.user_name }} size={40} />
                    <div>
                      <div className="review-head">
                        <strong>{r.user_name || 'Гость'}</strong>
                        <span className="muted">{formatDate(r.created_date)}</span>
                      </div>
                      <Stars value={r.stars} />
                      <p>{r.comment}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="hotel-aside">
          <div className="aside-card">
            {minPrice != null ? (
              <p className="price big">
                <span className="muted small">от </span>{money(minPrice)}
                <span className="muted small"> / ночь</span>
              </p>
            ) : (
              <p className="muted">Цены уточняйте</p>
            )}
            <p className="muted">
              {open.length} {plural(open.length, ['свободный номер', 'свободных номера', 'свободных номеров'])}
            </p>
            <button
              className="btn btn-primary btn-block"
              onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Выбрать номер
            </button>
          </div>
        </aside>
      </div>

      {booking && (
        <BookingModal room={booking} hotelName={hotel.name} onClose={() => setBooking(null)} />
      )}
    </article>
  );
}
