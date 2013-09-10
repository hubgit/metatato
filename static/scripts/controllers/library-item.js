var PageLibraryItemController = function(){
  var self = this;
  this.node = "#library-item";

  this.bind = function(){
    $(document)
      .on("click", ".fullscreen", self.readFullScreen)
      //.on("click", this.node + " .speak", self.speakAbstract)
  };

  this.render = function(data){
    app.item = new Item(data);

    // render the full item page
    self.view = new Views.ItemView({ container: self.node, item: app.item });
    self.view.render();

    setActiveNode(".collection #item-" + app.item.id);

    app.pluginsWindow.trigger("item-selected");

    // set up inputs for receiving a file
    if (!app.item.data.fileCount) self.setupFileReceivers(self.view.node);
  };

  this.setupFileReceivers = function(node){
    // setup bookmarklet and listen for imports
    node.find("#import-bookmarklet").attr("href", "javascript:" + $("#import-bookmarklet-template").text()).hide(); // FIXME: hiding temporarily
    //self.addMessageListener();

    var filePicker = node.find(".file-picker");
    var dropZone = node.find(".dropzone");

    // handle chosen/dropped files
    self.setupFilePicker(dropZone, filePicker);

    // area for choosing/dropping files
    self.setupDropZone(dropZone, filePicker);
  };

  this.setupFilePicker = function(dropZone, filePicker){
    filePicker.on("change", function(event){
      if (!this.files.length) return;

      //node.find("#import-bookmarklet").parent().remove();

      var formData = new FormData;
      formData.append("pdf", this.files[0]);

      var fileHandler = new FileHandler;
      fileHandler.upload(dropZone, formData);

      if (detectPDFPlugin()){
        $("#library-item").addClass("has-files");
        self.showFile(URL.createObjectURL(this.files[0]));
      }
    });
  };

  this.setupDropZone = function(dropZone, filePicker){
    dropZone
      .click(function(){
        filePicker.click();
      })
      .bind("dragover", function(event) {
        event.stopPropagation();
        event.preventDefault();
      })
      .bind("drop", function(event) {
        event.stopPropagation();
        event.preventDefault();

        $("#library-item").addClass("has-files");

        var fileHandler = new FileHandler;
        fileHandler.uploadFiles(dropZone, event.dataTransfer.files);

        //self.showFile(URL.createObjectURL(event.dataTransfer.files[0]));
        self.showTemporaryFile(event.dataTransfer.files[0]);
      })
      .bind("dragenter", function(event) {
        $(this).addClass("dragover");
      })
      .bind("dragleave", function(event) {
        $(this).removeClass("dragover");
      });
  };

  this.showFile = function(url){
    var page = app.sections.library.pages.item;
    var readerNode = $("<iframe/>", { name: "read", "data-role": "content", src: url, mozallowfullscreen: true });
    $(page.contentNode).replaceWith(readerNode);
    //$("iframe[name=read]", app.sections.library.pages.item).attr("src", url);
  };

  this.addMessageListener = function(){
    if (!self.messageListener) self.messageListener = window.addEventListener("message", self.receiveFile, false);
  };

  this.receiveFile = function(event){
    if (event.origin == "https://plusone.google.com") return; // the +1 button uses postMessage to communicate with its iframe

    var node = $("#library-item");
    node.addClass("has-files");

    var blob = new Blob([event.data], { type: "application/pdf" });

    var formData = new FormData;
    formData.append("pdf", blob);

    var fileHandler = new FileHandler;
    fileHandler.upload(node.find(".dropzone"), formData);

    self.showTemporaryFile(blob);
  };

  // store as a temporary file; if only the blob is used, the file is downloaded
  this.showTemporaryFile = function(blob){
    app.filesystem.root.getFile("tmp.pdf", { create: true }, function(fileEntry) {
      console.log("saving to tmp.pdf");
      var fileURL;
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(){
          self.showFile(fileURL);
        };

        fileEntry.file(function(file) {
          fileURL = URL.createObjectURL(file);
          fileWriter.write(blob);
        });
      });
    });
  }

  this.showPluginResult = function(id, result){
    if (app.item.data.id !== id) return;

    var link = $("<a/>", {
      "class": "metric",
      "rel": result.rel ? result.rel : "external",
      "href": result.url,
      "text": result.text
    });

    if(!result.icon) {
      if (!result.domain) result.domain = $("<a/>", { "href": result.url }).get(0).hostname;
      if (result.domain.match("elsevier")) result.domain = "elsevier.com";
      result.icon = "https://plus.google.com/_/favicon?domain=" + encodeURIComponent(result.domain);
    }

    link.css("background-image", "url(" + result.icon + ")");

    link.appendTo("#library-item .metrics");
  };

  this.readFullScreen = function(event){
    event.preventDefault();

    var iframe = $("iframe[name=read]").get(0);
    if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen();
    }
    else {
      iframe.webkitRequestFullScreen();
    }
  };

  /*
  this.speakAbstract = function(event){
    event.preventDefault();
    var text = $("#item .abstract").text();
    chrome.tts.speak(text, { lang: "en-GB", gender: "female", rate: 2.0 });
  };
  */
};

var itemController = new PageLibraryItemController;
itemController.bind();
