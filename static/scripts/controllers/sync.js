var SyncController = function() {
  var self = this;
  
  this.lastSyncedTime = 0;
  
  this.sync = {
    items: { total: 0, progress: 0 },
    files: { total: 0, progress: 0 },
    canonical: { total: 0, progress: 0 },
  };

  this.bind = function() {
    $(document)
      .on("click", "#sync-items", self.syncItems)
      .on("click", "#sync-deleted", self.syncDeleted)
      .on("click", "#clear-items", self.clearItems)
      .on("click", "#clear-files", self.clearFiles)
      .on("click", "#sync-files", self.syncFiles)
      .on("click", "#sync-canonical", self.syncCanonical);
  };
  
  this.renderSyncView = function(container){    
    var view = new Views.SyncView({ container: container });
    view.render();
    self.node = view.node;
  };
  
  this.clearItems = function(){
    if (window.confirm("Clear all items in the local database?")){
      app.db.startTransaction(IDBTransaction.READ_WRITE).clear().onsuccess = function() {
        localStorage.setItem("synced", 0);
        alert("Items cleared!");
      };
    }
  };
  
  this.clearFiles = function(){
    if (window.confirm("Remove all files stored locally by this application?")){
      app.filesystem.root.getDirectory("files", {}, function(dirEntry) {
        dirEntry.removeRecursively(function() {
          alert("Items cleared!");
        }, self.fileSystemError);
      });
    }
  };
  
  this.incrementSyncProgress = function(type){
    self.setSyncProgress(type, ++self.sync[type].progress);
  };
  
  this.setSyncProgress = function(type, value){
    if (typeof self.sync[type] == "undefined") self.sync[type] = { total: 0, progress: 0 };
    self.sync[type].progress = value;
    
    var counter = self.node.find("#syncing-" + type + " .syncing-count");
    counter.text(self.sync[type].progress + "/" + self.sync[type].total);
    if (self.sync[type].total) counter.show();
    
    var progress = self.node.find("#syncing-" + type + " progress");
    if (progress.length) progress.get(0).value = value;
  };
  
  this.setSyncTotal = function(type, value){
    if (typeof self.sync[type] == "undefined") self.sync[type] = { total: 0, progress: 0 };
    self.sync[type].total = value;
    self.node.find("#syncing-" + type + " progress").attr("max", value);
  };

  this.syncItems = function(){
    console.log("Syncing items");
    self.setSyncTotal("items", 0);
    self.setSyncProgress("items", 0);
    self.fetchItemsSinceLastSynced();
  };
  
  this.fetchItemsSinceLastSynced = function(){
    var lastSyncedTime = localStorage.getItem("synced");
    self.lastSyncedTime = lastSyncedTime ? parseInt(lastSyncedTime) : 0;
    console.log("Last synced: " + new Date(self.lastSyncedTime * 1000).toString());
    self.node.find("#syncing-items .syncing-count").html("fetching items updated since " + new Date(self.lastSyncedTime * 1000).toString() + " &hellip;");  
    self.fetchItems(0);
    //TODO: queuing
  };

  this.fetchItems = function(page) {
    console.log("Fetching library items, page " + page);
    var request = $.getJSON("api/documents", { "n": 50, "page": parseInt(page), "since": self.lastSyncedTime }, function(library) {
      console.log(library.total_results + " library items to sync. Handling page " + library.current_page);
      
      if (!library.total_results) return self.finishedSyncingItems(0);
      self.setSyncTotal("items", library.total_results);
      
      var nextPage = library.current_page + 1;
      if (nextPage < library.total_pages) self.fetchItems(nextPage);
      
      var count = 0;

      $.each(library.document_ids, function(index, id) {
        $.getJSON("api/documents/" + encodeURIComponent(id), function(item) {
          if (!item["modified"]) item["modified"] = new Date().getTime();
          
          item["fileCount"] = 0;
          if (item["files"].length) {
            item["files"].forEach(function(file){
              if (file.file_extension == "pdf") {
                item["fileCount"]++;
                if (item["fileCount"] === 1) self.fetchFile(file.file_hash, item.id);
              }
            });
          }
          
          //if (item.canonical_id) self.fetchCanonical(item);
                    
          app.objectStore.put(item, function(event){
            self.incrementSyncProgress("items");
            
            if (++count == library.document_ids.length) {
              if (nextPage == library.total_pages) {
                self.finishedSyncingItems(library.total_results);
                // TODO: remove deleted items (requires full sync)
              }
            }
          });
        });
      });
    });
    
    //self.requests.push(request);
  };
  
  this.finishedSyncingItems = function(total){
    self.setSyncProgress(total);                
    self.node.find("#syncing-items .syncing-count").hide();
    localStorage.setItem("synced", Math.round(Date.now() / 1000));
    app.sections.library.node.trigger("library-updated");
    // TODO: update library views
  };

  this.syncFiles = function(event) {
    console.log("Syncing files");
    
    var files = {};

    // items with at least one file
    app.db.startTransaction().index("fileCount").openCursor(IDBKeyRange.lowerBound(1)).onsuccess = function(event){
      var cursor = event.target.result;
      if (!cursor) return self.fetchFiles(files);

      var item = cursor.value;

      $.each(item.files, function(i, file) {
        files[file.file_hash] = item.id;
      });
      
      cursor.continue();
    };
  };

  this.fetchFiles = function(files) {
    var total = 0;
    
    $.each(files, function() { total++; });
    
    self.setSyncTotal("files", total);
    self.setSyncProgress("files", 0);  
    
    if (total) $.each(files, self.fetchFile);
  };

  this.fetchFile = function(filehash, docid) {
    //console.log([filehash, docid]);
    app.filesystem.root.getDirectory("files", { create: true }, function(dirEntry) {   
      dirEntry.getFile(filehash + ".pdf", { create: true }, function(fileEntry) {
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = self.fileWritten;
          fileWriter.onerror = self.fileSystemError;

          fileEntry.file(function(file) {
            if (file.size > 9) { // already got this file
              if (self.sync.files.total){
                self.setSyncTotal("files", --self.sync.files.total);
                self.incrementSyncProgress("files");
                if (self.sync.files.total == self.sync.files.progress) self.finishedSyncingFiles(self.sync.files.total);
              }
              return; 
            }

            var xhr = new XMLHttpRequest;
            xhr.open("GET", "api/documents/" + encodeURIComponent(docid) + "/files/" + encodeURIComponent(filehash), true);
            xhr.setRequestHeader("Accept", "application/pdf");
            xhr.responseType = "arraybuffer"; // need to download as ArrayBuffer, then convert to Blob
          
            /*
            xhr.onprogress = function(event) {
              if (event.lengthComputable) {
                self.setFilesProgress(event.loaded / event.total);
              }
            };
            */

            xhr.onload = function(event) {
              if (this.status != 200) return;
              var bb = new BlobBuilder;
              bb.append(event.target.response);
              var blob = bb.getBlob("application/pdf");
              fileWriter.write(blob);
            };
          
            xhr.onerror = function(event){
              console.log([this, event]);;
            };

            self.setSyncProgress("files", 0);
            xhr.send();
          });
        }, self.fileSystemError);
      }, self.fileSystemError);
    });
  };

  this.fileWritten = function(e) {
    self.incrementSyncProgress("files");
    if (self.sync.files.synced == self.sync.files.total) self.finishedSyncingFiles();
  };
  
  this.finishedSyncingFiles = function(){
    self.setSyncProgress(self.sync.files.progress);
    self.node.find("#syncing-files .syncing-count").hide();
    app.sections.library.node.trigger("library-updated");
  };

  this.fileSystemError = function(event) {
    console.log([this, arguments]);
  };
  
  this.syncCanonical = function(event){
    console.log("Syncing canonical items");
    
    self.setSyncTotal("canonical", 0);
    self.setSyncProgress("canonical", 0);
    
    var items = [];
    app.objectStore.find("canonical_id", IDBKeyRange.lowerBound(1), function(items){
      if (!items.length) return;
      
      items = items.filter(function(item){
        return !item.canonical;
      });
      
      if (!items.length) return;
      self.setSyncTotal("canonical", items.length);    
      items.forEach(self.fetchCanonical);
    });
  };
  
  this.fetchCanonical = function(item){
    console.log("Fetching canonical document " + item.canonical_id);
    
    $.getJSON("api/catalog/" + encodeURIComponent(item.canonical_id), function(data){
      if (!data) return;
      
      item.canonical = data;
      item.oa_journal = data.oa_journal;
      
      app.objectStore.put(item, function(event){
        if (self.sync.canonical.total){
          self.incrementSyncProgress("canonical");
          if (self.sync.canonical.progress == self.sync.canonical.total) self.finishedSyncingCanonical();
        }
      });
    });
  };
  
  this.finishedSyncingCanonical = function(){
    self.setSyncProgress("canonical", self.sync.canonical.total);
    self.node.find("#syncing-canonical .syncing-count").hide();
    app.sections.library.node.trigger("library-updated");
  };
  
  this.syncDeleted = function(itemIds){
    console.log("Syncing deleted items");
    self.itemIds = [];
    self.fetchItemIds(0);
  };
  
  this.fetchItemIds = function(page){
    console.log("Fetching existing item ids: page " + page);
    $.getJSON("api/documents", { "n": 50, "page": parseInt(page) }, function(library) {
      //console.log("Received existing item ids: page " + library.current_page);
      
      $.each(library.document_ids, function(index, id) {
        self.itemIds.push(id);
      });
      
      if (library.current_page == library.total_pages - 1) {
        if (self.itemIds.length == library.total_results) self.deleteMissingItems(self.itemIds);
        else alert("The number of document IDs in the library (" +  self.itemIds.length + ") does not match the expected number of documents (" + library.total_results + ")");
      }
      else {
        self.fetchItemIds(library.current_page + 1);
      }
    });
  };
  
  this.deleteMissingItems = function(itemIds){
    var ids = {};
    itemIds.forEach(function(itemId){
      ids[itemId] = 1;
    });
    
    var deleted = [];
      
    app.objectStore.select({}, function(items){
      items.forEach(function(item){
        if (!ids[item.id]){
          app.objectStore.delete(item.id, function(){
            console.log("Deleted " + item.id);
            deleted.push(item);
          });
        }
      });
      alert("Deleted " + deleted.length + " items");
      app.sections.library.node.trigger("library-updated");
    });
  };
}

var syncController = new SyncController;
syncController.bind();
