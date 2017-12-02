var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sgMail = require('@sendgrid/mail');

var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var User = require('./db/User');
var Post = require('./db/Post');


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
var msg = {
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
   console.log(req.body);
  //sgMail.send(msg);
  User.addUser(req.body.firstname, req.body.lastname, req.body.username, req.body.password, function(err) {
    if (err) res.send('error' + err);
    else res.send('new user registered with username ' + req.body.username);
  });
});

// --- SESSION routes start --- ///

app.get('/session', function(req, res) {
   console.log(req.session.username);
  if (!req.session.username || req.session.username === '') {
    res.send('You tried to access a protected page');
  } else {
  	var results = [];
  	Post.find({}, function (err, posts) {
  		var i = 0; 
  		var n = posts.length;
  		if (n == 0) {
  			res.render('session', {posts: results});
  		}
  		posts.forEach(function (post){
  			console.log('does it reach here');
  			var content = post.content;
  			var id  = post.author;
  			var name = '';
  			User.find({_id: id}, function (err, users) {
  				name = users[0].firstname + ' ' + users[0].lastname;
  				var obj = {content: content, name: name};
  				results.push(obj);
  				i++;
  				if (i == n) {
  					res.render('session', {posts: results});
  				}
  			});
  		});
  	});
  }
});

app.post('/session', function (req, res) {
	console.log('POSTING');
	console.log(req.body.content);
	User.find({username: req.session.username}, function (err, users) {
      Post.addPost(users[0], req.body.content, function(err) {
        if (err) res.send('error' + err);
        else res.redirect('/session');
  	  });
	});
});

// ----- Like ---- //


app.get('/like', function (req, res) {
	console.log('liked button on console');
});

// ---- SESSION routes end -- //

app.get('/chat', function (req, res) {
	res.render('chat');
});
 
app.get('/home', function (req, res) {
  res.render('home');
});

// ---- /friends routes ----//

app.get('/friends', function (req, res) {
	//var userMap = {};
	var results = [];
	User.find({}, function(err, users) {
    	users.forEach(function(user) {
      		console.log(user.username);
      		var obj = {id : user._id, firstname : user.firstname, lastname : user.lastname};
      		results.push(obj);
      		//userMap[user._id] = user.username;
    	});
    	//console.log(results);
    	res.render('addfriends', {results: results});
    });
	
});

app.post('/friends', function (req, res) {
	console.log('POST FRIENDS');
	console.log(req.session.username);
	console.log(req.body);
	res.send('added friends');
});

// --- //

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