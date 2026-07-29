from django.contrib import admin

from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ("name", "user")
	search_fields = ("name", "user__username")


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
	list_display = ("title", "user", "category", "updated_at")
	search_fields = ("title", "content", "user__username")
	list_filter = ("category", "updated_at")
