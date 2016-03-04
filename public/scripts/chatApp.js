// Implementation Collection
var messages = new Pigeon.Collection({
  url: '/api/messages'
});

// handles a remote collection
messages.fetch(function(messages) {
  
  var chatBoxView = new Pigeon.View({

    target: '.messages',
    collection: messages,
    events: [
      { el: '.messageForm', type: 'submit', method: 'sendMessage'}
    ],

    initialize: function() {
      this.listenTo('change', this.collection);
      this.render();
    },

    render: function() {
      var self = this;
      this.element.innerHTML = '';
      this.collection.data.forEach(function(model) {
        var listItem = document.createElement('li'); // create a list item
        listItem.classList.add('message');
        listItem.appendChild(document.createTextNode(model.get('message')));
        self.element.appendChild(listItem);
      });
    },

    sendMessage: function(socket) {
      
      // bad we need a specific element not a general
      var el = document.querySelector('.messageData');
      var message = {'message': el.value};
      socket.socketMethods.sendMessage(message);
      el.value = '';

    }

  });

  // boot chat box
  chatBoxView.initialize();

});