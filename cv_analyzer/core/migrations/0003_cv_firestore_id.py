# Generated by Django 5.0.6 on 2024-05-30 23:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_cv_firebase_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='cv',
            name='firestore_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
