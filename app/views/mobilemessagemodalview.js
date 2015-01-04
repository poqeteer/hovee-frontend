var MobileMessageModalView = Ember.View.extend({

	didInsertElement: function() {
		// initially hide the custom-text area until a user picks the last messaging option
		$('.custommessage').hide();

		$('select.choices').change(function() {
			var lastIndex = $('select.choices option').length - 1;
			if($("select.choices").prop("selectedIndex") === lastIndex){
				// show textarea
				$('.custommessage').show(200);
				$('textarea.message').focus();
			} else {
				// hide textarea
				$('.custommessage').hide(200);
			}
		});

		// below is code for counting characters
    var view = this;
    var text_max = 160;

    $('textarea.message').keyup(function() {
        var text_length = $('textarea.message').val().length;
        var text_remaining = text_max - text_length;

        $('.char-count').html(text_remaining);
    });
  }
});

export default MobileMessageModalView;
