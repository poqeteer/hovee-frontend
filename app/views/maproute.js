var MapRoute = Ember.View.extend({
  id: 'map_canvas',
  tagName: 'div',
  attributeBindings: ['style', 'from', 'to', 'waypoints'],
  style:'width:100%; height:100%;',
  directionsDisplay: null,

  didInsertElement: function() {
    var mapOptions = {
      center: new window.google.maps.LatLng(37.871667, -122.272778),
      zoom: 13,
      zoomControlOptions: {style: window.google.maps.ZoomControlStyle.SMALL,
                            position: window.google.maps.ControlPosition.LEFT_TOP},
      mapTypeId: window.google.maps.MapTypeId.ROADMAP
    };

    var controller = this.get('controller');
    var map = new window.google.maps.Map(this.$().get(0),mapOptions);

    var directionsDisplay = new window.google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    this.set('directionsDisplay', directionsDisplay);

    this.loadDirections();
  },

  loadDirections: function() {

    var from = this.get('from');
    var to = this.get('to');
    var waypoints = this.get('waypoints');

    if (from && to && waypoints) {

      var directionsService = new window.google.maps.DirectionsService();
      var request;

      if (waypoints.length > 0) {
        request = {
          origin: from,
          destination: to,
          waypoints: waypoints,
          travelMode: window.google.maps.DirectionsTravelMode.DRIVING
        };
      } else {
        request = {
          origin: from,
          destination: to,
          travelMode: window.google.maps.DirectionsTravelMode.DRIVING
        };
      }
      var that = this;
      directionsService.route(request, function(response, status) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          that.get('directionsDisplay').setDirections(response);
        }
      });

    }


  }.observes('from','to','waypoints')
});

export default MapRoute;