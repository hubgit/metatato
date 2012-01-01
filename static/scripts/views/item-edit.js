Views.ItemEditView = function(options){
  var self = this;
  var container = $(options.container);

  this.render = function(){ 
    $("#item-edit-form").remove();
    
    app.item.prepare();

    var template = $("#item-edit-template").html();
    var node = $(Mustache.to_html(template, app.item.data));
    self.node = node;

    node.find(".field textarea").each(self.prepareInput);

    node.find("select[name=type]")
      .val(app.item.data.type)
      .find("option[value='" + app.item.data.type + "']").prop("selected", true);
    
    node.find(".edit-cancel").click(function(event){
      event.preventDefault();
      node.remove();
    });

    node.ajaxForm({
      dataType: "json",
      beforeSubmit: function(){
        node.find("input[type=submit]").val("Saving...");
      },
      success: function(data){
        console.log("saved");
        app.item.data = data;
        self.render();
      },
      error: function(data){
        console.log("error while saving");
        console.log(data);
      },
    });
    
    node.appendTo(container).show();
    node.find("textarea").elastic().trigger("input");
  };
  
  this.prepareInput = function(node){
    var input = $(this);
    
    switch(input.data("type")){
      case "string+array":
        input.val(app.item.data[input.attr("name")].join("\n"));
      break;

      case "person+array":
        input.val(self.formatPersonNames(app.item.data, input.attr("name")).join("\n"));
      break;
    }
  };
  
  this.formatPersonNames = function(data, field){
    if (!(field in data && "length" in data[field])) return [];
    
    return data[field].map(function(item){
      var personName = item.surname;
      if (item.forename) personName += ", " + item.forename;
      return personName;
    });
  };
    
  this.itemUpdated = function(event){
    event.preventDefault();     
  };
  
  return this;
};