require("waypoints");

import { geoMercator, geoPath} from "d3-geo";
import { select, selectAll } from "d3-selection";
import { feature } from "topojson";

export const Scrollmap = class Scrollmap {
  constructor (options) {
    this.el = options.el;

    if (this.el === null) {
      return false;
    }

    if (options.scrollmapFile === void 0) {
      throw new Error("scrollmapFile option is required");
    }
    this._scrollmapFile = options.scrollmapFile;

    this._map = this.el.querySelector(".js-Map");

    this._initScrollmap();
  }

  _initScrollmap () {
    if (window.innerWidth < 1280) {
      return;
    }

    const height = 720;

    const svg = select(".js-Map")
      .append("svg")
      .attr("width", 360)
      .attr("height", height);

    const projection = geoMercator()
      .center([101.3097594, 15.8565707])
      .scale(2400)
      .translate([0, height / 2]);

    const path = geoPath()
      .projection(projection);

    svg
      .selectAll(".Country")
      .data(feature(this._scrollmapFile, this._scrollmapFile.objects.world_borders_hd_copy).features)
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
        this.el.querySelector("#" + d.properties.slug).scrollIntoView({
          behavior: "smooth"
        });
      });

    this._initEvents();
  }

  _initEvents () {
    document.addEventListener("DOMContentLoaded", () => this._fixScrollmap());

    window.addEventListener("scroll", () => this._fixScrollmap());
    window.addEventListener("resize", () => this._fixScrollmap());

    const scrollmapTitles = document.querySelectorAll(".js-Scrollmap-title");

    scrollmapTitles.forEach(scrollmapTitleEl => {
      /* eslint-disable no-unused-vars, no-undef */
      const scrollmapTitleWaypointDown = new Waypoint({
      /* eslint-enable no-unused-vars, no-undef */

        element: scrollmapTitleEl,
        handler: direction => {
          if (direction === "down") {
            const id = scrollmapTitleEl.id;

            if (this.el.querySelector(".js-City-label--" + id) !== null) {
              this._activeCity(id);

              let mapTitles = [];
              let prevEl = scrollmapTitleEl.previousElementSibling;

              while (prevEl) {
                if (prevEl.classList.contains("js-Scrollmap-title")) {
                  mapTitles.push(prevEl);
                }

                prevEl = prevEl.previousElementSibling;
              }

              mapTitles.forEach(mapTitleEl => {
                select(".js-City-label--" + mapTitleEl.id).classed("is-visited", true);
                selectAll(".js-Route--" + id).classed("is-active", true);
              });
            }
          }
        },
        offset: window.innerHeight
      });

      /* eslint-disable no-unused-vars, no-undef */
      const scrollmapTitleWaypointUp = new Waypoint({
      /* eslint-enable no-unused-vars, no-undef */
        element: scrollmapTitleEl,
        handler: direction => {
          if (direction === "up") {
            const id = scrollmapTitleEl.id;

            if (this.el.querySelector(".js-City-label--" + id) !== null) {
              this._activeCity(id);

              let mapTitles = [];
              let nextEl = scrollmapTitleEl.nextElementSibling;

              while (nextEl) {
                if (nextEl.classList.contains("js-Scrollmap-title")) {
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
        }
      });
    });

    /* eslint-disable no-unused-vars, no-undef */
    const stickyWaypoint = new Waypoint({
    /* eslint-enable no-unused-vars, no-undef */
      element: this.el.querySelector(".js-Sticky"),
      handler: direction => {
        if (direction === "down") {
          this._map.classList.add("is-bottom");
        }

        if (direction === "up") {
          this._map.classList.remove("is-bottom");
        }
      },
      offset: 720
    });
  }

  _activeCity (id) {
    selectAll(".js-City").classed("is-active", false);
    select(".js-City--" + id).classed("is-active", true);

    selectAll(".js-City-label").classed("is-active", false);
    select(".js-City-label--" + id).classed("is-active is-visited", true);
  }

  _fixScrollmap () {
    var scroll = document.body.scrollTop;

    if (scroll >= 642) {
      this._map.classList.add("is-fixed");
    } else {
      this._map.classList.remove("is-fixed");
    }
  }
};
