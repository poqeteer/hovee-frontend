import AuthenticatedRoute from 'appkit/routes/authenticated';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberTripMap = AuthenticatedRoute.extend({

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },

  memberId: null,
  flag: null,

  model: function(params){
    this.set('flag', params.flag);
    this.set('memberId', this.modelFor('member').get('id'));
    return this.store.find('trip', params.trip_id );
  },

  setupController: function(controller, trip) {
    var ownerIsDriver = trip.get('driverId') === trip.get("ownerId");
    var memberId = this.get('memberId');

    controller.set('from', null);
    controller.set('to', null);
    controller.set('waypoints', []);
    //controller.set('isDriver', this.get('memberId') === trip.get('driverId'));... Now done in model
    
    controller.set('place', '');

    var that = this;

    Ember.RSVP.hash({
      owner: trip.get('owner'),
      rider: trip.get('rider'),
      riderHomeLocation: trip.get('riderHomeLocation'),
      riderWorkLocation: trip.get('riderWorkLocation'),
      memberHomeLocation: trip.get('memberHomeLocation'),
      memberWorkLocation: trip.get('memberWorkLocation')
    }).then(function(hash) {
      if (hash.owner.get('id') === memberId) {
        controller.set('partner', hash.rider);
      } else {
        controller.set('partner', hash.owner);
      }

      controller.set('firstName', controller.get('partner.possessiveName'));

      // flag === hx, from member/owner home to rider home
      // flag === hy, from rider home to member/owner home
      // flag === ht, from member/owner home to member/owner work
      // flag === hu, from rider home to rider work
      // flag === hz, from full trip home to work

      // flag === wx, from member/owner work to rider work
      // flag === wy, from rider work to member/owner work
      // flag === wt, from member/owner work to member/owner home
      // flag === wu, from rider work to rider home
      // flag === wz, from full trip work to home

      switch (that.get('flag')) {
        case 'hx':
          controller.set('from', hash.memberHomeLocation.get('addressCityState'));
          controller.set('to', hash.riderHomeLocation.get('addressCityState'));
          break;
        case 'hy':
          controller.set('from', hash.riderHomeLocation.get('addressCityState'));
          controller.set('to', hash.memberHomeLocation.get('addressCityState'));
          break;
        case 'ht':
          controller.set('from', hash.memberHomeLocation.get('addressCityState'));
          controller.set('to', hash.memberWorkLocation.get('addressCityState'));
          controller.set('place', 'work');          
          break;
        case 'hu':
          controller.set('from', hash.riderHomeLocation.get('addressCityState'));
          controller.set('to', hash.riderWorkLocation.get('addressCityState'));
          controller.set('place', 'work');
          break;
        case 'hz':
          if (ownerIsDriver) {
            controller.set('waypoints', [{location: hash.riderHomeLocation.get('addressCityState')}, {location: hash.riderWorkLocation.get('addressCityState')}]);
            controller.set('from', hash.memberHomeLocation.get('addressCityState'));
            controller.set('to', hash.memberWorkLocation.get('addressCityState'));
          } else {
            controller.set('waypoints', [{location: hash.memberHomeLocation.get('addressCityState')}, {location: hash.memberWorkLocation.get('addressCityState')}]);
            controller.set('from', hash.riderHomeLocation.get('addressCityState'));
            controller.set('to', hash.riderWorkLocation.get('addressCityState'));
          }
          break;
        case 'wx':
          controller.set('from', hash.memberWorkLocation.get('addressCityState'));
          controller.set('to', hash.riderWorkLocation.get('addressCityState'));
          controller.set('place', 'work');
          controller.set('firstName', 'Your');
          break;
        case 'wy':
          controller.set('from', hash.riderWorkLocation.get('addressCityState'));
          controller.set('to', hash.memberWorkLocation.get('addressCityState'));
          controller.set('place', 'work');
          controller.set('firstName', 'Your');
          break;
        case 'wt':
          controller.set('from', hash.memberWorkLocation.get('addressCityState'));
          controller.set('to', hash.memberHomeLocation.get('addressCityState'));
          break;
        case 'wu':
          controller.set('from', hash.riderWorkLocation.get('addressCityState'));
          controller.set('to', hash.riderHomeLocation.get('addressCityState'));
          break;
        case 'wz':
          if (ownerIsDriver) {
            controller.set('waypoints', [{location: hash.riderWorkLocation.get('addressCityState')}, {location: hash.riderHomeLocation.get('addressCityState')}]);
            controller.set('from', hash.memberWorkLocation.get('addressCityState'));
            controller.set('to', hash.memberHomeLocation.get('addressCityState'));
          } else {
            controller.set('waypoints', [{location: hash.memberWorkLocation.get('addressCityState')}, {location: hash.memberHomeLocation.get('addressCityState')}]);
            controller.set('from', hash.riderWorkLocation.get('addressCityState'));
            controller.set('to', hash.riderHomeLocation.get('addressCityState'));
          }
          break;
      }
    }).catch(function(error) {
      new GenericModalDialog().modalDialog(
        {
          dialogTitle: Em.I18n.translations.error.trip.map.load.title,
          dialogImageUrl: '/assets/img/icon-car-blue.png',
          dialogImageTitle: Em.I18n.translations.error.trip.map.load.id,
          dialogText: Em.I18n.translations.error.trip.map.load.message
        });
      Ember.Logger.debug('error getting location info ' + error.status + ' - ' + error.responseText);
    });

  }
});

export default MemberTripMap;
