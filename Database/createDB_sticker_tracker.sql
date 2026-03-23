CREATE DATABASE sticker_tracker;
USE sticker_tracker;

CREATE TABLE sticker_data (
    photo_id VARCHAR(500),
    user_id  VARCHAR(80), 
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    date_picture DATE,
    date_uploaded DATE,
    committee VARCHAR(80),
    title VARCHAR(100),
    description TEXT
);