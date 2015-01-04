import MapDirections from 'appkit/mixins/map_directions';
var MapDirections = Ember.View.extend(MapDirections, {
  id: 'map_canvas',
  tagName: 'div',
  attributeBindings: ['style', 'from', 'to', 'waypoints', 'icons', 'disableControls', 'headerHeight', 'layers', 'weatherZips', 'weatherInfo', 'controller'],
  style:'width:100%; height:100%',
  directionsDisplay: null,

  didInsertElement: function() {
    this.initialize(this.$().get(0), this.get('icons'), this.get('from'), this.get('to'), this.get('waypoints'), this.get('disableControls'), this.get('layers'), this.get('weatherZips'), this.get('weatherInfo'));
//    $('#map').height($(window).height() - (this.get('headerHeight') | 44));
    if (this.get('controller')) {
      this.get('controller').set('mapDirections', this);
    }
  }});

export default MapDirections;