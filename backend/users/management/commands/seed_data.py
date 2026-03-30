import random
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from users.models import User
from checkins.models import CheckIn
from journal.models import JournalEntry


JOURNAL_ENTRIES = [
    ("Rough start to the week", "Woke up feeling groggy and unmotivated. Had a big deadline looming and couldn't shake the anxiety. Tried to take it one task at a time but kept losing focus. Evening walk helped a little."),
    ("Surprisingly productive day", "Got into a flow state this morning and knocked out most of my to-do list before lunch. Really satisfying. Had coffee with a friend in the afternoon which lifted my mood even more."),
    ("Feeling overwhelmed", "Too many things happening at once. Work, family stuff, and I've been sleeping badly. Hard to know where to start. Writing this down to get it out of my head."),
    ("Small wins", "Nothing huge today but I cooked a proper meal, went for a run, and finished a chapter of my book. Sometimes the small things matter most."),
    ("Difficult conversation", "Had to address something uncomfortable with a colleague today. It went better than expected but I'm still processing it. Glad it's done."),
    ("A good weekend", "Spent most of Saturday outside. Clear head, no screens. Reminded myself why I need to do this more often."),
    ("Tired but okay", "Low energy all day but nothing catastrophic. Just one of those days. Early night planned."),
    ("Feeling grateful", "Noticed how much I appreciate the people around me today. Sometimes anxiety makes me forget that. Good reminder."),
    ("Stress spike", "Exam results stress hitting hard. Couldn't concentrate, kept checking my phone. Need to find a better coping mechanism than doomscrolling."),
    ("Better than yesterday", "Yesterday was rough. Today was quieter and I felt more like myself. Progress."),
    ("Can't sleep again", "Third night in a row with broken sleep. Everything feels harder when you're tired. Going to try cutting screens earlier."),
    ("Therapy notes", "Had a session today. We talked about the pattern of me catastrophising small setbacks. Good to name it. Hard to change it but I'm aware."),
    ("Good social day", "Spent time with people I actually like today. Laughed a lot. Forgot to be anxious for a few hours."),
    ("Back to basics", "Feeling flat. Not sad exactly, just grey. Going back to basics — sleep, food, movement. That usually helps."),
    ("Long week finally over", "Friday. I made it. Brain is fried but in a good way. Proud of what I got done despite the rough patches mid-week."),
]

NOTES = [
    "Decent sleep last night, felt more alert.",
    "Skipped lunch, probably affecting my mood.",
    "Had an argument this morning, hard to shake it.",
    "Exercise really helped today.",
    "Rainy day, stayed inside most of it.",
    "Social plans got cancelled, felt relieved if I'm honest.",
    "Deadline pressure is building.",
    "Managed to meditate for 10 minutes.",
    "Felt oddly calm despite a busy day.",
    "Overthinking everything tonight.",
    "Good news from home, lifted my spirits.",
    "Ate well, slept well, felt it.",
    "",
    "",
    "",
]


class Command(BaseCommand):
    help = "Seed the database with realistic demo data for MindLog."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username", default="demo", help="Username for the demo user (default: demo)"
        )
        parser.add_argument(
            "--password", default="Demo1234!", help="Password for the demo user (default: Demo1234!)"
        )
        parser.add_argument(
            "--days", type=int, default=60, help="Number of past days to generate check-ins for (default: 60)"
        )
        parser.add_argument(
            "--clear", action="store_true", help="Delete all existing data for the demo user before seeding"
        )

    def handle(self, *args, **options):
        username = options["username"]
        password = options["password"]
        days     = options["days"]

        # Create or get demo user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": f"{username}@mindlog.demo"},
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
        else:
            self.stdout.write(f"Using existing user: {username}")

        if options["clear"]:
            CheckIn.objects.filter(user=user).delete()
            JournalEntry.objects.filter(user=user).delete()
            self.stdout.write("Cleared existing data.")

        # Generate check-ins spread across the last `days` days
        # Mood follows a slight weekly pattern (worse Mon/Sun, better Fri/Sat)
        DOW_MOOD_BIAS = {0: -1, 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: -1}  # Mon=0
        checkins_created = 0
        now = timezone.now()

        for day_offset in range(days, 0, -1):
            # ~85% chance of a check-in on any given day
            if random.random() > 0.85:
                continue

            date = now - timedelta(days=day_offset)
            dow  = date.weekday()
            bias = DOW_MOOD_BIAS.get(dow, 0)

            mood    = max(1, min(10, random.randint(4, 8) + bias + random.randint(-1, 1)))
            energy  = max(1, min(10, mood + random.randint(-2, 2)))
            anxiety = max(1, min(10, 11 - mood + random.randint(-2, 2)))

            # Vary the time of day
            hour   = random.choice([8, 9, 10, 18, 19, 20, 21, 22])
            minute = random.randint(0, 59)
            dt     = date.replace(hour=hour, minute=minute, second=0, microsecond=0)

            ci = CheckIn(
                user=user, mood=mood, energy=energy, anxiety=anxiety,
                notes=random.choice(NOTES),
            )
            ci.save()
            # Backdating requires overriding the auto_now_add field
            CheckIn.objects.filter(pk=ci.pk).update(created_at=dt)
            checkins_created += 1

        self.stdout.write(self.style.SUCCESS(f"Created {checkins_created} check-ins over {days} days."))

        # Generate ~15 journal entries spread across the period
        journal_pool = JOURNAL_ENTRIES[:]
        random.shuffle(journal_pool)
        journal_count = min(len(journal_pool), 15)

        for i in range(journal_count):
            day_offset = random.randint(1, days)
            dt = (now - timedelta(days=day_offset)).replace(
                hour=random.randint(18, 23), minute=random.randint(0, 59), second=0, microsecond=0
            )
            title, body = journal_pool[i]
            je = JournalEntry(user=user, title=title, body=body)
            je.save()
            JournalEntry.objects.filter(pk=je.pk).update(created_at=dt, updated_at=dt)

        self.stdout.write(self.style.SUCCESS(f"Created {journal_count} journal entries."))
        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Log in with  username={username}  password={password}"
        ))
