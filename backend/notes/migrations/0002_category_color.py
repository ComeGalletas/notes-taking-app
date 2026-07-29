from django.db import migrations, models


def set_default_category_colors(apps, schema_editor):
    Category = apps.get_model("notes", "Category")
    defaults = {
        "Random Thoughts": "#EF9C66",
        "School": "#FCDC94",
        "Personal": "#78ABA8",
    }
    for name, color in defaults.items():
        Category.objects.filter(name=name).update(color=color)


class Migration(migrations.Migration):

    dependencies = [
        ("notes", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="color",
            field=models.CharField(default="#FCDC94", max_length=20),
        ),
        migrations.RunPython(set_default_category_colors, migrations.RunPython.noop),
    ]
