var DB = function(dbOptions, objectStoreName, callback) {
  var self = this;
  
  var request = IndexedDB.open(dbOptions.name, dbOptions.version);
  
  // new IndexedDB interface
  request.onupgradeneeded = function(event){
    self.upgradeDB(Number(event.oldVersion), event.target.result);
  }    
  
  request.onsuccess = function(event) {
    self.db = request.result;
    console.log(self.db);
        
    self.db.onerror = function(){ 
      console.error(["Database error", this, arguments]); 
    };
    
    var oldVersion = Number(self.db.version);
    
    if (dbOptions.version > oldVersion){
      if (typeof self.db.setVersion != "function") throw new Error; // should have been upgraded in onupgradeneeded
      
      self.db.setVersion(dbOptions.version).onsuccess = function(event){
        self.upgradeDB(oldVersion, self.db);
        self.performMigrations(oldVersion, dbOptions.migrations);
        callback(self);
      };
    }
    else {
      callback(self);
    }
  };  
  
  request.onerror = function(db){
    alert('Unable to open a database');
  };
  
  this.upgradeDB = function(oldVersion, db, transaction){
    console.log("upgrade needed");
    console.log("Old version: " + oldVersion);
    console.log(db);
    
    if (!transaction) transaction = db;
    
    if (!db.objectStoreNames.contains(objectStoreName)) {
      db.createObjectStore(objectStoreName, { keyPath: "id" });
    }
        
    console.log(["objectStoreNames", db.objectStoreNames]);
  };
  
  this.performMigrations = function(oldVersion, migrations){
    var newMigrations = [];

    $.each(migrations, function(newVersion, migration){
      if (newVersion > oldVersion) newMigrations.push(migration);
    });

    if (!newMigrations.length) return;
    
    var objectStore = self.startTransaction(IDBTransaction.READ_WRITE);
    console.log(objectStore);
    
    newMigrations.forEach(function(migration){
      try {
        migration(objectStore);
      }
      catch(e){
        console.log("Error updating the database");
        console.log(migration);
      }
    });
  };
    
  this.startTransaction = function(permissions){
    if (typeof permissions == "undefined") permissions = IDBTransaction.READ_ONLY;
    return self.db.transaction([objectStoreName], permissions).objectStore(objectStoreName);
  };
}
