const submit = document.getElementById("submit");
const form = document.getElementById("location_text");
const switchButton = document.getElementById("unitSwitch-button");
const dailyButton = document.getElementById("daily-button");
const hourlyButton = document.getElementById("hourly-button");

let currentLocation = "Cambridge, US";
let displayedUnit = "";
let displayedSpeed = "";
let unit = "imperial";
let count = "daily";
dailyButton.classList.add("hightlight");

setDisplayedUnits();
getCoords(currentLocation, unit);

switchButton.addEventListener("click", () => {
  switchUnits();
  setDisplayedUnits();
  getCoords(currentLocation, unit);
});

submit.addEventListener("click", (event) => submitFunction(event));

function submitFunction(event) {
  event.preventDefault();
  currentLocation = form.value;
  getCoords(form.value);
  form.value = "";
}

dailyButton.addEventListener("click", () => {
  dailyButton.classList.add("hightlight");
  hourlyButton.classList.remove("hightlight");
  count = "daily";
  getCoords(currentLocation, unit);
});

hourlyButton.addEventListener("click", () => {
  hourlyButton.classList.add("hightlight");
  dailyButton.classList.remove("hightlight");
  count = "hourly";
  getCoords(currentLocation, unit);
});

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
    })
    .catch(function () {
      alert("invalid input");
      currentLocation = "Cambridge, US";
      getCoords(currentLocation, unit);
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

      let tilesDiv = document.getElementById("tiles-div");
      removeChildren(tilesDiv);
      fillBottom(info);
    });
}

function fillRightDiv(info) {
  let feelsLike = document.getElementById("feels-like-info");
  let clouds = document.getElementById("cloud-info");
  let humidity = document.getElementById("humidity-info");
  let wind = document.getElementById("wind-info");

  feelsLike.textContent = info["feels_like"];
  clouds.textContent = info["cloud-cover"];
  humidity.textContent = info["humidity"];
  wind.textContent = info["wind"];
}

function fillLeftDiv(info) {
  let main = document.getElementById("main-left");
  let temp = document.getElementById("temp-left");
  let time = document.getElementById("time-left");
  let img = document.getElementById("main-img");

  main.textContent = info["main"];
  temp.textContent = info["temp"];
  img.classList.add("main-img");
  let id = chooseIcon(info["id"]);
  img.src = id;
  time.textContent = formatDateforMain(info["current-time"]);
}

function fillBottom(info) {
  if (count == "daily") {
    for (let i = 0; i < info["daily"].length; i++) {
      createDailyTile(info["daily"][i]);
    }
  } else {
    for (let i = 0; i < info["daily"].length; i++) {
      createHourlyTile(info["hourly"][i]);
    }
  }
}

function createDataObj(response) {
  let info = {};
  info["main"] = response.current.weather[0].main;
  info["description"] = response.current.weather[0].description;
  info["temp"] = `${response.current.temp} °${displayedUnit}`;
  info["feels_like"] = `${response.current.feels_like} °${displayedUnit}`;
  info["pressure"] = response.current.pressure;
  info["humidity"] = `${response.current.humidity} %`;
  info["visibility"] = response.current.visibility;
  info["wind"] = `${response.current.wind_speed} ${displayedSpeed}`;
  info["cloud-cover"] = `${response.current.clouds} %`;
  info["current-time"] = createDate(response.current.dt);
  info["id"] = response.current.weather[0].id;

  // if (response.daily[0].rain == undefined) {
  //   info["rain"] = "0%";
  // } else {
  //   info["rain"] = `${response.daily[0].rain}%` || `0%`;
  // }

  info["daily"] = [];
  info["hourly"] = [];

  for (i = 0; i < 7; i++) {
    info["daily"].push({
      max_temp: response.daily[i].temp.max,
      min_temp: response.daily[i].temp.min,
      main: response.daily[i].weather[0].main,
      id: response.daily[i].weather[0].id,
      time: formatDateForDaily(createDate(response.daily[i].dt)),
    });
  }

  for (i = 0; i < 7; i++) {
    info["hourly"].push({
      temp: response.hourly[i].temp,
      main: response.hourly[i].weather[0].main,
      id: response.hourly[i].weather[0].id,
      time: formatAMPM(formatDateForHourly(createDate(response.hourly[i].dt))),
    });
  }

  return info;
}

function createDailyTile(obj) {
  const tilesDiv = document.getElementById("tiles-div");

  let tile = document.createElement("div");
  let tileTime = document.createElement("h3");
  let tileMain = document.createElement("img");
  let tileMax = document.createElement("p");
  let tileMin = document.createElement("p");

  tileTime.textContent = obj.time;
  tileMax.textContent = `H: ${obj.max_temp} °${displayedUnit}`;
  tileMin.textContent = `L: ${obj.min_temp} °${displayedUnit}`;
  tileMain.classList.add("footer-img");
  tileMain.src = chooseIcon(obj.id);

  tile.appendChild(tileTime);
  tile.appendChild(tileMain);
  tile.appendChild(tileMax);
  tile.appendChild(tileMin);

  tilesDiv.appendChild(tile);
}

function createHourlyTile(obj) {
  const tilesDiv = document.getElementById("tiles-div");

  let tile = document.createElement("div");
  let tileTime = document.createElement("h3");
  let tileMain = document.createElement("img");
  let tileTemp = document.createElement("p");

  tileTime.textContent = obj.time;
  tileTemp.textContent = `${obj.temp} °${displayedUnit}`;
  tileMain.classList.add("footer-img");
  tileMain.src = chooseIcon(obj.id);

  tile.appendChild(tileTime);
  tile.appendChild(tileMain);
  tile.appendChild(tileTemp);

  tilesDiv.appendChild(tile);
}

function createDate(dt) {
  let unix_timestamp = dt;
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(unix_timestamp * 1000);

  return date;
}

function formatDateforMain(date) {
  date = date.toString().split(" ");
  date.splice(5, 4);
  date = date.join(" ");
  return date;
}

function formatDateForDaily(date) {
  date = date.toString().split(" ");
  date.splice(1, 9);
  date = date.join(" ");
  return date;
}

function formatDateForHourly(date) {
  return date.getHours();
  // date = date.toString().split(" ");
  // date = date.slice(4, 5);
  // date = date.join(" ");
}
function formatAMPM(hours) {
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  let strTime = hours + " " + ampm;
  return strTime;
}

function removeChildren(parent) {
  while (parent.lastChild) {
    parent.removeChild(parent.lastChild);
  }
}

function chooseIcon(id) {
  if (id >= 801 && id <= 804) {
    return "./SVG/cloudy.svg";
  } else if (id == 800) {
    return "./SVG/sun.svg";
  } else if (id >= 600 && id <= 622) {
    return "./SVG/snow.svg";
  } else if (id >= 300 && id <= 531) {
    return "./SVG/rainy.svg";
  } else if (id >= 200 && id <= 232) {
    return "./SVG/lightning.svg";
  }
}
