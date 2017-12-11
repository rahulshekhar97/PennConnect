var socket = io ();


$(document).ready(function () {
	//socket.emit('create');
	$(document).on('click', '#clicktochat', function() {
		socket.emit('create');
		$('#clicktochat').remove();
		$('#connect').append('<p id = "wait"> Waiting to be Connected! </p>');
	});

	$(document).on('click', '#clicktochat2', function() {
		socket.emit('create');
		$('#chatbox').empty();
		$('#messages').empty();
		$('#connect').append('<p id = "wait"> Waiting to be Connected! </p>');
	});

	// ----- handles disconnet operations ---- //

	socket.on('predisc', function () {
		socket.emit('disconnectroom');
	});

	socket.on('after disconnect', function () {
		console.log('reached after disconnect function');
	});

	socket.on('restore', function () {
		$('#chatbox').empty();
		var chatbutton = '<button type="button" id = "clicktochat2">Click to Chat again!</button>';
		$('#chatbox').append(chatbutton);
	});

	// --- disconnecting operations end -----//
	
	socket.on('connected', function () {
		$('#chatbox').empty();
		$('#messages').empty();
		var disconnect = '<input type = submit id=send2 value = End> </input>'
		var html1 =  '<input type = text id=text> </input>'
		var html2 =  '<input type = submit id=send1 value = Send> </input>'
		$('#chatbox').append(disconnect);
		$('#chatbox').append(html1);
		$('#chatbox').append(html2);
		$('#wait').remove();
		console.log('connected');
	});

	$(document).on('click', '#send2', function (e) {
		console.log('clicked');
		e.preventDefault();
		socket.emit('disconnecting');
		//$('#text').val("");
	});

	$(document).on('click', '#send1', function (e) {
		console.log('clicked');
		e.preventDefault();
		socket.emit('message', $("#text").val());
		$('#text').val("");
	});

	$(document).on('keydown', '#text', function (e) {
     var keyCode = e.keyCode || e.which;
     if (keyCode === 13) {
        socket.emit('message', $("#text").val());
        $(this).val("");
     }
  });

	socket.on('chat message', function (msg){
		$('#messages').append('<div class = left>' + msg + '</div>');
		var x = 0.55 * $(document).height();
		$('#messages').css('height', x + 'px');
		$('#messages').scrollTop($('#messages').scrollTop() + 70);
	});

	socket.on('sender', function (msg) {
		$('#messages').append('<div class = right>' + msg + '</div>');
		var x = 0.55 * $(document).height();
		$('#messages').css('height', x + 'px');
		$('#messages').scrollTop($('#messages').scrollTop() + 70);
	});

	// ---- code for like button ---//
	$(document).on('click', '.btn-secondary', function (e) {
		var likes = parseInt($(this).html());
		var ok = $(this).attr('data-like');
		if (ok == '0') {
		  	likes++;
			$(this).attr('data-like', '1');
		}
		$(this).html(' ' + likes);
		var link = '/like/' + $(this).attr('data-id');
		console.log(link);
		 $.ajax(
		   {url: link,
		   	type: 'GET',
		   	success : function (result) {

		   	}
    	   }
    	 );
	});

});