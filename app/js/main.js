// jshint devel:true
/*global $, _, Backbone, d3, topojson, App, document, window */

'use strict';

App.Views.Main = Backbone.View.extend({

  el: 'body',

  initialize: function() {
    this.$map = this.$('.js-Map');

    this._initViews();
    this._initBindings();
  },

  _initBindings: function() {
    var _this = this;

    $(document)
      .ready(function() {
        _this._fixMenu();
      });

    $(window)
      .scroll(function() {
        _this._fixMenu();
      })
      .resize(function() {
        _this._fixMenu();
      });

    this.$('h2').waypoint({
      handler: function(direction) {
        var id = this.element.id;

        if (direction == 'down') {
          if ($('.js-City-label--'+id).length) {
            d3.selectAll('.js-City').classed('is-active', false);
            d3.select('.js-City--'+id).classed('is-active', true);

            d3.selectAll('.js-City-label').classed('is-active', false);
            d3.select('.js-City-label--'+id).classed('is-active is-visited', true);

            var titles = $(this.element).prevAll('h2');

            _.each(titles, function(el) {
              var previousId = $(el).attr('id');

              if (previousId) {
                d3.select('.js-City-label--'+previousId).classed('is-visited', true);
                d3.selectAll('.js-Route--'+id).classed('is-active', true);
              }
            });

          }
        }
      },
      offset: 'bottom-in-view'
    });

    this.$('h2').waypoint({
      handler: function(direction) {
        var id = this.element.id;

        if (direction == 'up') {
          if ($('.js-City-label--'+id).length) {
            d3.selectAll('.js-City').classed('is-active', false);
            d3.select('.js-City--'+id).classed('is-active', true);

            d3.selectAll('.js-City-label').classed('is-active', false);
            d3.select('.js-City-label--'+id).classed('is-active is-visited', true);

            var titles = $(this.element).nextAll('h2');

            _.each(titles, function(el) {
              var nextId = $(el).attr('id');

              if (nextId) {
                d3.select('.js-City-label--'+nextId).classed('is-visited', false);
                d3.selectAll('.js-Route--'+nextId).classed('is-active', false);
              }
            });
          }
        }
      }
    });
  },

  _fixMenu: function() {
    var headerHeight = this.$('.js-Header').outerHeight();
    var scrollNumber = document.body.scrollTop;

    if (scrollNumber >= headerHeight) {
      this.$map.addClass('is-fixed');
    } else {
      this.$map.removeClass('is-fixed');
    }
  },

  _goTo: function($el, opt, callback) {
    if ($el) {
      var speed = (opt && opt.speed) || 150,
          delay = (opt && opt.delay) || 0,
          margin = (opt && opt.margin) || 0;

      $('html, body').delay(delay).animate({scrollTop:$el.offset().top - margin}, speed);

      setTimeout(function() {
        callback && callback();
      }, delay);
    }
  },

  _initViews: function() {
    this._initMap();
  },

  _initMap: function() {
    var _this = this;

    var width = 360;
    var height = 500;

    var svg = d3.select('#map')
        .append('svg')
          .attr('width', width)
          .attr('height', height);

    var projection = d3.geo.mercator()
        .center([101.3097594, 15.8565707])
        .scale(2500)
        .translate([0, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    d3.json('js/data/vietcongada.json', function(error, vietcongada) {
      if (error) {
        return console.error(error);
      }

      svg
        .selectAll('.Route')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_routes_1).features)
        .enter()
        .append('path')
          .attr('class', function(d) { return 'Route ' + (d.properties.display ? '' : 'is-hidden'); })
          .attr('d', path);
      svg
        .selectAll('.Route--story')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_routes_1).features)
        .enter()
        .append('path')
          .attr('class', function(d) { return 'Route Route--story js-Route js-Route--' + d.properties.route; })
          .attr('d', path);

      // TODO: group city labels
      svg
        .selectAll('.City')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_cities_1).features)
        .enter()
        .append('path')
          .attr('class', function(d) { return 'City js-City js-City--' + d.properties.slug; })
          .attr('d', path.pointRadius(2));

      svg
        .selectAll('.City-label')
        .data(topojson.feature(vietcongada, vietcongada.objects.vietcongada_cities_1).features)
        .enter()
        .append('text')
          .attr('class', function(d) { return 'City-label js-City-label js-City-label--' + d.properties.slug; })
          .attr('transform', function(d) { return 'translate(' + projection(d.geometry.coordinates) + ')'; })
          .text(function(d) { return d.properties.label ? d.properties.name : ''; })
          .attr('dy', '.35em')
          .attr('dx', function(d) {
            var w = parseInt(d3.select(this).style('width').replace('px', ''), 10);

            return '-' + (w + 10);
          })
          .on('click', function(d) {
            _this._goTo(_this.$('#'+d.properties.slug), { margin: 20 });
          });

      // ho_chi_minh_city is-active by default
      d3.select('.js-City--ho_chi_minh_city').classed('is-active', true);
      d3.select('.js-City-label--ho_chi_minh_city').classed('is-active is-visited', true);
    });
  }

});
