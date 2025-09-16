"use client";
import { useState } from "react";

type WeatherData = {
  name: string;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: { description: string; main: string; icon: string }[];
};

type ForecastData = {
  dt_txt: string;
  main: { temp: number };
  weather: { description: string; icon: string }[];
}[];

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState("");

  async function getWeather() {
    if (!city) return;
    const apiKey = "d7a0a6195ddfc0549cf6c076ebb1d888";
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
      setError("");

      // fetch 3-day forecast (every 24h at noon)
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
      );
      const forecastData = await forecastRes.json();
      const dailyForecast = forecastData.list.filter((f: any) =>
        f.dt_txt.includes("12:00:00")
      );
      setForecast(dailyForecast.slice(0, 3));
    } catch (err) {
      setError("City not found. Please try again.");
      setWeather(null);
      setForecast(null);
    }
  }

  function getBackground(condition: string) {
    condition = condition.toLowerCase();
    if (condition.includes("cloud")) return "cloudy";
    if (condition.includes("rain")) return "rainy";
    if (condition.includes("snow")) return "snowy";
    if (condition.includes("clear")) return "sunny";
    if (condition.includes("storm")) return "stormy";
    return "default";
  }

  const bgClass =
    weather && weather.weather ? getBackground(weather.weather[0].main) : "default";

  return (
    <div className={`app ${bgClass}`}>
      <div className="search">
        <h1>Weather App</h1>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeather}>Get Weather</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && weather.main && (
        <div className="container">
          <div className="top">
            <h2>{weather.name}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
              alt={weather.weather[0].description}
              className="weather-icon"
            />
            <p className="temp">{weather.main.temp} °C</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Pressure: {weather.main.pressure} hPa</p>
            <p className="description">{weather.weather[0].description}</p>
          </div>
        </div>
      )}

      {forecast && (
        <div className="forecast">
          <h3>3-Day Forecast</h3>
          <div className="forecast-cards">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p>{new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "long" })}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p className="forecast-temp">{Math.round(day.main.temp)} °C</p>
                <p className="forecast-desc">{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
