// Step 0: Import data
import data from "./json/NycPropertySales.json" assert { type: "json" };

console.log({ data });

const BOROUGH = {
  MANHATTAN: 1,
  BRONX: 2,
  BROOKLYN: 3,
  QUEENS: 4,
  STATEN_ISLAND: 5,
};

const BOROUGH_DISPLAY_NAME = {
  [BOROUGH.MANHATTAN]: "Manhattan",
  [BOROUGH.BRONX]: "Bronx",
  [BOROUGH.BROOKLYN]: "Brooklyn",
  [BOROUGH.QUEENS]: "Queens",
  [BOROUGH.STATEN_ISLAND]: "Staten Island",
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  maximumFractionDigits: 0,
});

let totalMonthlySaleChart = null;
let topCategoriesChart = null;
let selectedBoroughFilter = -1;
let selectedStartDate = "2016-09-01";
let selectedEndDate = "2017-08-31";

// Render chart di awal
const filter = createFilter(
  data,
  selectedBoroughFilter,
  selectedStartDate,
  selectedEndDate
);

render(filter);

// =============== Filter Borough ===================
// Menampilkan opsi borough
const filterBorough = document.getElementById("borough-filter");
filterBorough.addEventListener("change", (e) => {
  selectedBoroughFilter = Number(e.target.value);
  console.log(selectedBoroughFilter);

  //   Render ulang chart sesuai filter
  const filter = createFilter(
    data,
    Number(e.target.value),
    selectedStartDate,
    selectedEndDate
  );

  render(filter);
});

Object.keys(BOROUGH).forEach((key) => {
  const option = document.createElement("option");
  option.setAttribute("value", BOROUGH[key]);
  option.textContent = BOROUGH_DISPLAY_NAME[BOROUGH[key]];
  filterBorough.appendChild(option);
});

// ============ End of Filter ================

// =========== Filter Date ==============

const filterStartDate = document.getElementById("startDate");
const filterEndDate = document.getElementById("endDate");

filterStartDate.setAttribute("value", selectedStartDate);
filterEndDate.setAttribute("value", selectedEndDate);

filterStartDate.addEventListener("change", (e) => {
  const startDate = e.target.value;
  selectedStartDate = startDate;
  filterEndDate.setAttribute("min", startDate);

  const filter = createFilter(
    data,
    selectedBoroughFilter,
    startDate,
    selectedEndDate
  );

  render(filter);
});

filterEndDate.addEventListener("change", (e) => {
  const endDate = e.target.value;
  selectedEndDate = endDate;
  filterStartDate.setAttribute("max", endDate);

  const filter = createFilter(
    data,
    selectedBoroughFilter,
    selectedStartDate,
    endDate
  );

  render(filter);
});

// =========== End of Filter Date ============

function sum(data, key) {
  return data.reduce((total, item) => {
    let salePrice = item[key];

    if (typeof salePrice === "string") {
      salePrice = Number(item[key].split(".").join(""));
    }

    return total + salePrice;
  }, 0);
}

function createFilter(data, selectedBorough = -1, startDate, endDate) {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  // Step 1: Buat list label (Bulan & Tahun)
  /**
   * labels: ["Jan 2016", "Feb 2016", "Mar 2016", "Apr 2016"]
   */

  const x = d3.scaleUtc().domain([startDateObj, endDateObj]);
  const labels = x.ticks(d3.utcMonth.every(1));

  // Step 2: Bikin dataset per borough
  /**
 * {
        label: "Manhattan",
        data: [
          3_700_000_000, 2_800_000_000, 3_700_000_000, 3_700_000_000,
          3_700_000_000, 3_700_000_000,
        ],
        borderWidth: 1,
      }
 */

  const mappedData = data
    .map((item) => {
      const [date, month, year] = item["SALE DATE"].split("/").map(Number);
      return {
        ...item,
        date: new Date(year, month - 1, date),
        dateValue: {
          date: date,
          month: month - 1,
          year: year,
        },
      };
    })
    .filter((item) => {
      return startDateObj <= item.date && item.date <= endDateObj;
    })
    .filter(
      (item) => selectedBorough === -1 || item.BOROUGH == selectedBorough
    );

  console.log(mappedData, selectedBorough);

  function getTotalMonthlySales() {
    const datasets = Object.keys(BOROUGH).map((key) => {
      const data = labels.map((date) => {
        const month = date.getMonth();
        const year = date.getFullYear();

        const filteredData = mappedData.filter((item) => {
          return (
            item.dateValue.month === month &&
            item.dateValue.year === year &&
            item.BOROUGH === BOROUGH[key]
          );
        });

        const totalSales = sum(filteredData, "SALE PRICE");

        return totalSales;
      });

      return {
        label: BOROUGH_DISPLAY_NAME[BOROUGH[key]],
        data: data,
      };
    });

    return {
      labels: labels.map(
        (date) => `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      ),
      datasets: datasets.filter(
        (item) =>
          selectedBorough === -1 ||
          item.label === BOROUGH_DISPLAY_NAME[selectedBorough]
      ),
    };
  }

  function getTotalSales() {
    return formatter.format(sum(mappedData, "SALE PRICE"));
  }

  //   TODO: tambahin function lain

  //mendapatkan total unit
  function getTotalUnits() {
    return sum(mappedData, "TOTAL UNITS")
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  //mendapatkan harga rata-rata
  function getAverageSales() {
    let totalSales = sum(mappedData, "SALE PRICE");
    let average = totalSales / mappedData.length;
    return average;
  }

  function getTopCategories() {
    const categorySales = {};
    mappedData.forEach((item) => {
      const category = item["BUILDING CLASS CATEGORY"];
      const salePrice = parseFloat(item["SALE PRICE"]);
      if (!isNaN(salePrice)) {
        if (category in categorySales) {
          categorySales[category] += salePrice;
        } else {
          categorySales[category] = salePrice;
        }
      }
    });

    const sortedCategories = Object.keys(categorySales).sort(
      (a, b) => categorySales[b] - categorySales[a]
    );

    const topCategories = sortedCategories.slice(0, 5);

    const topCategoriesList = topCategories.map((category) => {
      return {
        category: category,
        totalSales: categorySales[category], // Pastikan nilai numerik untuk data
      };
    });

    return topCategoriesList;
  }

  return {
    getTotalMonthlySales,
    getTotalSales,
    getTotalUnits,
    getAverageSales,
    getTopCategories,
  };
}

function renderTotalSales(sales) {
  const totalSales = document.getElementById("totalSales");
  totalSales.textContent = sales;
}

function renderCharts(labels, datasets) {
  const ctx = document.getElementById("totalMontlySales");

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      interaction: {
        mode: "index",
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
function renderTopCategoriesHorizontalBarChart(topCategories) {
  const labels = topCategories.map((item) => item.category);
  const data = topCategories.map((item) => item.totalSales);

  const ctx = document
    .getElementById("topCategoriesHorizontalBarChart")
    .getContext("2d");

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Sales",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 205, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(54, 162, 235, 0.2)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y", // Mengatur sumbu menjadi horizontal
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Top 5 Categories by Sales",
        },
      },
    },
  });
}

function renderTotalUnits(units) {
  const totalUnits = document.getElementById("totalUnits");
  totalUnits.textContent = units;
}

function renderAverageSales(average) {
  const averageSales = document.getElementById("averageSales");
  averageSales.textContent = formatter.format(average);
}

function renderTopCategories(topCategories) {
  const topCategoriesListElement = document.getElementById("topCategoriesList");
  topCategoriesListElement.innerHTML = "";

  topCategories.forEach((item, index) => {
    const listItem = document.createElement("div");
    listItem.textContent = `${index + 1}. ${item.category}: ${item.totalSales}`;
    topCategoriesListElement.appendChild(listItem);
  });
}

function render(filter) {
  if (totalMonthlySaleChart !== null) {
    totalMonthlySaleChart.destroy();
  }

  if (topCategoriesChart !== null) {
    topCategoriesChart.destroy();
  }

  renderTotalSales(filter.getTotalSales());
  renderTotalUnits(filter.getTotalUnits());
  renderAverageSales(filter.getAverageSales());

  const { datasets, labels } = filter.getTotalMonthlySales();
  totalMonthlySaleChart = renderCharts(labels, datasets);

  const topCategories = filter.getTopCategories();
  topCategoriesChart = renderTopCategoriesHorizontalBarChart(topCategories);
}
