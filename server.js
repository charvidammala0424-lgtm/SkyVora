// server.js
// Tiny backend proxy for SkyVora.
// The API key lives only here, on the server — never in the browser.

require("dotenv").config(); // loads variables from .env into process.env

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Put your real key in an environment variable, NOT in this file.
// e.g. on your machine: export WEATHER_API_KEY=your_real_key_here
// Locally you can also use a .env file (see .env.example) with the
// "dotenv" package, but it's optional — this works without it too.
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

if (!WEATHER_API_KEY) {
    console.warn(
        "⚠️  WEATHER_API_KEY is not set. Set it as an environment variable before deploying."
    );
}

// Serve the front-end files (skyvora.html, skyvora.css) as static assets
app.use(express.static(__dirname));

// The only endpoint the browser is allowed to call.
// It forwards the request to weatherapi.com using the hidden key.
app.get("/api/weather", async (req, res) => {
    const location = req.query.location;

    if (!location) {
        return res.status(400).json({ error: "Missing location" });
    }

    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
        location
    )}&aqi=yes`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

app.listen(PORT, () => {
    console.log(`SkyVora server running at http://localhost:${PORT}`);
});
