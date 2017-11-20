var socket = io ();


$(document).ready(function () {
	socket.emit('create');
	console.log('ready');
	socket.on('connected', function () {
		var html1 =  '<input type = text id=text> </input>'
		var html2 =  '<input type = submit id =send> </input>'
		$('#chatbox').append(html1);
		$('#chatbox').append(html2);
		$('p').remove();
		console.log('connected');
	});
	$(document).on('click', '#send', function (e) {
		console.log('clicked');
		e.preventDefault();
		socket.emit('message', $("#text").val());
	});
	socket.on('chat message', function (msg){
		$('#messages').append('<div class = left>' + msg + '</div>');
	});
	socket.on('sender', function (msg) {
		$('#messages').append('<div class = right>' + msg + '</div>');
	});
});