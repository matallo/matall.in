import "intersection-observer";
import scrollama from "scrollama";

import { geoMercator, geoPath} from "d3-geo";
import { select, selectAll } from "d3-selection";
import { feature } from "topojson";

class Scrollmap {
  constructor (options) {
    if (options.containerEl === void 0) {
      throw new Error("containerEl option is required");
    }

    if (options.scrollmapFile === void 0) {
      throw new Error("scrollmapFile option is required");
    }

    this._containerEl = options.containerEl;
    this._scrollmapFile = options.scrollmapFile;
    this._scrollmapCenter = options.scrollmapCenter;
    this._graphicEl = this._containerEl.querySelector(".js-Scroll-graphic");
  }

  init () {
    const width = 300;
    const height = 600;

    const svg = select(".js-Scroll-graphic")
      .append("svg")
      .classed("Chart", true)
      .attr("width", width)
      .attr("height", height);

    const country = this._scrollmapFile.objects.world_borders_hd_copy;

    const projection = geoMercator()
      .center(this._scrollmapCenter)
      .fitSize([width, height], feature(this._scrollmapFile, country));

    const path = geoPath()
      .projection(projection);

    svg
      .selectAll(".Country")
      .data(feature(this._scrollmapFile, country).features)
      .enter()
      .append("path")
      .attr("class", "Country")
      .attr("d", path);

    svg
      .selectAll(".Route")
      .data(feature(this._scrollmapFile, this._scrollmapFile.objects.routes_1).features)
      .enter()
      .append("path")
      .attr("class", d => { return "Route " + (d.properties.display ? "" : "is-hidden"); })
      .attr("d", path);

    svg
      .selectAll(".Route--story")
      .data(feature(this._scrollmapFile, this._scrollmapFile.objects.routes_1).features)
      .enter()
      .append("path")
      .attr("class", d => `Route Route--story js-Route js-Route--${d.properties.route}`)
      .attr("d", path);

    svg
      .selectAll(".City")
      .data(feature(this._scrollmapFile, this._scrollmapFile.objects.cities_1).features)
      .enter()
      .append("path")
      .attr("class", d => `City js-City js-City--${d.properties.slug}`)
      .attr("d", path.pointRadius(2));

    svg
      .selectAll(".City-label")
      .data(feature(this._scrollmapFile, this._scrollmapFile.objects.cities_1).features)
      .enter()
      .append("text")
      .attr("class", d => `City-label js-City-label js-City-label--${d.properties.slug}`)
      .attr("transform", d => `translate(${projection(d.geometry.coordinates)})`)
      .text(d => d.properties.label ? d.properties.name : "")
      .attr("dy", "1.5em")
      .attr("dx", (d, i, j) => j[i].getBoundingClientRect().width / 2 * -1)
      .on("click", d => {
        this._containerEl.querySelector("#" + d.properties.slug).scrollIntoView({
          behavior: "smooth"
        });
      });

    this._initScroller();
  }

  _initScroller () {
    const scroller = scrollama();

    scroller
      .setup({
        container: ".js-Scroll",
        graphic: ".js-Scroll-graphic",
        text: ".js-Scroll-text",
        step: ".js-Scroll-step",
        offset: 0.5,
        debug: false
      })
      .onStepEnter(response => {
        const direction = response.direction;
        const target = response.element;
        const id = target.id;
        let mapTitles = [];

        if (direction === "down") {
          if (this._containerEl.querySelector(".js-City-label--" + id) !== null) {
            let prevEl = target.previousElementSibling;

            this._activeCity(id);

            while (prevEl) {
              if (prevEl.classList.contains("js-Scroll-step")) {
                mapTitles.push(prevEl);
              }

              prevEl = prevEl.previousElementSibling;
            }

            mapTitles.forEach(mapTitleEl => {
              select(".js-City-label--" + mapTitleEl.id).classed("is-visited", true);
              selectAll(".js-Route--" + id).classed("is-active", true);
            });
          }
        } else if (direction === "up") {
          if (this._containerEl.querySelector(".js-City-label--" + id) !== null) {
            let nextEl = target.nextElementSibling;

            this._activeCity(id);

            while (nextEl) {
              if (nextEl.classList.contains("js-Scroll-step")) {
                mapTitles.push(nextEl);
              }

              nextEl = nextEl.nextElementSibling;
            }

            mapTitles.forEach(mapTitleEl => {
              const nextId = mapTitleEl.id;

              select(".js-City-label--" + nextId).classed("is-visited", false);
              selectAll(".js-Route--" + nextId).classed("is-active", false);
            });
          }
        }
      })
      .onContainerEnter(() => {
        this._graphicEl.classList.add("is-fixed");
        this._graphicEl.classList.remove("is-bottom");
      })
      .onContainerExit(response => {
        this._graphicEl.classList.remove("is-fixed");
        this._graphicEl.classList.toggle("is-bottom", response.direction === "down");
      });

    window.addEventListener("resize", scroller.resize());
  }

  _activeCity (id) {
    selectAll(".js-City").classed("is-active", false);
    select(".js-City--" + id).classed("is-active", true);

    selectAll(".js-City-label").classed("is-active", false);
    select(".js-City-label--" + id).classed("is-active is-visited", true);
  }
}

export default Scrollmap;
