#Backend
import sqlite3
from pathlib import Path

base_dir = Path(__file__).parent
database_dir = base_dir.parent / "Database"
db_path = database_dir / "Simon_Stevin_sticker_tracker.db"

current_user_id = int.input("user_id") 
current_latitude = float.input("latitude")
current_longitude = float.input("longitude")
current_date_picture = str.input("yyyy-mm-dd")
current_committee = int.input("sticker_id")
current_title = str.input("title")
current_description = str.input("description")

def insert(db_path):
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()

    cursor.execute("""
    INSERT INTO sticker_data (
        user_id,
        latitude,
        longitude,
        date_picture,
        sticker_id,
        title,
        description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        current_user_id,
        current_latitude,
        current_longitude,
        current_date_picture,
        current_committee,
        current_title,
        current_description

    ))
    connection.commit()
    connection.close()
    return

insert(db_path)
print("done")