var TimeSlider = Ember.View.extend({
  didInsertElement: function() {
    var view = this;
//    this.$('').slider({
//      from: 480,
//      to: 1080,
//      step: 15,
//      dimension: '', scale: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', "18:00"],
//      limits: false,
//      calculate: function( value ){
//        var hours = Math.floor( value / 60 );
//        var mins = ( value - hours*60 );
//        var time = (hours < 10 ? "0"+hours : hours) + ":" + ( mins === 0 ? "00" : mins );
//        return time;
//      },
//      onstatechange: function(value){view.onStateChange(value);}
//    });
  },
  onStateChange: function(value) {
    this.set('value', value);
  },
  setValues: function(p1, p2) {
    //this.$('').slider('value', p1, p2);
  },
  tagName : "input",
  type : "slider",
  attributeBindings : [ "name", "type", "value" ]
});

export default TimeSlider;

