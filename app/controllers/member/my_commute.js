import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import MapDialog from 'appkit/utils/map_dialog';
import modalMenu from 'appkit/utils/modal_menu';

import ProfileMixinController from 'appkit/mixins/profile_mixin_controller';
import TaglineMixinController from 'appkit/mixins/tagline_mixin_controller';

import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var MemberMyCommuteController = Ember.ObjectController.extend(ProfileMixinController, TaglineMixinController, {
  needs: ['application', 'currentMember', 'login', 'member'],

  from: null,
  to: null,
  icons:[],
  weatherZips: null,
  weatherInfo: null,
  layers: 'traffic weather',
  disableOptions: false,
  mapStyle: 'border: 1px black solid; width: 100%; height: 250px',

  memberId: null, // needed for LinkedIn view var access

  //mobileHeaderString: "My Commute",

  refresh: false,

  setHeight: '',

  imgWidth: '200px',

  onMyCommute: true,

  mapCanvas: null,
  here: null,

  lastTraffic: null,
  lastWeather: null,

  trafficTime: function() {
    return new TimeDateFormatting().formatTime(this.get('lastTraffic'));
  }.property('lastTraffic'),
  weatherTime: function() {
    return new TimeDateFormatting().formatTime(this.get('lastWeather'));
  }.property('lastWeather'),

  actions: {
    showMap: function() {
      this.transitionToRoute('member.map_the_ride', this.get('id'), '-1');
    }
  }
});

export default MemberMyCommuteController;
