from django.conf import settings
from django.db import models


class Category(models.Model):
	name = models.CharField(max_length=120)
	color = models.CharField(max_length=20, default="#FCDC94")
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="categories",
	)

	class Meta:
		ordering = ["id"]
		unique_together = ("name", "user")

	def __str__(self):
		return f"{self.name} ({self.user.username})"


class Note(models.Model):
	title = models.CharField(max_length=200)
	content = models.TextField(blank=True)
	color = models.CharField(max_length=20, default="#FFE082")
	category = models.ForeignKey(
		Category,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="notes",
	)
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="notes",
	)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-updated_at"]

	def __str__(self):
		return f"{self.title} ({self.user.username})"
