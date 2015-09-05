// https://987.tw/2014/03/08/export-this-node-jsmo-zu-de-jie-mian-she-ji-mo-shi/

var express = require('express');

function Room() {
  this.SUITS = ["c", "s", "h", "d"];
  this.RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
  this.VALUES = {a:1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "t":10, "j":10, "q":10, "k":10};
  this.id = 'nchuit';
  this.init();
}

Room.prototype.init = function(){
  this.in_play = false;
  this.players = {};
  this.pOrder = [];
  this.observers = {};
  this.deck = null;
  this.CARD_BACK = "poker-back-heartstone";
};

Room.prototype.start = function() {
  this.deck = new Deck(this).shuffle();
  this.in_play = true;
  if(this.players.length < 2)
    throw "[Room.start] Players count must between 2 and 4.";
  for(i=0; i<2; i++)
    for(j in this.players)
      this.players[j].addCard( this.deck.dealCard() );
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
  express.io.emit('outcome', {
    color: typeof(color) !== "undefined" ? color : 'info',
    msg: msg,
  });
};

Room.prototype.addPlayer = function(obj) {
  if(this.players.length >= 4)
    throw "[Room.addPlayer] exceed 4 players";
  var player = obj instanceof Person ? obj : new Person(socket);
  var socketId = player.socket.id;
  console.log(socketId, 'join at room ID= "',this.id, '" as players');
  player.room = this;
  this.players[socketId] = player;
  this.pOrder.push(socketId); 
  this.outcome(player.nick + ' join to room');
  return player;
}

Room.prototype.removePlayer = function(socket) {
  console.log(socket.id, 'remove at room ID= "',this.id, '" as players');
  var tmp = []; 
  tmp[0] += delete this.players[socket.id];
  tmp[1] += delete this.pOrder[this.pOrder.indexOf(socket.id)];
  if ( tmp[0] && tmp[1])
    this.outcome(socket.id, 'remove as players');
}

Room.prototype.addObserver = function(socket) {
  console.log(socket.id, 'join at room ID= "',this.id, '" as observers');
  var observer = new Person(socket);
  observer.room = this;
  this.observers[socket.id] = observer;
  return observer;
}

Room.prototype.removeObserver = function(socket) {
  console.log(socket.id, 'remove at room ID= "',this.id, '" as observers');
  delete this.observers[socket.id];
}

Room.prototype.draw = function() {
  for(var i in this.players) {
    this.players[i].drawPlayer();
  }
  this.drawObserver();
};

Room.prototype.drawObserver = function() {
  var data = {
    outcome: this.outcome,
    players: [],
  };
  for (var pid in this.pOrder) {
    pid = this.pOrder[pid];
    var tmp = null;
    if(pid != null) {
      var player = this.players[pid];
      var tmp = {
        nick: player.nick,
        cards: player.cards,
        outcome: player.outcome,
      }
      tmp.cards[0] = 'xx';
    }
    data.players.push(tmp);
  }
  for (var pid in this.observers)
    this.observers[pid].socket.emit('drawObserver', data);
};

Room.prototype.shuffle = function(v) {
  for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
}

Room.prototype.newId = function() {
  this.id = this.shuffle(this.id.split('')).join('');
  return this.id;
}

Room.prototype.maxIdCnt = function() {
  var cnt = 1;
  for (var i = 0; i < this.id.length; i++) {
    cnt *= i+1;
  }
  return cnt;
};

// Card
function Card(room, suit, rank) {
  if( room.SUITS.indexOf(suit) == -1 || room.RANKS.indexOf(rank) == -1 )
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

function Deck(room) {
  this.room = room;
  this.cards = [];
  var SUITS = this.room.SUITS, RANKS = this.room.RANKS;
  for( var i in SUITS )
    for( var j in RANKS )
      this.cards.push(new Card(room, SUITS[i], RANKS[j]));
  return this;
};
Deck.prototype = {
  toString: function() {
    return "Deck contains " + this.cards.join(" ");
  },
  shuffle: function() {
    this.cards = this.room.shuffle(this.cards);
    return this;
  },
  dealCard: function() {
    return this.cards.pop();
  },
};
Room.prototype.Deck = Deck;

function Person(socket) {
  this.nick = socket.id;
  this.room = null;
  this.cards = [];
  this.socket = socket;
}
Person.prototype = {
  hit: function() {
    if(this.room.in_play) {
      if(this.getValue() <= 21)
        this.addCard(this.room.deck.dealCard());
      if(this.getValue() > 21)
        this.room.outcome("<strong>" + this.nick + "</strong> have busted", "warning");
      this.room.draw();
    } else {
      this.outcome("Click <strong>Restart</strong> button to restart.");
    }
  },
  stand: function() {
    // if(!this.room.in_play) {
    //   this.outcome("Click <strong>Deal</strong> button to restart.");
    //   return;
    // }
    // if(player.getValue() <= 21)
    //   while(dealer.getValue() < 17 || dealer.getValue() < Math.min(player.getValue(), 21))
    //     dealer.addCard(deck.dealCard());
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
    this.socket.emit('outcome', {
      color: typeof(color) !== "undefined" ? color : 'info',
      msg: msg,
    });
  },
  toString: function() {
    return this.nick + " contains " + this.cards.join(" ");
  },
  addCard: function(card) {
    this.cards.push(card);
  },
  getValue: function(steal) {
    var value = 0, hasAce = false, isFirst = (steal === true), VALUES = this.room.VALUES;
    for( var i in this.cards ) {
      if(isFirst) {
        isFirst = false;
        continue;
      }
      card = this.cards[i];
      if( card.getRank() == 'a' )
        hasAce = true;
      value += VALUES[card.getRank()];
    }
    if(hasAce && value<=11)
      value += 10;
    if(value < 21 && this.cards.length>=5)
      return 21;
    return value;
  },
  drawPlayer: function(steal) {
    var data = {
      nick: this.nick,
      cards: this.cards,
      outcome: this.outcome,
    };
    for(var i in data.cards)
      data.cards[i] = data.cards[i].toString();
    this.socket.emit('drawPlayer', data);
    return this;
  },
};
Room.prototype.Person = Person;

module.exports = Room;

// r = new Room();
// p1 = r.addPlayer('1');
// p2 = r.addPlayer('2');
// r.start();
