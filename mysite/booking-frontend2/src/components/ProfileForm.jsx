import { useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import Avatar from './Avatar.jsx';
import { Camera } from './Icons.jsx';

const FIELDS = ['first_name', 'last_name', 'username', 'country', 'phone_number'];

export default function ProfileForm({ user, onDone }) {
  const { updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() =>
    Object.fromEntries(FIELDS.map((k) => [k, user[k] ?? '']))
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // отправляем только то, что изменилось
    const data = new FormData();
    let changed = false;
    FIELDS.forEach((k) => {
      const value = k === 'phone_number' ? form[k].replace(/[\s()-]/g, '') : form[k].trim();
      if (value !== (user[k] ?? '')) {
        data.append(k, value);
        changed = true;
      }
    });
    if (file) {
      data.append('avatar', file);
      changed = true;
    }
    if (!changed) {
      onDone();
      return;
    }

    setBusy(true);
    try {
      await updateProfile(data);
      toast('Профиль обновлён', 'success');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <div className="avatar-edit">
        <Avatar user={user} size={88} src={preview} />
        <label className="btn btn-ghost btn-sm">
          <Camera /> Сменить фото
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="row-2">
        <label className="field">
          <span>Имя</span>
          <input value={form.first_name} onChange={set('first_name')} autoComplete="given-name" />
        </label>
        <label className="field">
          <span>Фамилия</span>
          <input value={form.last_name} onChange={set('last_name')} autoComplete="family-name" />
        </label>
      </div>

      <div className="row-2">
        <label className="field">
          <span>Имя пользователя</span>
          <input value={form.username} onChange={set('username')} autoComplete="username" required />
        </label>
        <label className="field">
          <span>Email</span>
          <input value={user.email || ''} disabled />
        </label>
      </div>

      <div className="row-2">
        <label className="field">
          <span>Страна</span>
          <input value={form.country} onChange={set('country')} autoComplete="country-name" />
        </label>
        <label className="field">
          <span>Телефон</span>
          <input type="tel" value={form.phone_number} onChange={set('phone_number')} autoComplete="tel" />
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить'}</button>
        <button type="button" className="btn btn-ghost" onClick={onDone} disabled={busy}>Отмена</button>
      </div>
    </form>
  );
}
