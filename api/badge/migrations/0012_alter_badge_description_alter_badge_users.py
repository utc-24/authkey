# Generated by Django 4.1.1 on 2022-10-07 05:27

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("badge", "0011_alter_badge_signer_ethereum_address"),
    ]

    operations = [
        migrations.AlterField(
            model_name="badge",
            name="description",
            field=models.TextField(default=None),
        ),
        migrations.AlterField(
            model_name="badge",
            name="users",
            field=models.ManyToManyField(
                blank=True, null=True, to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
