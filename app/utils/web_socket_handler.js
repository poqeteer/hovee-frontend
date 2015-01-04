import standaloneModalDialog from 'appkit/utils/standalone_modal_dialog';

var WebSocketHandler = Ember.Object.extend({
  uri: 'ws://hovee-staging-ms.herokuapp.com',
  //uri: 'ws://hovee-prod-ms.herokuapp.com', // If you change defaults make sure to do it in main index.html also
  //uri: 'ws://localhost:1337',
  ws: null,
  onOpen: null,
//  init: function() {
//    // Switch server depending on which host we are on... Use default if localhost.
//    var host = window.location.host;
//    if (host.indexOf('localhost') === -1) {
//      // Because the URL of the app will now be different on production, the API URL can no longer be gotten dynamically.
//      // Now we test for the address to contain ‘hovee.com’ and use the static prod API URL.
//      if (host.indexOf('hovee.com') > -1) {
//        this.url = 'ws://hovee-prod-ms.herokuapp.com';
//      } else {
//        this.url = 'ws://' + host.replace('web', 'ms');
//      }
//    }
//    this.ws = new window.WebSocket(this.uri);
//    var self = this;
//    // callbacks
//    this.ws.onopen = function() {
//      Ember.Logger.debug('WebSocket connection established');
//      self.onOpen();
//    };
//    this.ws.onclone = function() {
//      Ember.Logger.debug('Connection closed /' + 'all');
//    };
//    this.ws.onmessage = function(data) {
//      var json = JSON.parse(data.data);
//      standaloneModalDialog(json.dialogTitle, json.dialogImageUrl, json.dialogMessage, json.closeActionLink);
//    };
//
//    this._super();
//  }
});

export default WebSocketHandler;
