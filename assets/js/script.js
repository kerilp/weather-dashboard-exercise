var searchInputEl = document.querySelector("#search-form");
var apiUrl = "https://api.openweathermap.org/data/2.5/";
var apiKey = "2a6b33a118b125115c4d4cf251a9a914";
var cityNameEl = document.querySelector("#city-name");
var todayEl = document.querySelector("#todays-date");
var iconEl = document.querySelector("#icon");
var tempEl = document.querySelector("#temp");
var windEl = document.querySelector("#wind");
var humidEl = document.querySelector("#humidity");
var uviEl = document.querySelector("#uv-index");
var historyEl = document.querySelector("#search-history");
var savedCities = [];
var saved = [];

function displaySavedCities() {
    historyEl.innerHTML = "";
    if (localStorage.getItem("saved")) {
        savedCities = JSON.parse(localStorage.getItem("saved"));
        for (var i = 0; i < savedCities.length; i++) {
            var liEl = document.createElement("li");
            liEl.setAttribute("class", "list-group-item list-group-item-info");
            liEl.textContent = savedCities[i];
            historyEl.appendChild(liEl);
        }
    }
}

function searchByCity(query) {
    weatherApi = apiUrl + "weather?q=" + query + "&appid=" + apiKey;

    fetch(weatherApi)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var cityName = data.name;
            cityNameEl.textContent = cityName;

            if(localStorage.getItem("saved")) {
                saved = JSON.parse(localStorage.getItem("saved"));
            }
            if(!saved.includes(cityName)) {
                saved.push(cityName);
                localStorage.setItem("saved", JSON.stringify(saved));
            }
            displaySavedCities();


            var lat = data.coord.lat;
            var lon = data.coord.lon;
            var onecallApi = apiUrl + "onecall?lat=" + lat + "&lon=" + lon + "&units=imperial" + "&appid=" + apiKey;
            return fetch(onecallApi);
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var today = new Date(data.current.dt * 1000);
            var todaysDate = today.toDateString();
            todayEl.textContent = todaysDate;

            var iconId = data.current.weather[0].icon;
            var iconSrc = "https://openweathermap.org/img/wn/" + iconId + "@2x.png";
            iconEl.setAttribute("src", iconSrc);

            tempEl.textContent = data.current.temp + " °F";

            windEl.textContent = data.current.wind_speed + " MPH";

            humidEl.textContent = data.current.humidity + " %";

            var uvi = data.current.uvi;
            uviEl.textContent = uvi;
            if (uvi < 3) {
                uviEl.setAttribute("style", "padding: 2px 4px; color: white; background-color: green;");
            } else if (3 <= uvi < 6) {
                uviEl.setAttribute("style", "padding: 2px 4px; color: black; background-color: yellow;");
            } else if (6 <= uvi < 8) {
                uviEl.setAttribute("style", "padding: 2px 4px; color: white; background-color: orange;");
            } else if (8 <= uvi < 11) {
                uviEl.setAttribute("style", "padding: 2px 4px; color: white; background-color: red;");
            } else if (uvi >= 11) {
                uviEl.setAttribute("style", "padding: 2px 4px; color: white; background-color: purple;");
            }

            var lat = data.lat;
            var lon = data.lon;
            var forecastApi = apiUrl + "forecast?lat=" + lat + "&lon=" + lon + "&units=imperial" + "&appid=" + apiKey;
            return fetch(forecastApi);
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var j = 1;
            for (var i = 3; i <= 35; i += 8) {
                var day = data.list[i];

                var dateEl = document.querySelector("#h5-day-" + j);
                var date = day.dt_txt.split(" ");
                dateEl.textContent = date[0].slice(5);

                var smallIconEl = document.querySelector("#img-day-" + j);
                var iconId = day.weather[0].icon;
                var iconSrc = "https://openweathermap.org/img/wn/" + iconId + ".png";
                smallIconEl.setAttribute("src", iconSrc);

                var tempLiEl = document.querySelector("#temp-day-" + j);
                var windLiEl = document.querySelector("#wind-day-" + j);
                var humidLiEl = document.querySelector("#humid-day-" + j);

                tempLiEl.textContent = "Temp: " + day.main.temp + " °F";
                windLiEl.textContent = "Wind: " + day.wind.speed + " MPH";
                humidLiEl.textContent = "Humid: " + day.main.humidity + " %";

                j++;
            }
        })
        .catch(function (error) {
            console.error(error);
        });
}

function searchFormSubmit(event) {
    event.preventDefault();

    var query = document.querySelector("#search-input").value;
    if (!query) {
        alert("Please enter a search term");
        return;
    }
    searchByCity(query);
}

displaySavedCities();
searchInputEl.addEventListener("submit", searchFormSubmit);
historyEl.addEventListener("click", function (event) {
    if (event.target.matches("li")) {
        var savedQuery = event.target.textContent;
        searchByCity(savedQuery);
    }
});