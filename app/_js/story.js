// jshint devel:true
/* global $, _, Backbone, d3, topojson, App, document, window */

'use strict'

App.Views.Story = Backbone.View.extend({

  el: '.js-Story',

  initialize: function () {
    this.$map = this.$('.js-Map')

    this._initViews()
  },

  _initBindings: function () {
    var _this = this

    $(document)
      .ready(function () {
        _this._fixMap()
      })

    $(window)
      .scroll(function () {
        _this._fixMap()
      })
      .resize(function () {
        _this._fixMap()
      })

    this.$('h2').waypoint({
      handler: function (direction) {
        if (direction === 'down') {
          var id = this.element.id

          if ($('.js-City-label--' + id).length) {
            d3.selectAll('.js-City').classed('is-active', false)
            d3.select('.js-City--' + id).classed('is-active', true)

            d3.selectAll('.js-City-label').classed('is-active', false)
            d3.select('.js-City-label--' + id).classed('is-active is-visited', true)

            var titles = $(this.element).prevAll('h2')

            _.each(titles, function (el) {
              var previousId = $(el).attr('id')

              if (previousId) {
                d3.select('.js-City-label--' + previousId).classed('is-visited', true)
                d3.selectAll('.js-Route--' + id).classed('is-active', true)
              }
            })
          }
        }
      },
      offset: $(window).height()
    })

    this.$('h2').waypoint({
      handler: function (direction) {
        if (direction === 'up') {
          var id = this.element.id

          if ($('.js-City-label--' + id).length) {
            d3.selectAll('.js-City').classed('is-active', false)
            d3.select('.js-City--' + id).classed('is-active', true)

            d3.selectAll('.js-City-label').classed('is-active', false)
            d3.select('.js-City-label--' + id).classed('is-active is-visited', true)

            var titles = $(this.element).nextAll('h2')

            _.each(titles, function (el) {
              var nextId = $(el).attr('id')

              if (nextId) {
                d3.select('.js-City-label--' + nextId).classed('is-visited', false)
                d3.selectAll('.js-Route--' + nextId).classed('is-active', false)
              }
            })
          }
        }
      }
    })

    this.$('.js-Sticky').waypoint({
      handler: function (direction) {
        if (direction === 'down') {
          _this.$map.addClass('is-bottom')
        }

        if (direction === 'up') {
          _this.$map.removeClass('is-bottom')
        }
      },
      offset: 720
    })
  },

  _fixMap: function () {
    var scroll = document.documentElement.scrollTop || document.body.scrollTop

    if (scroll >= 580) {
      this.$map.addClass('is-fixed')
    } else {
      this.$map.removeClass('is-fixed')
    }
  },

  _goTo: function ($el, opt, callback) {
    if ($el) {
      var speed = (opt && opt.speed) || 150
      var delay = (opt && opt.delay) || 0
      var margin = (opt && opt.margin) || 0

      $('html, body').delay(delay).animate({scrollTop: $el.offset().top - margin}, speed)

      setTimeout(function () {
        callback && callback()
      }, delay)
    }
  },

  _initViews: function () {
    this._initMap()
  },

  _initMap: function () {
    var mobile = 1280

    if ($(window).width() < mobile) {
      return
    }

    var _this = this

    var width = 360
    var height = 720

    var svg = d3.select('.js-Map')
        .append('svg')
          .attr('width', width)
          .attr('height', height)

    var projection = d3.geo.mercator()
        .center([101.3097594, 15.8565707])
        .scale(2400)
        .translate([0, height / 2])

    var path = d3.geo.path()
        .projection(projection)

    d3.json('/js/data/vietcongada.json', function (error, vietcongada) {
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
          .attr('class', function (d) { return 'Route ' + (d.properties.display ? '' : 'is-hidden') })
          .attr('d', path)
      svg
        .selectAll('.Route--story')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_routes_1).features)
        .enter()
        .append('path')
          .attr('class', function (d) { return 'Route Route--story js-Route js-Route--' + d.properties.route })
          .attr('d', path)

      // TODO: group city labels
      svg
        .selectAll('.City')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_cities_1).features)
        .enter()
        .append('path')
          .attr('class', function (d) { return 'City js-City js-City--' + d.properties.slug })
          .attr('d', path.pointRadius(2))

      svg
        .selectAll('.City-label')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_cities_1).features)
        .enter()
        .append('text')
          .attr('class', function (d) { return 'City-label js-City-label js-City-label--' + d.properties.slug })
          .attr('transform', function (d) { return 'translate(' + projection(d.geometry.coordinates) + ')' })
          .text(function (d) { return d.properties.label ? d.properties.name : '' })
          .attr('dy', '1.5em')
          .attr('dx', function (d) {
            var w = parseInt(d3.select(this).style('width').replace('px', ''), 10) / 2 * -1

            return w
          })
          .on('click', function (d) {
            _this._goTo(_this.$('#' + d.properties.slug), { margin: 40 })
          })

      _this._initBindings()
    })
  }

})

$(function () {
  if ($('body').hasClass('js-Story')) {
    window.story = new App.Views.Story()
  }
})
