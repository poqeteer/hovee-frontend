import AuthenticatedRoute from 'appkit/routes/authenticated';

import TaglineMixinRoute from 'appkit/mixins/tagline_mixin_route';
import ProfileMixinRoute from 'appkit/mixins/profile_mixin_route';

var MemberMyCommuteRoute = AuthenticatedRoute.extend(TaglineMixinRoute, ProfileMixinRoute, {

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },

  member: null,

  model: function() {
    var member = this.modelFor('member');
    this.set('member', member);
    return member.reload(true);
  },

  afterModel: function(member) {
    var controller = this.controllerFor('member.my_commute');
    controller.set('here', controller);
    controller.set('controllers.application.lastPage', 'profile');

    controller.set('memberId', member.id);

    controller.set('mapStyle', 'width: 100%; height: ' +
      (window.innerHeight -  (this.controllerFor('login').get('onDesktop') ? 300 : 100)) + "px;");

    controller.set('imgWidth', window.innerWidth - 10 + 'px');

    var timeForLookup = new Date().getTime() - 60 + 60 + 1000;
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
        if(controller.get('controllers.login.onDesktop') && (!controller.get('lastWeather') || !controller.get('weatherInfo')|| !controller.get('weatherInfo.length')  || controller.get('lastWeather') > timeForLookup)) {
          controller.set('lastWeather', new Date().getTime());
          controller.set('weatherZips', [{zip: result.location.address.zip, lat: result.location.latitude, lon: result.location.longitude},
                                          {zip: member.get('homeLocation.homeAddress.zip'), lat: member.get('homeLocation.latitude'), lon: member.get('homeLocation.longitude')}]);
        } else {
          controller.set('weatherZips', null);
        }
      });
    } else {
      controller.set('to', member.get('workLocation.addressCityState'));
      if(controller.get('controllers.login.onDesktop') && (!controller.get('lastWeather') || !controller.get('weatherInfo')  || !controller.get('weatherInfo.length') || controller.get('lastWeather') > timeForLookup)) {
        controller.set('lastWeather', new Date().getTime());
        controller.set('weatherZips', [{zip: member.get('workLocation.workAddress.zip'), lat: member.get('workLocation.latitude'), lon: member.get('workLocation.longitude')},
                                        {zip: member.get('homeLocation.homeAddress.zip'), lat: member.get('homeLocation.latitude'), lon: member.get('homeLocation.longitude')}]);
      } else {
        controller.set('weatherZips', null);
      }
    }

    controller.set('from', member.get('homeLocation.addressCityState'));
    controller.set('icons', [
      {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-home.png", title: 'home', address: controller.get('from'), type: 'h'},
      {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-work.png", title: 'work', address: controller.get('to'), type: 'w'}]);

    this.profileAfterModelProcessing(controller, member.id);

    controller.set('lastTraffic', new Date().getTime());

    Ember.run.schedule('afterRender', this, function () {
      controller.set('weatherInfo', controller.get('mapDirections.weather'));
    });
  }
//  },
//
//  actions: {
//    didTransition: function () {
//      // Used to signal to refresh the profile page...
//      this.controllerFor('member.profile').send('refreshOnce');
//    }
//  }

});

export default MemberMyCommuteRoute;
