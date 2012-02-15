var FileHandler = function() {
  var self = this;

  // select files with file picker
  this.bindFilePicker = function(node) {
    // var node = document.getElementById("file-picker");
    $(node).bind("change", function(event) {
      self.uploadFiles(this, event.target.files);
    });
  };

  // drag/drop files to dropzone
  this.handleDragEvents = function(dropzone) {
    dropzone
    .bind("dragover", function(event) {
      event.stopPropagation();
      event.preventDefault();
    })
    .bind("drop", function(event) {
      event.stopPropagation();
      event.preventDefault();
      $(this).addClass("uploading");
      self.uploadFiles(this, event.dataTransfer.files);
    })
    .bind("dragenter", function(event) {
      $(this).addClass("dragover");
    })
    .bind("dragleave", function(event) {
      $(this).removeClass("dragover");
    });
  };

  // progress bar
  this.showProgress = function(event, progress) {
    if (event.lengthComputable) {
      progress.value = event.loaded / event.total;
    }
  };

  /* download */
  this.fetchFileAsBlob = function(url, callback) {
    //var callback = self.uploadAsFormData;
    //self.download(url, "blob", self.upload);
    self.download(url, "blob", callback);
  };

  this.fetchFileAsArrayBuffer = function(url, callback) {
    //var callback = self.uploadArrayBuffer;
    self.download(url, "arraybuffer", callback);
  };

  this.arrayBufferToBlob = function(ab, mimetype) {
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

    var bb = new BlobBuilder;
    bb.append(ab);

    return bb.getBlob(mimetype);
  };

  this.download = function(url, responseType, callback) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', url, true);
    xhr.responseType = responseType;

    xhr.onprogress = function(event) {
      self.showProgress(event, "download-progress");
    };

    xhr.onload = function(event) {
      if (this.status != 200) return;
      $("#download-progress").get(0).value = 1;
      callback(this.response);
    };

    xhr.send();
  };

  /* upload */
  this.uploadArrayBuffer = function(node, ab, mimetype) {
    // var mimetype = "application/pdf";
    var blob = self.arrayBufferToBlob(ab, mimetype);
    self.uploadAsFormData(node, blob);
  }

  this.uploadAsFormData = function(node, blob) {
    var formData = new FormData;
    formData.append("pdf", blob);
    self.upload(node, formData);
  };

  // files is a FileList of File objects
  this.uploadFiles = function(node, files) {
    var formData = new FormData;

    for (var i = 0, file; file = files[i]; ++i) {
      formData.append("pdf", file);
    }

    self.upload(node, formData);
  };

  this.upload = function(node, data) {
    var node = $(node);
    //node.text("Uploading...").addClass("uploading");
    var progress = $("#upload-progress").show().get(0);
    progress.value = 0;

    var xhr = new XMLHttpRequest;
    xhr.open("POST", node.data("url"), true);
    xhr.setRequestHeader("x-csrf-token", $.cookie("csrf"));

    xhr.upload.onprogress = function(event) {
      self.showProgress(event, progress);
    };

    xhr.onload = function(event) {
      progress.value = 1;
      console.log(event);
      console.log(arguments);
      
      var xhr = event.target;
      
      switch (xhr.status){  
        case 201:
          $.getJSON(xhr.getResponseHeader("Location"), function(data){
            console.log(data);
            if (!data || !data.id) return;
            app.objectStore.put(data);
          });
        break;
      }
      
      $(progress).hide();
    };

    xhr.send(data);
  };
}
