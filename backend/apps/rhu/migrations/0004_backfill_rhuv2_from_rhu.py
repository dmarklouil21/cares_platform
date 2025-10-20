from django.db import migrations


def forwards(apps, schema_editor):
    RHU = apps.get_model('rhu', 'RHU')
    Rhuv2 = apps.get_model('rhu', 'Rhuv2')
    db_alias = schema_editor.connection.alias

    for r in RHU.objects.using(db_alias).all():
        if Rhuv2.objects.using(db_alias).filter(id=r.id).exists():
            continue
        Rhuv2.objects.using(db_alias).create(
            id=r.id,
            lgu=r.lgu,
            address=r.address,
        )


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('rhu', '0003_rhuv2_representative'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
