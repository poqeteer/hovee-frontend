/**
 * Created by lancemock on 8/21/14.
 */
var Spinner = Ember.Object.extend({
  create: function(color) {
    var opts = {
      lines: 13, // The number of lines to draw
      length: 16, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: color ? color : '#CCC', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner' // The CSS class to assign to the spinner
    };

    var target = document.getElementById('mainBody');
    return new window.Spinner(opts).spin(target);
  }
});

export default Spinner;