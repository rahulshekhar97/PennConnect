var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/newDb');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var postSchema = Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  anonymous: String
});
 
postSchema.statics.addPost = function(user, content, anonymity, tags, cb) {
  //console.log("Post " + tags);
  var newPost = new this({ author: user, content: content, anonymous: anonymity});
  var n = tags.length;
  var curr = '';
  for (var i = 0; i < n; i++) {
  	if (tags[i] === ',') {
  		newPost.tags.push(curr);
  		console.log('tag' + curr);
  		curr = '';
  	} 
  	else {
  		curr = curr + tags[i];
  	}
  }
  newPost.tags.push(curr);
  console.log(curr);
  newPost.save(cb);
}

module.exports = mongoose.model('Post', postSchema);