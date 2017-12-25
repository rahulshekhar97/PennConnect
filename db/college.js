var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/newDb');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var collegeSchema = Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  collegeName: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'post' }],
});

collegeSchema.statics.addUser = function(name, cb) {
  var newCollege = new this({collegeName: name});
  newCollege.save(cb);
}

module.exports = mongoose.model('College', collegeSchema);