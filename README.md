![pigeon-intro](https://cloud.githubusercontent.com/assets/1669104/13193480/dec8503a-d72d-11e5-8284-bb84ff5254bf.png)

# Pigeon
A full fledge open source chat application, includes rooms, 1on1, spam filtering, and much more. This is a work in progress, I have some cool ideas for this project it just needs time.

## Getting started - Beta

    // Implementation Model
    var message = new Pigeon.Model({ body: 'hello' });

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
          //this.collection.add(new Pigeon.Model(message));
          socket.socketMethods.sendMessage(message);
          el.value = '';

        }

      });

      // boot chat box
      chatBoxView.initialize();

    });
