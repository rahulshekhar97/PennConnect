var socket = io ();


$(document).ready(function () {
	console.log('ready');
	$('#send').click(function (e) {
		console.log('clicked');
		e.preventDefault();
		socket.emit('message', $("#text").val());
	});
	socket.on('chat message', function (msg){
		$('#messages').append('<li>' + msg + '</li>');
	});
});