// https://987.tw/2014/03/08/export-this-node-jsmo-zu-de-jie-mian-she-ji-mo-shi/

var express = require('express');

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function Room() {
  this.SUITS = ["c", "s", "h", "d"];
  this.RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
  this.VALUES = {a:1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "t":10, "j":10, "q":10, "k":10};
  this.id = 'nchuit';
  this.nextPlayer = null;
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
  this.draw();
  this.askHitOrStand();
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
  var player = obj instanceof Person ? obj : new Person(obj);
  var socketId = player.socket.id;
  console.log(socketId + 'join at room ID= "'+this.id+ '" as players');
  player.room = this;
  this.players[socketId] = player;
  this.pOrder.push(socketId);
  this.outcome(player.nick + ' join to room');
  if (this.pOrder.indexOf(socketId) == 0) {
    player.drawStartBtn();
  }
  return player;
}

Room.prototype.removePlayer = function(socket) {
  console.log(socket.id+ 'remove at room ID= "'+this.id+ '" as players');
  /*
  var tmp = [];
  tmp[0] += delete this.players[socket.id];
  tmp[1] += delete this.pOrder[this.pOrder.indexOf(socket.id)];
  */
  delete this.players[socket.id];
  var index = this.pOrder.indexOf(socket.id);
  if (index != -1) {
    this.pOrder.splice(index,1);
    this.outcome(socket.id + ' 離開遊戲。');
  }
  var firstPlayer = this.players[this.pOrder[0]];
  if (typeof firstPlayer !== "undefined")
    firstPlayer.drawStartBtn();
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
      // This line in order to prevent tmp reference to player's data 
      data = clone(data);
      for(var i in data.cards)
        tmp.cards[i] = tmp.cards[i].toString();
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

Room.prototype.drawWait = function() {
  var data = [];
  for (var i in this.pOrder) {
    var tmp  = {
      pOrder: i+1,
      nick: this.players[this.pOrder[i]].nick,
    };
    data.push(tmp);
  }
  for (var pid in this.observers) {
    this.observers[pid].socket.emit('drawWait', data);
  }
};

Room.prototype.askHitOrStand = function() {
  this.nextPlayer = null;
  for( var i in this.pOrder ) {
    i = this.pOrder[i];
    if( this.players[i].isStand )
      continue;
    this.nextPlayer = this.players[i];
    break;
  }
  if( this.nextPlayer != null ) {
    // some players need to ask hit or stand
    this.outcome('現在輪到 <strong>' + this.nextPlayer.nick + '</strong> 決定要不要抽牌。');
    this.nextPlayer.askHitOrStand();
  } else this.end();
};

Room.prototype.end = function() {
  this.in_play = false;
  var winner = [], highValue = 0;
  for( var player in this.players ) {
    player = this.players[player];
    playerValue = player.getValue();
    if(playerValue > highValue) {
      winner = [player.socket.id];
      highValue = playerValue;
    } else if (playerValue == highValue) {
      winner.push(player.socket.id);
    }
  }
  for(var player in this.players) {
    if(player.id in winner)
      player.drawWin();
    else player.drawLose();
  }
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
  this.isStand = false;
}
Person.prototype = {
  askHitOrStand: function() {
    this.socket.emit('askHitOrStand');
  },
  hit: function() {
    if(this.socket.id != this.room.nextPlayer.socket.id) {
      this.outcome("It's not your turn!", "danger");
      return;
    }
    if(this.getValue() <= 21)
      this.addCard(this.room.deck.dealCard());
    if(this.getValue() > 21)
      this.outcome("<strong>" + this.nick + "</strong> 已經超過 21 點了，請按 Stand 來結束您的回合。", "warning");
    this.room.draw();
  },
  stand: function() {
    this.isStand = true;
    this.room.draw();
    this.room.askHitOrStand();
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
      var card = this.cards[i];
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
    data = clone(data);
    //data = JSON.parse(JSON.stringify(data));
    for(var i in data.cards)
      data.cards[i] = data.cards[i].toString();
    this.socket.emit('drawPlayer', data);
    return this;
  },
  drawStartBtn: function() {
    var data = 'Let\'s start game';
    this.socket.emit('drawStartBtn', data);
  },
  drawWin: function() {
    this.socket.emit('win');
  },
  drawLose: function() {
    this.socket.emit('lose');
  }
};
Room.prototype.Person = Person;

module.exports = Room;

// r = new Room();
// p1 = r.addPlayer('1');
// p2 = r.addPlayer('2');
// r.start();
