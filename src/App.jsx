/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

const KEY = "520559273579e01aba0b4394c5c9fe61";

function App() {
  const [search, setSearch] = useState("London");
  const [result, setResult] = useState({});

  useEffect(
    function () {
      const controller = new AbortController();
      async function getWeather() {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${KEY}&units=metric`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResult(data);
      }

      getWeather();

      return function () {
        controller.abort();
      };
    },
    [search]
  );

  return (
    <div className="container">
      <div className="wrapper">
        <SearchBar onSearch={setSearch} search={search} />
        <MainSection>
          <CountryInfo result={result} />
          <WeatherInfo result={result} />
        </MainSection>
        <Footer result={result} search={search} />
      </div>
    </div>
  );
}

export default App;

function SearchBar({ onSearch, search }) {
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Enter") {
          onSearch(search);
        }
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onSearch, search]
  );

  return (
    <div className="searchContainer">
      <input
        type="text"
        placeholder="Enter your city"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <span>🔎</span>
    </div>
  );
}

function MainSection({ children }) {
  return <div className="mainSection">{children}</div>;
}

function CountryInfo({ result }) {
  return (
    <div className="countryInfo">
      <h1>{result.name}</h1>
      <p>{result.weather?.[0].description}</p>
    </div>
  );
}

function WeatherInfo({ result }) {
  return (
    <div className="weatherInfo">
      <h1>{result.main?.temp.toFixed(1)}°C</h1>
      <div className="weatherIcon">
        <img
          src={`https://openweathermap.org/img/wn/${result.weather?.[0]?.icon}@2x.png`}
          alt={result.weather?.[0]?.main}
        />
        <div className="weatherStatistics">
          <ul>
            <li>
              <span>🍃</span>
              <p>{result.wind?.speed} km/h</p>
            </li>
            <li>
              <span>☔</span>
              <p>{result.main?.humidity}%</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Footer({ result, search }) {
  const [manyResults, setManyResults] = useState({});

  useEffect(
    function () {
      if (!search.length) {
        setManyResults({});
        return;
      }
      async function getNextDays() {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${result.name}&cnt=3&units=metric&appid=${KEY}`
        );
        const data = await res.json();
        setManyResults(data);
      }

      getNextDays();
    },
    [result, search]
  );

  return (
    <div className="footer">
      {manyResults.list?.map((box) => (
        <WeatherBox ObjBox={box} key={box?.dt} />
      ))}
    </div>
  );
}

function WeatherBox({ ObjBox }) {
  const hourString = ObjBox.dt_txt.split(" ").at(1).slice(0, 5);
  const hourInt = parseInt(hourString, 10);
  const nightHour = hourInt - 12;

  return (
    <div className="weatherBox">
      <img
        src={`https://openweathermap.org/img/wn/${ObjBox.weather?.[0]?.icon}@2x.png`}
        alt={ObjBox.weather?.[0]?.main}
      />
      <p>{hourInt > 12 ? `${nightHour}:00 PM` : `${hourInt}:00 AM`}</p>
      <h3>{ObjBox.main?.temp.toFixed(1)}°C</h3>
    </div>
  );
}
