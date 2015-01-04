/* usage in a template:

 {{view "calendarmatrixview" selectedWeekIndex=selectedWeekIndex
 selectedDisplayDate=selectedDisplayDate
 selectedDate=selectedDate
 member4WeekSchedule=member4WeekSchedule
 partner4WeekSchedule=partner4WeekSchedule
 scheduling4Week=scheduling4Week}}

*/
var CalendarMatrixView = Ember.View.extend({
  templateName: 'views/calendar-matrix-view',
  selectedWeekIndex: null,
  selectedDate: null,
  calendarObject: null,
  currentWeekArray: null,
  isNegotiatingTrip: null,
  isCancelledOrDeclined: null,
  isAccepted: null,

  // run this code once the calendar template has been inserted into the DOM
  didInsertElement: function() {

    var view = this; // for scope usage inside methods

    // cache the weeks
    var $eachWeek = Ember.$('.calendar .week');
    // cache the days
    var $eachWeekDay = Ember.$('.weeks .day');

    var $tip = view.$('.calendartip');
    $tip.css({ 'display': 'none', position: 'fixed', 'z-index': 999 });

    // interaction events for DAYS in the week-view:
    $eachWeekDay.hover(function() {
      // cache reference to this (speeds up the jquery)
      var $this = Ember.$(this),
        isOneOfYourDays = $this.parent().parent().parent().hasClass("top");
      if (view.get('isNegotiatingTrip') === true || (view.get('isNegotiatingTrip') === false) && (isOneOfYourDays === true)) {
        var wi = view.get('selectedWeekIndex');
        var di = $this.index();
        var day = view.get('calendarObject.content.' + wi + '.daysOfTheWeek.' + di);

        var dayStr = $this.attr('class').split(' ')[1]; // assumes day-of-week is 2nd class each day

        // see if both your and your partner's days are available
        if (day.get('bothAreAvailable') && ! Ember.$('.weeks .weekconnector td.' + dayStr).hasClass('selected')) {
          $this.css('cursor', 'pointer');

          Ember.$('.weeks .weekconnector td.' + dayStr).addClass('hovered');
          Ember.$('.weeks .week td.' + dayStr).addClass('hovered');
        }
      }
    }, function() {
      var $this = Ember.$(this),
        isOneOfYourDays = $this.parent().parent().parent().hasClass("top");

      if (view.get('isNegotiatingTrip') === true || (view.get('isNegotiatingTrip') === false) && (isOneOfYourDays === true)) {
        // change cursor back to normal
        $this.css('cursor', 'inherit');
        // unset connector class (space between upper + lower days)
        var dayStr = $this.attr('class').split(' ')[1];
        Ember.$('.weeks .weekconnector td.' + dayStr).removeClass('hovered');
        Ember.$('.weeks .week td.' + dayStr).removeClass('hovered');
      }
    });
    $eachWeekDay.hoverIntent(function() {
      // cache reference to this (speeds up the jquery)
      var $this = Ember.$(this),
        isOneOfYourDays = $this.parent().parent().parent().hasClass("top");
      if (view.get('isNegotiatingTrip') === true || (view.get('isNegotiatingTrip') === false) && (isOneOfYourDays === true)) {
        var wi = view.get('selectedWeekIndex');
        var di = $this.index();
        var day = view.get('calendarObject.content.' + wi + '.daysOfTheWeek.' + di);

        var dayStr = $this.attr('class').split(' ')[1]; // assumes day-of-week is 2nd class each day

        // for the tooltip
        if (day.get('memberStatus') !== "") {
          // populate tooltip info:
          $tip.html('<p class="you">'+day.get('memberStatus')+'</p><p class="partner">'+day.get('partnerStatus')+'</p>');
          // x is days's x
          var x = $this.offset().left + ($this.outerWidth() / 2) - ($tip.outerWidth() / 2);
          var y = Ember.$('.weeks .week.bottom').offset().top + $this.outerHeight() - Ember.$(document).scrollTop() - 14;

          $tip.css({ top: y, left: x }).stop().fadeIn(200);
        }
      }
    }, function() {
      var $this = Ember.$(this),
        isOneOfYourDays = $this.parent().parent().parent().hasClass("top");

      $tip.fadeOut(100, function(){
        if (view.get('isNegotiatingTrip') === true || (view.get('isNegotiatingTrip') === false) && (isOneOfYourDays === true)) {
          $('.infobox .infodate').html('&nbsp;');
          $('.infobox .infodetails').html('&nbsp;');
        }
      });
    });

    $eachWeekDay.click(function(e) {
      if (view.get('isNegotiatingTrip') === true) {
        $tip.fadeOut(100);
        var wi = view.get('selectedWeekIndex');
        var di = Ember.$(this).index();
        var day = view.get('calendarObject.content.' + wi + '.daysOfTheWeek.' + di);

        if (day.get('bothAreAvailable')) {
          Ember.$('.weeks .weekconnector td').removeClass('hovered');
          Ember.$('.weeks .weekconnector td').removeClass('selected');
          Ember.$('.weeks .week td').removeClass('hovered');
          Ember.$('.weeks .week td').removeClass('selected');

          var dayOfWeekClassName = Ember.$(this).attr('class').split(' ')[1];  // mon, tue, etc
          view.unselectAllWeekDays();
          Ember.$('.weeks .weekconnector td.' + dayOfWeekClassName).addClass('selected');
          Ember.$('.weeks .week td.' + dayOfWeekClassName).addClass('selected');

          if(view.get('isCancelledOrDeclined')) {
            Ember.$('.weeks .weekconnector td.' + dayOfWeekClassName).addClass('declined');
            Ember.$('.weeks .week td.' + dayOfWeekClassName).addClass('declined');
          }
          var c = view.get('controller');
          c.send('selectTheDay', day);
        }
      }
    });

    Ember.$(window).resize(function() {
      view.setElementHeights();
    });

    // set the height of elements:
    this.setElementHeights();

    // if no week is in negotiation, auto-select the first week:
    if (Ember.isNone(view.get('selectedWeekIndex'))) {
      view.set('selectedWeekIndex', 0);
    } else {
      // otherwise update the UI to reflect the relevant week (of negotation)
      view.onCalendarWeekChange();
    }
  },

  setElementHeights: function() {
    Ember.$('.schedulematrix .weeks .week .day').height(97);
  },

  removeWeekClasses: function() {
    var $weekDays = Ember.$('.schedulematrix .weeks .week .day');
    $weekDays.each(function() {
      var $t = $(this);
      if ($t.hasClass('scheduled')) {
        $t.removeClass("scheduled");
      }
      if ($t.hasClass('available')) {
        $t.removeClass("available");
      }
      if ($t.hasClass('not')) {
        $t.removeClass("not");
      }

    });
  },

  unselectAllWeekDays: function() {
    Ember.$('.weeks .weekconnector td').removeClass('selected');
    Ember.$('.weeks .week td').removeClass('selected');
    Ember.$('.weeks .weekconnector td').removeClass('declined');
    Ember.$('.weeks .week td').removeClass('declined');
    Ember.$('.weeks .weekconnector td').removeClass('accepted');
    Ember.$('.weeks .week td').removeClass('accepted');
  },

  selectDateInUI: function() {
    this.unselectAllWeekDays();
    for (var i=0; i < 7; i++){
      if(this.get('currentWeekArray.'+i+'.displayDate') === this.get('selectedDate')) {

        var dayStr = this.get('currentWeekArray.'+i+'.id').toLowerCase();
        Ember.$('.weeks .weekconnector td.' + dayStr).addClass('selected');
        Ember.$('.weeks .week td.' + dayStr).addClass('selected');

        if(this.get('isCancelledOrDeclined')) {
          Ember.$('.weeks .weekconnector td.' + dayStr).addClass('declined');
          Ember.$('.weeks .week td.' + dayStr).addClass('declined');
        }

        if(this.get('isAccepted')) {
          Ember.$('.weeks .weekconnector td.' + dayStr).addClass('accepted');
          Ember.$('.weeks .week td.' + dayStr).addClass('accepted');
        }

        break;
      }
    }
  },

  // this fires whenever this.get('selectedWeekIndex') changes
  // thus far triggered by a click on a week or the initial
  // state of the view
  onCalendarWeekChange: function() {
    // Ember.Logger.debug(">>> onCalendarWeekChange");
    this.set("currentWeekArray", this.get('calendarObject.content.' + this.get('selectedWeekIndex') + '.daysOfTheWeek'));
    this.selectDateInUI();
  }.observes('selectedWeekIndex'),

  // this fires whenever this.get('selectedDate') changes
  onSelectedDateChange: function() {
    // Ember.Logger.debug(">>> onSelectedDateChange");
    this.selectDateInUI();
  }.observes('selectedDate')

});

export default CalendarMatrixView;
