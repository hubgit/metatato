var DB = function(dbOptions, objectStoreName, callback) {
  var self = this;
  
  var request = IndexedDB.open(dbOptions.name, dbOptions.name);
    
  request.onsuccess = function(event) {
    self.db = event.target.result;
        
    self.db.onerror = function(){ 
      console.error(["Database error", this, arguments]); 
    };
    
    var migrations = [];
    var version = self.db.version ? parseInt(self.db.version) : 0;
    console.log(["DB version " + version, self.db.objectStoreNames]);
    
    $.each(dbOptions.migrations, function(newVersion, migration){
      if (version < newVersion) migrations.push(migration);
    });
    
    if (!migrations.length) return callback(self);
    
    self.db.setVersion(dbOptions.version).onsuccess = function(event) {    
      if (!self.db.objectStoreNames.contains(objectStoreName)) {
        self.db.createObjectStore(objectStoreName, { keyPath: "id" });
      }

      var objectStore = event.target.result.objectStore(objectStoreName);

      migrations.forEach(function(migration){
        try {
          migration(objectStore);
        }
        catch(e){
          console.log("Error updating the database");
          console.log(migration);
        }
      });

      callback(self);
    };
  };  
  
  request.onerror = function(){
    alert('Unable to open a database');
  };
    
  this.startTransaction = function(permissions){
    if (typeof permissions == "undefined") permissions = IDBTransaction.READ_ONLY;
    return self.db.transaction([objectStoreName], permissions).objectStore(objectStoreName);
  };
}
