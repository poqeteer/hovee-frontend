var RadioButtonComponent = Ember.Component.extend({
  tagName : "input",
  type : "radio",
  attributeBindings : [ "name", "type", "value", "checked:checked", "isDesktop" ],
  classNameBindings: ["checked:active"],
  click : function() {
    this.set("selection", this.$().val());
  },
  checked : function() {
    return this.get("value") === this.get("selection");
  }.property('selection')
});

export default RadioButtonComponent;
