var ObjectStore = function(db, callback) {
  var self = this;
  
  this.count = function(callback) {
    var total = 0;
    //db.startTransaction().index("modified").count().onsuccess = function(event){
    db.startTransaction().openCursor().onsuccess = function(event){
      var cursor = event.target.result;
      if (!cursor) return callback(total);
      total++;
      cursor.continue();
    };
  };
  
  this.select = function(options, callback){    
    var items = [];
    var i = 0;
    db.startTransaction().openCursor().onsuccess = function(event){
      var cursor = event.target.result;
      
      if (!cursor) {
        if (options.sort){
          items.sort(function(a, b){
            switch (options.order){
              case "asc":
              default:
                return a[options.sort] - b[options.sort];
              break;
              
              case "desc":
                return b[options.sort] - a[options.sort];
              break;
            }
          });
        }
        return callback(items);
      }
      
      var item = cursor.value;
      
      switch (typeof options.value){
        case "undefined":
          items.push(item);
        break;
        
        default:
          var itemValue = item[options.field];
          switch (typeof itemValue){
            case "string":
            case "number":
              if (itemValue == options.value) items.push(item);
            break;
            
            case "boolean":
              if (itemValue == (options.value == "true")) items.push(item);
            break;
          
            case "object":
              if ($.isArray(itemValue)){
                itemValue.forEach(function(value){
                  if (value == options.value) items.push(item);
                });
              }
            break;

            default:
              if (itemValue == options.value) items.push(item);
            break;
          }
        break;
      }
      
      cursor.continue();
    };
  };
  
  this.facet = function(items, field){
    var counts = {};
    
    items.forEach(function(item){
      if (!field in item) return true; // continue;
      var value = item[field];
      
      switch (typeof value){
        case "string":
        case "number":
        case "boolean":
          if (typeof counts[value] == "undefined") counts[value] = 0;
          counts[value]++;
        break;
        
        case "object":
          if (Array.isArray(item[field])){
            item[field].forEach(function(arrayValue){
              if (typeof counts[arrayValue] == "undefined") counts[arrayValue] = 0;
              counts[arrayValue]++;
            });
          }
        break;
        
        default:
          return true; // continue;
      }
    });

    return counts;
  };
  
  this.selectUnsorted = function(options, callback){    
    var items = [];
    var i = 0;
    db.startTransaction().openCursor().onsuccess = function(event){
      var cursor = event.target.result;
      if (!cursor || items.length == options.limit) return callback(items);
      var item = cursor.value;
      if (typeof options.value == "undefined" || (options.field in item && item[options.field] == options.value)){
        if (i++ >= options.start) {
          items.push(cursor.value);
        }
      }
      cursor.continue();
    };
  };
  
  this.loadStoredItems = function(callback, n) {
    var items = [];
    //db.startTransaction().index("fileCount").openCursor(IDBKeyRange.lowerBound(0), IDBCursor.PREV).onsuccess = function(event){
    db.startTransaction().index("added").openCursor(null, IDBCursor.PREV).onsuccess = function(event){
      var cursor = event.target.result;
      if (!cursor || items.length == n) return callback(items);
      items.push(cursor.value);
      cursor.continue();
    };
  };
  
  this.getLastModified = function(callback){
    db.startTransaction().index("modified").openCursor(null, IDBCursor.PREV).onsuccess = function(event){
      var modified = event.target.result ? event.target.result.value.modified : 0;
      callback(modified);
    };
  };

  this.sortItems = function(callback, n) {
    var node = $(this);
    var sortOrder = node.data("desc") ? IDBCursor.NEXT : IDBCursor.PREV;
    self.sortedItems(node.data("index"), sortOrder, callback, n);
  };
  
  this.sortedItems = function(field, sortOrder, callback, n) {
    var items = [];
    
    db.startTransaction().index(field).openCursor(null, sortOrder).onsuccess = function(event){
      var cursor = event.target.result;
      if (!cursor || items.length == n) return callback(items);
      items.push(cursor.value);
      cursor.continue();
    };
  };

  this.filterItems = function(field, values, callback, n) {
    if (typeof values == "string") {
      if (field == "fileCount") values = parseInt(values);
      values = [values];
    }

    var index = db.startTransaction().index(field);

    var items = [];
    values.forEach(function(value) {
      index.openCursor(IDBKeyRange.only(value)).onsuccess = function(event) {
        var cursor = event.target.result;
        if (!cursor || items.length == n) return callback(items);
        items.push(cursor.value);
        cursor.continue();
      };
    });
  };

  this.getFieldKeys = function(field, callback) {
    var items = [];

    db.startTransaction().index(field).openCursor(null, IDBCursor.NEXT_NO_DUPLICATE).onsuccess = function(event){
      var cursor = event.target.result;
      if (!cursor) return callback(items);
      items.push({ field: field, value: cursor.key });
      cursor.continue();
    };
  };

  this.countMultipleFieldKeys = function(field, callback) {
    var items = {};

    db.startTransaction().openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (!cursor) return callback(items);

      $.each(cursor.value[field], function(key, value){
        items[value] = (value in items) ? items[value] + 1 : 1;
      });
      
      cursor.continue();
    };
  };
  
  this.findOne = function(field, value, callback){
    //console.log([field, value]);
    db.startTransaction().index(field).openCursor(IDBKeyRange.only(value)).onsuccess = function(event) {
      //console.log(event);
      var cursor = event.target.result;
      callback(cursor ? cursor.value : null);
    };
  };
  
  this.find = function(field, range, callback){
    var items = [];
    
    db.startTransaction().index(field).openCursor(range).onsuccess = function(event) {
      var cursor = event.target.result;
      
      if (!cursor){
        callback(items);
        return;
      }
      
      items.push(cursor.value);
      cursor.continue();
    };
  };
  
  this.get = function(value, callback){
    db.startTransaction().openCursor(IDBKeyRange.only(value)).onsuccess = function(event) {
      var cursor = event.target.result;
      callback(cursor ? cursor.value : null);
    };
  };
  
  this.put = function(item, callback){
    db.startTransaction(IDBTransaction.READ_WRITE).put(item).onsuccess = function(event) {
      var cursor = event.target.result;
      app.sections.library.node.trigger("library-updated");
      if (typeof callback == "function") callback(cursor ? cursor.value : null);
    };
  };
  
  this.delete = function(item, callback){
    db.startTransaction(IDBTransaction.READ_WRITE).delete(item).onsuccess = function(event) {
      var cursor = event.target.result;
      app.sections.library.node.trigger("library-updated");
      callback(cursor ? cursor.value : null);
    };
  };
};

