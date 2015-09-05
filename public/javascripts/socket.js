$(function () {
	var ws_url = location.origin+location.pathname;
	ws_url = ws_url.replace(/\/$/, '');
	window.socket = io( {
	query: $.param({
	  room: location.pathname.match(/[nchuit]{6}/)[0],
	 }),
  });


	var RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
	var VALUES = {a:1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "t":10, "j":10, "q":10, "k":10};
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
			$target.append($.parseHTML('<div class="poker poker-'+this.suit+this.rank+'" />'));
			return this;
		},
		draw_back: function($target) {
			$target.append($.parseHTML('<div class="poker '+CARD_BACK+'" />'));
			return this;
		},
	};
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
		function Deck() {
			this.cards = [];
			for( var i in SUITS )
			for( var j in RANKS )
			this.cards.push(new Card(SUITS[i], RANKS[j]));
			return this;
	};

	socket.on('drawObserver', function(data){
		view_hide();
		$('#poker-table').show();
		outcome(outcome.msg, outcome.color)
		console.log('drawObserver', data);
	});

	socket.on('drawPlayer', function(data){
		view_hide();
		$('#poker-table').show();
		outcome(outcome.msg, outcome.color)
		console.log('drawPlayer', data);
	});

	socket.on('outcome', function(data){
		console.log('outcome', data);
	});

	socket.on('hitOrStand', function(data){
		console.log('hitOrStand', data);
	});

	function view_hide(){
		$('#roomId').hide();
		$('#poker-table').hide();
		$('#result').hide();
		$('#player-nick').hide();
	}

	function outcome(msg, color) {
		color = typeof(color) !== "undefined" ? color : 'info';
		var $outcome = $('#outcome');
		$outcome.css('visibility', (msg.length==0)?'hidden':'inherit') // 顯示或隱藏
		.html(msg.length==0?'No message.':msg)
		.removeClass('alert-success alert-info alert-warning alert-danger')
		.addClass('alert-'+color);
	}

	function plyerPost(target, players){
		var target = $(target);
		var cards = players.cards;
		var nick = players.nick;
		$(target + ' .panel-title .playerNick').text(nick);
		draw_value('#player .panel-title .badge');
	}

	function observerPost(target, players){
		var target = $(target);
		var cards = players.cards;
		var nick = players.nick;
		$(target + ' .panel-title .playerNick').text(nick);
		draw_value('#player .panel-title .badge');
	}
  $('#nick').submit(function() {
    var nick = $('#nick input').val();
    socket.emit('gameJoin', {nick:nick});
    $('form input').prop( "disabled", true );
    $('#btn-start').attr('disabled','disabled');
    return false;
  })
});

	
