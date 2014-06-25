/*
Problems: (1) Count and facet are switched. (2) For the state, it takes the spaces as a facet and it takes single words as the fact.
*/


(function ($) {

AjaxSolr.StateDropdownWidget = AjaxSolr.AbstractFacetWidget.extend({  //You must also change the name of the widget in the ACTUAL WIDGET FILE, because there will be an extend command
  afterRequest: function () {
    var self = this;

    $(this.target).empty();  //this.[variable] refrs to the global variable [variable]


    var maxCount = 0;
    var options = { '': '--Filter by State--' };
	var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
	
	for (i=0; i<states.length;i++){
		options[states[i]] = states[i];
	}
	/*Below code is useful if trying to get the specific labels in documents and you don't really know them/have specified them ahead of time
	var states =[];  //create an empty array
	for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {  //for every document in Solr
     	var doc = this.manager.response.response.docs[i];
		//document.write(i,doc.subject)
		states.push(doc.subject);  //append the various subjects to the array
	}
	//document.write(this.manager.response.response.docs.length);
	states = $.unique(states);  //only keep the unique values in the array
	//document.write(states.length);
	for (i=0; i < states.length; i++) {
		//document.write(states.length);
		options = states[i];
	}
	*/
	
	//document.write(states)
	
	//document.write(options)
	/*
	for (var facet in this.manager.response.facet_counts.facet_fields[this.field]) { //Basically, options is an array. Its counting the number of elements in this field, and then for setting the key for the option to the number of elements, and then the 
      //if (facet.length == 2) { // only display country codes
	  //document.write(count)
       var count = this.manager.response.facet_counts.facet_fields[this.field][facet];  //counts the # of docs in the corpus with that facet fiedl
        if (count > maxCount) {
          maxCount = count;
        
		//document.write(count)
		//options[facet] = count; //you modified this
		options[facet] = count;
        //options[facet] = facet + ' (' + count + ')';  //laying out the options in the drop-down menu.  Will be the facet name + the count of how many
      //}
    }
	*/
	
	
    $(this.target).append(this.template('state', options));  //appending the "target" global variable with the facet name and the facets under that category.  Calling the "template' function iwth the name of the facet and the various options iwthin it
 
    $(this.target).find('#state').change(function () {  // This is the function that is called when a selection is made in the drop-down menu
      var value = $(this).val();
	  //document.write(value)
      if (value && self.add(value)) {
         //self.manager.store.remove('fq'); //deletes a parameter
      	//self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value)); //if parameter can be specified multiple times, creates parameter using given name and value
		self.doRequest();  
      }
    });
  },
  
  template: function (name, container) {
    var options = [];
    for (var value in container) {
      options.push('<option value="' + value +'">' + container[value] + '</option>');
    }
    return '<select id="' + name + '" name="' + name + '">' + options.join('\n') + '</select>';
  }
});

})(jQuery);
