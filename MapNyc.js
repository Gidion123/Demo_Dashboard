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
  const mappedGeoJsonData = {
    type: "FeatureCollection",
    features: geojsonData.features.map((item) => {
      return {
        ...item,
        properties: {
          ...item.properties,
          salePrice: zipCodeSalePrice[item.properties.postalCode] || 0,
        },
      };
    }),
  };

  var info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
    this.update();
    return this._div;
  };

  const formatter = new Intl.NumberFormat("en-US", { currency: "USD" });

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML =
      "<h4>Sale Price</h4>" +
      (props
        ? "<b>" +
          props.borough +
          "</b><br />$" +
          formatter.format(props.salePrice)
        : "Hover over a state");
  };

  console.log({ mappedGeoJsonData });

  var map = L.map("map").setView([40.7447677, -73.8947312], 10);

  info.addTo(map);

  var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  var geojson;

  geojson = L.geoJson(mappedGeoJsonData, { style, onEachFeature }).addTo(map);

  console.log({ data, zipCodeSalePrice });
}

main();

//TODO: Tentuin Warna Utama dan Turunannnya // clear
function getColor(d) {
  return d > 396_865_891
    ? "#fb9a99" // Pink
    : d > 352_769_681
    ? "#33a02c" // Hijau tua
    : d > 308_673_471
    ? "#1f78b4" // Biru tua
    : d > 264_577_261
    ? "#e41a1c" // Merah
    : d > 220_481_051
    ? "#377eb8" // Biru
    : d > 176_384_841
    ? "#4daf4a" // Hijau
    : d > 132_288_631
    ? "#984ea3" // Ungu
    : d > 110_240_526
    ? "#ff7f00" // Oranye
    : d > 88_192_421
    ? "#ffff33" // Kuning
    : d > 66_144_316
    ? "#a65628" // Coklat
    : d > 44_096_211
    ? "#f781bf" // Pink muda
    : d > 22_048_106
    ? "#999999" // Abu-abu tua
    : // <= 22_048_105
      "#e0e0e0"; // Abu-abu muda
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.salePrice),
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });

  info.update(layer.feature.properties);

  layer.bringToFront();
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}
