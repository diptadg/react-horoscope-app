import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { generateDate, months } from "./util/calendar";
import cn from "./util/cn";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import axios from "axios";

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

const colors = [
  "#ff0000",
  "#ff3300",
  "#ff6600",
  "#ff9900",
  "#ffcc00",
  "#ffff00",
  "#ccff00",
  "#99ff00",
  "#66ff00",
  "#33ff00",
  "#00ff00",
];

// Get score for a given date, and sign
const getScore = (date, sign, data) => {
  let Y = date.year();
  let M = date.month() + 1 > 9 ? date.month() + 1 : `0${date.month() + 1}`;
  let D = date.date() > 9 ? date.date() : `0${date.date()}`;

  // create date-string to match the keys in database array
  const dateString = `${Y}-${M}-${D}T00:00:00.000Z`;
  if (data) {
    // find the score for corresponding sign using the date-string key
    const score = data.days.find((d) => d.date === dateString)?.scores[sign];
    return score;
  } else {
    return 0;
  }
};

export default function Calendar() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDate = dayjs();
  const [today, setToday] = useState(currentDate);
  const [selectDate, setSelectDate] = useState(currentDate);
  const [data, setData] = useState();
  const [year, setYear] = useState(0);
  const [sign, setSign] = useState(signs[0]);
  const [bestMonth, setBestMonth] = useState();
  const [bestSign, setBestSign] = useState();

  // set the current year, this will update the data coming from the server
  useEffect(() => {
    setYear(new Date(today).getFullYear());
  }, [today]);

  // update the best month for selected sign
  useEffect(() => {
    // avg score array for 12 months
    let valuesArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // loop through the days of the year
    for (let i = 0; i < data?.days.length; i++) {
      // get score for the sign on the corresponding date i
      let value = data?.days[i].scores[sign];
      // get the month index for the date i
      let monthIndex = +data?.days[i].date.split("-")[1];
      // get the total number of days of month
      let monthDays = data?.days.filter(
        (a) => +a.date.split("-")[1] === monthIndex
      ).length;

      // update the avg value for the month index
      valuesArray[monthIndex - 1] =
        valuesArray[monthIndex - 1] + value / monthDays;
    }

    // find the month index with highest average value
    let max = 0;
    let index = 0;
    for (let i = 0; i < valuesArray.length; i++) {
      if (valuesArray[i] > max) {
        max = valuesArray[i];
        index = i;
      }
    }

    // set the best month string
    setBestMonth(months[index]);
  }, [data, sign]);

  // update the best sign of the current month
  useEffect(() => {
    // find the month index
    const month = new Date(today).getMonth();

    // filter the data with only current month scores
    const monthData = data?.days.filter(
      (d) => +d.date.split("-")[1] === month + 1
    );

    // empty object for sign avg scores
    let avg = {};
    for (let j = 0; j < signs.length; j++) {
      // initialize the object with the average sign scores 0
      avg[signs[j]] = 0;
    }

    // loop through each day of month and update the average sign scores
    for (let i = 0; i < monthData?.length; i++) {
      for (let j = 0; j < signs.length; j++) {
        avg[signs[j]] =
          avg[signs[j]] + monthData[i].scores[signs[j]] / monthData.length;
      }
    }

    // find the sign and its average score with the maximum average
    let maxSign = signs[0];
    let maxVal = avg[signs[0]];
    for (let j = 1; j < signs.length; j++) {
      if (avg[signs[j]] > maxVal) {
        maxSign = signs[j];
        maxVal = avg[signs[j]];
      }
    }
    setBestSign({ sign: maxSign, value: maxVal });
  }, [today, data]);

  useEffect(() => {
    // fetch the data from the server for the current year
    (async () => {
      const { data } = await axios.get(
        `http://localhost:5000/horoscopes?year=${year}`
      );
      if (data) setData(data);
    })();
  }, [year]);
  return (
    <div className="flex gap-10 sm:divide-x justify-center sm:w-1/2 mx-auto  h-screen items-center sm:flex-row flex-col">
      <div className="w-96 h-96 ">
        <div className="flex justify-between items-center">
          <h1 className="select-none font-semibold">
            {months[today.month()]}, {today.year()}
          </h1>
          <div className="flex gap-10 items-center ">
            <GrFormPrevious
              className="w-5 h-5 cursor-pointer hover:scale-105 transition-all"
              onClick={() => {
                setToday(today.month(today.month() - 1));
              }}
            />
            <h1
              className=" cursor-pointer hover:scale-105 transition-all"
              onClick={() => {
                setToday(currentDate);
              }}
            >
              Today
            </h1>
            <GrFormNext
              className="w-5 h-5 cursor-pointer hover:scale-105 transition-all"
              onClick={() => {
                setToday(today.month(today.month() + 1));
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-7 ">
          {days.map((day, index) => {
            return (
              <h1
                key={index}
                className="text-sm text-center h-14 w-14 grid place-content-center text-gray-500 select-none"
              >
                {day}
              </h1>
            );
          })}
        </div>

        <div className=" grid grid-cols-7 ">
          {generateDate(today.month(), today.year()).map(
            ({ date, isCurrentMonth, isToday }, index) => {
              return (
                <div
                  key={index}
                  className="relative p-2 text-center h-14 grid place-content-center text-sm border-t"
                >
                  <div
                    className="absolute bottom-0 left-0 w-full h-2 -z-10"
                    style={{
                      backgroundColor: colors[getScore(date, sign, data) - 1],
                    }}
                  ></div>
                  <h1
                    className={cn(
                      isCurrentMonth ? "" : "text-gray-400",
                      isToday ? "bg-red-600 text-white" : "",
                      selectDate.toDate().toDateString() ===
                        date.toDate().toDateString()
                        ? "bg-black text-white"
                        : "",
                      "h-10 w-10 rounded-full grid place-content-center hover:bg-black hover:text-white transition-all cursor-pointer select-none"
                    )}
                    onClick={() => {
                      setSelectDate(date);
                    }}
                  >
                    {date.date()}
                  </h1>
                </div>
              );
            }
          )}
        </div>
      </div>
      <div className="h-96 w-96 sm:px-5">
        <select
          className="capitalize w-full p-2 outline-none border rounded shadow"
          value={sign}
          onChange={(e) => setSign(e.target.value)}
        >
          {signs.map((s, i) => (
            <option className="capitalize" key={i} value={s}>
              {s}
            </option>
          ))}
        </select>
        {data ? (
          <>
            <div className="flex flex-col items-center p-2 my-4 border shadow rounded gap-2">
              <p className="text-center">
                <span className="capitalize font-semibold ">{sign}</span> best
                month in {today.year()}
              </p>
              <p className="w-full uppercase text-center text-2xl font-bold text-sky-700">
                {bestMonth}
              </p>
            </div>
            <div className="flex flex-col items-center p-2 my-4 border shadow rounded gap-2">
              <p className="text-center">
                Best sign for {months[today.month()]}, {today.year()}
              </p>
              <p className="w-full uppercase text-center text-2xl font-bold text-sky-700">
                {bestSign?.sign} ({bestSign?.value?.toFixed(2)})
              </p>
            </div>
          </>
        ) : null}
        {data && selectDate ? (
          <div className="flex flex-col items-center p-2 my-4 border shadow rounded gap-2">
            <p className="text-center">
              Score for <span className="capitalize font-semibold">{sign}</span>{" "}
              on <br />
              <span className="font-semibold">
                {months[selectDate.month()]} {selectDate.date()},{" "}
                {selectDate.year()}
              </span>
            </p>
            <p className="w-full uppercase text-center text-2xl font-bold text-sky-700">
              {getScore(selectDate, sign, data)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
