from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

ROOM_CHOICES = (
('standard', 'Standard'),
('deluxe', 'Deluxe'),
('suite', 'Suite'),
('family', 'Family'),
)

BOOKING_STATUS = (
('pending', 'Pending'),
('confirmed', 'Confirmed'),
('cancelled', 'Cancelled'),
)

class UserProfile(AbstractUser):
    phone_number = PhoneNumberField()
    avatar = models.ImageField(upload_to='avatar/', blank=True, null=True)
    country = models.CharField(max_length=50, blank=True)
    date_register = models.DateTimeField(auto_now_add=True)

class RoomType(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(max_length=10, choices=ROOM_CHOICES)

class Hotel(models.Model):
    name = models.CharField(max_length=50)
    address = models.TextField()
    city = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    stars = models.PositiveSmallIntegerField(choices=[(i, str(i))for i in range(1, 6)])
    description = models.TextField()
    photo = models.ImageField(upload_to='photo_hotel/')
    has_parking = models.BooleanField()
    has_wif = models.BooleanField()

class Room(models.Model):
    room_number = models.IntegerField()
    price_per_night = models.IntegerField()
    capacity = models.IntegerField()
    description = models.TextField()
    is_available = models.BooleanField()
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name='rooms')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms')

class RoomImage(models.Model):
    image = models.ImageField(upload_to='room_image/')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_images')

class Booking(models.Model):
    guest = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_bookings')
    check_in = models.DateField()
    check_out = models.DateField()
    guests_count = models.IntegerField()
    status = models.CharField(max_length=10, choices=BOOKING_STATUS, default='pending')
    created_date = models.DateTimeField(auto_now_add=True)

class HotelReview(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='hotel_review')
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    stars = models.PositiveSmallIntegerField(choices=[(i, str(i))for i in range(1, 6)])
    comment = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)