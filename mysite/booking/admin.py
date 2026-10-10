from django.contrib import admin
from .models import *

admin.site.register(UserProfile)
admin.site.register(RoomType)
admin.site.register(Hotel)
admin.site.register(Room)
admin.site.register(RoomImage)
admin.site.register(Booking)
admin.site.register(HotelReview)