var Item = function(data) {
  var self = this;
  this.data = data;
  
  this.authorsCount = function(){
    return ("authors" in self.data && $.isArray(self.data.authors)) ? self.data.authors.length : 0;
  };
  
  this.fileCount = function(){
    return ("files" in self.data) ? self.data.files.length : 0;
  };
  
  this.prepare = function(){
    if (typeof self.data.fileCount == "undefined") self.data.fileCount = self.fileCount;
    self.data.authorsCount = self.authorsCount;

    self.data.allTypes = app.allTypes;
  
    self.data.fields = [];
    if (self.data.type){
      $.each(app.allFields[self.data.type], function(key, field){
        field["field-value"] = self.data[field["field-name"]];
        field["field-textarea"] = (field["field-type"] != "string");
        self.data.fields.push(field);
      });
    }
  };
  
  this.getRemoteFileURL = function(file){
    return "api/documents/" + encodeURIComponent(self.data.id) + "/files/" + encodeURIComponent(file.file_hash) + "/"
  };
  
  this.showFile = function(container, callback) {
    container.removeClass("has-files");
    if (!self.data.id || !self.data.files.length) return;
      
    console.log(self.data.files);
          
    self.data.files.forEach(function(file){
      if (file.file_extension != "pdf") return true; // continue
      
      if (!app.filesystem) {
        console.log("No local filesystem: loading remote file");
        container.addClass("has-files");
        $("iframe[name=read]", container).attr("src", self.getRemoteFileURL(file));
        return;
      }
      
      app.filesystem.root.getDirectory("files", { create: true }, function(dirEntry){
        dirEntry.getFile(file.file_hash + ".pdf", { create: false }, 
          function getFileSuccess(fileEntry) {
            console.log("Showing local file");
            console.log(fileEntry.toURL());
            container.addClass("has-files"); // and #group-item
            $("iframe[name=read]", container).attr("src", fileEntry.toURL());
          }, 
          function getFileError(event) {
            console.log("Couldn't find file locally; fetching...");
            syncController.fetchFile(file.file_hash, self.data.id, self.groupId, callback);
            //console.log("Loading remote file");
            //$("#library-item").addClass("has-files");
            //$("iframe[name=read]").attr("src", self.getRemoteFileURL(file));
            // TODO: store file when loaded
          }
        );
      }, function(){
       console.log("error opening directory"); 
      });
        
      return false; // break
    });
  };
  
  return this;
}
