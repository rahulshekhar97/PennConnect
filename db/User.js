var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/newDb');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

userSchema.statics.addUser = function(firstname, lastname, username, password, cb) {
  var newUser = new this({ firstname: firstname, lastname: lastname, username: username, password: password});
  newUser.save(cb);
}

userSchema.statics.checkIfLegit = function(username, password, cb) {
  this.findOne({ username: username }, function(err, user) {
    if (!user) cb('no user');
    else {
      bcrypt.compare(password, user.password, function(err, isRight) {
        if (err) return cb(err);
        cb(null, isRight);
      });
    };
  });
}

module.exports = mongoose.model('User', userSchema);
