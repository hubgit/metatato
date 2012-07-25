var databaseOptions = {
  name: "library",
  version: 29,
  migrations: {
    29: function(objectStore){
      objectStore.createIndex("fileCount", "fileCount", { unique: false });
      objectStore.createIndex("publication_outlet", "publication_outlet", { unique: false });
      objectStore.createIndex("year", "year", { unique: false });
      objectStore.createIndex("added", "added", { unique: false });
      objectStore.createIndex("modified", "modified", { unique: false });
      objectStore.createIndex("canonical_id", "canonical_id", { unique: false });
    }, 
    23: function(objectStore){
      objectStore.createIndex("doi", "doi", { unique: false }); // should be unique, but no merging yet
      objectStore.createIndex("pmid", "pmid", { unique: false }); // should be unique, but no merging yet
    },
  },
};