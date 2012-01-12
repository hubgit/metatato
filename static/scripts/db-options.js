var databaseOptions = {
  name: "library",
  version: 10,
  migrations: {
    1: function(objectStore){
      objectStore.createIndex("fileCount", "fileCount", { unique: false });
      objectStore.createIndex("publication_outlet", "publication_outlet", { unique: false });
      objectStore.createIndex("year", "year", { unique: false });
      objectStore.createIndex("added", "added", { unique: false });
      objectStore.createIndex("modified", "modified", { unique: false });
      objectStore.createIndex("canonical_id", "canonical_id", { unique: false });
    }, 
  },
};