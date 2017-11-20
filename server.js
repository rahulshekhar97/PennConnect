var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.set('port', process.env.PORT || 3000);

app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', function (req, res) {
	res.render('home');
});

app.get('/register', function (req, res) {
	res.render('session');
});

app.get('/chat', function (req, res) {
	res.render('index');
});
 
io.on('connection', function (socket) {
	socket.on('create', function () {
		// socket.join('room1');
		var obj = io.sockets.adapter.rooms;
		var keys = Object.keys(io.sockets.adapter.rooms);
		// get rooms which can be filled 
		var rooms = [];
		for (var i = 0; i < keys.length; i++) {
			if (keys[i].indexOf('room') != -1) {
				if(obj[keys[i]].length == 1) {
					rooms.push(keys[i]);
				} 
			}
		}

		if (rooms.length) {
			var r = Math.floor(Math.random() * rooms.length);
			socket.join(rooms[r]);
			io.to(rooms[r]).emit('connected');
			console.log(rooms[r]);
		} else {
			while (true) {
				var r = Math.floor(Math.random() * 1000);
				var join = 'room' + r;
				if (keys[join] == undefined) {
					socket.join('room' + r);
					break;
				}
		    }
		}
	});
	console.log('connected ' + socket.id);
	socket.on('message', function (message) {
		console.log(message);
		var keys = Object.keys(socket.rooms);
		var room = socket.rooms[keys[1]];
		socket.broadcast.to(room.toString()).emit('chat message', message);
		socket.emit('sender', message);
	});
});

http.listen(app.get('port'), function() { 
  console.log('listening');
});