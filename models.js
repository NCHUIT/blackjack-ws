// https://987.tw/2014/03/08/export-this-node-jsmo-zu-de-jie-mian-she-ji-mo-shi/

function Room() {
  this.in_play = false;
  this.players = [];
  this.observers = [];
  this.deck = null;
  this.SUITS = ["c", "s", "h", "d"];
  this.RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
  this.VALUES = {a:1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "t":10, "j":10, "q":10, "k":10};
  this.CARD_BACK = "poker-back-heartstone";

  this.restart();
}

Room.prototype.outcome = function(msg, color) {
  color = typeof(color) !== "undefined" ? color : 'info';
  var $outcome = $('#outcome');
  $outcome.css('visibility', (msg.length==0)?'hidden':'inherit') // 顯示或隱藏
    .html(msg.length==0?'No message.':msg)
    .removeClass('alert-success alert-info alert-warning alert-danger')
    .addClass('alert-'+color);
};

// Card
function Card(suit, rank) {
  if( SUITS.indexOf(suit) != -1 && RANKS.indexOf(rank) != -1 ) {
    this.suit = suit;
    this.rank = rank;
  } else {
    throw "Invalid card: " + suit + rank;
  }
  return this;
};
Card.prototype = {
  toString: function() {
    return this.suit + this.rank;
  },
  get_suit: function() {
    return this.suit;
  },
  get_rank: function() {
    return this.rank;
  },
  draw: function($target) {
    return this.suit+this.rank;
  },
  draw_back: function($target) {
    return 'xx';
  },
};
Room.prototype.Card = Card;

function Hand(steal) {
  this.cards = [];
  this.steal = typeof(steal) !== 'undefined' ? steal : false;
  return this;
};
Hand.prototype = {
  toString: function() {
    return "Hand contains " + this.cards.join(" ");
  },
  add_card: function(card) {
    this.cards.push(card);
  },
  get_value: function() {
    var value = 0, hasAce = false;
    for( var i in this.cards ) {
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
  draw_value: function(target) {
    var $target = $(target);
    if(in_play && this.steal)
      $target.text('?');
    else $target.text(this.get_value());
    return this;
  },
  draw_cards: function(target) {
    var $target = $(target);
    $target.empty();
    for(var i in this.cards) {
      if(in_play && this.steal && i==0)
        this.cards[i].draw_back($target);
      else this.cards[i].draw($target);
    }
    return this;
  }
};
Room.prototype.Hand = Hand;

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
    this.cards = shuffle(this.cards);
    return this;
  },
  deal_card: function() {
    return this.cards.pop();
  },
};
Room.prototype.Deck = Deck;

Room.prototype.shuffle = function(v) {
  for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
};

Room.prototype.restart = function(){
  deck = new Deck().shuffle();
  player = new Hand();
  dealer = new Hand(true); // steal
  for(i=0; i<2; i++) {
    player.add_card(deck.deal_card());
    dealer.add_card(deck.deal_card());
  }
  if(in_play) {
    score -= 1;
    outcome("<strong>Player</strong> lose. <strong>Hit</strong> or <strong>stand</strong>?", "success");
  } else {
    in_play = true;
    outcome("<strong>Hit</strong> or <strong>stand</strong>?");
  }
  draw();
};

function Person() {

}
Person.prototype = {
  hit: function(){
    if(in_play) {
      if(player.get_value() <= 21)
        player.add_card(deck.deal_card());
      if(player.get_value() > 21)
        outcome("<strong>Player</strong> have busted", "warning");
      draw();
    } else {
      outcome("Click <strong>Deal</strong> button to restart.");
    }
  },
  stand: function(){
    if(!in_play) {
      outcome("Click <strong>Deal</strong> button to restart.");
      return;
    }
    if(player.get_value() <= 21)
      while(dealer.get_value() < 17 || dealer.get_value() < Math.min(player.get_value(), 21))
        dealer.add_card(deck.deal_card());
    in_play = false;
    player_win = ( player.get_value() <= 21 && dealer.get_value() < player.get_value() || dealer.get_value() > 21 );
    if(player_win) {
      score += 1;
      outcome('<strong>Player</strong> wins.', 'success');
    } else {
      score -= 1;
      outcome('<strong>Dealer</strong> wins.', 'danger');
    }
    draw();
  },
};
Room.prototype.Person = Person;

Room.prototype.draw = function() {
  player.draw_cards('#player .blackjack-board').draw_value('#player .badge');
  dealer.draw_cards('#dealer .blackjack-board').draw_value('#dealer .badge');
  $('#score').text('Score: '+score);
}

module.exports = Room;
