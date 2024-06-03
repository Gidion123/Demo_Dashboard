async function fetchData() {
  const response = await fetch("./json/DatasetNycPropertySales.json");
  return response.json();
}

function createSalesTable(data) {
  return new DataTable("#salesTable", {
    data: data,
    columns: [
      { data: "NAME BOROUGH" },
      { data: "NEIGHBORHOOD" },
      { data: "BUILDING CLASS CATEGORY" },
      { data: "TAX CLASS AT PRESENT" },
      { data: "TOTAL UNITS" },
      { data: "LAND SQUARE FEET" },
      { data: "GROSS SQUARE FEET" },
      { data: "YEAR BUILT" },
      //Sale Price
      {
        data: "SALE PRICE",
        render: (data, type) => {
          const number = DataTable.render
            .number(",", ".", 3, "$")
            .display(data);

          if (type === "display") {
            return number;
          }
          return data;
        },
      },
      { data: "SALE DATE" },
    ],
  });
}

async function main() {
  const data = await fetchData();
  console.log({ data });
  createSalesTable(data);
}

main();
