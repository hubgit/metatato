var SectionTextController = function(){
  var self = this;
  this.init("text", ["text", "entities", "entity"]);

  this.pagesRendered = function(){
    $(document)
      .on("submit", "#process-text", self.processText)
      .on("click", ".entity-extractor", self.extractEntities)
      
    self.renderTextPage();
    self.renderEntitiesPage();
  };
  
  this.renderTextPage = function(){
    var items = [
      { title: "Whatizit", id: "whatizit", class: "entity-extractor" }
    ];
    
    var view = new Views.TextView({ container: self.pages.text.contentNode, items: items });
    view.render();
  
    self.processor = $("#processor").get(0).contentWindow;
    window.addEventListener("message", self.receivedMessage, true);
  };
  
  this.receivedMessage = function(event){
    if (event.source != self.processor) return;

    switch (event.data){
      case "ready": // "ready" = the processor is ready
        $("#process-text").show();
      break;

      default: // anything else = the processor has returned the text of the PDF
        self.extractButton.val("Extract Text");
        $("#process-text-output").text(event.data.replace(/\s+/g, " "));
      break;
    }
  };
  
  this.processText = function(event){
    event.preventDefault();
    
    var pdfURL = $("iframe[name=read]").attr("src");
    console.log(pdfURL);
    
    if (!pdfURL || !pdfURL.match(/^filesystem:/)) {
      alert("Choose a PDF file first");
      return;
    }
    
    self.extractButton = $(this).find("input[type=submit]");
    self.extractButton.val("Fetching PDF...");
    
    var xhr = new XMLHttpRequest;
    xhr.open('GET', pdfURL, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function(event) {
      self.extractButton.val("Extracting text...");
      self.processor.postMessage(this.response, "*");
    };
    xhr.send();
  };
    
  this.renderEntitiesPage = function(){
    var view = new Views.EntitiesView({ container: self.pages.entities.contentNode });
    view.render();
  };
  
  this.renderEntityPage = function(){
    var iframe = $("<iframe/>", { src: "javascript:void(0);", "data-role": "content" }).replaceAll(self.pages.entity.contentNode); 
  };
  
  this.extractEntities = function(event){
    console.log(event);
    event.preventDefault();
    
    var text = $("#process-text-output").text();
    if (!text) {
      //alert("Extract some text first!");
      //return;
      text = "cd25 cd4";
    }
    
    var node = $(this);
    var annotator = node.data("annotator");
      
    $.ajax({
      type: "POST",
      url: "annotate/" + encodeURIComponent(annotator.id),
      data: { text: text },
      success: function(data, textstatus, jqXHR){
        console.log(data);
      },
      error: function(event){
        console.log(["error", this]);
      },
    });
  };
}

SectionTextController.prototype = new Section;
//new SectionTextController;

