var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/newDb');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var postSchema = Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  //likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

postSchema.statics.addPost = function(user, content, cb) {
  var newPost = new this({ author: user, content: content});
  newPost.save(cb);
}

module.exports = mongoose.model('Post', postSchema);