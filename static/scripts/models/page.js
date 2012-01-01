var Page = function(options){
  this.section = options.section;
  this.page = options.page;
  this.id = [this.section, this.page].join("-");
}

Page.prototype = {
  get headerNode(){
    return this.view.node.find("[data-role=header]");  
  },
  
  get contentNode(){
    return this.view.node.find("[data-role=content]");  
  },
  
  active: function(){
    console.log("Showing page " + this.id);  
    this.section.selectedPage = this.id;
    setActiveNode(this.node);
  },
  
  render: function(options){
    $.extend(options, { section: this.section, pageName: this.page, id: this.id });
    this.view = new Views.PageView(options);
    this.view.render();
    this.node = this.view.node;
  },
};