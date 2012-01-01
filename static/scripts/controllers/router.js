var Router = function(){
  this.bind = function(){
    $(document).on("click", "a[href]", this.handleLink.bind(this));
    
    // call this on a timeout to avoid Chrome's initial popstate
    window.setTimeout(function() {
      $(window).bind("popstate", this.handleHistory.bind(this));
    }.bind(this), 1000);
  };
  
  this.setURL = function(path, query, hash){
    console.log(["setURL", arguments]);
    if (query) path += buildQueryString(query);
    if (hash) path += "#" + encodeURIComponent(hash);
    console.log(["path", path]);
    this.route(path);
  };
  
  this.handleLink = function(event){
    console.log(event);
    event.preventDefault();
    var node = $(event.target);
    var href = node.attr("href");
    if (href === "#" || node.hasClass("direct") || node.attr("rel") === "external") return true;
    this.route(href);
  };
  
  this.handleHistory = function(event){
    console.log("handlehistory: " + event.originalEvent.state.path);
    if (!event.originalEvent.state) return;
    this.route(event.originalEvent.state.path, true);
  };
  
  this.route = function(fullPath, ignoreHistory){
    if (!fullPath) return;
    console.log(fullPath); 
    
    app.currentPath = fullPath;
    console.log(["route: " + fullPath, arguments]);
        
    var link = $("<a/>", { href: fullPath }).get(0);
    var url = link.href; 
    var hash = link.hash.replace(/^#/, "");
    var query = parseQueryString(link.search.replace(/^\?/, ""));
    
    app.location = {
      path: link.pathname,
      query: query,
      hash: hash
    };
    
    console.log(app.location);
    
    path = link.pathname.replace(/^\//, "").replace(/\/$/, "");
    var parts = path.split("/");  
    console.log("path: " + path);    
    
    var section = parts.shift();
    console.log([path, section, hash, query, parts]); 
    
    var sectionController = app.sections[section];
    if (!sectionController) this.setURL("/library");
    
    if (!ignoreHistory) history.pushState({ path: fullPath }, "", baseURL + fullPath);   
    
    console.log([section, app.selectedSection]);
    if (section != app.selectedSection) sectionController.active();
    
    var activePage = hash || sectionController.pages[sectionController.firstPage].id;
    console.log("Active page: " + activePage);
    setActiveNode("#" + activePage); // TODO: page.active()
    
    $(sectionController.selector).attr("href", fullPath);
    if (typeof sectionController.handleURL == "function") sectionController.handleURL(parts, query, hash);
  };
};

app.router = new Router;
app.router.bind();