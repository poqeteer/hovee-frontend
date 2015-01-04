var TaglineMixinRoute = Ember.Mixin.create({

  taglineAfterModelProcessing: function(controller, member) {
    if (!Ember.isNone(member.get('tagline'))) {
      controller.set('taglineText', member.get('tagline.text'));
    } else {
      controller.set('taglineText', null);
    }
  }
});

export default TaglineMixinRoute;