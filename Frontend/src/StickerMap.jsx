import React, { useEffect, useRef, useState } from "react";
import "./StickerMap.css";

import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import Overlay from "ol/Overlay";

import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";

import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import { fromLonLat, toLonLat } from "ol/proj";

import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";



const StickerTracker = () => {
  const mapRef = useRef(null);
  const locationMapRef = useRef(null);  
  const [sortOpen, setSortOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);


  useEffect(() => {
    let selectedCoordinates = [5.4697, 51.4416];
    let selectedStickerType = "Logo A";

    /* ================= MAIN MAP ================= */

    const stickerSource = new VectorSource();

    const stickerLayer = new VectorLayer({
      source: stickerSource,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        stickerLayer,
      ],
      view: new View({
        center: fromLonLat([5.4697, 51.4416]),
        zoom: 4,
      }),
    });

    const popupOverlay = new Overlay({
      element: document.getElementById("popup"),
      positioning: "bottom-center",
      offset: [0, -20],
    });

    map.addOverlay(popupOverlay);

    const popupContent = document.getElementById("popupContent");

    function createStickerFeature(data) {
      const feature = new Feature({
        geometry: new Point(
          fromLonLat(data.coordinates)
        ),
        stickerData: data,
      });

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: "#38bdf8" }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 2,
            }),
          }),
        })
      );

      stickerSource.addFeature(feature);
    }

    /* Example sticker */
    createStickerFeature({
      title: "Sample Sticker",
      description: "Example sticker popup.",
      stickerId: "Logo A",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg",
      detailDescription: "Detailed sticker information.",
      year: "2026",
      members: "Member A, Member B",
      leus: "Placeholder leus",
      rubric: "Placeholder rubric",
      coordinates: [5.4697, 51.4416],
    });

    /* ================= CLICK ================= */

    map.on("click", (event) => {
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (f) => f
      );

      if (!feature) {
        popupOverlay.setPosition(undefined);
        return;
      }

      const data = feature.get("stickerData");
      const coords = feature.getGeometry().getCoordinates();

      popupContent.innerHTML = `
        <h3>${data.title}</h3>
        <p><strong>Description:</strong> ${data.description}</p>
        <p>
          <strong>Type:</strong>
          <span class="type-link" id="popupTypeLink">${data.stickerId}</span>
        </p>
        ${data.image}
      `;

      popupOverlay.setPosition(coords);

      setTimeout(() => {
        const typeLink = document.getElementById("popupTypeLink");
        const popupImage = document.getElementById("popupStickerImage");

        if (typeLink) {
          typeLink.onclick = () => {
            document.getElementById("detailName").textContent = data.title;
            document.getElementById("detailDescription").textContent =
              data.detailDescription;
            document.getElementById("detailYear").textContent = data.year;
            document.getElementById("detailMembers").textContent =
              data.members;
            document.getElementById("detailLeus").textContent = data.leus;
            document.getElementById("detailRubric").textContent =
              data.rubric;
            document.getElementById("detailImage").src = data.image;

            document.getElementById(
              "stickerDetailOverlay"
            ).style.display = "flex";
          };
        }

        if (popupImage) {
          popupImage.onclick = () => {
            document.getElementById("largeOverlayImage").src =
              data.image;
            document.getElementById(
              "largeImageOverlay"
            ).style.display = "flex";
          };
        }
      }, 50);
    });

    /* ================= LOCATION MAP ================= */

    const locationSource = new VectorSource();

    const locationLayer = new VectorLayer({
      source: locationSource,
    });

    const locationMap = new Map({
      target: locationMapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        locationLayer,
      ],
      view: new View({
        center: fromLonLat([0, 20]),
        zoom: 2,
      }),
    });

    locationMap.on("click", (event) => {
      locationSource.clear();
      selectedCoordinates = toLonLat(event.coordinate);

      const marker = new Feature({
        geometry: new Point(event.coordinate),
      });

      marker.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: "#22c55e" }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 2,
            }),
          }),
        })
      );

      locationSource.addFeature(marker);
    });

    /* ================= UI ================= */

    document.getElementById("toggleSortDropdown").onclick = () => {
      const d = document.getElementById("sortDropdown");
      d.style.display = d.style.display === "flex" ? "none" : "flex";
    };

    document.getElementById("openStickerOverlay").onclick = () =>
      (document.getElementById("stickerOverlay").style.display =
        "flex");

    document.getElementById("openPictureOverlay").onclick = () =>
      (document.getElementById("pictureOverlay").style.display =
        "flex");

    document.getElementById("openStickerIdOverlay").onclick = () =>
      (document.getElementById("stickerIdOverlay").style.display =
        "flex");

    document.getElementById("openLocationOverlay").onclick = () => {
      document.getElementById("locationOverlay").style.display =
        "flex";
      setTimeout(() => locationMap.updateSize(), 100);
    };

    document.querySelectorAll(".logo-item").forEach((logo) => {
      logo.onclick = () => {
        selectedStickerType = logo.textContent;
        document.getElementById("stickerIdOverlay").style.display =
          "none";
      };
    });

    document.getElementById("detailImage").onclick = () => {
      document.getElementById("largeOverlayImage").src =
        document.getElementById("detailImage").src;
      document.getElementById("largeImageOverlay").style.display =
        "flex";
    };

    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.onclick = () => {
        document.getElementById(btn.dataset.close).style.display =
          "none";
      };
    });

    document.getElementById("saveStickerBtn").onclick = () => {
      const title =
        document.getElementById("titleInput").value ||
        "Untitled Sticker";

      const description =
        document.getElementById("descriptionInput").value ||
        "No description";

      createStickerFeature({
        title,
        description,
        stickerId: selectedStickerType,
        image:
          "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg",
        detailDescription: "Detailed info",
        year: "2026",
        members: "Placeholder",
        leus: "Placeholder",
        rubric: "Placeholder",
        coordinates: selectedCoordinates,
      });

      document.getElementById("stickerOverlay").style.display =
        "none";
    };
  }, []);

  return (
    <div className="app">
      <div id="map" ref={mapRef}></div>

      <div className="right-controls">
        <button className="control-btn" id="openStickerOverlay">
          + Add Sticker
        </button>

        <button className="control-btn" id="toggleSortDropdown">
          Sort Stickers
        </button>

        <div className="dropdown" id="sortDropdown">
          <label><input type="checkbox" defaultChecked /> Logo A</label>
          <label><input type="checkbox" defaultChecked /> Logo B</label>
          <label><input type="checkbox" defaultChecked /> Logo C</label>
          <label><input type="checkbox" defaultChecked /> Logo D</label>
        </div>
      </div>

      <div id="popup">
        <div className="popup" id="popupContent"></div>
      </div>

  
      <div className="overlay" id="stickerOverlay">
        <div className="overlay-content">
          <h2>Add Sticker</h2>
          <button className="close-btn" data-close="stickerOverlay">×</button>

          <input id="titleInput" placeholder="Sticker title" />
          <textarea id="descriptionInput"></textarea>

          <button id="saveStickerBtn" className="save-btn">
            Save Sticker
          </button>
        </div>
      </div>

      <div className="overlay" id="locationOverlay">
        <div className="overlay-content">
          <h2>Select Location</h2>
          <button className="close-btn" data-close="locationOverlay">×</button>

          <div id="locationMap" ref={locationMapRef}></div>
        </div>
      </div>

      <div className="overlay" id="pictureOverlay">
        <div className="overlay-content">
          <h2>Add Picture</h2>
          <button className="close-btn" data-close="pictureOverlay">×</button>
          <input type="file" multiple accept="image/*" />
        </div>
      </div>

      <div className="overlay" id="stickerIdOverlay">
        <div className="overlay-content">
          <h2>Select Logo</h2>
          <button className="close-btn" data-close="stickerIdOverlay">×</button>

          <div className="logo-grid">
            <div className="logo-item">Logo A</div>
            <div className="logo-item">Logo B</div>
            <div className="logo-item">Logo C</div>
            <div className="logo-item">Logo D</div>
          </div>
        </div>
      </div>

      <div className="overlay" id="stickerDetailOverlay">
        <div className="overlay-content">
          <h2>Sticker Info</h2>
          <button className="close-btn" data-close="stickerDetailOverlay">×</button>

          <p id="detailName"></p>
          <p id="detailDescription"></p>
          <p id="detailYear"></p>
          <p id="detailMembers"></p>
          <p id="detailLeus"></p>
          <p id="detailRubric"></p>

          <img id="detailImage" className="popup-image" />
        </div>
      </div>

      <div className="overlay" id="largeImageOverlay">
        <div className="overlay-content">
          <h2>Image</h2>
          <button className="close-btn" data-close="largeImageOverlay">×</button>
          <img id="largeOverlayImage" className="large-image" />
        </div>
      </div>
    </div>
  );
};

export default StickerTracker;