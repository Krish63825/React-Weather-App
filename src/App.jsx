import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const App = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [suggestions, setSuggestions] = useState([]); // State for city suggestions
  const intervalRef = useRef(null);

  const api = {
    key: "fcc8de7015bbb202209bbf0261babf4c",
    base: "https://api.openweathermap.org/data/2.5/",
    geoBase: "http://api.openweathermap.org/geo/1.0/direct" // Geo API for city names
  };

  const getResults = async (query) => {
    try {
      const response = await axios.get(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`);
      setWeatherData(response.data);
      setError('');
      updateDateTime(response.data.timezone);
    } catch (err) {
      setError('City not found');
      setWeatherData(null);
    }
  };

  const getWeatherByLocation = async (lat, lon) => {
    try {
      const response = await axios.get(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${api.key}`);
      setWeatherData(response.data);
      setError('');
      updateDateTime(response.data.timezone);
    } catch (err) {
      setError('Unable to get weather data');
      setWeatherData(null);
    }
  };

  const setQuery = (evt) => {
    if (evt.key === 'Enter') {
      getResults(city);
      setSuggestions([]);  // Clear suggestions on search
    }
  };

  const updateDateTime = (timezoneOffset) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const localTime = new Date(utcTime + timezoneOffset * 1000);

      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };

      const formattedDate = new Intl.DateTimeFormat('en-US', options).format(localTime);
      setDateTime(formattedDate);
    }, 1000);
  };

  // Fetch city suggestions from the Geo API based on the input
  const fetchCitySuggestions = async (query) => {
    if (query.length > 1) {
      try {
        const response = await axios.get(`${api.geoBase}?q=${query}&limit=5&appid=${api.key}`);
        setSuggestions(response.data);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);  // Clear suggestions if input is less than 2 characters
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherByLocation(latitude, longitude);
        },
        () => {
          setError('Unable to retrieve location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: 'url("https://media1.tenor.com/m/MAvdaWBaZ0EAAAAC/moving-clouds-world-meteorological-day.gif")' }}>
      <nav className="bg-gray-800 text-white py-4 shadow-lg">
        <h1 className="text-center text-3xl font-bold">Weather App</h1>
      </nav>

      <div className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-sm mx-auto p-4">
          <div className="mb-6">
            <div className="flex items-center border border-gray-700 rounded-md p-2 bg-gray-800">
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  fetchCitySuggestions(e.target.value);  // Fetch city suggestions as user types
                }}
                onKeyDown={setQuery}
                placeholder="Enter city"
                className="bg-transparent outline-none text-white w-full px-2"
              />
              <button onClick={() => {
                getResults(city);
                setSuggestions([]);  // Clear suggestions on button click
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l4-4m0 0l4-4m-4 4h12" />
                </svg>
              </button>
            </div>

            {/* Display city suggestions */}
            {suggestions.length > 0 && (
              <ul className="bg-white text-black rounded-md mt-2 max-h-40 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setCity(`${suggestion.name}, ${suggestion.country}`);
                      getResults(`${suggestion.name}, ${suggestion.country}`);
                      setSuggestions([]);  // Clear suggestions on selection
                    }}
                  >
                    {suggestion.name}, {suggestion.country}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {weatherData && (
            <div className="bg-gray-800 p-6 rounded-lg text-center text-white">
              <h2 className="text-2xl font-bold">{weatherData.name}, {weatherData.sys.country}</h2>
              <p className="text-lg mt-1">{dateTime}</p>
              <p className="text-xl mt-2">{weatherData.weather[0].main}</p>
              <p className="text-5xl mt-4">{Math.round(weatherData.main.temp)}<span>°c</span></p>
              <p className="mt-4">Low: {Math.round(weatherData.main.temp_min)}°c / High: {Math.round(weatherData.main.temp_max)}°c</p>
              <div className="flex justify-around mt-4">
                <p>Humidity: {weatherData.main.humidity}%</p>
                <p>Wind: {weatherData.wind.speed} m/s</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
