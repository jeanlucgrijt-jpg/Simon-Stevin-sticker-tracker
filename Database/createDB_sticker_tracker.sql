CREATE DATABASE sticker_tracker;
USE sticker_tracker;

CREATE TABLE sticker_data (
    photo_id VARCHAR(100),
    user_id  VARCHAR(50), 
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    date_picture DATE,
    date_uploaded DATE,
    committee VARCHAR(30),
    title VARCHAR(50),
    description TEXT
);