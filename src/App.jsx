/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useLocation } from "./useLocation";

const KEY = "520559273579e01aba0b4394c5c9fe61";

function App() {
  const [search, setSearch] = useState("London");
  const [result, setResult] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const {
    position: { long, lat },
    // isFindingCurrentLocation,
    getPosition,
    setPosition,
  } = useLocation();

  useEffect(
    function () {
      const controller = new AbortController();
      async function getWeather() {
        setIsLoading(true);
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${KEY}&units=metric`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResult(data);
        setIsLoading(false);
      }

      getWeather();

      return function () {
        controller.abort();
      };
    },
    [search]
  );

  useEffect(
    function () {
      if (!lat || !long) return;
      async function getLocation() {
        setIsLoading(false);
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${KEY}`
        );
        const data = await res.json();
        setIsLoading(false);
        setSearch(data?.name);
      }
      getLocation();
      return function () {
        setPosition({});
      };
    },

    [lat, long, setPosition, getPosition]
  );

  useEffect(
    function () {
      if (!search || result.cod === "404") return;
      document.title = `${result?.name} | Weather`;

      return function () {
        document.title = "myWeather";
      };
    },
    [search, result]
  );

  return (
    <div className="container">
      <div className="wrapper">
        <SearchBar>
          <div className="searchContainer">
            <input
              type="text"
              placeholder="Enter your city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span>🔎</span>
            <button onClick={() => getPosition()}>Live📍</button>
          </div>
        </SearchBar>
        {!search.length && <Welcome />}
        {isLoading || (result.cod === "404" && <Loader />)}
        {!isLoading && result.cod === 200 && (
          <>
            <MainSection>
              <CountryInfo result={result} />
              <WeatherInfo result={result} />
            </MainSection>
            <Footer result={result} search={search} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;

function Welcome() {
  return <div className="welcome">Daily weather forecast ☀️</div>;
}

function Loader() {
  return <div className="loader">Loading...</div>;
}

function SearchBar({ children }) {
  return <div className="search">{children}</div>;
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
