var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sgMail = require('@sendgrid/mail');

var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');

/* mongoose schemas */

var User = require('./db/User');
var Post = require('./db/Post');
var College = require('./db/college');


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

var homepage = {text: ""};

app.get('/', function (req, res) {
   // console.log(req.session.username);
  if (req.session.username && req.session.username !== '') {
    res.redirect('/session');
  } else {
  	homepage.text = "";
    res.redirect('/home');
  }
});

app.post('/home', function(req, res) {
   // console.log('shit');
  username = req.body.username;
  password = req.body.password;
  User.checkIfLegit(username, password, function(err, isRight) {
    if (err) {
      homepage.text = "An error occured";
      res.redirect('/home');
    } else {
      if (isRight) {
        req.session.username = username;
        res.redirect('session');
      } else {
      	homepage.text = "Username or Password was wrong!";
      	res.redirect('/home');
        //res.send('wrong password');
      }
    }
  });

});

app.get('/register', function (req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
   // console.log(req.body);
  //sgMail.send(msg);
  User.addUser(req.body.firstname, req.body.lastname, req.body.username, req.body.password, function(err) {
    if (err) res.send('error' + err);
    else { 
    	//res.send('new user registered with username ' + req.body.username);
    	homepage.text = "New User Succesfully Registered! Check your email and verify your account!";
      //msg.html = '<a href = "https://www.facebook.com/"> Facebook </a>';
      //sgMail.send(msg);
    	res.redirect('/home');
    }
  });
});


// --- Account confirmation --- //


app.get('/confirmation/:id', function (req, res) {
  var id = req.params.id;

});


// --- SESSION routes start --- ///

var searchtext = '';


app.get('/session/:id', function (req, res) {
  searchtext = req.params.id;
  console.log('reached to the parameter');
  res.redirect('/session');
});


app.get('/session', function(req, res) {
   // console.log(req.session.username);
   console.log('what is this');
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
  		User.findOne({username: req.session.username}, function (err, currUser) {
  			// curruser is the current session user
  			posts.forEach(function (post) {
  			  // console.log('does it reach here');
  			  var content = post.content;
  			  var likes = post.likes.length;
  			  var id  = post.author;
  			  var name = '';
  			  var likedhtmlid = '0';
  			  var likedids = post.likes;
  			  // console.log("SESSION");
  			  // console.log(likedids);
  			  var currid = currUser._id;
  			  if(likedids.indexOf(currid) != -1) { // post has been liked
  			  	likedhtmlid = '1';
  			  }   			 
  			   // need to check if curruser has already liked the post
  			  if (post.anonymous == 'Yes')
  				name = 'Anonymous'
  			  User.find({_id: id}, function (err, users) {
  				 if (name == '')
  				   name = users[0].firstname + ' ' + users[0].lastname;
           if (post.tags.indexOf(searchtext) != -1 || searchtext === '') {
  				   var obj = {id : post._id, content: content, name: name, likes: likes, likedboolean: likedhtmlid};
  				   results.push(obj);
           }
  				 i++;
  				 if (i === n) {
               //console.log(results);
               console.log('searchtext' + searchtext);
               searchtext = '';
  			       res.render('session', {posts: results});
  				 }
  			  });
  			});
  		});
  	});
  }
});

app.post('/session', function (req, res) {
  //console.log('POSTING');
	// console.log(req.body.content);
	User.find({username: req.session.username}, function (err, users) {
      Post.addPost(users[0], req.body.content, req.body.anon, req.body.tags, function(err) {
        if (err) res.send('error' + err);
        else res.redirect('/session');
  	  });
	});
});

// ----- Like ---- //


app.get('/like/:id', function (req, res) {
  //console.log(req.params.id);
	var id = req.params.id;
	Post.findOne({_id : id}, function (err, post) {
		var n = post.likes.length;
    	User.findOne({username: req.session.username}, function (err, user) {
    		if (n == 0) {
    			post.likes.push(user);
    			post.save(function (err) {
    					  if (err) throw err;
    					  // console.log('user liked');
    		    });
    			return;
    		}
    		var curr = 0;
    		var same = 0;
    		for (var i = 0; i < n; i++) {
    			var currId = post.likes[i];
    			// console.log('printing id' + currId);
    			User.findOne({_id: currId}, function (err, newuser) {
    				if (newuser.username == req.session.username) {
    					same++;
    				}
    				curr++;
    				// console.log('dude i reached here' + ' ' + curr);
    				if (curr == n && !same) {
    					post.likes.push(user);
    					post.save(function (err) {
    					  if (err) throw err;
    					  // console.log('user liked');
    		            });
    				}
    			});
    		}
    	});	
	});
});

// ----- LIKE routes end ---- //

// ---- SESSION routes end -- //

app.get('/chat', function (req, res) {
	res.render('chat');
});
 
app.get('/home', function (req, res) {
  res.render('home', {homepage});
});

// ---- /friends routes ----//

app.get('/friends', function (req, res) {
	//var userMap = {};
	var results = [];
	User.find({}, function(err, users) {
    	users.forEach(function(user) {
      		// console.log(user.username);
      		var obj = {id : user._id, firstname : user.firstname, lastname : user.lastname};
      		results.push(obj);
      		//userMap[user._id] = user.username;
    	});
    	//// console.log(results);
    	res.render('addfriends', {results: results});
    });
	
});

app.post('/friends', function (req, res) {
	// console.log('POST FRIENDS');
	// console.log(req.session.username);
	// console.log(req.body);
	res.send('added friends');
});

// ---  friends routes end ---//

app.get('/logout', function(req, res) {
  req.session.username = '';
  homepage.text = "";
  res.redirect('/home');
});



// socket.IO

io.on('connection', function (socket) {

	// -------------------------------------------- ANONYMOUS CHAT STARTS  --------------------//
	socket.on('create', function () {
		// socket.join('room1');
		var obj = io.sockets.adapter.rooms;
		var keys = Object.keys(io.sockets.adapter.rooms); // gets all rooms
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
		if (rooms.length) {					// some room exists for a user to join
			var r = Math.floor(Math.random() * rooms.length);
			socket.join(rooms[r]);
			io.to(rooms[r]).emit('connected');
			// console.log(rooms[r]);
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
	// console.log('connected ' + socket.id);
	socket.on('message', function (message) {
		// console.log('IN MESSAGE FUNCTION');
		// console.log(message);
		var keys = Object.keys(socket.rooms);
		var room = socket.rooms[keys[1]];
		socket.broadcast.to(room.toString()).emit('chat message', message);
		socket.emit('sender', message);
	});

	// disconnecting function

	socket.on('disconnectroom', function () {
		var keys = Object.keys(socket.rooms);
		var room = socket.rooms[keys[1]];
		if (room != undefined) {
			// console.log(room.toString());
			socket.leave(room.toString());
			socket.emit('restore');
			// console.log('In disconnect room!');
		}
	});

	socket.on('disconnecting', function () {
		//// console.log(Object.keys(socket.rooms));
		var keys = Object.keys(socket.rooms);
		var room = socket.rooms[keys[1]];
		if (room != undefined) {
			io.sockets.in(room.toString()).emit('predisc');
		}
		//socket.broadcast.to(room.toString()).emit('predisc');
	});

	// -------------------------------------------- ANONYMOUS CHAT ENDS --------------------//

});

http.listen(app.get('port'), function() { 
  // console.log('listening');
});