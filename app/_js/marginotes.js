// jshint devel:true
/*global $, Backbone, App, document, window */

'use strict'

App.Views.Marginotes = Backbone.View.extend({

  el: '.js-Marginotes',

  events: {
    'mouseover .js-Footnote': '_onMouseoverFootnote',
    'mouseout .js-Footnote': '_onMouseoutFootnote'
  },

  initialize: function () {
    this.$marginote = this.$('.js-Marginote')
  },

  _onMouseoverFootnote: function (e) {
    var mobile = 1280

    if ($(window).width() < mobile) {
      return
    }

    var $target = $(e.target)
    var text = $(document.getElementById($($target).attr('href').split('#')[1])).html()

    this.$marginote
      .html(text)
      .css({
        top: $target.position().top
      })
      .fadeIn(200)
  },

  _onMouseoutFootnote: function (e) {
    this.$marginote.fadeOut(200)
  }

})

$(function () {
  if ($('body').hasClass('js-Marginotes')) {
    window.marginotes = new App.Views.Marginotes()
  }
})
