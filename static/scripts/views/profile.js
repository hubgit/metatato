Views.ProfileView = function(options){
  var self = this;
  var container = $(options.container);
  var id = "settings-profile";
  
  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();
        
    var template = $("#profile-template").html();
    self.node = $(Mustache.to_html(template, options.profile)).appendTo(container);
  };
  
  return this;
};