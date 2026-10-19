# PythonProjectBooking — сервис бронирования отелей

Учебный проект: REST API на **Django + Django REST Framework** и фронтенд **«Stay»** на **React + Vite**.
Пользователи могут смотреть отели и номера, читать отзывы, регистрироваться, бронировать номера и управлять профилем.

## Возможности

- Каталог отелей: фото, город, страна, звёзды, удобства (парковка, Wi-Fi)
- Страница отеля: описание, номера с ценой за ночь и фотографиями, отзывы
- Регистрация и вход по **email** с авторизацией через **JWT** (access 60 минут, refresh 7 дней)
- Выход с занесением refresh-токена в чёрный список
- Профиль пользователя: аватар, имя, страна, телефон
- Список бронирований текущего пользователя
- Админ-панель Django для всех моделей
- Светлая и тёмная тема во фронтенде

## Технологии

| Часть | Стек |
|---|---|
| Бэкенд | Python 3.12, Django 6.1, Django REST Framework, SimpleJWT, django-allauth, django-cors-headers, django-phonenumber-field, Pillow |
| База данных | SQLite (локально) / PostgreSQL 17 (в Docker) |
| Фронтенд | React 18, React Router 6, Vite 5 |
| Деплой | Docker, docker-compose, gunicorn, nginx |

## Структура проекта

```
PythonProjectBooking/
└── mysite/
    ├── manage.py
    ├── req.txt                  зависимости Python
    ├── .env                     SECRET_KEY
    ├── Dockerfile
    ├── docker-compose.yml       db (Postgres) + web (gunicorn) + nginx
    ├── nginx/                   конфигурация nginx
    ├── mysite/                  настройки проекта (settings, urls, wsgi/asgi)
    ├── booking/                 основное приложение
    │   ├── models.py
    │   ├── serializer.py
    │   ├── views.py
    │   ├── urls.py
    │   └── admin.py
    ├── media/                   загруженные фото отелей и аватары
    └── booking-frontend2/       фронтенд (React + Vite)
        ├── src/                 страницы, компоненты, api.js, auth.jsx
        └── backend-patch/       доработанные файлы бэкенда (см. ниже)
```

## Модели данных

- **UserProfile** — пользователь (наследник `AbstractUser`): телефон, аватар, страна, дата регистрации
- **Hotel** — отель: название, адрес, город, страна, звёзды (1–5), описание, фото, парковка, Wi-Fi
- **RoomType** — тип номера (Standard, Deluxe, Suite, Family)
- **Room** — номер: номер комнаты, цена за ночь, вместимость, описание, доступность, тип, отель
- **RoomImage** — фотографии номера
- **Booking** — бронь: гость, номер, даты заезда и выезда, число гостей, статус
- **HotelReview** — отзыв об отеле: пользователь, оценка (1–5), комментарий

## Быстрый старт (локально)

### 1. Бэкенд

```bash
cd mysite

python -m venv venv
# Windows:
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r req.txt
```

Создайте файл `.env` рядом с `manage.py`:

```env
SECRET_KEY=ваш-секретный-ключ
```

Примените миграции, создайте администратора и запустите сервер:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Если переменная `POSTGRES_HOST` не задана, проект использует SQLite (`db.sqlite3`).

### 2. Фронтенд

В другом терминале:

```bash
cd mysite/booking-frontend2
npm install
npm run dev
```

Приложение откроется на http://localhost:5173. Запросы к `/en/...` и `/media/...` проксируются на Django (`http://127.0.0.1:8000`).
Если бэкенд работает на другом адресе, измените `BACKEND` в `vite.config.js`.

## Запуск в Docker

```bash
cd mysite
docker compose up --build
```

Поднимутся три сервиса:

- `db` — PostgreSQL 17
- `web` — Django под gunicorn (миграции и `collectstatic` выполняются при старте)
- `nginx` — отдаёт статику и медиа, проксирует остальное на `web`

Сайт будет доступен на http://localhost (порт 80). Фронтенд в Docker не входит и запускается отдельно через `npm run dev`.

## API

Все маршруты находятся под языковым префиксом `/en/` (используется `i18n_patterns`), например `http://127.0.0.1:8000/en/hotel/`.

| Метод | URL | Описание | Доступ |
|---|---|---|---|
| POST | `/register/` | Регистрация (email, username, password, phone_number) | все |
| POST | `/login/` | Вход по email, возвращает JWT-токены | все |
| POST | `/logout/` | Выход, refresh-токен уходит в blacklist | все |
| POST | `/token/refresh/` | Обновление access-токена | все |
| GET, PUT, PATCH, DELETE | `/profile/` | Профиль текущего пользователя | авторизованные |
| GET | `/booking/` | Брони текущего пользователя | авторизованные |
| GET | `/hotel/` | Список отелей | все |
| GET | `/hotel/<id>/` | Детальная информация об отеле | все |
| GET | `/hotel/<id>/rooms/` | Номера отеля | все |
| GET | `/hotel/room/<id>/` | Детальная информация о номере | все |
| — | `/admin/` | Админ-панель Django | администратор |

Для защищённых запросов передавайте заголовок:

```
Authorization: Bearer <access_token>
```

## Патч бэкенда для фронтенда

В папке `booking-frontend2/backend-patch/` лежат доработанные версии `models.py`, `serializer.py`, `views.py` и `urls.py`. Они нужны, чтобы работали создание брони и редактирование профиля:

- `Booking.check_in` и `check_out` становятся `DateField` (при `auto_now` даты перезаписываются при каждом сохранении)
- у брони появляется статус `pending / confirmed / cancelled`
- `POST /booking/` создаёт бронь, а список показывает только брони текущего пользователя
- в профиле можно редактировать телефон, `avatar` и `country` становятся необязательными

Как применить:

1. Скопируйте 4 файла из `backend-patch/booking/` в `mysite/booking/` с заменой.
2. Убедитесь, что в `INSTALLED_APPS` есть `rest_framework_simplejwt.token_blacklist`.
3. Выполните миграции:

   ```bash
   python manage.py makemigrations booking
   python manage.py migrate
   ```

Подробности смотрите в `booking-frontend2/backend-patch/README.md`.

## Что стоит доработать перед продакшеном

- В `settings.py` стоит `ALLOWED_HOSTS = ['*']` и `CORS_ALLOW_ALL_ORIGINS = True` — ограничьте списком реальных доменов.
- Пароль БД в `docker-compose.yml` (`postgres`) задан по умолчанию — вынесите его в переменные окружения.
- Не коммитьте `.env` и `db.sqlite3` в репозиторий.
- Проверьте `DEBUG` в настройках — на сервере он должен быть `False`.
