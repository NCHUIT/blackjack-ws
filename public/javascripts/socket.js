$(function () {
	window.socket = io({
		query: $.param({
			room: location.pathname.match(/[nchuit]{6}/)[0],
		}),
	});
	var SUITS = ["c", "s", "h", "d"];
	var RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
	var VALUES = {a:1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "t":10, "j":10, "q":10, "k":10};

	function Card(str) {
		this.suit = str[0];
		this.rank = str[1];
		if( SUITS.indexOf(str[0]) == -1 && RANKS.indexOf(str[1]) == -1 && str != 'xx' )
			throw "Invalid card: " + suit + rank;
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
			if(this.suit != 'x')
				$target.append($.parseHTML('<div class="poker poker-'+this.suit+this.rank+'" />'));
			else
				$target.append($.parseHTML('<div class="poker poker-back" />'));
			return this;
		},
	};
	function Hand(cards) {
		this.cards = [];
		for(var i in cards)
			this.add_card(new Card(cards[i]));
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
			var value = 0, hasAce = false, steal = '';
			$.each(this.cards, function(i, card){
				if( card.toString() == 'xx' ) {
					steal = ' + ?';
					return true;
				}
				if( card.get_rank() == 'a' )
					hasAce = true;
				value += VALUES[card.get_rank()];
			});
			if(hasAce && value<=11)
				value += 10;
			if(value < 21 && this.cards.length>=5)
				return 21;
			return value + steal;
		},
		draw_value: function(target) {
			var $target = $(target);
			$target.text(this.get_value());
			return this;
		},
		draw_cards: function(target) {
			var $target = $(target);
			$target.empty();
			for(var i in this.cards)
				this.cards[i].draw($target);
			return this;
		}
	};

	socket.on('drawObserver', function(data){
		console.log('drawObserver', data);
		view_hide();
		outcome(data.outcome);
		for(var i=0; i<4; i++) {
			if(i in data.players) {
				drawPlayer('#player-'+(i+1), data.players[i]);
				$('#player-'+(i+1)).show();
			} else $('#player-'+(i+1)).hide();

		}
		
		$('#poker-table').show();
	});

	socket.on('drawPlayer', function(data){
		console.log('drawPlayer', data);
		view_hide();
		outcome(data.outcome);
		drawPlayer('#player', data);
		$('#poker-table').show();
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

	function outcome(msg) {
		if(msg == null)
			return;
		msg.color = msg.color || 'info';
		msg.msg = msg.msg || '';
		var $outcome = $('#outcome');
		$outcome.css('visibility', (msg.msg.length == 0)?'hidden':'inherit') // 顯示或隱藏
		.html(msg.msg)
		.removeClass('alert-success alert-info alert-warning alert-danger')
		.addClass('alert-' + msg.color);
	}

	function drawPlayer(target, player){
		var $target = $(target);
		var hand = new Hand(player.cards);
		var nick = player.nick;
		$target.find('.playerNick').text(nick);
		hand.draw_cards($target.find('.panel-body'))
			.draw_value($target.find('.panel-title .badge'));
	}

  $('#nick').submit(function() {
    var nick = $('#nick input').val();
    socket.emit('gameJoin', {nick:nick});
    $('form input').prop( "disabled", true );
    $('#btn-start').attr('disabled','disabled');
    return false;
  })
});
