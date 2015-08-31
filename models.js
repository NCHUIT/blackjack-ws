var models = function() {

  var SUITS = ["c", "s", "h", "d"];
  var RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
  var VALUES = {a:1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "t":10, "j":10, "q":10, "k":10};

  function Room(id) {
    if(id == null) {
      // create a new room
      id = '';
    }
    return {
      id: function(newId) {
        if(newId == null)
          throw "newId is null";
      },
      observers: function(){

      },
      players: function() {

      },
      status: function() {

      }
    };
  }

  // Card
  function Card(suit, rank) {
    if( SUITS.indexOf(suit) == -1 || RANKS.indexOf(rank) == -1 )
      throw "Invalid card: " + suit + rank;
    return {
      toString: function() {
        return suit + rank;
      },
      suit: function() {
        return suit;
      },
      rank: function() {
        return rank;
      },
    };
  };

  function Hand(steal) {
    cards = [];
    steal = typeof(steal) !== 'undefined' ? steal : false;
    return {
      toString: function() {
        return "Hand contains " + cards.join(" ");
      },
      card: function(card) {
        cards.push(card);
      },
      value: function() {
        var value = 0, hasAce = false;
        for( var i in cards ) {
          card = cards[i];
          if( card.get_rank() == 'a' )
            hasAce = true;
          value += VALUES[card.get_rank()];
        }
        if(hasAce && value<=11)
          value += 10;
        if(value < 21 && cards.length>=5)
          return 21;
        return value;
      },
    };
  };

  function Deck() {
    cards = [];
    for( var i in SUITS )
      for( var j in RANKS )
        cards.push(new Card(SUITS[i], RANKS[j]));
    return {
      toString: function() {
        return "Deck contains " + cards.join(" ");
      },
      shuffle: function() {
        cards = shuffle(cards);
      },
      dealCard: function() {
        return cards.pop();
      },
    };
  };

  function shuffle(v) {
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
  };
}
