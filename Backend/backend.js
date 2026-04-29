import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Connect to your existing DB file
const db = new sqlite3.Database("./Database/Simon_Stevin_sticker_tracker.db");

// Test route
app.get("/", (req, res) => {
    res.send("Server running");
});

// Insert endpoint
app.post("/submit", (req, res) => {
    const d = req.body;

    const query = `
        INSERT INTO stickers 
        (latitude, longitude, date_picture, sticker_id, title, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
        d.latitude,
        d.longitude,
        d.date_picture,
        d.sticker_id,
        d.title,
        d.description
    ], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }

        res.json({ success: true, id: this.lastID });
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});