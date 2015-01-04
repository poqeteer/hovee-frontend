var PickADate = Ember.View.extend({
  tagName: 'input',
  attributeBindings : [ "name", "value" ],
  attributes: ['interval', 'format', 'formatSubmit', 'select'],
  // attributes: ['monthsFull', 'monthsShort', 'weekdaysFull', 'weekdaysShort',
  // 'monthPrev', 'monthNext', 'showMonthsFull', 'showWeekdaysShort', 'today',
  // 'clear', 'format', 'formatSubmit', 'hiddenSuffix', 'firstDay', 'monthSelector',
  // 'yearSelector', 'dateMin', 'dateMax', 'datesDisabled', 'disablePicker'],

  events: ['start', 'render', 'open', 'close', 'stop', 'set'],

  classNames: 'pickadate',

  onChange: function(e) {
    this.set('value', e.currentTarget.value);
  },

  didInsertElement: function() {
    var options = {};
    var self = this;

    options.format       = 'mmmm dd, yyyy';
    options.formatSubmit = options.format;
    options.hiddenPrefix = 'prefix__';
    options.hiddenSuffix = '__suffix';

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

    this.$('').pickadate(options);
    this.$('').on('change', function(e) {self.onChange(e);});
  }
});

export default PickADate;

