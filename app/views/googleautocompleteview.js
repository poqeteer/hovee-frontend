import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var GoogleAutocompleteView =  Ember.TextField.extend({

  attributeBindings: ['location'],
  style:'width:100%;',
  lastErrorResult: null,

  didInsertElement: function() {
    this._super();
    var _this = this;

    // Set the basic bounds to the bay area. Will speed up lookups but not restrict them
    var defaultBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(36.945502, -123.700562),
      new window.google.maps.LatLng(37.957192, -123.035889));

    // Create the search box and link it to the UI element.
    var input = this.$('').get(0);

    var searchBox = new window.google.maps.places.SearchBox(input,{
      bounds: defaultBounds
    });

    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    window.google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();
      var address = places[0].formatted_address;

      var geocoder = new window.google.maps.Geocoder();

      // Okay finally to the address lookup
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status === window.google.maps.GeocoderStatus.OK) {
          var latitude, longitude, parsed;
          var location;

          /**
           * Process a single address result
           *
           * @param result
           * @returns {{country: string, neighborhood: string, street: string, address: string}}
           */
          var processResult = function (result) {
            function seek(target, long) {
              try {
                if (long) {
                  return $.grep(result.address_components, function(e) { return $.inArray(target, e.types) >= 0; })[0].long_name;
                }
                return $.grep(result.address_components, function(e) { return $.inArray(target, e.types) >= 0; })[0].short_name;
              } catch(e) {
                return '';
              }
            }

            var street = '';
            var city = '';
            var state = '';
            var zip = '';
            var country = '';
            var neighborhood = '';

            var street_number = seek('street_number');

            // Only allow complete addresses...
            if (!Ember.isNone(street_number) && street_number !== '') {
              street = seek('route');
              city = seek('locality', true);
              state = seek('administrative_area_level_1');
              zip = seek('postal_code');
              country = seek('country');

              neighborhood = seek('neighborhood', true);
              if (neighborhood === '') {
                neighborhood = city;
              }
            }

            return {country: country, neighborhood: neighborhood, street: street, address: street_number + ' ' + street + ', ' + city + ', ' + state + ' ' + zip + ', ' + country};
          };

          // Check the lat/long and only allow SF area...
          var lngDiff = results[0].geometry.location.lng() + 122.07;
          var latDiff = results[0].geometry.location.lat() - 37.91;
          var radius = Math.sqrt(lngDiff*lngDiff + latDiff*latDiff);
          if (radius <= 2) {

            // For some reason google can return multiple results for a given location like "133 Fremont St, San Francisco".
            // One will have the street number (street_number) separate and other will have it as part of the street name
            // (route). Since the majority of the address have the the former (street_number separate) we will look for
            // that instance of the result...
            //
            // Note: The lat/long are slightly different but they end up resolving to the same address when looked up.
            var i = 0;
            do {
              parsed = processResult(results[i++]);
            } while ((parsed.address.indexOf('undefined') !== -1 || parsed.street === '') && i < results.length);

            if (parsed.address.indexOf('undefined') === -1 && parsed.street !== ''){

              latitude =  results[0].geometry.location.lat();
              longitude = results[0].geometry.location.lng();

              _this.set('location',
              {
                street: parsed.street,
                address: parsed.address,
                neighborhood: parsed.neighborhood,
                latitude: latitude,
                longitude: longitude,
                country: parsed.country
              });
            } else {
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.address.autocomplete.invalid.title,
                  dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                  dialogImageTitle: Em.I18n.translations.error.address.autocomplete.invalid.id,
                  dialogText: Em.I18n.translations.error.address.autocomplete.invalid.message
                });
            }
          } else {
            _this.set('location', null);
            if (_this.get('lastErrorResult') !== results[0].formatted_address) {
              _this.set('lastErrorResult', results[0].formatted_address);
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.address.autocomplete.radius.title,
                  dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                  dialogImageTitle: Em.I18n.translations.error.address.autocomplete.radius.id,
                  dialogText: Em.I18n.translations.error.address.autocomplete.radius.message
                });
            }
          }
        }
      });
    });
  }
});

export default GoogleAutocompleteView;