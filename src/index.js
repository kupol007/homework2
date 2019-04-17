import "babel-polyfill";
import Chart from "chart.js";

const currencyURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadWeather() {
    const response = await fetch(currencyURL);
    const xmlTest = await response.text();
    const parser = new DOMParser();
    const currencyData = parser.parseFromString(xmlTest, "text/xml");
    const temperatures = currencyData.querySelectorAll("TEMPERATURE[max][min]");
    const times = currencyData.querySelectorAll("FORECAST[hour]");
    const heats = currencyData.querySelectorAll("HEAT[max][min]");
    var result = [];

    for (let i = 0; i < temperatures.length; i++) {
        const temperatureTag = temperatures.item(i);
        const timeTag = times.item(i);
        const heatTag = heats.item(i);
        const time = Number(timeTag.getAttribute("hour"));
        const temperatureMax = Number(temperatureTag.getAttribute("max"));
        const temperatureMin = Number(temperatureTag.getAttribute("min"));
        const heatMin = Number(heatTag.getAttribute("min"));
        const heatMax = Number(heatTag.getAttribute("max"));
        result[i] = { time, temperatureMax, temperatureMin, heatMin, heatMax };
    }

    return result;
}

function normalizeDataByTemperature(data, vid) {
    const result = [];

    for (var i = 0; i < data.length; i++) {
        result[i] = data[i][vid];
    }

    return result;
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
    const currencyData = await loadWeather();
    const temperatureMaxData = normalizeDataByTemperature(currencyData, "temperatureMax");
    const keys = normalizeDataByTemperature(currencyData, "time");
    const temperatureMinData = normalizeDataByTemperature(currencyData, "temperatureMin");
    const heatMinData = normalizeDataByTemperature(currencyData, "heatMin");
    const heatMaxData = normalizeDataByTemperature(currencyData, "heatMax");

    const chartConfig = {
        type: "line",

        data: {
            labels: keys,
            datasets: [{
                    label: "Максимальная температура воздуха",
                    borderColor: "#0F0",
                    borderColor: "#0F0",
                    data: temperatureMaxData
                },
                {
                    label: "Минимальная температура воздуха",
                    borderColor: "#00F",
                    data: temperatureMinData
                },
                {
                    label: "Максимальная температура комфорта",
                    borderColor: "#F00",
                    data: heatMaxData
                },
                {
                    label: "Минимальная температура комфорта",
                    borderColor: "#FF7F00",
                    data: heatMinData
                }
            ]
        }
    };

    if (window.chart) {
        chart.data.labels = chartConfig.data.labels;
        chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
        chart.update({
            duration: 800,
            easing: "easeOutBounce"
        });
    } else {
        window.chart = new Chart(canvasCtx, chartConfig);
    }
});