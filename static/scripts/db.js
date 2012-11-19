var DB = function(dbOptions, objectStoreName, callback) {
  var self = this;

  var request = IndexedDB.open(dbOptions.name, dbOptions.version);

  // new IndexedDB interface
  request.onupgradeneeded = function(event) {
    self.upgradeDB(event.target.result, Number(event.oldVersion), event.currentTarget.transaction);
  }

  request.onsuccess = function(event) {
    self.db = request.result;
    console.log("db", self.db);

    self.db.onerror = function(){
      console.error("Database error", this, arguments);
    };

    var oldVersion = Number(self.db.version);

    if (typeof self.db.setVersion === "function" && dbOptions.version > oldVersion){
      // old IndexedDB interface; replaced by onupgradeneeded
      self.db.setVersion(dbOptions.version).onsuccess = function(event) {
        self.upgradeDB(self.db, oldVersion, event.target.result);
      }
    }
    else {
      callback(self);
    }
  };

  request.onerror = function(db){
    alert('Unable to open a database');
  };

  this.upgradeDB = function(db, oldVersion, transaction){
    if (!db.objectStoreNames.contains(objectStoreName)) {
      db.createObjectStore(objectStoreName, { keyPath: "id" });
    }

    if(typeof transaction !== "undefined") {
      self.performMigrations(oldVersion, dbOptions.migrations, transaction.objectStore(objectStoreName));

      transaction.oncomplete = function() {
        callback(self);
      }
    }
    else {
      var objectStore = transaction.objectStore(objectStoreName);
      self.performMigrations(oldVersion, dbOptions.migrations, objectStore);
      callback(self);
    }
  };

  this.performMigrations = function(oldVersion, migrations, objectStore){
    var newMigrations = [];

    $.each(migrations, function(newVersion, migration){
      if (newVersion > oldVersion) newMigrations.push(migration);
    });

    if (!newMigrations.length) return;

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

  this.startTransaction = function(permissions){
    if (typeof permissions == "undefined") permissions = "readonly";
    return self.db.transaction([objectStoreName], permissions).objectStore(objectStoreName);
  };
}
