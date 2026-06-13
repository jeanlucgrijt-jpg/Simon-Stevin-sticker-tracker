import { useEffect, useRef } from "react";
import "./StickerMap.css";

import "ol/ol.css";

import Map from "ol/Map";
import View from "ol/View";
import Overlay from "ol/Overlay";

import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";

import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import { fromLonLat, toLonLat } from "ol/proj";

import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";

import testImage from "../../pictures_site/native/test.png";

const StickerTracker = () => {
  const mapRef = useRef(null);
  const locationMapRef = useRef(null);
  const popupRef = useRef(null);
  const popupContentRef = useRef(null);

  useEffect(() => {
      let selectedCoordinates = [5.4697, 51.4416];
      let tempCoordinates = selectedCoordinates;
      let selectedStickerType = "Logo A";
      let selectedImageFile = null;
      let selectedImagePreview = testImage;
      let userLocation =
    [5.4697, 51.4416];

  navigator.geolocation
    .getCurrentPosition(
      (position) => {

        userLocation = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        const userMarker =
          new Feature({
            geometry: new Point(
              fromLonLat(
                userLocation
              )
            ),
          });

        userMarker.setStyle(
          new Style({
            image:
              new CircleStyle({
                radius: 10,
                fill:
                  new Fill({
                    color:
                      "#e76a03dc",
                  }),
                stroke:
                  new Stroke({
                    color:
                      "#ffffff",
                    width: 3,
                  }),
              }),
          })
        );

        stickerSource.addFeature(
          userMarker
        );
      }
    );

    /* ===================================================== */
    /* MAIN MAP */
    /* ===================================================== */

    const stickerSource = new VectorSource();

    const stickerLayer = new VectorLayer({
      source: stickerSource,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url:
              "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          }),
        }),
        stickerLayer,
      ],
      view: new View({
        center: fromLonLat([5.4697, 51.4416]),
        zoom: 4,
      }),
    });

    const popupOverlay = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      offset: [0, -20],
    });

    map.addOverlay(popupOverlay);

    const popupContent = popupContentRef.current;

    /* ===================================================== */
    /* CREATE STICKER FEATURE */
    /* ===================================================== */

    function createStickerFeature(data) {
      const coordinates = data.coordinates.map(Number);

      if (
        coordinates.length !== 2 ||
        !coordinates.every(Number.isFinite)
      ) {
        console.warn(
          "Skipping sticker with invalid coordinates:",
          data
        );
        return null;
      }

      const feature = new Feature({
        geometry: new Point(
          fromLonLat(coordinates)
        ),
        stickerData: data,
      });

      feature.set("stickerType", data.stickerId);

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({
              color: "#38bdf8",
            }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 2,
            }),
          }),
        })
      );

      stickerSource.addFeature(feature);
      return feature;
    }

    /* ===================================================== */
    /* LOAD STICKERS FROM DATABASE */
    /* ===================================================== */

    async function loadStickersFromDatabase() {
      try {
        const stickerResponse = await fetch(
          "http://127.0.0.1:5000/stickerData"
        );

        const committeeResponse = await fetch(
          "http://127.0.0.1:5000/committeeData"
        );

        const photoResponse = await fetch(
          "http://127.0.0.1:5000/photoData"
        );

        const stickerJson = await stickerResponse.json();
        const committeeJson = await committeeResponse.json();
        const photoJson = await photoResponse.json();
        console.log("Sticker Data:", stickerJson);
        console.log("Committee Data:", committeeJson);
        console.log("Photo Data:", photoJson);

        const committeeMap = {};
        const photoMap = {};

        committeeJson.committeeData.forEach((committee) => {
          committeeMap[committee.stickerId] = committee;
        });

        photoJson.photoData.forEach((photo) => {
          photoMap[photo.photoId] = photo;
        });

        stickerJson.stickerData.forEach((sticker) => {
          const committee =
            committeeMap[sticker.stickerId] || {};

          const photo =
            photoMap[sticker.photoId] || {};

          createStickerFeature({
            title:
              sticker.title || "Untitled Sticker",

            datePicture:
              sticker.datePicture ||
              sticker.date_picture,

            description:
              sticker.description || "No description",

            stickerId:
              sticker.stickerId || "Unknown",

            image:
              photo.imagePath
                  ? `http://127.0.0.1:5000/${photo.imagePath}`
                  : testImage,

            detailDescription:
              committee.stickerDescription ||
              "No committee description",

            year:
              committee.stickerDate || "2026",

            members:
              committee.committeeMembers ||
                            "Unknown",

            leus:
              committee.committeeLeus || "Unknown",

            rubric:
              committee.committeeRubric || "Unknown",

            coordinates: [
              parseFloat(
                sticker.longitude ??
                sticker.longtidue
              ),
              parseFloat(sticker.latitude),
            ],
          });
        });
      } catch (error) {
        console.error("Failed loading stickers:", error);
      }
    }

    loadStickersFromDatabase();

    /* ===================================================== */
    /* CLICK HANDLER */
    /* ===================================================== */

    map.on("click", (event) => {
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );

      if (!feature) {
        popupOverlay.setPosition(undefined);
        return;
      }

      const data = feature.get("stickerData");

      if (!data) {
        popupOverlay.setPosition(undefined);
        return;
      }


      const coordinates =
        feature.getGeometry().getCoordinates();

      popupContent.innerHTML = `
        <h3>${data.title}</h3>

        <p>
          <strong>Date:</strong>
          ${
            data.datePicture
              ? new Date(
                  data.datePicture
                )
                  .toISOString()
                  .split("T")[0]
              : "Unknown"
          }
        </p>

        <p>
          <strong>Description:</strong>
          ${data.description}
        </p>

        <p>
          <strong>Type:</strong>
          <span class="type-link" id="popupTypeLink">
            ${data.stickerId}
          </span>
        </p>

        <img
          src="${data.image}"
          class="popup-image"
                    id="popupStickerImage"
        />
      `;

      popupOverlay.setPosition(coordinates);

      setTimeout(() => {
        const typeLink =
          document.getElementById("popupTypeLink");

        const popupImage =
          document.getElementById("popupStickerImage");

        if (typeLink) {
          typeLink.onclick = () => {
            document.getElementById(
              "detailName"
            ).textContent = data.title;

            document.getElementById(
              "detailDescription"
            ).textContent = data.detailDescription;

            document.getElementById(
              "detailYear"
            ).textContent = data.year;

            document.getElementById(
              "detailMembers"
            ).textContent = data.members;

            document.getElementById(
              "detailLeus"
            ).textContent = data.leus;

            document.getElementById(
              "detailRubric"
            ).textContent = data.rubric;

            document.getElementById(
              "detailImage"
            ).src = data.image;

            document.getElementById(
              "stickerDetailOverlay"
            ).style.display = "flex";
          };
        }

        if (popupImage) {
          popupImage.onclick = () => {
            document.getElementById(
              "largeOverlayImage"
            ).src = data.image;

            document.getElementById(
              "largeImageOverlay"
            ).style.display = "flex";
          };
        }
      }, 50);
    });

    /* ===================================================== */
    /* LOCATION MAP */
    /* ===================================================== */
    
    const locationSource = new VectorSource();

    const locationLayer = new VectorLayer({
      source: locationSource,
    });

    const locationMap = new Map({
      target: locationMapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url:
              "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          }),
        }),
        locationLayer,
      ],
      view: new View({
        center: fromLonLat([0, 20]),
        zoom: 2,
      }),
    });

    locationMap.on("click", (event) => {
      locationSource.clear();

      tempCoordinates =
        toLonLat(event.coordinate);

      const marker = new Feature({
        geometry: new Point(event.coordinate),
      });

      marker.setStyle(
        new Style({
          image: new CircleStyle({          
                        radius: 8,
            fill: new Fill({
              color: "#22c55e",
            }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 2,
            }),
          }),
        })
      );

      locationSource.addFeature(marker);
    });

    const confirmLocationBtn =
      document.getElementById(
        "confirmLocationBtn"
      );

    if (confirmLocationBtn) {
      confirmLocationBtn.onclick = () => {
        selectedCoordinates =
          [...tempCoordinates];

        const button =
          document.getElementById(
            "openLocationOverlay"
          );

        if (button) {
          button.textContent =
            "Change Location";
        }

        document.getElementById(
          "locationOverlay"
        ).style.display = "none";
      };
    }

    const pictureInput =
      document.getElementById(
        "pictureInput"
      );

    if (pictureInput) {
      pictureInput.onchange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        selectedImageFile = file;

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/heic",
          "image/heif"
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(
            "Only JPG, JPEG, PNG, HEIC and HEIF files are allowed."
          );

          event.target.value = "";
          return;
        }

        const reader = new FileReader();

        reader.onload = (loadEvent) => {
          selectedImagePreview =
            loadEvent.target.result;

          const pictureButton =
            document.getElementById(
              "openPictureOverlay"
            );

          if (pictureButton) {
            pictureButton.textContent =
              "Change Picture";
          }

          const preview =
            document.getElementById(
              "currentStickerPreview"
            );

          preview.onclick = () => {

            document.getElementById(
              "largeOverlayImage"
            ).src =
              preview.src;

            document.getElementById(
              "largeImageOverlay"
            ).style.display =
              "flex";
          };

          const stickerPreview =
            document.getElementById(
              "currentStickerPreview"
            );

          if (preview) {
            preview.src =
              selectedImagePreview;
          }

          if (stickerPreview) {
            stickerPreview.src =
              selectedImagePreview;
          }
        };

        reader.readAsDataURL(file);
      };
    }

    const goToLocationBtn =
      document.getElementById(
        "goToLocationBtn"
      );

    if (goToLocationBtn) {
      goToLocationBtn.onclick = () => {
        map.getView().animate({
          center: fromLonLat(userLocation),
          zoom: 13,
          duration: 1000,
        });
      };
    }

    const pickMyLocationBtn =
      document.getElementById(
        "pickMyLocationBtn"
      );

    if (pickMyLocationBtn) {

      pickMyLocationBtn.onclick = () => {

        selectedCoordinates =
          [...userLocation];

        locationSource.clear();

        const marker =
          new Feature({
            geometry:
              new Point(
                fromLonLat(userLocation)
              ),
          });

        locationSource.addFeature(
          marker
        );

        locationMap
          .getView()
          .animate({
            center:
              fromLonLat(
                userLocation
              ),
            zoom: 15,
          });
      };
    }

    /* ===================================================== */
    /* SORT BUTTON */
    /* ===================================================== */  

    const toggleSortDropdown =
      document.getElementById(
        "toggleSortDropdown"
      );

    if (toggleSortDropdown) {
      toggleSortDropdown.onclick = () => {
        const dropdown =
          document.getElementById(
            "sortDropdown"
          );

        if (!dropdown) return;

        dropdown.style.display =
          dropdown.style.display === "flex"
            ? "none"
            : "flex";
      };
    }

    function updateStickerVisibility() {

      const enabledTypes = [];

      document
        .querySelectorAll(
          "#sortDropdown input"
        )
        .forEach((checkbox) => {

          if (checkbox.checked) {
            enabledTypes.push(
              checkbox.dataset.type
            );
          }
        });

      stickerSource
        .getFeatures()
        .forEach((feature) => {

          const type =
            feature.get(
              "stickerType"
            );

          const data =
            feature.get(
              "stickerData"
            );

          if (!data) return;

          if (
            enabledTypes.includes(type)
          ) {

            feature.setStyle(
              new Style({
                image:
                  new CircleStyle({
                    radius: 8,
                    fill:
                      new Fill({
                        color:
                          "#38bdf8",
                      }),
                    stroke:
                      new Stroke({
                        color:
                          "#ffffff",
                        width: 2,
                      }),
                  }),
              })
            );

          } else {

            feature.setStyle(
              new Style({})
            );
          }
        });
    }

    document
      .querySelectorAll(
        "#sortDropdown input"
      )
      .forEach((checkbox) => {

        checkbox.addEventListener(
          "change",
          updateStickerVisibility
        );
      });


    /* ===================================================== */
    /* OPEN OVERLAYS */
    /* ===================================================== */

    const openStickerOverlay =
      document.getElementById(
        "openStickerOverlay"
      );

    if (openStickerOverlay) {
      openStickerOverlay.onclick = () => {
        document.getElementById(
          "stickerOverlay"
        ).style.display = "flex";

        const dateInput =
          document.getElementById(
            "datePictureInput"
          );

        if (
          dateInput &&
          !dateInput.value
        ) {
          dateInput.value =
            new Date()
              .toISOString()
              .split("T")[0];
        }

      };
    }

    const openPictureOverlay =
      document.getElementById(
        "openPictureOverlay"
      );

    if (openPictureOverlay) {
      openPictureOverlay.onclick = () => {
        document.getElementById(
          "pictureOverlay"
        ).style.display = "flex";
      };
    }

    const openStickerIdOverlay =
      document.getElementById(
        "openStickerIdOverlay"
      );

    if (openStickerIdOverlay) {
      openStickerIdOverlay.onclick = () => {
        document.getElementById(
          "stickerIdOverlay"
        ).style.display = "flex";
      };
    }

    const openLocationOverlay =
      document.getElementById(
                "openLocationOverlay"
      );

    if (openLocationOverlay) {
      openLocationOverlay.onclick = () => {
        document.getElementById(
          "locationOverlay"
        ).style.display = "flex";

        setTimeout(() => {
          locationMap.updateSize();
        }, 100);
      };
    }

    /* ===================================================== */
    /* LOGO SELECTION */
    /* ===================================================== */

    document
      .querySelectorAll(".logo-item")
      .forEach((logo) => {
        logo.onclick = () => {

          selectedStickerType =
            logo.textContent;

          const button =
            document.getElementById(
              "openStickerIdOverlay"
            );

          if (button) {
            button.textContent =
              selectedStickerType;
          }

          document.getElementById(
            "stickerIdOverlay"
          ).style.display = "none";
        };
      });

    /* ===================================================== */
        /* LARGE IMAGE OVERLAY */
    /* ===================================================== */

    const detailImage =
      document.getElementById("detailImage");

    if (detailImage) {
      detailImage.onclick = () => {
        document.getElementById(
          "largeOverlayImage"
        ).src = detailImage.src;

        document.getElementById(
          "largeImageOverlay"
        ).style.display = "flex";
      };
    }

    /* ===================================================== */
    /* CLOSE BUTTONS */
    /* ===================================================== */

    document
      .querySelectorAll("[data-close]")
      .forEach((button) => {
        button.onclick = () => {
          document.getElementById(
            button.dataset.close
          ).style.display = "none";
        };
      });

    /* ===================================================== */
    /* SAVE STICKER */
    /* ===================================================== */

    const saveStickerBtn =
      document.getElementById(
        "saveStickerBtn"
      );

    if (saveStickerBtn) {
      saveStickerBtn.onclick = async () => {
        const title =
          document.getElementById(
            "titleInput"
          ).value || "Untitled Sticker";

        const description =
          document.getElementById(
            "descriptionInput"
          ).value || "No description";

        const datePicture =
          document.getElementById(
            "datePictureInput"
          ).value;

          {/* user_id needs the fix/script from flip*/}
        const payload = {
          user_id: 1, 
          latitude:
            selectedCoordinates[1].toString(),
          longitude:
            selectedCoordinates[0].toString(),
          date_picture:
            datePicture,
          sticker_id: selectedStickerType,
          title,
          description,
        };

        try {
          const response = await fetch(
            "http://127.0.0.1:5000/upload_sticker",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          const result = await response.json();

          if (!response.ok) {
            console.error(result.message);
            return;
          }

          if (selectedImageFile) {

            const imageForm =
              new FormData();

            imageForm.append(
              "photo_id",
              result.photo_id
            );

            imageForm.append(
              "image",
              selectedImageFile
            );

            const imageResponse =
              await fetch(
                "http://127.0.0.1:5000/upload_photo_file",
                {
                  method: "POST",
                  body: imageForm,
                }
              );

            const imageResult =
              await imageResponse.json();

            console.log(
              "Image upload:",
              imageResult
            );
          }

          createStickerFeature({
            title,
            description,
            stickerId: selectedStickerType,
            image: testImage,
            detailDescription:
              "Detailed information",
            year: "2026",
            members: "Placeholder",
            leus: "Placeholder",
            rubric: "Placeholder",
            coordinates: selectedCoordinates,
          });

          document.getElementById(
            "stickerOverlay"
          ).style.display = "none";

        } catch (error) {
          console.error(
            "Upload failed:",
            error
          );
        }
      };
    }

    /* ===================================================== */
        /* CLEANUP */
    /* ===================================================== */

        return () => {
      map.removeOverlay(popupOverlay);
      map.setTarget(null);
      locationMap.setTarget(null);
    };
  }, []);

  return (
    <div className="app">
      <div id="map" ref={mapRef}></div>

      {/* ===================================================== */}
      {/* RIGHT CONTROLS */}
      {/* ===================================================== */}

    <div className="right-controls">
      <button
        className="control-btn"
        id="openStickerOverlay"
      >
        + Add Sticker
      </button>

      <button
        className="control-btn"
        id="toggleSortDropdown"
      >
        Sort Stickers
      </button>

      <button
        className="control-btn"
        id="goToLocationBtn"
      >
        My Location
      </button>

      <div className="dropdown" id="sortDropdown">
        <label>
          <input 
          type="checkbox" 
          data-type="Logo A"
          defaultChecked 
        />
          Logo A
        </label>

        <label>
          <input 
          type="checkbox" 
          data-type="Logo B"  
          defaultChecked 
        />
          Logo B
        </label>

        <label>
          <input 
          type="checkbox" 
          data-type="Logo C"  
          defaultChecked 
        />
          Logo C
        </label>

        <label>
          <input 
          type="checkbox" 
          data-type="Logo D"  
          defaultChecked 
        />
          Logo D
        </label>
      </div>
    </div>

      {/* ===================================================== */}
      {/* POPUP */}
      {/* ===================================================== */}

      <div id="popup" ref={popupRef}>
        <div
          className="popup"
          id="popupContent"
          ref={popupContentRef}
        ></div>
      </div>

      {/* ===================================================== */}
      {/* ADD STICKER OVERLAY */}
      {/* ===================================================== */}

      <div
        className="overlay"
        id="stickerOverlay"
      >
        <div className="overlay-content">

          <div className="overlay-header">
            <h2>Add Sticker</h2>

            <button
              className="close-btn"
              data-close="stickerOverlay"
            >
              ×
            </button>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>Location</label>

              <button
                className="secondary-btn"
                id="openLocationOverlay"
              >
                Select Location
              </button>
            </div>

            <div className="form-group">
              <label>Sticker Type</label>

              <button
                className="secondary-btn"
                id="openStickerIdOverlay"
              >
                Select Sticker Type
              </button>
            </div>

            <div className="form-group full">
              <label>Title</label>

              <input
                id="titleInput"
                placeholder="Sticker title"
              />
            </div>

            <div className="form-group">
              <label>Date Picture</label>
              <input
                id="datePictureInput"
                type="date"
              />
            </div>

            <div className="form-group full">
              <label>Description</label>

              <textarea id="descriptionInput"></textarea>
            </div>

          </div>

          <img
            id="currentStickerPreview"
            className="popup-image"
            src={testImage}
            alt=""
          />

          <div className="secondary-actions">
            <button
              id="openPictureOverlay"
              className="secondary-btn"
            >
              Add Picture
            </button>
          </div>

          <button
            id="saveStickerBtn"
            className="save-btn"
          >
            Save Sticker
          </button>

        </div>
      </div>

      {/* ===================================================== */}
      {/* LOCATION OVERLAY */}
      {/* ===================================================== */}

      <div
        className="overlay"
        id="locationOverlay"
      >
        <div className="overlay-content">

          <div className="overlay-header">
            <h2>Select Location</h2>

            <button
              className="close-btn"
              data-close="locationOverlay"
            >
              ×
            </button>
          </div>

          <div
            id="locationMap"
            ref={locationMapRef}
          ></div>

          <button
            id="pickMyLocationBtn"
            className="secondary-btn"
          >
            My Location
          </button>

          <button
            id="confirmLocationBtn"
            className="save-btn"
          >
            Confirm Location
          </button>

        </div>
      </div>

      {/* ===================================================== */}
      {/* PICTURE OVERLAY */}
      {/* ===================================================== */}

      <div
        className="overlay"
        id="pictureOverlay"
      >
        <div className="overlay-content">

          <div className="overlay-header">
            <h2>Add Picture</h2>

            <button
              className="close-btn"
              data-close="pictureOverlay"
            >
              ×
            </button>
          </div>

          <img
            id="picturePreview"
            className="popup-image"
            src={testImage}
            alt=""
          />

          <input
            id="pictureInput"
            type="file"
            accept=".jpg,.jpeg,.png,.heic,.heif"
          />

          <button
            id="confirmPictureBtn"
            className="save-btn"
          >
            Confirm Picture
          </button>

        </div>
      </div>

      {/* ===================================================== */}
      {/* STICKER TYPE OVERLAY */}
      {/* ===================================================== */}

      <div
        className="overlay"
        id="stickerIdOverlay"
      >
        <div className="overlay-content">

          <div className="overlay-header">
            <h2>Select Logo</h2>

            <button
              className="close-btn"
              data-close="stickerIdOverlay"
            >
              ×
            </button>
          </div>

          <div className="logo-grid">

            <div className="logo-item">
              Logo A
            </div>

            <div className="logo-item">
              Logo B
            </div>

            <div className="logo-item">
              Logo C
            </div>

            <div className="logo-item">
              Logo D
            </div>

          </div>

        </div>
      </div>

      {/* ===================================================== */}
      {/* DETAIL OVERLAY */}
      {/* ===================================================== */}

      <div
        className="overlay"
        id="stickerDetailOverlay"
      >
        <div className="overlay-content">

          <div className="overlay-header">
            <h2>Sticker Information</h2>

            <button
              className="close-btn"
              data-close="stickerDetailOverlay"
            >
              ×
            </button>
          </div>

          <div className="detail-box">
            <strong>Name:</strong>
            <p id="detailName"></p>
          </div>

          <div className="detail-box">
            <strong>Description:</strong>
            <p id="detailDescription"></p>
          </div>

          <div className="detail-box">
            <strong>Year:</strong>
            <p id="detailYear"></p>
          </div>

          <div className="detail-box">
            <strong>Members:</strong>
            <p id="detailMembers"></p>
          </div>

          <div className="detail-box">
            <strong>Leus:</strong>
            <p id="detailLeus"></p>
          </div>

          <div className="detail-box">
            <strong>Rubric:</strong>
            <p id="detailRubric"></p>
          </div>

          <img
            id="detailImage"
            className="popup-image"
            src={testImage}
            alt="Sticker"
          />

        </div>
      </div>

      {/* ===================================================== */}
      {/* LARGE IMAGE OVERLAY */}
      {/* ===================================================== */}

      <div
        className="overlay"id="largeImageOverlay"
      >
        <div className="overlay-content">

          <div className="overlay-header">
            <h2>Sticker Image</h2>

            <button
              className="close-btn"
              data-close="largeImageOverlay"
            >
              ×
            </button>
          </div>

          <img
            id="largeOverlayImage"
            className="large-image"
            src={testImage}
            alt="Large Sticker"
          />

        </div>
      </div>

    </div>
  );
};

export default StickerTracker;
