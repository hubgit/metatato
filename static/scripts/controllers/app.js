var App = function(options) {
  var self = this;
  
  this.objectStoreName = options.objectStoreName;
  
  this.sections = {};
  
  this.selectedSection = null;
  this.selectedLibraryItem = null;
        
  this.init = function(fields){
    self.requestFileSystem(); // asynchronous, but should be fast enough
    
    $.getJSON("fields", function(fields){
      self.allFields = prepareFields(fields);
      self.allTypes = $.map(fields, function(field, type){ return type; });
      self.requestIndexedDB();
    });
  };
  
  this.requestFileSystem = function(){
    if (typeof window.RequestFileSystem != "function") return;
    var requestedFileSystemSize = 1024 * 1024 * 1024; // 1GB    
    window.RequestFileSystem(window.PERMANENT, requestedFileSystemSize, self.requestFileSystemReady, self.requestFileSystemError);
  };
  
  this.requestFileSystemReady = function(filesystem){
    console.log(filesystem);
    self.filesystem = filesystem;
  };
  
  this.requestFileSystemError = function(){
    console.log(["filesystem error", this, arguments]);
  };
  
  this.requestIndexedDB = function(callback){
    new DB(databaseOptions, self.objectStoreName, self.databaseReady);
  };
  
  this.databaseReady = function(db){
    console.log(db);
    self.db = db;
    self.objectStore = new ObjectStore(db);
  
    $.each(self.sections, self.renderSection.bind(self));
    self.router.route(location.href.replace(baseURL, ""), true);
    self.fetchProfile();
    //syncController.syncItems();
  };
  
  this.renderSection = function(id){
    var section = self.sections[id];
    section.view = new Views.SectionView({ container: "#sections", section: id });
    section.view.render();
    section.node = section.view.node;
    
    $.each(section.pages, section.addPage.bind(section));
    section.pagesRendered();
  };
  
  this.fetchProfile = function(){
    $.getJSON("api/profile", function(data){
      app.profile = data;
      $(app.sections.settings.node).trigger("profile-ready");
    });
  };
};

var app = new App({ objectStoreName: "documents" });
$(app.init);
