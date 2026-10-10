from datetime import date
from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('email', 'username', 'password', 'phone_number')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if UserProfile.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        username = validated_data.pop('username')
        user = UserProfile(email=email, username=username, **validated_data)
        user.set_password(password)
        user.save()
        return user

class CustomLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        try:
            user = UserProfile.objects.get(email=email)
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError({"email": "Пользователь с таким email не найден"})

        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Неверный пароль"})



        self.context['user'] = user
        return data

    def to_representation(self, instance):
        user = self.context['user']
        refresh = RefreshToken.for_user(user)

        return {
            'user': {
                'username': user.username,
                'email': user.email,
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        token = attrs.get('refresh')
        try:
            RefreshToken(token)
        except Exception:
            raise serializers.ValidationError({"refresh": "Невалидный токен"})
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'avatar', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'country']
        read_only_fields = ['id', 'email', 'date_joined']

class HotelListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['id', 'photo', 'name', 'city', 'country', 'stars']

class HotelReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = HotelReview
        fields = ['user', 'user_name', 'created_date', 'stars', 'comment']


class HotelDetailSerializer(serializers.ModelSerializer):
    hotel_review = HotelReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Hotel
        fields = ['id', 'photo', 'name', 'address', 'city', 'country', 'stars', 'description',
                  'has_parking', 'has_wif', 'hotel_review']

class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ['image']

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['guest', 'check_in', 'check_out', 'guests_count', 'status']

class RoomSerializer(serializers.ModelSerializer):
    room_images = RoomImageSerializer(many=True, read_only=True)
    room_bookings = BookingSerializer(many=True, read_only=True)
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'room_images', 'room_number', 'price_per_night', 'capacity', 'description',
                  'is_available', 'room_bookings', 'room_type', 'room_type_name']

class HotelRoomsListSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    class Meta:
        model = Hotel
        fields = ['country', 'name', 'rooms']

class HotelRoomDetailSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = Hotel
        fields = ['photo', 'name', 'city', 'country', 'stars', 'description', 'has_parking', 'has_wif', 'rooms']

class MyBookingSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='room.hotel.name', read_only=True)
    room_number = serializers.IntegerField(source='room.room_number', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'room', 'check_in', 'check_out', 'guests_count', 'status',
                  'hotel_name', 'room_number', 'total_price']
        read_only_fields = ['status']

    def get_total_price(self, obj):
        return (obj.check_out - obj.check_in).days * obj.room.price_per_night

    def validate(self, data):
        room, check_in, check_out = data['room'], data['check_in'], data['check_out']
        if check_in < date.today():
            raise serializers.ValidationError('Дата заезда уже прошла.')
        if check_out <= check_in:
            raise serializers.ValidationError('Дата выезда должна быть позже даты заезда.')
        if not room.is_available:
            raise serializers.ValidationError('Этот номер сейчас недоступен.')
        if data['guests_count'] < 1 or data['guests_count'] > room.capacity:
            raise serializers.ValidationError(f'Номер рассчитан на {room.capacity} гостей.')
        busy = (Booking.objects.filter(room=room, check_in__lt=check_out, check_out__gt=check_in)
                .exclude(status='cancelled').exists())
        if busy:
            raise serializers.ValidationError('На эти даты номер уже забронирован.')
        return data