var TypeAheadView =  Ember.TextField.extend({

  attributeBindings: ['selectFlag'],
  style:'width:100%;',

  didInsertElement: function() {
    this._super();
    var _this = this;

    _this.set('selectFlag', false);

    if(!this.get("data")){
      throw "No data property set";
    }

    if (window.jQuery.isFunction(this.get("data").then)){
      this.get("data").then(function(data) {
        _this.initializeTypeahead(data);
      });
    }

    else{
      this.initializeTypeahead(this.get("data"));
    }

  },

  engine: null,

  initializeTypeahead: function(data){
    var _this = this;
    var _data = new window.Bloodhound({
      datumTokenizer: function(d) { return window.Bloodhound.tokenizers.whitespace(d.name); },
      queryTokenizer: window.Bloodhound.tokenizers.whitespace,
      limit: 10,
      local: data
    });

    _data.initialize();

    this.set('engine', _data);

    this.typeahead = this.$().typeahead(null, {
      name: '_data',
      displayKey: 'name',
      source: _data.ttAdapter()
    });

    this.typeahead.on("typeahead:selected", function(event, item) {
      _this.set("selection", item.name);
      _this.set('selectFlag', _this.get('selectFlag') + 1);
    });

    this.typeahead.on("typeahead:autocompleted", function(event, item) {
      _this.set("selection", item.name);
      _this.set('selectFlag', _this.get('selectFlag') + 1);
    });

    if (this.get("selection")) {
      this.typeahead.val(this.get("selection.name"));
      this.set('selectFlag', this.get('selectFlag') + 1);
    }
  },

  onChange: function(e) {
    this.set('value', e.currentTarget.value);
  },

  watchData: function() {
    if (!Ember.isNone(this.get('data')) && this.get('data.length') > 0) {
      var engine = this.get('engine');
      engine.clear();
      engine.add(this.get('data'));
//      var _data = new window.Bloodhound({
//        datumTokenizer: function(d) { return window.Bloodhound.tokenizers.whitespace(d.name); },
//        queryTokenizer: window.Bloodhound.tokenizers.whitespace,
//        limit: 10,
//        local: this.get('data')
//      });
//
//      _data.initialize();
//
//      this.$().typeahead('destroy');
//      this.typeahead = this.$().typeahead(null, {
//        name: '_data',
//        displayKey: 'name',
//        source: _data.ttAdapter()
//      });
//
//      this.typeahead.focus();
    }
  }.observes('data')
});

export default TypeAheadView;