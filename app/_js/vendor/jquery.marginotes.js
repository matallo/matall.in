var marginotes = function (options) {
  var options = options || {}
  $('body').append('<div class = "margintooltip" style = "display:none;"></div>')
  var field = options.field || "desc"
  var spans = this.filter("span")
  spans.css({ 'border-bottom': '1px dashed #337ab7',
              'cursor': 'help' })
  this.hover(function (e) {
    var description = $(this).attr(field)
    var parent = $(this.parentElement)
    var position = parent.position()
    var tooltip = $('.margintooltip')
    var width = Math.min(options.width || 100, position.left)
    if (width < 60 || !description) return
    var tooltipStyle = {
      "position": "absolute",
      "border-right": "solid 2px #337ab7",
      "width": "50px",
      "font-size": "13px",
      "text-align": "right",
      "padding-right": "7px",
      "top": position.top,
      "left": position.left - width - 5,
      "min-height": parent.height(),
      "width": width
    }
    tooltip.css(tooltipStyle)
    tooltip.text(description)
    tooltip.stop()
    tooltip.fadeIn({duration:100, queue: false})
  }, function () {
    $('.margintooltip').stop()
    $('.margintooltip').fadeOut({duration:100})
  })
}

window.jQuery.prototype.marginotes = window.$.prototype.marginotes = marginotes