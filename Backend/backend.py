#Backend
import sqlite3
from pathlib import Path

base_dir = Path(__file__).parent
database_dir = base_dir.parent / "Database"
db_path = database_dir / "Simon_Stevin_sticker_tracker.db"

current_user_id = "ReAcCie 25-26 VO" #numbers
current_latitude = 51.451
current_longitude = 5.481
current_date_picture = "2026-03-26"
current_date_uploaded = "2026-03-26"
current_committee = "ReAcCie 25-26"
current_title = "Luna sticker muur plafond"
current_description = "Midwinterbroai VO"

def insert(db_path):
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()

    cursor.execute("""
    INSERT INTO sticker_data (
        user_id,
        latitude,
        longitude,
        date_picture,
        date_uploaded,
        committee,
        title,
        description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        current_user_id,
        current_latitude,
        current_longitude,
        current_date_picture,
        current_date_uploaded,
        current_committee,
        current_title,
        current_description

    ))
    connection.commit()
    connection.close()
    return

insert(db_path)
print("done")