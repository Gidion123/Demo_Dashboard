async function fetchData() {
  const data = await fetch(
    "https://raw.githubusercontent.com/rdsarjito/nyc_dataset/main/nyc_dataset.json"
  ).then((res) => res.json());
  return data;
}

async function main() {
  const data = await fetchData();

  //   ZIP CODE
  //  SALE PRICE

  /**
   *
   * 0: {}
   *
   * 1: {
   *    11111: 100_000
   * }
   *
   * 2: {
   *    11111: 100_000 + 200_000
   * }
   */

  //   const hasil = {
  //     11111: 2_000_000_000,
  //     11122: 3_500_000_000,
  //   };

  const zipCodeSalePrice = data.reduce((acc, curr) => {
    const key = curr["ZIP CODE"];
    if (!(key in acc)) {
      acc[key] = curr["SALE PRICE"];
    } else {
      acc[key] = acc[key] + curr["SALE PRICE"];
    }
    return acc;
  }, {});

  console.log({ data, zipCodeSalePrice });
}

main();
