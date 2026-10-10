import { useState } from 'react';
import { Moon, Sun } from './Icons.jsx';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* без сохранения */
    }
    setTheme(next);
  };

  return (
    <button className="icon-btn" onClick={toggle} aria-label="Сменить тему оформления">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
