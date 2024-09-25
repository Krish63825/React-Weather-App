import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [dateTime, setDateTime] = useState('');

  const api = {
    key: "fcc8de7015bbb202209bbf0261babf4c",
    base: "https://api.openweathermap.org/data/2.5/"
  };

  // Function to fetch weather data using city or coordinates
  const getResults = async (query) => {
    try {
      const response = await axios.get(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`);
      setWeatherData(response.data);
      setError('');
    } catch (err) {
      setError('City not found');
      setWeatherData(null);
    }
  };

  // Function to fetch weather data using coordinates
  const getWeatherByLocation = async (lat, lon) => {
    try {
      const response = await axios.get(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${api.key}`);
      setWeatherData(response.data);
      setError('');
    } catch (err) {
      setError('Unable to get weather data');
      setWeatherData(null);
    }
  };

  // Function to handle search on 'Enter' key press
  const setQuery = (evt) => {
    if (evt.key === 'Enter') {
      getResults(city);
    }
  };

  // Function to build date
  const dateBuilder = (d) => {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();

    return `${day} ${date} ${month} ${year}`;
  };

  // Use effect to get the current date and time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedDate = dateBuilder(now);
      const formattedTime = now.toLocaleTimeString();
      setDateTime(`${formattedDate} ${formattedTime}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Use effect to get user's location and fetch weather data
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
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: 'url("https://media1.tenor.com/m/MAvdaWBaZ0EAAAAC/moving-clouds-world-meteorological-day.gif")' }}>
      {/* Navbar */}
      <nav className="bg-gray-800 text-white py-4 shadow-lg">
        <h1 className="text-center text-3xl font-bold">Weather App</h1>
      </nav>

      {/* Weather Section */}
      <div className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-sm mx-auto p-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex items-center border border-gray-700 rounded-md p-2 bg-gray-800">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyParse={setQuery}
                placeholder="Enter city"
                className="bg-transparent outline-none text-white w-full px-2"
              />
              <button onClick={() => getResults(city)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l4-4m0 0l4-4m-4 4h12" />
                </svg>
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Weather Details */}
          {weatherData && (
            <div className="bg-gray-800 p-6 rounded-lg text-center text-white">
              <h2 className="text-2xl font-bold">{weatherData.name}, {weatherData.sys.country}</h2>
              <p className="text-lg mt-1">{dateTime}</p> {/* Display current date and time */}
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
