import 'intersection-observer';
import scrollama from 'scrollama';

import { geoMercator, geoPath } from 'd3-geo';
import { select, selectAll } from 'd3-selection';
import { feature } from 'topojson';

export const Scrollmap = class Scrollmap {
  constructor(options) {
    if (options.containerEl === undefined) {
      throw new Error('containerEl option is required');
    }

    if (options.scrollmapFile === undefined) {
      throw new Error('scrollmapFile option is required');
    }

    this.containerEl = options.containerEl;
    this.scrollmapFile = options.scrollmapFile;
    this.scrollmapCenter = options.scrollmapCenter;
    this.graphicEl = this.containerEl.querySelector('.js-Scroll-graphic');
  }

  init() {
    const width = 300;
    const height = 600;

    const svg = select('.js-Scroll-graphic')
      .append('svg')
      .classed('Chart', true)
      .attr('width', width)
      .attr('height', height);

    const country = this.scrollmapFile.objects.world_borders_hd_copy;

    const projection = geoMercator()
      .center(this.scrollmapCenter)
      .fitSize([width, height], feature(this.scrollmapFile, country));

    const path = geoPath()
      .projection(projection);

    svg
      .selectAll('.Country')
      .data(feature(this.scrollmapFile, country).features)
      .enter()
      .append('path')
      .attr('class', 'Country')
      .attr('d', path);

    svg
      .selectAll('.Route')
      .data(feature(this.scrollmapFile, this.scrollmapFile.objects.routes).features)
      .enter()
      .append('path')
      .attr('class', d => `Route ${d.properties.display ? '' : 'is-hidden'}`)
      .attr('d', path);

    svg
      .selectAll('.Route--story')
      .data(feature(this.scrollmapFile, this.scrollmapFile.objects.routes).features)
      .enter()
      .append('path')
      .attr('class', d => `Route Route--story js-Route js-Route--${d.properties.route}`)
      .attr('d', path);

    svg
      .selectAll('.City')
      .data(feature(this.scrollmapFile, this.scrollmapFile.objects.cities_1).features)
      .enter()
      .append('path')
      .attr('class', d => `City js-City js-City--${d.properties.slug}`)
      .attr('d', path.pointRadius(2));

    svg
      .selectAll('.City-label')
      .data(feature(this.scrollmapFile, this.scrollmapFile.objects.cities_1).features)
      .enter()
      .append('text')
      .attr('class', d => `City-label js-City-label js-City-label--${d.properties.slug}`)
      .attr('transform', d => `translate(${projection(d.geometry.coordinates)})`)
      .text(d => (d.properties.label ? d.properties.name : ''))
      .attr('dy', '1.5em')
      .attr('dx', (d, i, j) => (j[i].getBoundingClientRect().width / 2) * -1)
      .on('click', (d) => {
        this.containerEl.querySelector(`#${d.properties.slug}`).scrollIntoView({
          behavior: 'smooth',
        });
      });

    this.initScroller();
  }

  initScroller() {
    const scroller = scrollama();

    const activeCity = (id) => {
      selectAll('.js-City').classed('is-active', false);
      select(`.js-City--${id}`).classed('is-active', true);

      selectAll('.js-City-label').classed('is-active', false);
      select(`.js-City-label--${id}`).classed('is-active is-visited', true);
    };

    scroller
      .setup({
        container: '.js-Scroll',
        graphic: '.js-Scroll-graphic',
        text: '.js-Scroll-text',
        step: '.js-Scroll-step',
        offset: 0.5,
        debug: false,
      })
      .onStepEnter((response) => {
        const { direction } = response;
        const target = response.element;
        const { id } = target;
        const mapTitles = [];

        if (direction === 'down') {
          if (this.containerEl.querySelector(`.js-City-label--${id}`) !== null) {
            let prevEl = target.previousElementSibling;

            activeCity(id);

            while (prevEl) {
              if (prevEl.classList.contains('js-Scroll-step')) {
                mapTitles.push(prevEl);
              }

              prevEl = prevEl.previousElementSibling;
            }

            mapTitles.forEach((mapTitleEl) => {
              select(`.js-City-label--${mapTitleEl.id}`).classed('is-visited', true);
              selectAll(`.js-Route--${id}`).classed('is-active', true);
            });
          }
        } else if (direction === 'up') {
          if (this.containerEl.querySelector(`.js-City-label--${id}`) !== null) {
            let nextEl = target.nextElementSibling;

            activeCity(id);

            while (nextEl) {
              if (nextEl.classList.contains('js-Scroll-step')) {
                mapTitles.push(nextEl);
              }

              nextEl = nextEl.nextElementSibling;
            }

            mapTitles.forEach((mapTitleEl) => {
              const nextId = mapTitleEl.id;

              select(`.js-City-label--${nextId}`).classed('is-visited', false);
              selectAll(`.js-Route--${nextId}`).classed('is-active', false);
            });
          }
        }
      })
      .onContainerEnter(() => {
        this.graphicEl.classList.add('is-fixed');
        this.graphicEl.classList.remove('is-bottom');
      })
      .onContainerExit((response) => {
        this.graphicEl.classList.remove('is-fixed');
        this.graphicEl.classList.toggle('is-bottom', response.direction === 'down');
      });

    window.addEventListener('resize', scroller.resize());
  }
};
