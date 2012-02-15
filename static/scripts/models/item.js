var Item = function(data) {
  var self = this;
  this.data = data;
  
  this.authorsCount = function(){
    return ("authors" in self.data && $.isArray(self.data.authors)) ? self.data.authors.length : 0;
  };
  
  this.fileCount = function(){
    console.log(self.data);
    return (typeof self.data.files == "undefined") ? 0 : self.data.files.length;
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
  
  this.remoteFileURL = function(file){
    return "api/documents/" + encodeURIComponent(self.data.id) + "/files/" + encodeURIComponent(file.file_hash) + "/"
  };
  
  this.firstPdfFile = function(){
    var files = self.data.files;
    for (var file, i = 0; i < files.length; i++){
      file = files[i];
      if (file.file_extension == "pdf" && file.file_hash) return file;
    }
  };
  
  this.showFile = function(container, callback) {
    container.removeClass("has-files");
    if (!self.data.files.length) return;
    
    var file = self.firstPdfFile();
    if (!file) return;

    container.addClass("has-files");
    
    // src = javascript:false ?
    var readerNode = $("<iframe/>", { name: "read", "data-role": "content", src: "about:blank", mozallowfullscreen: true });
    var contentNode = container.find("[data-role=content]");
    var messageNode = contentNode.find(".pdf-message");
    
    if (!app.filesystem) {
      console.log("No local filesystem: loading remote file");
      self.renderFile(messageNode, readerNode, contentNode, self.remoteFileURL(file));
      return;
    }
        
    app.filesystem.root.getDirectory("files", { create: true }, function(dirEntry){
      dirEntry.getFile(file.file_hash + ".pdf", { create: false }, 
        function getFileSuccess(fileEntry) {
          console.log("Found local file: " + fileEntry.toURL());
          self.renderFile(messageNode, readerNode, contentNode, fileEntry.toURL());
        }, 
        function getFileError(event) {
          console.log("Couldn't find file locally; fetching remote file.");
          messageNode.append("<br>").append("Fetching the PDF file (choose 'Sync Files' on the <a href='/settings'>settings page</a> to pre-fetch all files)&hellip;");
          syncController.fetchFile(file.file_hash, self.data.id, self.groupId, callback, true);
        }
      );
    }, function(){
     console.log("error opening directory"); 
    });
  };
  
  this.renderFile = function(messageNode, readerNode, contentNode, fileURL){
    if (messageNode.hasClass("has-pdf-plugin")){
      readerNode.attr("src", fileURL);
      contentNode.replaceWith(readerNode);
    }
    else {
      messageNode.append("<br>");
      $("<a/>", { text: "Download the PDF file for viewing externally.", href: fileURL, rel: "external", class: "download-pdf" }).appendTo(messageNode);
    }
  };
  
  return this;
}
