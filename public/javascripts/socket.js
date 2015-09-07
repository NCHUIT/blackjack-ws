$(function () {
	window.socket = io({
		query: $.param({
			room: location.pathname.match(/[nchuit]{6}/)[0],
		}),
	});
	var SUITS = ["c", "s", "h", "d"];
	var RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
	var VALUES = {a:1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "t":10, "j":10, "q":10, "k":10};

	function Card(card) {
		this.suit = card.suit;
		this.rank = card.rank;
		if (typeof card === 'string') {
			this.suit = card[0];
			this.rank = card[1];
		}
		if( SUITS.indexOf(this.suit) == -1 && RANKS.indexOf(this.rank) == -1 && card != 'xx' )
			throw "Invalid card: " + this.suit + this.rank;
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
		outcome(data);
	});

	// only sent for observer
	socket.on('drawWait', function(data){ //<-outcome
		console.log('drawWait', data);
		view_hide();

		$.each(data, function(i, nick){
			$('#playerList-' + (i+1)).text((i+1) + '. ' + data[i].nick);
		});
		$('#roomId').show();
	});
	//First Player Only
	socket.on('drawStartBtn', function(data) {
	    console.log('drawStartBtn', data);
	    $('#btn-submit').hide();
	    $('#waitingMsg').hide();
	    $('#btn-start').show();
	});

	socket.on('askHitOrStand', function(){
		// ask player hit or stand
		console.log('askHitOrStand');
		$('#poker-hit').removeAttr('disabled','disabled');
		$('#poker-stand').removeAttr('disabled','disabled');
	});

	socket.on('drawResult', function(data) {
		view_hide();
		console.log('drawResult');
		$('#winner').text(data + 'win!!');
		$('#result').show;
	});

	socket.on('win', function() {
		view_hide();
		console.log('win');
		$('#result').text('You win!');
		$('#result').show;
	});

	socket.on('lose', function() {
		view_hide();
		console.log('lose');
		$('#result').text('You lose!');
		$('#result').show;
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

  $('#btn-submit').click(function() {
    var nick = $('#nick input').val();
    socket.emit('joinPlayer', {nick:nick});
    $('form input').prop( "disabled", true );
    $('#btn-submit').attr('disabled','disabled');
    $('#waitingMsg').show();
    return false;
  })
  $('#btn-start').click(function() {
    socket.emit('gameStart', {nick:nick});
    return false;
  })
  $('#nick input').click(function() {
  	$('#nick input').val("");
  });
  var name=['Jason', 'Lego', 'PastLeo', 'Sakamoto', 'Jimmy', 'ray', 'Joker', 'Ely', 'Momo'];
  $('#nick input').val(name[Math.floor(Math.random()*(8-0+1)+0)]);

  $('#poker-hit').click(function(){
  	socket.emit('hit');
  	console.log('hit');
  });

  $('#poker-stand').click(function(){
  	socket.emit('stand');
  	$('#poker-hit').attr('disabled','disabled');
  	$('#poker-stand').attr('disabled','disabled');
  	console.log('stand');
  });
  $('#poker-hit').attr('disabled','disabled');
  $('#poker-stand').attr('disabled','disabled');
});
