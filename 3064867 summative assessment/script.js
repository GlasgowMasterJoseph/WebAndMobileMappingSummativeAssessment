mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zZXBodGhldW5pbWFzdGVyIiwiYSI6ImNtNXlseW5lMDBubjUya3B4cHN5ZDJrZXAifQ.UVUfdo0Z43sbyHiAOpL6kQ';

// Initialise the map with the default Monochrome style
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/josephtheunimaster/cm6qq6k0s006f01se9a6r0vjw',
  center: [-81.719497122, 27.922829642], //Location set to Florida
  zoom: 5
});

// Initialise the Mapbox Geocoder
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  placeholder: "Search places in Florida",
  proximity: { longitude: -81.719497122, latitude: 27.922829642 }
});

// Add the geocoder control to the map
map.addControl(geocoder, "top-right");

// Function to toggle the map style (OpenAI ChatGPT, 2025) 
const toggleButton = document.getElementById("style-toggle");

function toggleMapStyle() {
  const currentStyle = map.getStyle().sprite;

  if (currentStyle.includes("cm6qq6k0s006f01se9a6r0vjw")) {
    map.setStyle('mapbox://styles/josephtheunimaster/cm6rt0nvd011l01rydtuj9qha');
    toggleButton.textContent = "Switch to Monochrome";
  } else {
    map.setStyle('mapbox://styles/josephtheunimaster/cm6qq6k0s006f01se9a6r0vjw');
    toggleButton.textContent = "Switch to Satellite";
  }
}

toggleButton.addEventListener("click", toggleMapStyle);

// Add controls
map.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: true }), "top-right");
map.addControl(new mapboxgl.NavigationControl(), "top-right");

// Weather code descriptions with emojis (OpenAI ChatGPT, 2025) 
const weatherDescriptions = {
  0: "Clear sky 🌞",
  1: "Mainly clear 🌤️",
  2: "Partly cloudy 🌥️",
  3: "Overcast ☁️",
  45: "Fog 🌫️",
  48: "Depositing rime fog 🌨️🌫️",
  51: "Light drizzle 🌧️",
  53: "Moderate drizzle 🌧️💧",
  55: "Dense drizzle 🌧️💦",
  56: "Light freezing drizzle ❄️🌧️",
  57: "Dense freezing drizzle ❄️🌧️💦",
  61: "Slight rain 🌧️",
  63: "Moderate rain 🌧️🌧️",
  65: "Heavy rain 🌧️🌧️🌧️",
  66: "Light freezing rain ❄️🌧️",
  67: "Heavy freezing rain ❄️🌧️🌧️",
  71: "Slight snowfall 🌨️",
  73: "Moderate snowfall 🌨️❄️",
  75: "Heavy snowfall 🌨️❄️❄️",
  77: "Snow grains 🌨️❄️",
  80: "Slight rain showers 🌧️☔",
  81: "Moderate rain showers 🌧️☔☔",
  82: "Violent rain showers 🌧️🌧️🌧️",
  85: "Slight snow showers ❄️🌨️",
  86: "Heavy snow showers ❄️🌨️❄️",
  95: "Thunderstorm ⛈️",
  96: "Thunderstorm with slight hail ⛈️🌨️",
  99: "Thunderstorm with heavy hail ⛈️🌨️❄️"
};

// Handle click event to show weather info (OpenAI ChatGPT, 2025) 
map.on('click', async (event) => {
  const features = map.queryRenderedFeatures(event.point, {
    layers: ['transportation-and-evacuation-0f6spg']
  });

  if (!features.length) return;

  const feature = features[0];
  const [lon, lat] = feature.geometry.coordinates;

  // Connect to Open Meteo API (Open Meteo, 2024)
  const meteoAPIUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;

  try {
    const response = await fetch(meteoAPIUrl);
    const data = await response.json();

    let temperature = data.current_weather?.temperature ?? "N/A";
    let windspeed = data.current_weather?.windspeed ?? "N/A";
    let weatherCode = data.current_weather?.weathercode;
    let conditions = weatherDescriptions[weatherCode] || "Unknown";
    let airportCode = feature.properties.ACODE;

    // Check if the airport code is blank, null, or undefined and set it to "Unavailable" (OpenAI ChatGPT, 2025) 
    if (!airportCode || airportCode.trim() === "") {
      airportCode = "Unavailable";
    }

    document.querySelector("#airport-info-box h3").textContent = feature.properties.Name;
    document.querySelector("#airport-info-box p:nth-child(2)").textContent = `Airport Code: ${airportCode}`;
    document.querySelector("#airport-info-box p:nth-child(3)").innerHTML = `<strong>Weather:</strong> ${conditions}`;
    document.querySelector("#airport-info-box p:nth-child(4)").innerHTML = `<strong>Temperature:</strong> ${temperature}°C`;
    document.querySelector("#airport-info-box p:nth-child(5)").innerHTML = `<strong>Wind Speed:</strong> ${windspeed} km/h`;

  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
});

// Create a custom pitch control (OpenAI ChatGPT, 2025) 
class PitchControl {
  constructor() {
    this._button = document.createElement('button');
    this._button.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-pitch';
    this._button.title = 'Tilt Map';
    this._button.textContent = '3D';

    this._button.addEventListener('click', () => this._togglePitch());
  }

  onAdd(map) {
    this._map = map;
    const container = document.createElement('div');
    container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    container.appendChild(this._button);
    return container;
  }

  onRemove() {
    this._button.removeEventListener('click', this._togglePitch);
    this._map = undefined;
  }

  _togglePitch() {
    const currentPitch = this._map.getPitch();
    if (currentPitch === 0) {
      this._map.setPitch(60);
      this._button.textContent = '2D';
    } else {
      this._map.setPitch(0);
      this._button.textContent = '3D';
    }
  }
}

map.addControl(new PitchControl(), 'top-right');

// Add fullscreen
map.addControl(new mapboxgl.FullscreenControl());


// Add scale bar
const scale = new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' });
map.addControl(scale);

// Add event listener for hover over airports with custom cursor (OpenAI ChatGPT, 2025)
map.on('mouseenter', 'transportation-and-evacuation-0f6spg', () => {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'transportation-and-evacuation-0f6spg', () => {
  map.getCanvas().style.cursor = '';
});

// Add functionality for single click to pan and zoom to airport (OpenAI ChatGPT, 2025) 
map.on('click', (event) => {
  const features = map.queryRenderedFeatures(event.point, {
    layers: ['transportation-and-evacuation-0f6spg']
  });

  if (features.length) {
    const feature = features[0];
    const [lon, lat] = feature.geometry.coordinates;

    const currentZoom = map.getZoom();
    
    // Increase zoom to 10 if the current zoom is below 10 (OpenAI ChatGPT, 2025)
    const newZoom = currentZoom < 10 ? 10 : currentZoom;

    // Center the map around the clicked airport and set zoom to 10 if needed (OpenAI ChatGPT, 2025)
    map.flyTo({
      center: [lon, lat],
      zoom: newZoom,
      essential: true // Animation is performed for a smooth transition (OpenAI ChatGPT, 2025)
    });
  }
});

// Handle help button click
document.getElementById("help-button").addEventListener("click", function() {
  document.getElementById("help-popup").style.display = "flex";
});

// Handle close button in the help popup
document.getElementById("close-help").addEventListener("click", function() {
  document.getElementById("help-popup").style.display = "none";
});