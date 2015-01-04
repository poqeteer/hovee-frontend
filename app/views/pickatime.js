var PickATime = Ember.View.extend({
  tagName: 'input',
  attributeBindings : [ "name", "value" ],
  attributes: ['interval', 'min', 'max', 'select', 'onDesktop'],
  // attributes: ['monthsFull', 'monthsShort', 'weekdaysFull', 'weekdaysShort',
  // 'monthPrev', 'monthNext', 'showMonthsFull', 'showWeekdaysShort', 'today',
  // 'clear', 'format', 'formatSubmit', 'hiddenSuffix', 'firstDay', 'monthSelector',
  // 'yearSelector', 'dateMin', 'dateMax', 'datesDisabled', 'disablePicker'],

  events: ['start', 'render', 'open', 'close', 'stop', 'set'],

  classNames: 'pickatime',

  onChange: function(e) {
    this.set('value', e.currentTarget.value);
  },

  didInsertElement: function() {
    var options = {};
    var self = this;

    this.get('events').forEach(function(event) {
      var callback = self[event];
      if (callback) {
        options[event] = callback;
      }
    });

    this.get('attributes').forEach(function(attr) {
      if (self[attr] !== undefined) {
        options[attr] = self[attr];
      }
    });

    options.interval      =  15;
    options.format        = 'h:i A';
    options.formatSubmit  = 'h:i A';
    options.min           = [3,0];
    options.max           = [23,30];
    options.clear         = '';
    options.editable      = false; //Ember.isNone(this.get('onDesktop')) ? true : this.get('onDesktop'); // edit doesn't seem to work... but doesn't look right on desktop
    options.onOpen        = function(e) { 
      this.set('view', this.get('value'));
      this.set('highlight', this.get('value'));
    };
    this.$('').pickatime(options);
    this.$('').on('change', function(e) {self.onChange(e);});
  }
});

export default PickATime;

