![pigeon-intro](https://cloud.githubusercontent.com/assets/1669104/13193480/dec8503a-d72d-11e5-8284-bb84ff5254bf.png)

# Pigeon
A full fledge open source chat application, includes rooms, 1on1, spam filtering, and much more. This is a work in progress, I have some cool ideas for this project it just needs time.

## Getting started - Beta

    // Implementation Model
    var message = new Pigeon.Model({ body: 'hello' });

    // Implementation View
    var chatBoxView = new Pigeon.View({
      element: '.messages',
      id: 'chatBox',
      model: message,
      events: {
        'click':'doClick'
      },
      render: function() {
        
        this.listenTo('change', this.model);
        this.element.innerHTML = '<div class="model">'+this.model.get('body')+'</div>';
        
      },
      doClick: function() {
      
        // Custom test method
        var messages = ['Good Day','Get Coffee','Read a book', 'Take a walk'];
        var randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // update the model
        this.model.set({
          body: randomMessage
        });
        
      }
    }); // view instance




    // Boot
    var StartChat = function() {
      chatBoxView.render();
    };
    
    // Eventually you just call this
    StartChat();
