//import WebSocketHandler from 'appkit/utils/web_socket_handler';

var ApplicationController = Ember.Controller.extend({
  needs: ['login', 'currentMember'],

  tallEnough: true,

  beenToProfile: false,

  onRideMatch: false,       // Kludge for the rides page and only desktop
  showRidesBackToCalendar: false,  // Kludge for the rides page and only desktop

  // Set in the ride_match_mixin_controller init event/function... In theory this should really only need to added to the
  // needs above, but I can't get the dot '.' controllers to work (I.E. member.ride_match)
  ride_match_controller: null,
  rides_controller: null,

  actions: {
    backToRidesCalendar: function()  {
      this.get('rides_controller').send('backToRidesCalendar');
    },
    sendRidesOpenMsg: function(){
      this.get('rides_controller').send('openHelp');
    },

    // This is a global event called from sendAlert in the index.html
    dispatchAlert:function(dispatchId){
      // For now should only be coming from ride_match... But in the future to allow for more than one such case we should
      // preface the id with a code to designate which event/action/function to call. For example...
      if (dispatchId.substr(0,2) === 'rm') {
        var controller = this.get('ride_match_controller');       // Get the controller
        if (dispatchId.substr(2) === 'Map') {
          controller.switchView(controller, 'map');
        } else if (dispatchId.substr(2) === 'List') {
          controller.switchView(controller, 'list');
        } else {
          controller.mapTheRide(controller, dispatchId.substr(2));// Call the function with controller and dispatch id.
                                                                  // This could also be a controller.send() call as well.
        }
      }
    },

    jumpToHomePage: function() {
      if (!Ember.isNone(this.get('controllers.currentMember.member.id'))) {
        this.transitionToRoute('member.rides', this.get('controllers.currentMember.member.id'));
      }
    }

  },

  init: function() {
    this.setAuthHeader();
    this.openMOMEvents();
    if(!this.get('onDesktop')){
      Ember.$('body').addClass('mobile');
    }
    this.set('tallEnough', window.innerHeight > 480);
  },

  /* scrolls page to top when path changes */
  currentPathChanged: function () {
    window.scrollTo(0, 0);
  }.observes('currentPath'),


  hasBrowsingHistory: function() {
    // one item is always the current page, so >1 = two items
    var len = window.history.length;
    return len > 1;
  }.property('window.history'),

  openMOMEvents: function() {
//    var loginController = this.get('controllers.login'),
//        memberId = loginController.get('memberId');
//
//    // Ember.Logger.debug('Initializing websocket connection');
////    window.wsh = WebSocketHandler.create();
//    // Ember.Logger.debug('Initialed websocket connection:', window.wsh);
//
//    window.wsh.onOpen = function(){
//      var user = {id: memberId};
//      var payload = { user: user };
//      var envelope = JSON.stringify({ cmd: 'appOpen',
//                                      data: payload
//                                    });
//      Ember.Logger.debug('Send openApp message to server: ' + envelope);
//      window.wsh.ws.send(envelope);
//    };
  },
  onDesktop: function() {
    var isMobile =
      function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(window.navigator.userAgent||window.navigator.vendor||window.opera);
        return check;
      };
    return !isMobile();
  }.property('onDesktop'),

  isIOS: function () {
    return window.navigator.userAgent.match(/(iPod|iPhone|iPad)/) && window.navigator.userAgent.match(/AppleWebKit/);
  }.property('isMobileSafari'),

  isAndroid: function() {
    return window.navigator.userAgent.match(/Android/);
  }.property('isAndroid'),

  whichMobile: function() {
    return this.get('isIOS') ? 'ios' : this.get('isAndroid') ? 'android' : 'mobile';
  }.property('whichMobile'),

//  isIPod: function () {
//    return window.navigator.userAgent.match(/iPod/);
//  }.property('isIPod'),
//  isIPhone: function () {
//    return window.navigator.userAgent.match(/iPhone/);
//  }.property('isIPhone'),
//  isIPad: function () {
//    return window.navigator.userAgent.match(/iPad/);
//  }.property('isIPad'),

  onBinaryWebView: function() {
    var is_webView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
    return is_webView;
  }.property('window.navigator.userAgent'),

  lastToken: null,
  closeNotification: function() {
    var notification = this.get('notification');

    if(!Ember.isEmpty(notification) && notification.persists) {
      notification.persists = null;
    } else {
      this.set('notification', null);
    }
  },

  notify: function(options) {
    var type = options.type,
        persists = options.persists;

    options.type = typeof type !== 'undefined' ? type : 'alert-danger';
    options.persists = typeof persists !== 'undefined' ? persists : false;

    this.set('notification', options);
  },

  lastPage: null
});

export default ApplicationController;
