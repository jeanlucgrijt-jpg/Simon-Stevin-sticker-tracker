import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';

import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { fromLonLat } from 'ol/proj.js';

import Style from 'ol/style/Style.js';
import CircleStyle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';


// =======================
// MAP SETUP
// =======================
const stickerSource = new VectorSource();

const stickerLayer = new VectorLayer({
  source: stickerSource,
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    stickerLayer,
  ],
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2,
  }),
});


// =======================
// ADD STICKER FUNCTION
// =======================
function addSticker(coords, name) {
  const feature = new Feature({
    geometry: new Point(fromLonLat(coords)),
  });

  feature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: 'red' }),
      }),
    })
  );

  stickerSource.addFeature(feature);

  console.log("Sticker added:", name);
}


// =======================
// BUTTON TEST
// =======================
document.getElementById("testsubmit").addEventListener("click", function () {
  console.log("FC Utrecht de beste");
});


// =======================
// FORM SUBMIT (MAIN LOGIC)
// =======================
document.getElementById("stickerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("http://localhost:3000/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Server response:", result);

    // =======================
    // ADD MARKER TO MAP
    // =======================

    if (result.coords && result.name) {
      addSticker(result.coords, result.name);
    }

  } catch (error) {
    console.error("Error:", error);
  }
});