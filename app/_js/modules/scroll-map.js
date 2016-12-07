/* global d3, topojson, Waypoint */

'use strict'

class Scrollmap {

  constructor (el) {
    this.el = el

    if (this.el === null) {
      return false
    }

    this.map = this.el.querySelector('.js-Map')

    this._initScrollmap()
  }

  _initScrollmap () {
    if (window.innerWidth < 1280) {
      return
    }

    const height = 720

    const svg = d3.select('.js-Map')
      .append('svg')
        .attr('width', 360)
        .attr('height', height)

    const projection = d3.geoMercator()
      .center([101.3097594, 15.8565707])
      .scale(2400)
      .translate([0, height / 2])

    const path = d3.geoPath()
      .projection(projection)

    d3.json('/js/data/vietcongada.json', (error, vietcongada) => {
      if (error) {
        return console.error(error)
      }

      svg
        .selectAll('.Country')
        .data(topojson.feature(vietcongada, vietcongada.objects.world_borders_hd_copy).features)
        .enter()
        .append('path')
          .attr('class', 'Country')
          .attr('d', path)

      svg
        .selectAll('.Route')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_routes_1).features)
        .enter()
        .append('path')
          .attr('class', (d) => { return 'Route ' + (d.properties.display ? '' : 'is-hidden') })
          .attr('d', path)

      svg
        .selectAll('.Route--story')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_routes_1).features)
        .enter()
        .append('path')
          .attr('class', (d) => `Route Route--story js-Route js-Route--${d.properties.route}`)
          .attr('d', path)

      svg
        .selectAll('.City')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_cities_1).features)
        .enter()
        .append('path')
          .attr('class', (d) => `City js-City js-City--${d.properties.slug}`)
          .attr('d', path.pointRadius(2))

      svg
        .selectAll('.City-label')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_cities_1).features)
        .enter()
        .append('text')
          .attr('class', (d) => `City-label js-City-label js-City-label--${d.properties.slug}`)
          .attr('transform', (d) => `translate(${projection(d.geometry.coordinates)})`)
          .text((d) => d.properties.label ? d.properties.name : '')
          .attr('dy', '1.5em')
          .attr('dx', (d, i, j) => j[i].getBoundingClientRect().width / 2 * -1)
          .on('click', (d) => {
            this.el.querySelector('#' + d.properties.slug).scrollIntoView({
              behavior: 'smooth'
            })
          })
    })

    this._initEvents()
  }

  _initEvents () {
    document.addEventListener('DOMContentLoaded', () => this._fixScrollmap())

    window.addEventListener('scroll', () => this._fixScrollmap())
    window.addEventListener('resize', () => this._fixScrollmap())

    const scrollmapTitles = document.querySelectorAll('.js-Scrollmap-title')
    Array.prototype.forEach.call(scrollmapTitles, (scrollmapTitleEl, i) => {
      const scrollmapTitleWaypointDown = new Waypoint({
        element: scrollmapTitleEl,
        handler: (direction) => {
          if (direction === 'down') {
            const id = scrollmapTitleEl.id

            if (this.el.querySelector('.js-City-label--' + id) !== null) {
              this._activeCity(id)

              let mapTitles = []
              let prevEl = scrollmapTitleEl.previousElementSibling

              while (prevEl) {
                if (prevEl.classList.contains('js-Scrollmap-title')) {
                  mapTitles.push(prevEl)
                }

                prevEl = prevEl.previousElementSibling
              }

              Array.prototype.forEach.call(mapTitles, (mapTitleEl, i) => {
                d3.select('.js-City-label--' + mapTitleEl.id).classed('is-visited', true)
                d3.selectAll('.js-Route--' + id).classed('is-active', true)
              })
            }
          }
        },
        offset: window.innerHeight
      })

      const scrollmapTitleWaypointUp = new Waypoint({
        element: scrollmapTitleEl,
        handler: (direction) => {
          if (direction === 'up') {
            const id = scrollmapTitleEl.id

            if (this.el.querySelector('.js-City-label--' + id) !== null) {
              this._activeCity(id)

              let mapTitles = []
              let nextEl = scrollmapTitleEl.nextElementSibling

              while (nextEl) {
                if (nextEl.classList.contains('js-Scrollmap-title')) {
                  mapTitles.push(nextEl)
                }

                nextEl = nextEl.nextElementSibling
              }

              Array.prototype.forEach.call(mapTitles, (mapTitleEl, i) => {
                const nextId = mapTitleEl.id

                d3.select('.js-City-label--' + nextId).classed('is-visited', false)
                d3.selectAll('.js-Route--' + nextId).classed('is-active', false)
              })
            }
          }
        }
      })
    })

    const stickyWaypoint = new Waypoint({
      element: this.el.querySelector('.js-Sticky'),
      handler: (direction) => {
        if (direction === 'down') {
          this.map.classList.add('is-bottom')
        }

        if (direction === 'up') {
          this.map.classList.remove('is-bottom')
        }
      },
      offset: 720
    })
  }

  _activeCity (id) {
    d3.selectAll('.js-City').classed('is-active', false)
    d3.select('.js-City--' + id).classed('is-active', true)

    d3.selectAll('.js-City-label').classed('is-active', false)
    d3.select('.js-City-label--' + id).classed('is-active is-visited', true)
  }

  _fixScrollmap () {
    var scroll = document.body.scrollTop

    if (scroll >= 642) {
      this.map.classList.add('is-fixed')
    } else {
      this.map.classList.remove('is-fixed')
    }
  }
}

export default Scrollmap
