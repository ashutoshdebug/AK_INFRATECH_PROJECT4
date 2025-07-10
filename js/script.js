const apiKey = "dce0ddd4695d3fe36737a16ed79a5dd1";
const resultDiv = document.getElementById("result");
const forecastDiv = document.getElementById("forecast");
const tabsDiv = document.getElementById("tabs");
const chartCanvas = document.getElementById("tempChart");
let forecastByDay = {};
let chartInstance;

document.getElementById("search-location").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    getWeather();
  }
});

function getWeather() {
  const city = document.getElementById("search-location").value.trim();

  resultDiv.style.display = "block";

  forecastDiv.innerHTML = "";
  tabsDiv.innerHTML = "";
  if (!city) return;

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.cod !== 200) {
        resultDiv.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
        resultDiv.style.display = "block";
        return;
      }

      const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      resultDiv.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="${iconUrl}" alt="${data.weather[0].description}">
            <p>${data.weather[0].main} - ${data.weather[0].description}</p>
            <p>🌡️ ${data.main.temp}°C (feels like ${data.main.feels_like}°C)</p>
            <p>💧 Humidity: ${data.main.humidity}%</p>
            <p>🌬️ Wind: ${data.wind.speed} m/s</p>
          `;

      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
      )
        .then((res) => res.json())
        .then((forecastData) => {
          forecastByDay = {};
          forecastData.list.forEach((item) => {
            const date = new Date(item.dt_txt);
            const day = date.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            });
            if (!forecastByDay[day]) forecastByDay[day] = [];
            forecastByDay[day].push(item);
          });

          
          Object.keys(forecastByDay).forEach((day, idx) => {
            const tab = document.createElement("div");
            tab.className = "tab" + (idx === 0 ? " active" : "");
            tab.innerText = day;
            tab.addEventListener("click", () => {
              document
                .querySelectorAll(".tab")
                .forEach((t) => t.classList.remove("active"));
              tab.classList.add("active");
              renderForecast(day);
              updateChart(day);
            });
            tabsDiv.appendChild(tab);
          });

          renderForecast(Object.keys(forecastByDay)[0]);
          updateChart(Object.keys(forecastByDay)[0]);
        });
    });
}

function renderForecast(day) {
  forecastDiv.innerHTML = "";
  forecastByDay[day].forEach((item) => {
    const time = new Date(item.dt_txt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const icon = item.weather[0].icon;
    forecastDiv.innerHTML += `
          <div class="forecast-box">
            <h3>${time}</h3>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
            <p><strong>${item.weather[0].main}</strong></p>
            <p>${item.main.temp}°C</p>
          </div>
        `;
  });
}

function updateChart(day) {
  const labels = forecastByDay[day].map((item) =>
    new Date(item.dt_txt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const temps = forecastByDay[day].map((item) => item.main.temp);
  const humidity = forecastByDay[day].map((item) => item.main.humidity);

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: true,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Humidity (%)",
          data: humidity,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "white" } },
      },
      scales: {
        x: { ticks: { color: "white" } },
        y: {
          type: "linear",
          position: "left",
          title: { display: true, text: "Temperature (°C)", color: "white" },
          ticks: { color: "white" },
        },
        y1: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Humidity (%)", color: "white" },
          ticks: { color: "white" },
        },
      },
    },
  });
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString(); 
  document.getElementById("clock").innerText = `Date: ${date}, Time: ${time}`;
}

updateClock();

setInterval(updateClock, 1000);
