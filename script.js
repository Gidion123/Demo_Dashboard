async function fetchData() {
  const data = await fetch(
    "https://raw.githubusercontent.com/rdsarjito/nyc_dataset/main/nyc_dataset.json"
  ).then((res) => res.json());
  return data;
}

function sum(data, key) {
  return data.reduce((acc, curr) => acc + curr[key], 0);
}

function range(start, end) {
  return Array.from({ length: end - start }, (_, i) => start + 1 + i);
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

function normalizeData(data, startDate, endDate) {
  return data.reduce((acc, curr) => {
    const [date, month, year] = curr["SALE DATE"]
      .split("/")
      .map((val) => Number(val));
    const convertedDate = new Date(year, month - 1, date);

    const newItem = {
      ...curr,
      date: convertedDate,
      dateValue: { date, month: month - 1, year },
    };

    if (newItem.date >= startDate && newItem.date <= endDate) {
      if (!acc[curr.BOROUGH]) {
        acc[curr.BOROUGH] = [newItem];
      } else {
        acc[curr.BOROUGH].push(newItem);
      }
    }

    return acc;
  }, {});
}

function createFilter(data, startDate, endDate) {
  // Cara untuk mendapatkan unique borough list
  const uniqueBorough = Array.from(new Set(data.map((item) => item.BOROUGH)));

  const filteredData = normalizeData(data, startDate, endDate);

  function getMonthlySales() {
    const scale = d3
      .scaleUtc()
      .domain([startDate, endDate])
      .ticks(d3.utcMonth.every(1));

    const formattedScale = scale.map((date) => {
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    });

    const monthlySales = uniqueBorough.map((borough) => {
      const sales = scale.map((date) => {
        const month = date.getMonth();
        const year = date.getFullYear();

        const isOnMonthRange = (data) =>
          data.dateValue.month === month && data.dateValue.year === year;

        const data = filteredData[borough].filter((data) =>
          isOnMonthRange(data)
        );

        const salesTotal = sum(data, "SALE PRICE");

        return salesTotal;
      });

      return {
        borough,
        sales,
      };
    });

    return { data: monthlySales, scales: formattedScale };
  }

  return {
    getMonthlySales,
    data: filteredData,
  };
}

(async function main() {
  const chart = await fetchData();
  const startDate = new Date("2016-09-01");
  const endDate = new Date("2017-05-31");
  const filter = createFilter(chart, startDate, endDate);

  console.log({ chart });

  console.log(filter.getMonthlySales());

  createMontlySaleChart(filter);
})();

function createMontlySaleChart(filter) {
  const color = [
    "hsl(24.6 95% 53.1%)",
    "hsla(180, 40%, 65%, 1)",
    "#63C7B2",
    "#3F612D",
    "#18206F",
  ];

  const totalMonthlySalesCtx = document.getElementById("totalMontlySales");
  const scale = filter.getMonthlySales().scales;
  const datasets = filter.getMonthlySales().data.map((item, i) => ({
    label: item.borough,
    data: item.sales,
    fill: false,
    borderColor: color[i % color.length],
    backgroundColor: color[i % color.length],
    tension: 0.3,
  }));

  new Chart(totalMonthlySalesCtx, {
    type: "line",
    data: {
      labels: scale,
      datasets: datasets,
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
