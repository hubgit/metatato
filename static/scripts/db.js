var DB = function(dbOptions, objectStoreName, callback) {
  var self = this;

  var request = IndexedDB.open(dbOptions.name, dbOptions.version);
  
  // new IndexedDB interface
  request.onupgradeneeded = function(event){
    console.log("onupgradeneeded");
    self.upgradeDB(Number(event.oldVersion), event.target.result);
  }    
  
  request.onsuccess = function(event) {
    self.db = request.result;
    console.log("db", self.db);
        
    self.db.onerror = function(){ 
      console.error(["Database error", this, arguments]); 
    };
    
    var oldVersion = Number(self.db.version);

    if (dbOptions.version > oldVersion){
      if (typeof self.db.setVersion != "function") throw new Error; // should have been upgraded in onupgradeneeded

      self.db.setVersion(dbOptions.version).onsuccess = function(event){  
        if (!self.db.objectStoreNames.contains(objectStoreName)) {
          self.db.createObjectStore(objectStoreName, { keyPath: "id" });
        }

        event.target.result.oncomplete = function() {
          self.performMigrations(oldVersion, dbOptions.migrations, self.db);
          callback(self);
        }
      };
    }
    else {
      callback(self);
    }
  };  
  
  request.onerror = function(db){
    alert('Unable to open a database');
  };
  
  this.performMigrations = function(oldVersion, migrations, db){
    var newMigrations = [];

    $.each(migrations, function(newVersion, migration){
      if (newVersion > oldVersion) newMigrations.push(migration);
    });

    if (!newMigrations.length) return;
    
    var objectStore = db.objectStore(objectStoreName); //self.startTransaction("readwrite");
    console.log(objectStore);
    
    newMigrations.forEach(function(migration){
      try {
        migration(objectStore);
      }
      catch(e){
        console.log("Error updating the database");
        console.log(migration);
        console.log(e);
      }
    });
  };
    
  this.startTransaction = function(permissions, transaction){
    if (typeof permissions == "undefined") permissions = "readonly";
    return self.db.transaction([objectStoreName], permissions).objectStore(objectStoreName);
  };
}
