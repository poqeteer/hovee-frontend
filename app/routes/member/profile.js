import AuthenticatedRoute from 'appkit/routes/authenticated';

import TaglineMixinRoute from 'appkit/mixins/tagline_mixin_route';
import ProfileMixinRoute from 'appkit/mixins/profile_mixin_route';

var MemberProfileRoute = AuthenticatedRoute.extend(TaglineMixinRoute, ProfileMixinRoute, {

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
    var controller = this.controllerFor('member.profile');

    controller.set('controllers.application.beenToProfile', true);

    this.taglineAfterModelProcessing(controller, this.get('member'));
    controller.set('controllers.application.lastPage', 'profile');

    controller.set('memberId', member.id);

    var isMemberProfile = parseInt(member.id, 10) === parseInt(controller.get('controllers.login.memberId'), 10);
    controller.set('isMembersProfile', isMemberProfile);
    controller.set('isPreview', !isMemberProfile);

    if (!Ember.isNone(member.get('workLocation'))) {
      // kludge... force ember to load the work location... should be loading automatically but it's not
      Ember.RSVP.hash({
        location: member.get('workLocation')
      }).then(function (work) {
        member.set('workLocation', work.location);
      });
    }

    this.profileAfterModelProcessing(controller, member.id);

    controller.set('listeningPreferences', []);
    var listeningPrefs = member.get('listeningPrefs');
    if (!Ember.isNone(listeningPrefs) && listeningPrefs.length > 0) {
      this.store.findQuery('listeningPrefOption').then(function (options) {
        var listeningPreferences = [];
        listeningPrefs.forEach(function (pref) {
          options.forEach(function (option) {
            if (parseInt(option.get('id'), 10) === pref.optionId) {
              listeningPreferences.push({pref: option.get('option')});
            }
          });
        });
        controller.set('listeningPreferences', listeningPreferences);
      });
    }

    controller.set('musicPreferences', []);
    var musicPrefs = member.get('musicPrefs');
    if (!Ember.isNone(musicPrefs) && musicPrefs.length > 0) {
      this.store.findQuery('musicPrefOption').then(function (options) {
        var musicPreferences = [];
        musicPrefs.forEach(function (pref) {
          options.forEach(function (option) {
            if (parseInt(option.get('id'), 10) === pref.optionId) {
              musicPreferences.push({pref: option.get('option')});
            }
          });
        });
        controller.set('musicPreferences', musicPreferences);
      });
    }

    // The willTransition isn't firing in application so need to do it here...
    this.controllerFor('application').send('closeMobileMenu');
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

export default MemberProfileRoute;