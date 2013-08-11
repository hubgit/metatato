var SectionSettingsController = function(){
  var self = this;
  this.init("settings", ["profile", "settings", "database"]);
 
  this.pagesRendered = function(){
    $(document)
      .on("profile-ready", self.node, self.renderProfile)
      .on("click", "#logout", self.signOut)
      
    setMessage(self.pages.profile, "Loading profile&hellip;");
    
    syncController.renderSyncView(self.pages.database.contentNode);
  };
  
  this.renderProfile = function(event){
    $(self.selector).text(app.profile.name);
    self.pages.profile.contentNode.empty();
    var view = new Views.ProfileView({ container: self.pages.profile.contentNode, profile: app.profile });
    view.render();
  };
  
  this.signOut = function(event){
    var result =  confirm("Your login cookies for this app and mendeley.com will be cleared, but your library database will still be available locally. If you're on a shared computer, make sure you completely clear all the local databases");
    if (result) {
      window.location.href = this.href;
    }
  };
}

SectionSettingsController.prototype = new Section;
new SectionSettingsController;
