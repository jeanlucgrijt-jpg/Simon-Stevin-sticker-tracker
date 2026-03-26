#Backend
import sqlite3
from pathlib import Path

base_dir = Path(__file__).parent
database_dir = base_dir.parent / "Database"
db_path = database_dir / "Simon_Stevin_sticker_tracker.db"

def insert(db_path):
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()

    cursor.execute(


    )
    connection.commit()
    connection.close()
    return