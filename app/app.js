import Resolver from 'resolver';
import ApplicationAdapter from 'appkit/adapters/rest';
import registerComponents from 'appkit/utils/register_components';

var App = Ember.Application.extend({
  LOG_ACTIVE_GENERATION: true,
  LOG_MODULE_RESOLVER: true,
  LOG_TRANSITIONS: true,
  LOG_TRANSITIONS_INTERNAL: true,
  LOG_VIEW_LOOKUPS: true,
  modulePrefix: 'appkit', // TODO: loaded via config
  customEvents: {touchend: "click"}, // for mobile touch events
  Resolver: Resolver,
  Store: DS.Store.extend({
    revision: 13,
    adapter: ApplicationAdapter
  })
});

App.initializer({
  name: 'Register Components',
  initialize: function(container, application) {
    registerComponents(container);
  }
});

export default App;
