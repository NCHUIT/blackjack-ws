// https://987.tw/2014/03/08/export-this-node-jsmo-zu-de-jie-mian-she-ji-mo-shi/

function Room() {
  this.SUITS = ["c", "s", "h", "d"];
  this.RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
  this.VALUES = {a:1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "t":10, "j":10, "q":10, "k":10};

  this.init();
  this.start();
}

Room.prototype.init = function(){
  this.in_play = false;
  this.players = [];
  this.observers = [];
  this.deck = null;
  this.CARD_BACK = "poker-back-heartstone";
};

Room.prototype.start = function() {
  if(this.players.length < 1)
    throw "[Room.start] Players count must between 2 and 4.";
  for(i=0; i<2; i++)
    for(player in this.players)
      player.hand.addCard( this.deck.dealCard() );
  this.outcome("<strong>Hit</strong> or <strong>stand</strong>?");
  // if(in_play) {
  //   score -= 1;
  //   outcome("<strong>Player</strong> lose. <strong>Hit</strong> or <strong>stand</strong>?", "success");
  // } else {
  //   in_play = true;
  //   outcome("<strong>Hit</strong> or <strong>stand</strong>?");
  // }
  this.draw();
};

Room.prototype.outcome = function(msg, color) {
  color = typeof(color) !== "undefined" ? color : 'info';
  console.log(color, msg);
  // var $outcome = $('#outcome');
  // $outcome.css('visibility', (msg.length==0)?'hidden':'inherit') // 顯示或隱藏
  //   .html(msg.length==0?'No message.':msg)
  //   .removeClass('alert-success alert-info alert-warning alert-danger')
  //   .addClass('alert-'+color);
};

Room.prototype.addPlayer = function(socketId) {
  if(this.players.length >= 4)
    throw "[Room.addPlayer] exceed 4 players";
  var player = new Person(socketId);
  player.room = this;
  this.players.push(player);
  return player;
}

Room.prototype.addObserver = function(socketId) {
  var observer = new Person(socketId);
  observer.room = this;
  this.observers.push(observer);
  return observer;
}

Room.prototype.draw = function() {
  for(player in this.players)
    player.drawCards().drawValue();
  for(observer in this.observers)
    observer.draw();
}

// Card
function Card(suit, rank) {
  if( SUITS.indexOf(suit) == -1 || RANKS.indexOf(rank) == -1 )
    throw "[Card.construct] Invalid card: " + suit + rank;
  this.suit = suit;
  this.rank = rank;
};
Card.prototype = {
  toString: function() {
    return this.suit + this.rank;
  },
  getSuit: function() {
    return this.suit;
  },
  getRank: function() {
    return this.rank;
  },
};
Room.prototype.Card = Card;

function Deck() {
  this.cards = [];
  for( var i in SUITS )
    for( var j in RANKS )
      this.cards.push(new Card(SUITS[i], RANKS[j]));
  return this;
};
Deck.prototype = {
  toString: function() {
    return "Deck contains " + this.cards.join(" ");
  },
  shuffle: function() {
    this.cards = this._shuffle(this.cards);
    return this;
  },
  _shuffle: function(v) {
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
  },
  dealCard: function() {
    return this.cards.pop();
  },
};
Room.prototype.Deck = Deck;

function Person(socketId) {
  this.nick = socketId;
  this.hand = null;
  this.room = null;
  this.cards = [];
  this.socketId = socketId;
}
Person.prototype = {
  hit: function() {
    if(this.room.in_play) {
      if(this.getValue() <= 21)
        this.add_card(this.room.deck.deal_card());
      if(this.getValue() > 21)
        this.room.outcome("<strong>" + this.nick + "</strong> have busted", "warning");
      this.room.draw();
    } else {
      this.outcome("Click <strong>Deal</strong> button to restart.");
    }
  },
  stand: function() {
    // if(!this.room.in_play) {
    //   this.outcome("Click <strong>Deal</strong> button to restart.");
    //   return;
    // }
    // if(player.getValue() <= 21)
    //   while(dealer.getValue() < 17 || dealer.getValue() < Math.min(player.getValue(), 21))
    //     dealer.add_card(deck.deal_card());
    // in_play = false;
    // player_win = ( player.getValue() <= 21 && dealer.getValue() < player.getValue() || dealer.getValue() > 21 );
    // if(player_win) {
    //   score += 1;
    //   outcome('<strong>Player</strong> wins.', 'success');
    // } else {
    //   score -= 1;
    //   outcome('<strong>Dealer</strong> wins.', 'danger');
    // }
    // this.room.draw();
  },
  outcome: function(msg, color) {
    console.log(color, msg);
  },
  toString: function() {
    return this.nick + " contains " + this.cards.join(" ");
  },
  addCard: function(card) {
    this.cards.push(card);
  },
  getValue: function(steal) {
    var value = 0, hasAce = false, isFirst = (steal === true);
    for( var i in this.cards ) {
      if(isFirst) {
        isFirst = false;
        continue;
      }
      card = this.cards[i];
      if( card.get_rank() == 'a' )
        hasAce = true;
      value += VALUES[card.get_rank()];
    }
    if(hasAce && value<=11)
      value += 10;
    if(value < 21 && this.cards.length>=5)
      return 21;
    return value;
  },
  drawValue: function(steal) {
    console.log("[Person.drawValue] " + this.getValue());
    return this;
  },
  drawCards: function(steal) {
    var cards = this.cards;
    if(steal === true)
      cards[0] = 'xx';
    // for(var i in this.cards) {
    // }
    console.log(cards.join(" "));
    return this;
  },
};
Room.prototype.Person = Person;

// module.exports = Room;
