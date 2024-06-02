async function fetchData() {
  const data = await fetch("./json/DatasetNycPropertySales.json").then((res) =>
    res.json()
  );
  return data;
}

async function main() {
  const data = await fetchData();
  const zipCodeSalePrice = data.reduce((acc, curr) => {
    const key = curr["ZIP CODE"];
    let salePrice = curr["SALE PRICE"];

    // Mengubah SALE PRICE dari string ke number jika perlu
    if (typeof salePrice === "string") {
      salePrice = Number(salePrice.split(".").join(""));
    }
    salePrice = Math.round(salePrice);

    if (!(key in acc)) {
      acc[key] = salePrice;
    } else {
      acc[key] += salePrice;
    }

    return acc;
  }, {});

  console.log({ data, zipCodeSalePrice });
}

main();
