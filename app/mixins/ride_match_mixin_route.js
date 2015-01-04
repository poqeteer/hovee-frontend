/**
 * Created by lancemock on 10/13/14.
 */
import TaglineMixinRoute from 'appkit/mixins/tagline_mixin_route';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var RideMatchMixinRoute = Ember.Mixin.create(TaglineMixinRoute, {

  rideMatchAfterModelProcessing: function(controller, recommendations, member) {
    this.taglineAfterModelProcessing(controller, member);

    controller.set('recommendations', recommendations);
    Ember.$.get(Ember.ENV.APIHOST + '/recommender-version').then(function(response){
      controller.set('version', response.recommenderVersion.version);
    });

    controller.computeMapHeight(controller);

    //controller.set('displayMap', controller.get('controllers.login.onDesktop'));

    var setDefault = function(recommendation){
      recommendation.set('homeDepartureTime', '7:00 AM');
      recommendation.set('workDepartureTime', '5:00 PM');
      recommendation.set('homeDepartureTimestamp', new Date('January 1, 1970 7:00 AM').getTime());
      recommendation.set('workDepartureTimestamp', new Date('January 1, 1970 5:00 PM').getTime());
    };
    var processRecommendation = function(recommendation) {
      if (Ember.isNone(recommendation.get('member.id'))) {
        Ember.Logger.debug('no member id in ' + recommendation.get('id') + ' where memberId is ' + recommendation.get('memberId'));
      }
      controller.store.findQuery('weeklySchedule', {memberId: recommendation.get('memberId')}).
        then(function(schedule) {
          // FIXME: Because only one time for all days, only need to find the first day that can be scheduled to find the times
          var memberSchedule = schedule.objectAt(0).get('dailySchedules');
          if (schedule.objectAt(0).get('id') !== '-1' && !Ember.isEmpty(memberSchedule.objectAt(0).get('homeDepartureTime')) && !Ember.isEmpty(memberSchedule.objectAt(0).get('workDepartureTime'))) {
            recommendation.set('homeDepartureTime', memberSchedule.objectAt(0).get('homeDepartureTime'));
            recommendation.set('workDepartureTime', memberSchedule.objectAt(0).get('workDepartureTime'));

            recommendation.set('homeDepartureTimestamp', new Date('January 1, 1970 ' + memberSchedule.objectAt(0).get('homeDepartureTime')).getTime());
            recommendation.set('workDepartureTimestamp', new Date('January 1, 1970 ' + memberSchedule.objectAt(0).get('workDepartureTime')).getTime());
          } else {
            setDefault(recommendation);
          }
        }).catch(function(){
          setDefault(recommendation);
        });
    };

    var len = recommendations.get('length');
    var half = len / 2;
    var firstQtr = Math.round(half / 2);
    var thirdQtr = half + firstQtr;
    var i1 = 0, i2 = 0, i3 = 0, i4 = 0;

    setTimeout(function() {
      recommendations.forEach(function(recommendation){
        if (i1++ < firstQtr) {
          processRecommendation(recommendation);
        }
      });
    }, 2500);
    setTimeout(function() {
      recommendations.forEach(function(recommendation){
        if (i2 >= firstQtr && i2 < half) {
          processRecommendation(recommendation);
        }
        i2++;
      });
    }, 3500);
    setTimeout(function() {
      recommendations.forEach(function(recommendation){
        if (i3 >= half && i3 < thirdQtr) {
          processRecommendation(recommendation);
        }
        i3++;
      });
    }, 4000);
    setTimeout(function() {
      recommendations.forEach(function(recommendation){
        if (i4++ >= thirdQtr) {
          processRecommendation(recommendation);
        }
      });
      // kludge... load initial set of map icons...
      if (Ember.isNone(controller.get('controllers.application.BAMOnce'))) {
        controller.send('refreshTheMap');
      }
    }, 4500);

    // kludge of a kludge... load the rest of the map icons...
    setTimeout(function() {
      if (Ember.isNone(controller.get('controllers.application.BAMOnce'))) {
        controller.send('refreshTheMap', true);
        controller.set('controllers.application.BAMOnce', true);
      }
    }, 9000);

    // This will only show the member's marker...
    Ember.run.schedule('afterRender', this, function () {
      controller.send('refreshTheMap', controller.get('controllers.application.BAMOnce'));
    });

    /*
     this.store.find('company').then(function (companies) {
     var cos = [];
     companies.forEach(function (co) {
     cos.push({name: co.get('name'), id: co.get('id'), checked: true});
     });
     controller.set('companies', cos);
     }). catch(function(error) {
     window.alert('error: ' + error.message);
     });
     */
    this.store.findQuery('listeningPrefOption').then(function(options){
      var opts = [];
      options.forEach(function (opt) {
        opts.push({name: opt.get('option'), id: parseInt(opt.get('id'), 10), checked: true});
      });
      controller.set('listeningPrefOptions', opts);
    });
  }
});

export default RideMatchMixinRoute;