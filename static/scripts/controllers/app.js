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
    if (typeof window.IndexedDB != "object") {
      alert("This application requires a browser that supports IndexedDB");
      return;
    }
    new DB(databaseOptions, self.objectStoreName, self.databaseReady);
  };

  this.databaseReady = function(db){
    console.log(db);
    self.db = db;
    self.objectStore = new ObjectStore(db);

    $.each(self.sections, self.renderSection.bind(self));
    $("#loading").fadeOut();
    self.router.route(location.href.replace(baseURL, ""), true);
    self.fetchProfile();
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
      syncController.syncItems();
    });
  };

  this.itemCollected = function(item, callback){
    ["doi", "pmid"].forEach(function(field){
      var value = item.data[field];
      if (!value) return true; // continue
      
      app.objectStore.findOne(field, value, function(result){
        if (result) callback(item, result);
      });
    });
  };
};

var app = new App({ objectStoreName: "documents" });
$(app.init);
