import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberTripMapController = Ember.ObjectController.extend({
  needs: ['application', 'login', 'currentMember', 'member'],

  from: null,
  to: null,
  waypoints: [],

  partner: null,
  isDriver: null,
  firstName: '',
  place: '',

  mobileHeaderString: "Trip Map"

});

export default MemberTripMapController;
