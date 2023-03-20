const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// connect to MongoDB database
mongoose.connect("mongodb://127.0.0.1:27017/horoscopes", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// define schema for horoscope model
const horoscopeSchema = new mongoose.Schema({
  year: Number,
  days: [
    {
      date: Date,
      scores: {
        aries: Number,
        taurus: Number,
        gemini: Number,
        cancer: Number,
        leo: Number,
        virgo: Number,
        libra: Number,
        scorpio: Number,
        sagittarius: Number,
        capricorn: Number,
        aquarius: Number,
        pisces: Number,
      },
    },
  ],
});
// declare signs
const signs = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

// create horoscope model from schema
const Horoscope = mongoose.model("Horoscope", horoscopeSchema);

const startDate = new Date("2024-01-01"); // start date of leap year
const dates = Array.from(
  { length: 366 },
  (_, i) => new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
);

// generate horoscopes for years 2001 to 2050
// for (let year = 2001; year <= 2050; year++) {
//   const horoscope = new Horoscope({
//     year: year,
//     days: [],
//   });

//   const startDate = new Date(`${year}-01-01`); // start date of leap year
//   const dates = Array.from(
//     { length: year % 4 ? 365 : 366 },
//     (_, i) => new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
//   );

//   // generate scores for each day of the year
//   for (let i = 0; i < dates.length; i++) {
//     const date = dates[i];
//     const scores = {};
//     for (const sign of signs) {
//       scores[sign] = Math.floor(Math.random() * 10) + 1;
//     }
//     horoscope.days.push({ date: date, scores: scores });
//   }

//   // save horoscope to database
//   horoscope.save();
// }

// endpoint for getting horoscope score for a given sign and date
app.use(cors());
app.get("/horoscopes", async (req, res) => {
  // find horoscope for the given year
  let year = req.query.year;
  let horoscope = null;
  horoscope = await Horoscope.findOne({
    year,
  });

  if (!horoscope) {
    horoscope = new Horoscope({
      year: year,
      days: [],
    });

    const startDate = new Date(`${year}-01-01`); // start date of leap year
    const dates = Array.from(
      { length: year % 4 ? 365 : 366 },
      (_, i) => new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    );

    // generate scores for each day of the year
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const scores = {};
      for (const sign of signs) {
        scores[sign] = Math.floor(Math.random() * 10) + 1;
      }
      horoscope.days.push({ date: date, scores: scores });
    }

    // save horoscope to database
    horoscope.save();
  }

  res.send(horoscope);
});

// start server
app.listen(5000, () => {
  console.log("Server started on port 5000");
});
