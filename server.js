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
	res.render('index');
});

io.on('connection', function (socket) {
	console.log('connected ' + socket.id);
	socket.on('message', function (message) {
		console.log(message);
		io.emit('chat message', message + io.sockets.clients());
	});
});

http.listen(app.get('port'), function() { 
  console.log('listening');
});