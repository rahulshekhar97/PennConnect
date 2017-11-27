var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const sgMail = require('@sendgrid/mail');

var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var User = require('./db/User');


app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use(cookieSession({
  secret: 'SHHisASecret'
}));

app.use(bodyParser.urlencoded({extended: false}));

app.set('port', process.env.PORT || 3000);

app.use('/static', express.static(path.join(__dirname, 'static')));


// for email

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: 'rshekhar@seas.upenn.edu',
  from: 'rshekhar.hardyboys@gmail.com',
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

// routes

app.get('/', function (req, res) {
   console.log(req.session.username);
  if (req.session.username && req.session.username !== '') {
    res.redirect('/session');
  } else {
    res.redirect('/home');
  }
});

app.post('/home', function(req, res) {
   console.log('shit');
  username = req.body.username;
  password = req.body.password;
  User.checkIfLegit(username, password, function(err, isRight) {
    if (err) {
      res.send('Error! ' + err);
    } else {
      if (isRight) {
        req.session.username = username;
        res.redirect('session');
      } else {
        res.send('wrong password');
      }
    }
  });

});


app.get('/register', function (req, res) {
	res.render('register');
});

app.post('/register', function(req, res) {
  console.log('reached');
  sgMail.send(msg);
  User.addUser(req.body.firstname, req.body.lastname, req.body.username, req.body.password, function(err) {
    if (err) res.send('error' + err);
    else res.send('new user registered with username ' + req.body.username);
  });
});

app.get('/session', function(req, res) {
   console.log(req.session.username);
  if (!req.session.username || req.session.username === '') {
    res.send('You tried to access a protected page');
  } else {
    res.render('session');
  }
});

app.get('/chat', function (req, res) {
	res.render('chat');
});
 
app.get('/home', function (req, res) {
  res.render('home');
});

app.get('/friends', function (req, res) {
	res.render('addfriends');
});

app.get('/logout', function(req, res) {
  req.session.username = '';
  res.redirect('/home');
});



// socket.IO

io.on('connection', function (socket) {

	// -------------------------------------------- ANONYMOUS CHAT STARTS  --------------------//
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

		var chk = Object.keys(socket.rooms);
		console.log('GOD');
		console.log(chk);
		console.log(socket.rooms);
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
	// -------------------------------------------- ANONYMOUS CHAT ENDS --------------------//


});

http.listen(app.get('port'), function() { 
  console.log('listening');
});