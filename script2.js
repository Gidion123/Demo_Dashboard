async function fetchData() {
  const response = await fetch(
    "https://raw.githubusercontent.com/rdsarjito/nyc_dataset/main/nyc_dataset.json"
  );
  const data = await response.json();
  return data;
}

function sum(data, key) {
  return data.reduce((acc, curr) => acc + curr[key], 0);
}

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

function getMontlySales(data) {
  const boroughs = [...new Set(data.map((item) => item.BOROUGH))];

  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const years = [2016, 2017];
  let monthsYear = [];

  for (let j = 0; j < years.length; j++) {
    for (let i = 0; i < months.length; i++) {
      monthsYear.push({
        month: months[i],
        year: years[j],
        label: `${monthNames[months[i]]} ${years[j]}`,
      });
    }
  }

  const mappedData = data.map((item) => {
    const [date, month, year] = item["SALE DATE"]
      .split("/")
      .map((date) => Number(date));
    return {
      ...item,
      date: {
        date,
        month: month - 1,
        year,
      },
    };
  });

  const totalMonthlySales = boroughs.map((borough) => {
    const monthlySales = monthsYear.map(({ month, year }) => {
      const sales = sum(
        mappedData.filter(
          (data) =>
            data.BOROUGH === borough &&
            data.date.month === month &&
            data.date.year === year
        ),
        "SALE PRICE"
      );
      return sales;
    });

    return {
      borough,
      sales: monthlySales,
    };
  });

  return {
    totalMonthlySales,
    monthsYear,
  };
}

const color = [
  "hsl(24.6 95% 53.1%)",
  "hsla(180, 40%, 65%, 1)",
  "#63C7B2",
  "#3F612D",
  "#18206F",
];

async function main() {
  const data = await fetchData();
  const { monthsYear, totalMonthlySales } = getMontlySales(data);

  const totalMonthlySalesCtx = document.getElementById("totalMontlySales");

  const startDate = new Date("2016-09-01T00:00Z");
  const endDate = new Date("2017-08-01T02:00Z");

  const x = d3.scaleUtc().domain([startDate, endDate]);
  const ticks = x
    .ticks(d3.utcMonth.every(1))
    .map((date) => `${monthNames[date.getMonth()]} ${date.getFullYear()}`);

  console.log({ ticks });

  new Chart(totalMonthlySalesCtx, {
    type: "line",
    data: {
      labels: monthsYear.map((l) => l.label),
      datasets: totalMonthlySales.map(({ borough, sales }, i) => ({
        label: borough,
        data: sales,
        fill: false,
        borderColor: color[i % color.length],
        backgroundColor: color[i % color.length],
        tension: 0.3,
      })),
    },
    options: {
      aspectRatio: 10 / 4,
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

main();
