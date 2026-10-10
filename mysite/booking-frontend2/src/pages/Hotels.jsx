import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { list, mediaUrl, plural } from '../utils.js';
import { Pin, Search } from '../components/Icons.jsx';

const FILTERS = [
  { label: 'Все', min: 0 },
  { label: '★ 3+', min: 3 },
  { label: '★ 4+', min: 4 },
  { label: '★ 5', min: 5 },
];

function HotelCard({ hotel }) {
  return (
    <Link to={`/hotel/${hotel.id}`} className="card">
      <div className="card-img">
        {hotel.photo && <img src={mediaUrl(hotel.photo)} alt={hotel.name} loading="lazy" />}
        <span className="badge">★ {hotel.stars}</span>
      </div>
      <h2>{hotel.name}</h2>
      <p className="muted with-icon">
        <Pin width={15} height={15} />
        {hotel.city}, {hotel.country}
      </p>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="card" aria-hidden="true">
      <div className="card-img sk" />
      <div className="sk-line" />
      <div className="sk-line short" />
    </div>
  );
}

export default function Hotels() {
  const [hotels, setHotels] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [minStars, setMinStars] = useState(0);
  const [sort, setSort] = useState('default');

  useEffect(() => {
    api
      .hotels()
      .then((d) => setHotels(list(d)))
      .catch((e) => setError(e.message));
  }, []);

  const shown = useMemo(() => {
    if (!hotels) return [];
    const q = query.trim().toLowerCase();
    let result = hotels.filter(
      (h) =>
        h.stars >= minStars &&
        (!q || `${h.name} ${h.city} ${h.country}`.toLowerCase().includes(q))
    );
    if (sort === 'stars') result = [...result].sort((a, b) => b.stars - a.stars);
    if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [hotels, query, minStars, sort]);

  return (
    <>
      <section className="hero">
        <h1>Найдите отель, в котором захочется остаться</h1>
        <p className="lead">Выбирайте среди проверенных отелей, смотрите номера и бронируйте за пару минут.</p>

        <div className="searchbar">
          <Search />
          <input
            type="search"
            placeholder="Название, город или страна"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Поиск отелей"
          />
        </div>
      </section>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Фильтр по звёздам">
          {FILTERS.map((f) => (
            <button
              key={f.min}
              className={`chip ${minStars === f.min ? 'on' : ''}`}
              onClick={() => setMinStars(f.min)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="select-wrap">
          <span className="sr-only">Сортировка</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Без сортировки</option>
            <option value="stars">Сначала с высокой оценкой</option>
            <option value="name">По названию</option>
          </select>
        </label>
      </div>

      {hotels && (
        <p className="muted count">
          {shown.length} {plural(shown.length, ['отель', 'отеля', 'отелей'])}
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {hotels && shown.length === 0 && <p className="empty">Ничего не найдено. Попробуйте изменить запрос.</p>}

      <div className="grid">
        {!hotels && !error && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {shown.map((h) => <HotelCard key={h.id ?? h.name} hotel={h} />)}
      </div>
    </>
  );
}
