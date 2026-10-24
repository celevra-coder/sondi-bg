/* SONDI_PLD_VISUAL_THREE_MAPS_64O */
(function () {
  "use strict";

  if (window.sondiPlovdivThreeMapsInitialized) return;
  window.sondiPlovdivThreeMapsInitialized = true;

  if (typeof L === "undefined" || typeof map === "undefined") {
    console.warn("Plovdiv layers: Leaflet map not available");
    return;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function coverageColor(n) {
    if (n >= 85) return "#167d55";
    if (n >= 65) return "#76a86b";
    if (n >= 45) return "#d7b955";
    return "#cc8358";
  }

  function sourceText(sources) {
    if (!Array.isArray(sources) || !sources.length) return "";
    return "<details><summary>Източници (" + sources.length +
      ")</summary><div style='max-height:150px;overflow:auto'>" +
      sources.map(function (s) {
        return "<div style='overflow-wrap:anywhere'>" + esc(s) + "</div>";
      }).join("") + "</div></details>";
  }

  function municipalityPopup(props, mode) {
    var html = "<strong>Община " + esc(props.name_bg) + "</strong>";
    html += "<div style='font-size:12px;margin-top:5px'>" +
      "Административна граница, не граница на скални формации.</div>";

    if (mode === "coverage") {
      html += "<p><strong>Картографско покритие</strong></p>";
      html += "<div>Директно разчетено: " +
        Number(props.direct_pct).toFixed(2) + "%</div>";
      html += "<div>Регионално попълване: " +
        Number(props.gap_fill_pct).toFixed(2) + "%</div>";
      html += "<div>Неразчетено: " +
        Number(props.unreadable_pct).toFixed(2) + "%</div>";
      html += "<p style='font-size:12px'>Това не е надеждност на " +
        "прогноза за литологията в дълбочина.</p>";
    } else {
      html += "<p><strong>Регионални геоложки сведения</strong></p>";
      (props.geological_notes || []).slice(0, 6).forEach(function (note) {
        html += "<details style='margin:5px 0'><summary>" +
          esc(note.title) + "</summary>";
        (note.paragraphs || []).slice(0, 6).forEach(function (paragraph) {
          html += "<p style='font-size:12px'>" + esc(paragraph) + "</p>";
        });
        html += "</details>";
      });
      html += "<p style='font-size:12px'>Описанията са регионални " +
        "или за отделни проучени райони, не точни пластове " +
        "под избрания имот.</p>";
    }

    html += sourceText(props.sources);
    return "<div style='min-width:210px;max-width:320px'>" + html + "</div>";
  }

  fetch("/geology-map/data/plovdiv_three_maps_v1.json")
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (data) {
      if (!data || data.region !== "PLD" ||
          !data.municipalities ||
          data.municipalities.features.length !== 18 ||
          !Array.isArray(data.boreholes) ||
          data.boreholes.length !== 5) {
        throw new Error("Invalid Plovdiv layer data");
      }

      var geologyLayer = L.geoJSON(data.municipalities, {
        style: function () {
          return {
            color: "#7145a0",
            weight: 2,
            fillColor: "#a78ac4",
            fillOpacity: 0.10
          };
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(municipalityPopup(feature.properties, "geology"));
        }
      });

      var coverageLayer = L.geoJSON(data.municipalities, {
        style: function (feature) {
          var color = coverageColor(feature.properties.direct_pct);
          return {
            color: "#555",
            weight: 1,
            fillColor: color,
            fillOpacity: 0.48
          };
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(municipalityPopup(feature.properties, "coverage"));
        }
      });

      var depthLayer = L.layerGroup();

      data.boreholes.forEach(function (borehole) {
        var grade = borehole.coordinate_grade;
        var gradeLabel =
          grade === "OFFICIAL_EXACT"
            ? "Официално установено устие"
            : grade === "SOURCE_REPORTED_OFFICIAL"
              ? "Координати от официален източник"
              : "Приблизително кадастрално местоположение";

        var color =
          grade === "OFFICIAL_EXACT" ? "#154b8b" :
          grade === "SOURCE_REPORTED_OFFICIAL" ? "#337cb7" :
          "#a66d2f";

        var marker = L.circleMarker(
          [borehole.latitude, borehole.longitude],
          {
            radius: 7,
            color: "#fff",
            weight: 2,
            fillColor: color,
            fillOpacity: 0.95
          }
        );

        var html = "<strong>" + esc(borehole.name_bg) + "</strong>" +
          "<div style='font-size:12px;margin-top:5px'>" +
          esc(gradeLabel) + "</div>" +
          "<div style='font-size:12px'>Документирани интервали:</div>";

        borehole.intervals.forEach(function (interval) {
          html += "<div style='margin-top:5px;font-size:12px'>" +
            esc(interval.from_m) + "–" +
            esc(interval.to_m) + " м: " +
            esc(interval.material_bg) + "</div>";
        });

        html += "<p style='font-size:12px'>Данните се отнасят само до " +
          "референтния сондаж. Не доказват същите пластове " +
          "под съседните имоти.</p>";
        html += sourceText(borehole.source_ids);

        marker.bindPopup(html, { maxWidth: 340 });
        marker.addTo(depthLayer);
      });

      var layers = [
        {
          id: "sondi-pld-depth-layer",
          label: "Пловдив — сондажни дълбочини",
          layer: depthLayer
        },
        {
          id: "sondi-pld-geology-layer",
          label: "Пловдив — регионална геология",
          layer: geologyLayer
        },
        {
          id: "sondi-pld-coverage-layer",
          label: "Пловдив — покритие и източници",
          layer: coverageLayer
        }
      ];

      if (typeof rightLayerControl !== "undefined" &&
          typeof rightLayerControl.addOverlay === "function") {
        layers.forEach(function (item) {
          rightLayerControl.addOverlay(item.layer, item.label);
        });
      }

      var panel = document.querySelector(".panel");
      if (panel) {
        var container = document.createElement("div");
        container.className = "layerbox";
        container.id = "sondi-pld-layer-controls";

        var heading = document.createElement("strong");
        heading.textContent = "Пловдив — геоложки слоеве";
        container.appendChild(heading);

        var hint = document.createElement("div");
        hint.className = "small";
        hint.textContent =
          "Регионални сведения и референтни сондажи; " +
          "без автоматични прогнози за пластовете.";
        container.appendChild(hint);

        layers.forEach(function (item) {
          var label = document.createElement("label");
          label.className = "layerrow";
          label.style.cursor = "pointer";

          var input = document.createElement("input");
          input.type = "checkbox";
          input.id = item.id;
          input.checked = map.hasLayer(item.layer);

          var text = document.createElement("span");
          text.textContent = item.label;

          label.appendChild(input);
          label.appendChild(text);
          container.appendChild(label);

          input.addEventListener("change", function () {
            if (input.checked) item.layer.addTo(map);
            else map.removeLayer(item.layer);
          });

          map.on("layeradd", function (event) {
            if (event.layer === item.layer) input.checked = true;
          });
          map.on("layerremove", function (event) {
            if (event.layer === item.layer) input.checked = false;
          });
        });

        panel.appendChild(container);
      }

      console.info("SONDI Plovdiv: three visual layers registered");
    })
    .catch(function (error) {
      console.error("SONDI Plovdiv layer initialization:", error);
    });
})();
