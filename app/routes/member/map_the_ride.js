import AuthenticatedRoute from 'appkit/routes/authenticated';
import GroupWaypoints from 'appkit/utils/group_waypoints';
import MapDialog from 'appkit/utils/map_dialog';

var MemberMapTheRideRoute = AuthenticatedRoute.extend({

  memberIsDriver: null,
  member: null,

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function(params) {
    var tripId = parseInt(params.trip_id, 10);
    var member = this.modelFor('member');
    this.set("member", member);
    if (tripId === -1) {
      return Ember.RSVP.hash({
        member: member.reload(true)
      });
    } else if (tripId < 1) {
      this.set('memberIsDriver', null);
      if (tripId < 0) {
        this.set('memberIsDriver', tripId === -2);
      }
      return Ember.RSVP.hash({
//        recommendation: this.store.find('recommendation', params.partner_id),
        partner: this.store.find('member', params.partner_id)
      });
    }
    return Ember.RSVP.hash({
      trip: this.store.find('trip', params.trip_id),
      partner: this.store.find('member', params.partner_id)
    });
  },

  afterModel: function(hash) {
    var controller = this.controllerFor('member.map_the_ride');
    var member = this.get('member');
//    var partner = hash.partner;
//
//    var mWorkLocation = '', pWorkLocation = '';
//    var mHomeLocation = '', pHomeLocation = '';
//    var memberIsDriver = false;
//
//    var companyLocationLookup = function (companyLocationId) {
//      var address = '';
//      Ember.$.ajax({
//        type: 'GET',
//        url: Ember.ENV.APIHOST + '/locations/' + companyLocationId,
//        async: false
//      }).then(function (result) {
//        address = result.location.address.address1 + ', ' + result.location.address.city + ', ' + result.location.address.state;
//      });
//      return address;
//    };

    // If member then we are only showing the members drive, no one else
    if (hash.member) {
      var timeForLookup = new Date().getTime() - 60 + 60 + 1000;
      controller.set('layers', 'traffic weather');
      member = hash.member;
      if (Ember.isNone(member.get('workLocation.addressCityState'))) {
        // kludge... force ember to load the work location... should be loading automatically but it's not
        Ember.RSVP.hash({
          location: member.get('workLocation')
        }).then(function (work) {
          member.set('workLocation', work.location);
        });

        // Above gets the object... but we need the address NOW!
        Ember.$.ajax({
          type: 'GET',
          url: Ember.ENV.APIHOST + '/locations/' + member.get('companyLocationId'),
          async: false
        }).then(function(result){
          controller.set('to', result.location.address.address1 + ', ' + result.location.address.city + ', ' + result.location.address.state);
          if(!controller.get('lastWeather') || controller.get('lastWeather') > timeForLookup) {
            controller.set('lastWeather', new Date().getTime());
            controller.set('weatherZips', [{zip: result.location.address.zip, lat: result.location.latitude, lon: result.location.longitude},
              {zip: member.get('homeLocation.homeAddress.zip'), lat: member.get('homeLocation.latitude'), lon: member.get('homeLocation.longitude')}]);
          } else {
            controller.set('weatherZips', null);
          }
        });
      } else {
        controller.set('to', member.get('workLocation.addressCityState'));
        if(!controller.get('lastWeather') || controller.get('lastWeather') > timeForLookup) {
          controller.set('lastWeather', new Date().getTime());
          controller.set('weatherZips', [{zip: member.get('workLocation.workAddress.zip'), lat: member.get('workLocation.latitude'), lon: member.get('workLocation.longitude')},
            {zip: member.get('homeLocation.homeAddress.zip'), lat: member.get('homeLocation.latitude'), lon: member.get('homeLocation.longitude')}]);
        } else {
          controller.set('weatherZips', null);
        }
      }
      Ember.run.schedule('afterRender', this, function () {
        controller.set('weatherInfo', controller.get('mapDirections.weather'));
      });

      controller.set('from', member.get('homeLocation.addressCityState'));
      controller.set('waypoints', null);
      controller.set('disableOptions', false);
      controller.set('icons', [
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-home.png", title: 'home', address: controller.get('from'), type: 'h'},
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-work.png", title: 'work', address: controller.get('to'), type: 'w'}]);
    } else {
      controller.set('layers', null);
      var params = new MapDialog().generateMapDialog(member, hash.partner, hash.trip, Ember.isNone(hash.trip) ? 0 : hash.trip.get('id'), controller.get('tripMode') % 10, controller.get('isDriver'));

      var disableOptions =
      controller.set('from', params.from);
      controller.set('to', params.to);
      controller.set('waypoints', params.waypoints);
      controller.set('disableOptions', Ember.isNone(hash.trip) || !hash.trip.get('isStatusAccepted'));
      controller.set('icons', params.icons);

//      var reviewTrip = hash.trip;
//
//      if (reviewTrip) {
//        var homeLocationLookup = function (homeLocationId) {
//          var address = '';
//          Ember.$.ajax({
//            type: 'GET',
//            url: Ember.ENV.APIHOST + '/homeLocations/' + homeLocationId,
//            async: false
//          }).then(function (result) {
//            address = result.homeLocation.address.address1 + ', ' + result.homeLocation.address.city + ', ' + result.homeLocation.address.state;
//          });
//          return address;
//        };
//
//        if (reviewTrip.get('owner.id') === member.get('id')) {
//          mWorkLocation = companyLocationLookup(reviewTrip.get('memberWorkLocation.id'));
//          pWorkLocation = companyLocationLookup(reviewTrip.get('riderWorkLocation.id'));
//          mHomeLocation = homeLocationLookup(reviewTrip.get('memberHomeLocation.id'));
//          pHomeLocation = homeLocationLookup(reviewTrip.get('riderHomeLocation.id'));
//
//        } else {
//          pWorkLocation = companyLocationLookup(reviewTrip.get('memberWorkLocation.id'));
//          mWorkLocation = companyLocationLookup(reviewTrip.get('riderWorkLocation.id'));
//          pHomeLocation = homeLocationLookup(reviewTrip.get('memberHomeLocation.id'));
//          mHomeLocation = homeLocationLookup(reviewTrip.get('riderHomeLocation.id'));
//        }
//
//        memberIsDriver = reviewTrip.get('driver.id') === member.get('id');
//      } else {
//        // Force the work location to load...
//        mWorkLocation = companyLocationLookup(member.get('companyLocationId'));
//        pWorkLocation = companyLocationLookup(partner.get('companyLocationId'));
//
//        // The home locations are already loaded...
//        mHomeLocation = member.get('homeLocation.addressCityState');
//        pHomeLocation = partner.get('homeLocation.addressCityState');
//
//        //memberIsDriver = hash.recommendation.get('recDefaults.role') === 'driver';
//        memberIsDriver = controller.get('isDriver');
//      }
//
//      if (!Ember.isNone(this.get('memberIsDriver'))) {
//        memberIsDriver = this.get('memberIsDriver');
//      }
//      var from, to, waypoints;
//      var home1, home2, work1, work2;
//      var address1, address2, address3, address4;
//      if (memberIsDriver) {
//        address1 = mHomeLocation;
//        address2 = pHomeLocation;
//        address3 = pWorkLocation;
//        address4 = mWorkLocation;
//
//        from = address1;
//        waypoints = [
//          {location: address2, stopover: true},
//          {location: address3, stopover: true}
//        ];
//        to = address4;
//
//        home2 = partner.get('firstName') + ' home';
//        home1 = member.get('firstName') + ' home';
//        work1 = partner.get('firstName') + ' work';
//        work2 = member.get('firstName') + ' work';
//      } else {
//        address1 = pHomeLocation;
//        address2 = mHomeLocation;
//        address3 = mWorkLocation;
//        address4 = pWorkLocation;
//
//        from = address1;
//        waypoints = [
//          {location: address2, stopover: true},
//          {location: address3, stopover: true}
//        ];
//        to = address4;
//
//        home1 = partner.get('firstName') + ' home';
//        home2 = member.get('firstName') + ' home';
//        work2 = partner.get('firstName') + ' work';
//        work1 = member.get('firstName') + ' work';
//      }
//
//      controller.set('from', from);
//      controller.set('to', to);
//      controller.set('waypoints', waypoints);
//      controller.set('disableOptions', Ember.isNone(reviewTrip));
//      controller.set('icons', [
//        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-1.png", title: home1, address: address1, type: 'h'},
//        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-2.png", title: home2, address: address2, type: 'h'},
//        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-3.png", title: work1, address: address3, type: 'w'},
//        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-" + (address3 === address4 ? "3" : "4") + ".png", title: work2, address: address4, type: 'w'}
//      ]);
    }
//  },
//
//  actions: {
//    didTransition: function () {
//      setTimeout(function(){
//        $('#map').height($(window).height());
//      }, 1000);
//    }
  }

});

export default MemberMapTheRideRoute;