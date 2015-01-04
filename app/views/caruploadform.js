var CarUploadForm = Ember.View.extend({
  didInsertElement: function() {
    var selfView = this;
    var s3URL = "https://hovee001.s3.amazonaws.com/";
    var fileKey = "";
    var controller = selfView.get('controller');
    var $status = Ember.$('.form-group .help-block');
    // policy to send
    var policy = { "expiration": "2025-12-01T12:00:00.000Z",
      "conditions": [
        {"bucket": "hovee001"},
        ["starts-with", "$key", ""],
        {"acl": "public-read"},
        ["starts-with", "$Content-Type", ""],
        ["content-length-range", 0, 524288000]
      ]
    };

    // initially hide the upload button
    Ember.$('#uploadSubmit').hide();

    // then show the upload button if an image is selected
    $("input:file").change(function (){
      Ember.$('#uploadSubmit').delay( 800 ).fadeIn(250);
    });

    Ember.$('#uploadSubmit').click(function(e) {
      e.preventDefault();
      // Ember.Logger.info('upload submit clicked.');

      uploadFile();
    });

    // get the policy and signature from PS
    Ember.$.ajax({
      type: 'POST',
      url: Ember.ENV.APIHOST + '/policySignature/sign',
      data: JSON.stringify(policy),
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }).then(function(data) {
      if (data.policy !== "" && data.signature !== "") {
        controller.set('encodedPolicy', data.policy);
        controller.set('calculatedSignature', data.signature);
      }
    });

    var getXMLHTTPObject = function() {
      var objXMLHttp = null;
      if (window.XMLHttpRequest) {
        objXMLHttp = new window.XMLHttpRequest();
      } else if (window.ActiveXObject) {
        objXMLHttp = new window.ActiveXObject("Microsoft.XMLHTTP");
      }
      return objXMLHttp;
    };

    var uploadFile = function() {
      $status.text('Uploading... ');
      if (document.getElementById('file').files.length > 0) {
        var file = document.getElementById('file').files[0];
        var fd = new window.FormData();

        var key = "car-images/" + (new Date().getTime()) + '-' + file.name;
        selfView.key = key;

        fd.append('key', key);
        fd.append('acl', 'public-read');
        fd.append('Content-Type', '');
        fd.append('AWSAccessKeyId', 'AKIAJUP47Q7VN6DCLKUQ');
        fd.append('policy', controller.get('encodedPolicy'));
        fd.append('signature', controller.get('calculatedSignature'));

        fd.append("file", file);

        var xhr = getXMLHTTPObject();

        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);

        xhr.open('POST', s3URL, true); //MUST BE LAST LINE BEFORE YOU SEND
        //xhr.setRequestHeader("Content-type","multipart/form-data");
        xhr.send(fd);

        Ember.$('#uploadSubmit').after(' <i class="fa fa-spinner fa-spin"></i>');
      }
    };

    var uploadProgress = function(evt) {
      if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        $status.text('Uploading... ' + percentComplete.toString() + '%');
        // Ember.Logger.debug(percentComplete.toString() + '%');
      } else {
        // Ember.Logger.debug('unable to compute');
      }
    };

    var uploadComplete = function(evt) {
      // Ember.Logger.debug("Done - " + evt);
      Ember.$('.form-group').removeClass('has-warning');
      Ember.$('.form-group').removeClass('has-error');
      Ember.$('.form-group').addClass('has-success');
      $status.text('Image upload successful.');
      var photoURL = s3URL + selfView.key;
      // set parent controller's photoURL var for model purposes
      controller.set('memberCar.photoUrl', photoURL);
      Ember.$('.fa-spinner').remove();
      Ember.$('#uploadSubmit').after(' <i class="fa fa-check"></i>');
      Ember.$('#carPhoto').attr('src', photoURL);
    };

    var uploadFailed = function(evt) {
      // Ember.Logger.error("There was an error attempting to upload the file." + evt);
      Ember.$('.form-group').removeClass('has-success');
      Ember.$('.form-group').removeClass('has-warning');
      Ember.$('.form-group').addClass('has-error');
      $status.text('We ran into a problem uploading the image.');
    };

    var uploadCanceled = function(evt) {
      // Ember.Logger.error("The upload has been canceled by the user or the browser dropped the connection.");
      Ember.$('.form-group').removeClass('has-success');
      Ember.$('.form-group').removeClass('has-error');
      Ember.$('.form-group').addClass('has-warning');
      $status.text('Upload cancelled or interrupted.');
    };
  }

});

export default CarUploadForm;
