import AuthenticatedRoute from 'appkit/routes/authenticated';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

import ProfileMixinRoute from 'appkit/mixins/profile_mixin_route';

var MemberProfileMainRoute = AuthenticatedRoute.extend(ProfileMixinRoute, {

  flag: 'work',

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function(params) {
    this.set('flag', params.flag);
    var member = this.modelFor('member');
    return member.reload(true);
  },

  afterModel: function(member) {

    var controller = this.controllerFor('member.profile_main');
    var flag = this.get('flag');
    var isOnBoardingProcess =  false;
    var goTo = 9;

    // Ok didn't think I would have to do this but if the user refreshes during on-boarding the flags are all cleared...
    Ember.$.ajax({
      type: 'GET',
      url: Ember.ENV.APIHOST + '/members/' + member.get('id') + '/tracking',
      async: false
    }).then(function(response){
      if (response.tracking.fullyOnboarded) {
      } else {
        isOnBoardingProcess = true;
        controller.set('controllers.login.isOnBoardingProfile', true);
        if (response.tracking.onboardingPageId === null || response.tracking.onboardingPageId < 1) {
          controller.transitionToRoute('member.linkedin', member.get('id)'));
        } else {
          goTo = response.tracking.onboardingPageId;
        }
      }
    }).fail(function(error){
      //ignore for now...
    });


    controller.set('companyName', '');

    controller.set('memberLinkedInData', member.get('linkedInProfile.data'));

    // Set the global to disable/enable the main menu... Only in the case of a refresh is this necessary
    controller.set('controllers.login.isOnBoardingProfile', isOnBoardingProcess);

    // Clear/Set the disable flag on the page... if another user logged in and was complete, and new user logs in and is incomplete, we need to set...
    controller.send('setDisables', isOnBoardingProcess);

    controller.set('onBoardingProcess', isOnBoardingProcess);
    controller.set('memberId', member.get('id'));

    if (isOnBoardingProcess) {
      controller.set('mobileHeaderString', null);
      controller.set('controllers.login.isOnBoardingProfile', true); // <-- only because page may have been refreshed
      // Yes, 'work' is duplicated. We could have come from linkedin or back in at 'work', so go to 'work', so to speak.
      if (flag !== 'work') {
        var sendTo = ['', 'work', 'work', 'about', 'driving', 'start', 'destination', 'schedule', 'ideal'];
        goTo = parseInt(flag, 10);
        flag = sendTo[goTo];
      } else {
        goTo = 1;
      }
      // This is kinda stupid, but we have to force the watch*Requirement calls to get the breadcrumbs to light up properly because we set them disabled above...
      for (var watch=1; watch < goTo + 1; watch++) {
        switch(watch) {
          case 1:
            controller.watchLinkedInRequirements();
            break;
          case 2:
            controller.watchWorkRequirements();
            break;
          case 3:
            controller.watchAboutRequirements();
            break;
          case 4:
            controller.watchDrivingRequirements();
            break;
          case 5:
            controller.watchStartRequirements();
            break;
          case 6:
            controller.watchDestinationRequirements();
            break;
          case 7:
            controller.watchScheduleRequirements();
            break;
//          case 8:  Not needed because we don't have any requirements for this...
//            break;
          default:
            controller.watchWorkRequirements();
            break;
        }
      }
    } else {
      controller.set('mobileHeaderString', 'Edit Profile');
    }

    // if we have the required fields than we are not OnBoarding
    controller.set('onBoardingProcess', isOnBoardingProcess);
    controller.set('onBoardingPageId', goTo);
    controller.set('memberId', member.get('id'));

    controller.set('isLinkedIn', !Ember.isNone(member.get('linkedInProfile.data')));

    if (!Ember.isNone(member.get('mobilePhone'))) {
      controller.set('phoneNumber', member.get('mobilePhone'));
    } else {
      controller.set('phoneNumber', '');
    }

    // If the last place was after driving, well assume that user has made their choices... Unfortun
    if (goTo > 4) {
      controller.set('isLicensed', member.get('hasLicense') ? 'true' : 'false');
      controller.set('hasAnAutomobile', member.get('hasCar') ? 'true' : 'false');
      controller.set('isInsured', 'true'); //member.get('hasInsurance') ? 'true' : 'false');
    } else {
      controller.set('isLicensed', '');
      controller.set('hasAnAutomobile', '');
      controller.set('isInsured', 'true'); //'');
    }

    if (!Ember.isNone(member.get('car'))) {
      // kludge... force ember to load the car make... should be loading automatically but it's not
      Ember.RSVP.hash({
        carMake: member.get('car.carMake')
      }).then (function (car){
        member.set('car.carMake', car.carMake);
        controller.set('memberCar', member.get('car'));
      });
    } else {
      controller.set('memberCar', {nickname: null, make: null, makeId: null, model: null, year: null, color: null, photoUrl: null});
    }

    if(!Ember.isNone(member.get('tagline'))) {
      controller.set('tagLineText', member.get('tagline.text'));
    } else {
      controller.set('tagLineText', '');
    }

    // If the member has a home location then they at least partially gone through this...
    if (!Ember.isNone(member.get('homeLocation'))) {
      controller.set('startAddress', member.get('homeLocation.homeAddress.address1') + ", " + member.get('homeLocation.homeAddress.city') + ", " + member.get('homeLocation.homeAddress.state') + ", " + member.get('homeLocation.homeAddress.zip'));
      controller.set('startLocationNickName', member.get('homeLocation.name'));
      controller.set('oldHomeLocation', member.get('homeLocation'));

      var wa = {
        latitude: member.get('homeLocation.latitude'),
        longitude: member.get('homeLocation.longitude'),
        country: member.get('homeLocation.homeAddress.country')
      };

      controller.set('startLocation', wa);
      controller.set('hasValidatedAddress', true);
    } else {
      controller.set('startLocation', null);
      controller.set('hasValidatedAddress', false);
      controller.set('editStartLocation', true);
      controller.set('cannotSaveAddress', true);
      controller.set('startAddress', '');
      controller.set('startLocationNickName', null);
    }

    if (!Ember.isNone(member.get('workLocation'))) {
      controller.set('hasValidatedDestination', true);
      // kludge... force ember to load the work location... should be loading automatically but it's not
      Ember.RSVP.hash({
        location: member.get('workLocation')
      }).then (function (work){
        member.set('workLocation', work.location);
        controller.set('oldCompanyLocation', work.location);
      });
    } else {
      controller.set('hasValidatedDestination', false);
      controller.set('oldCompanyLocation', null);
    }

//    controller.set('lastListeningPref', undefined);
    var listeningPrefs = member.get('listeningPrefs');
    this.store.findQuery('listeningPrefOption').then(function(options){
      var listeningPrefSettings = [];
      var isFirst = true;
      var prefs = [];
      options.forEach(function (option) {
        var id = parseInt(option.get('id'), 10);

        if (isFirst) {
          prefs = [
            {id: id, oldId: -1, option: option.get('option'), isSet: false, display: true},
            {id: -1, oldId: -1, option: '', isSet: false, display: false}
          ];
        } else {
          prefs[1].id = id;
          prefs[1].option = option.get('option');
          prefs[1].display = true;
        }
        if (isFirst) listeningPrefSettings.push(prefs);
        if (!Ember.isNone(listeningPrefs) && listeningPrefs.length > 0) {
          listeningPrefs.forEach(function (lpref) {
            if (lpref.optionId === id) {
              if (isFirst) {
                prefs[0].isSet = true;
                prefs[0].oldId = lpref.id;
              } else {
                prefs[1].isSet = true;
                prefs[1].oldId = lpref.id;
              }
            }
          });
          isFirst = !isFirst;
        }
      });
      controller.set('listeningPrefSettings', listeningPrefSettings);
    });

    var musicPrefs = member.get('musicPrefs');
    this.store.findQuery('musicPrefOption').then(function(options){
      var musicPrefSettings = [];
      var isFirst = true;
      var prefs = [];
      options.forEach(function (option) {
        var id = parseInt(option.get('id'), 10);

        // Ugly kludge.... But exclude "I'm open minded" option
        if (id !== 8) {
          if (isFirst) {
            prefs = [
              {id: id, oldId: -1, option: option.get('option'), isSet: false, display: true},
              {id: -1, oldId: -1, option: '', isSet: false, display: false}
            ];
          } else {
            prefs[1].id = id;
            prefs[1].option = option.get('option');
            prefs[1].display = true;
          }
          if (isFirst) musicPrefSettings.push(prefs);
          if (!Ember.isNone(musicPrefs) && musicPrefs.length > 0) {
            musicPrefs.forEach(function (mpref) {
              if (mpref.optionId === id) {
                if (isFirst) {
                  prefs[0].isSet = true;
                  prefs[0].oldId = mpref.id;
                } else {
                  prefs[1].isSet = true;
                  prefs[1].oldId = mpref.id;
                }
              }
            });
          }
          isFirst = !isFirst;
        }
      });
      controller.set('musicPrefSettings', musicPrefSettings);
    });

    this.loadSchedule(this, controller, member.get('id'));

    this.store.find('carMake').
      then(function(makes) {
        controller.set('carMakes', makes);
      }).catch(function(){
        window.console.error('car make lookup did not work');
      });

    var years = [];
    for (var y = new Date().getFullYear() + 1; y > 1979; y--) {
      years.push({label: y, value: y});
    }
    years.push({label: 'Classic', value: 1900});
    controller.set('yearsContent', years);

    this.store.findQuery('workLocation', {memberId: member.get('id')}).
      then(function(locations) {
        controller.set('workLocations', locations);
      }).catch(function(){
        window.console.error('work locations lookup did not work');
      });

    controller.set('homeLocations', this.store.findQuery('homeLocation', {memberId: member.get('id')}));

    Ember.run.schedule('afterRender', this, function () {
      var indexEdit = flag.indexOf('_edit');
      if (indexEdit > -1) {
        flag = flag.substr(0, indexEdit);
        if (flag === 'start') {
          controller.send('addNewHomeLocation');
        }
        if (flag === 'destination') {
          controller.send('addNewWorkLocation');
        }
      }
      // Ok finally go to the crumb...
      controller.send(flag);

      // Have to manually set the active radio button labels for mobile...
      if (!controller.get('controllers.login.onDesktop')) {
        var id = 'gfl';
        if (controller.get('gender') === 'male') {
          id = 'gml';
        }
        $('#' + id).addClass('active');
        switch (controller.get('genderPreference')) {
          case 'male':
            id = 'xgml';
            break;
          case 'female':
            id = 'xgfl';
            break;
          default :
            id = 'xgel';
            break;
        }
        $('#' + id).addClass('active');
        id = 'ncl';
        if (controller.get('hasCar')) {
          id = 'hcl';
        }
        $('#' + id).addClass('active');
        id = 'nll';
        if (member.get('hasLicense')){
          id = 'hll';
        }
        $('#' + id).addClass('active');
      }
    });
  },

  loadSchedule: function(_this, controller, id) {
    controller.store.findQuery('weeklySchedule', {memberId: id})
      .then (function (weeklySchedule) {
      var dailySchedule = null;
      if (Ember.isNone(weeklySchedule.objectAt(0))) {
        controller.set('mon', false);
        controller.set('tue', false);
        controller.set('wed', false);
        controller.set('thu', false);
        controller.set('fri', false);
        controller.set('sat', false);
        controller.set('sun', false);
        controller.set('homeDepartureTime', '7:00 AM');
        controller.set('workDepartureTime', '5:00 PM');
        controller.set('weeklyScheduleId', null);
      } else {
        dailySchedule = weeklySchedule.objectAt(0).get('dailySchedules');
        controller.set('mon', dailySchedule.objectAt(0).id !== "-1");
        controller.set('tue', dailySchedule.objectAt(1).id !== "-1");
        controller.set('wed', dailySchedule.objectAt(2).id !== "-1");
        controller.set('thu', dailySchedule.objectAt(3).id !== "-1");
        controller.set('fri', dailySchedule.objectAt(4).id !== "-1");
        controller.set('sat', dailySchedule.objectAt(5).id !== "-1");
        controller.set('sun', dailySchedule.objectAt(6).id !== "-1");
        controller.set('weeklyScheduleId', weeklySchedule.objectAt(0).get('id'));

        _this.findDepartureTimes(controller, dailySchedule);
      }
    });

  },

  actions: {

    willTransition: function(transition) {
      // The willTransition isn't firing in application so need to do it here...
      this.controllerFor('application').send('closeMobileMenu');

      if (transition.router.activeTransition.targetName === 'member.linkedin' || (transition.router.activeTransition.targetName === 'login' && this.controllerFor('login').get('token'))){
        transition.abort();
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: 'Sorry...',
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogText: 'Sorry but that page is no longer available.'
          });
      }
      // Undo changes just incase user left without submit...
      var controller = this.controllerFor('member.profile_main');
      if (controller.get('model.isDirty')) {
        controller.get('model').rollback();
      }
      if (controller.get('memberCar.isDirty')) {
        controller.get('memberCar').rollback();
      }
      this.loadSchedule(this, controller, controller.get('model.id'));
    }

  }

});

export default MemberProfileMainRoute;