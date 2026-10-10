export default function Stars({ value = 0 }) {
  return (
    <span className="stars" aria-label={`${value} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? 'on' : ''}>★</span>
      ))}
    </span>
  );
}
