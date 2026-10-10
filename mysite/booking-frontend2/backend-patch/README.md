# Патч для бэкенда

Фронтенд работает с вашей системой входа (по email, JWT). Но для профиля и бронирования
в бэкенде нужно несколько правок. Готовые файлы лежат в `booking/`: это **ваши** файлы с минимальными изменениями.

## Что изменено

| Файл | Что |
|---|---|
| `models.py` | `Booking.check_in/check_out` стали `DateField` (раньше `auto_now` перезаписывал даты при каждом сохранении); у брони появился нормальный статус (`pending / confirmed / cancelled`); `avatar` и `country` стали необязательными |
| `serializer.py` | `UserProfileSerializer`: добавлен `phone_number`, поля `id`, `email`, `date_joined` только для чтения (профиль можно редактировать) |
| `views.py` | `MyBookingListViewset`: теперь можно **создавать** бронь (POST), доступен только после входа, показывает только брони текущего пользователя (раньше отдавал брони всех) |
| `urls.py` | добавлены `logout/` (view уже был, но не был подключён) и `token/refresh/` (чтобы сессия продлевалась) |

## Как применить

1. Скопируйте 4 файла из `booking/` в `mysite/booking/` с заменой.

2. В `mysite/mysite/settings.py` добавьте в `INSTALLED_APPS` одну строку (нужна для выхода и обновления токенов):

   ```python
   'rest_framework_simplejwt.token_blacklist',
   ```

3. Миграции:

   ```bash
   py manage.py makemigrations booking
   py manage.py migrate
   ```

После этого перезапустите `py manage.py runserver`.
