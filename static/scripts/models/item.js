var Item = function(data) {
  var self = this;
  this.data = data;
  
  this.authorsCount = function(){
    return ("authors" in self.data && $.isArray(self.data.authors)) ? self.data.authors.length : 0;
  };
  
  this.prepare = function(){
    /*self.data.fileCount = function() {
      return ("files" in self.data) ? self.data.files.length : 0;
    };*/

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
  
  this.showFile = function() {
    $("#library-item").removeClass("has-files");
    if (!self.data.id) return;
    
    app.db.startTransaction().openCursor(IDBKeyRange.only(self.data.id)).onsuccess = function (event) {
      var cursor = event.target.result;
      if (!cursor) return;
      
      if (!cursor.value.files.length) {
        $("#library-item").removeClass("has-files");
        return;
      }
            
      cursor.value.files.forEach(function(file){
        if (file.file_extension != "pdf") return true; // continue
        
        /*if (!app.filesystem) {
          $("iframe[name=read]").attr("src", self.getRemoteFileURL(file));
          return;
        }*/
         
        app.filesystem.root.getFile(file.file_hash + ".pdf", { create: false }, 
          function getFileSuccess(fileEntry) {
            console.log("Showing local file");
            console.log(fileEntry.toURL());
            $("#library-item").addClass("has-files");
            $("iframe[name=read]").attr("src", fileEntry.toURL());
          }, 
          function getFileError(event) {
            console.log("Loading remote file");
            $("#library-item").addClass("has-files");
            $("iframe[name=read]").attr("src", self.getRemoteFileURL(file));
            // TODO: store file when loaded
          }
        );
          
        return false; // break
      });
    };
  };
  
  return this;
}
