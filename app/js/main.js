// jshint devel:true
/*global d3, topojson */

'use strict';

var width = 400;
var height = 500;

var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

var projection = d3.geo.mercator()
    .center([101.3097594, 15.8565707])
    .scale(2000)
    .translate([0, height / 2]);

var path = d3.geo.path()
    .projection(projection);

// https://matallo.cartodb.com/api/v2/sql?q=SELECT * FROM openpaths_matallo_20150818_20150831&format=topojson&filename=openpaths_matallo_20150818_20150831
d3.json('js/data/openpaths_matallo_20150818_20150831.json', function(error, openpaths) {
  if (error) {
    return console.error(error);
  }

  svg.selectAll('.point')
    .data(topojson.feature(openpaths, openpaths.objects.openpaths_matallo_20150818_20150831).features)
    .enter().append('path')
      .attr('class', 'point')
      .attr('d', path);
});
