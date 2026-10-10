import { initials, mediaUrl } from '../utils.js';

export default function Avatar({ user, size = 40, src }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  const image = src || (user?.avatar ? mediaUrl(user.avatar) : '');
  if (image) return <img className="avatar" style={style} src={image} alt="" />;
  return (
    <span className="avatar avatar-initials" style={style} aria-hidden="true">
      {initials(user)}
    </span>
  );
}
