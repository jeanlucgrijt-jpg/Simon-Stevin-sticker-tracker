#Database

'''

Creates the sticker tracker database and the relevant tables.

'''
import sqlite3

connection = sqlite3.connect("Database\Simon_Stevin_sticker_tracker.db")
cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS sticker_data (
    photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    date_picture DATE,
    date_uploaded DATETIME DEFAULT CURRENT_TIMESTAP,
    sticker_id VARCHAR(15),
    title VARCHAR(50),
    description TEXT           
               
)                          
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS committee_data (
    sticker_id VARCHAR(15),
    sticker_name VARCHAR(50),
    sticker_description TEXT,
    sticker_date DATE,
    committee_members TEXT,
    lustrum BOOLEAN
               
)""")

connection.commit()
connection.close()