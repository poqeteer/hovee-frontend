var Router = Ember.Router.extend(); // ensure we don't share routes between all Router instances

Router.map(function() {
  this.resource('accounts');

  this.resource('registrants', function() {
    this.route('fan', {path: ':email/fan'});
    this.route('forgotten');
    this.route('ios_redirect');
    this.route('key');
    this.route('new');
    this.route('reg_error');
    this.route('reset', {path: ':email/:resetKey/reset'});
    this.route('response', {path: ':email/response'});
  });

  this.resource('registrant', { path: '/registrants/:registrantKey/:email' }, function() {
    this.route('new_member');
  });

  this.resource('administration', function() {
    this.route('companies');
    this.route('daily_active_users');
    this.route('fan_report');
    this.route('main');
    this.route('match_two');
    this.route('members');
    this.route('messages');
    this.route('new_domain', {path: ":company_id/new_domain"});
    this.route('new_location', {path: ":company_id/new_location"});
    this.route('new_team', {path: ":company_id/new_team"});
    this.route('recommendations', {path: ":member_id/recommendations"});
    this.route('recommender');
    this.route('tracking_count');
    this.route('trips');
    this.route('unconfirmed_registrants');
  });

  this.resource('member', { path: '/members/:member_id' }, function() {
    this.route('account_management');
    this.route('calendar');
    this.route('help');
    this.route('linkedin');
    this.route('loading');
    this.route('map_the_ride', {path: "map_the_ride/:partner_id/:trip_id"});
    this.route('my_commute');
    this.route('notifications');
    this.route('qapla', {path: "qapla/:partner_id/:lookup_id/:choice"});
    this.route('pick_date', {path: "pick_date/:partner_id"});
    this.route('profile');
    this.route('profile_main', {path: "profile_main/:flag"});
    this.route('ride_match');
    this.route('rides');
    this.route('signup');
    this.route('thank_you');
    this.route('trip_detail', {path: "trip_detail/:partner_id/:trip_id"});
    this.route('trip_in_progress', {path: "trip_in_progress/:trip_id/:flag"});
    this.route('trip_in_progress_message', {path: "trip_in_progress_message/:trip_id/:partner_id/:is_driver"});
    this.route('trip_map', {path: "trip_map/:trip_id/:flag"});
    this.route('trip_proposal', {path: "trip_proposal/:partner_id/:trip_id/:date"});
    this.route('trip_rating_and_stats', {path: "trip_rating_and_stats/:trip_id"});
  });


  this.route('keyed', {path: "/keyed/:params"});

  this.route('login');

  this.route('communication_settings');
  this.route('faq');
  this.route('member_support');
  this.route('privacy-policy');
  this.route('terms-of-service');
  this.route('tos_m');

  this.route('incomplete');
  this.route('maintenance');

  // App kit routes
  this.route('component-test');
  this.route('helper-test');
  // this.resource('posts', function() {
  //   this.route('new');
  // });
});

export default Router;
