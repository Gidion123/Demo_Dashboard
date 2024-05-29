// import data from "./data.json" assert { type: "json" };

async function fetchData() {
  const data = await fetch(
    "https://raw.githubusercontent.com/rdsarjito/nyc_dataset/main/nyc_dataset.json"
  ).then((res) => res.json());
  return data;
}

function getBuildingClass(item) {
  return item["BUILDING CLASS CATEGORY"];
}

async function main() {
  const data = await fetchData();

  console.log({ data });

  /**
   * {
   *   '1': 1_000_000,
   *   '2': 3_000_000,
   *   '3': 3,
   *   '3': 3,
   * }
   *
   * {}
   *
   * {
   *   '13 CONDOS - ELEVATOR APARTMENTS': 1
   * }
   *
   * {
   *
   * }
   */

  const totalSalesPerBorough = data.reduce((accumulator, currentData) => {
    if (!accumulator[currentData["BOROUGH"]]) {
      accumulator[currentData["BOROUGH"]] = currentData["SALE PRICE"];
    } else {
      accumulator[currentData["BOROUGH"]] += currentData["SALE PRICE"];
    }
    return accumulator;
  }, {});

  console.log({ totalSalesPerBorough });

  const totalSalesPerBoroughLabel = Object.keys(totalSalesPerBorough);
  const totalSalesPerBoroughData = Object.values(totalSalesPerBorough);

  const totalSalesPerBoroughChartData = {
    labels: totalSalesPerBoroughLabel,
    datasets: [
      {
        label: "Sale Price",
        data: totalSalesPerBoroughData,
        borderColor: "hsl(24.6 95% 53.1%)",
        backgroundColor: "hsl(24.6 95% 53.1%)",
      },
    ],
  };

  const propertyTypeSalesCtx = document.getElementById("propertyTypeSales");

  new Chart(propertyTypeSalesCtx, {
    type: "bar",
    data: totalSalesPerBoroughChartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });

  const uniqueBuildingClass = data.reduce((accumulator, currentData) => {
    if (!accumulator[currentData["BUILDING CLASS CATEGORY"]]) {
      accumulator[currentData["BUILDING CLASS CATEGORY"]] = 1;
    } else {
      accumulator[currentData["BUILDING CLASS CATEGORY"]]++;
    }

    return accumulator;
  }, {});

  const labels = Object.keys(uniqueBuildingClass);
  const unitsSoldData = Object.values(uniqueBuildingClass);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Unit(s) Sold",
        data: unitsSoldData,
        borderColor: "hsl(24.6 95% 53.1%)",
        backgroundColor: "hsl(24.6 95% 53.1%)",
      },
    ],
  };

  const chartCtx = document.getElementById("totalMontlySales");

  new Chart(chartCtx, {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Unit Sold by Building Class",
        },
      },
    },
  });

  console.log({ labels });
}

main();
