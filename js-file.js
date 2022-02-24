const submit = document.getElementById("submit");
const form = document.getElementById("location_text");
const switchButton = document.getElementById("unitSwitch-button");

let displayedUnit = "";
let displayedSpeed = "";
let unit = "imperial";

switchButton.addEventListener("click", () => {
  switchUnits();
  console.log(unit);
  setDisplayedUnits();
  getCoords("Cambridge, US", unit);
});

submit.addEventListener("click", () => {
  getCoords(form.value);
});

setDisplayedUnits();
getCoords("Boston, US", unit);

function switchUnits() {
  if (unit == "imperial") {
    unit = "metric";
  } else {
    unit = "imperial";
  }
}

function setDisplayedUnits() {
  if (unit == "imperial") {
    displayedUnit = "F";
    displayedSpeed = "mph";
  } else {
    displayedUnit = "C";
    displayedSpeed = "km/h";
  }
}

function getCoords(location, unit) {
  fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=2&appid=a5cb39ed0a3bdbd7ba4f64cb5b391fe1`,
    {
      mode: "cors",
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      let lat = response[0].lat;
      let lon = response[0].lon;
      getData(lat, lon, unit);
    });
}

function getAndSetCityName(lat, lon) {
  fetch(
    `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=2&appid=a5cb39ed0a3bdbd7ba4f64cb5b391fe1`,
    {
      mode: "cors",
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      displayCityName(response[0].name);
    });
}

function displayCityName(name) {
  let cityTitle = document.getElementById("city-title");
  cityTitle.textContent = name;
}

function getData(lat, lon, unit = "imperial") {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${unit}&appid=a5cb39ed0a3bdbd7ba4f64cb5b391fe1`,
    {
      mode: "cors",
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      getAndSetCityName(lat, lon);
      console.log(response);
      let info = createDataObj(response);
      fillRightDiv(info);
      fillLeftDiv(info);
    });
}

function fillRightDiv(info) {
  let feelsLike = document.getElementById("feels-like-info");
  let rain = document.getElementById("rain-info");
  let humidity = document.getElementById("humidity-info");
  let wind = document.getElementById("wind-info");

  feelsLike.textContent = info["feels_like"];
  rain.textContent = info["rain"];
  humidity.textContent = info["humidity"];
  wind.textContent = info["wind"];
}

function fillLeftDiv(info) {
  let main = document.getElementById("main-left");
  let temp = document.getElementById("temp-left");

  main.textContent = info["main"];
  temp.textContent = info["temp"];
}

function createDataObj(response) {
  let info = {};
  info["main"] = response.daily[0].weather[0].main;
  info["description"] = response.current.weather[0].description;
  info["temp"] = `${response.current.temp} °${displayedUnit}`;
  info["feels_like"] = `${response.current.feels_like} °${displayedUnit}`;
  info["pressure"] = response.current.pressure;
  info["humidity"] = `${response.current.humidity} %`;
  info["visibility"] = response.current.visibility;
  info["wind"] = `${response.current.wind_speed} ${displayedSpeed}`;
  info["cloud-cover"] = response.current.clouds;
  info["time"] = new Date(response.minutely[0].dt).toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  if (response.daily[0].rain == undefined) {
    info["rain"] = "0%";
  } else {
    info["rain"] = `${response.daily[0].rain}%` || `0%`;
  }
  info["daily"] = [];

  for (i = 0; i < 5; i++) {
    info["daily"].push({
      max_temp: response.daily[i].temp.max,
      min_temp: response.daily[i].temp.min,
      main: response.daily[i].weather[0].main,
    });
  }

  return info;
}
