var SectionDiscussController = function(){
  this.init("discuss", ["group"]);
      
  this.pagesRendered = function(){
    $(this.selector).on("click", this.showGroup.bind(this));
    var iframe = $("<iframe/>", { src: "javascript:void(0)", "data-role": "content" }).replaceAll(this.pages.group.contentNode); 
  };
  
  this.showGroup = function(event){
    var iframe = this.pages.group.contentNode;
    
    var groupURL = "https://groups.google.com/forum/embed/?place=forum/web-library&showsearch=true&showpopout=true&hideforumtitle=true&fragments=true&parenturl=";
    var url = groupURL + encodeURIComponent(window.location.href)
    if (iframe.attr("src") != url) iframe.attr("src", url);
  };
};

SectionDiscussController.prototype = new Section;
new SectionDiscussController;
