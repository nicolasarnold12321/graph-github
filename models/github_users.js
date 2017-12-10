
var mongoose = require('mongoose');

// Define our beer schema
var userSchema   = new mongoose.Schema({
	  	login: String,
	    id: Number,
	    avatar_url: String,
	    gravatar_id: String,
	    url: String,
	    html_url: String,
	    followers_url: String,
	    subscriptions_url: String,
	    organizations_url: String,
	    repos_url: String,
	    received_events_url: String,
	    type: String,
	    score: Number
		following_url: String,
		gists_url: String,
		starred_url: String,
		subscriptions_url: String,
		organizations_url: String,
		repos_url: String,
		events_url: String,
		received_events_url: String,
		site_admin: Boolean,
		name: String,
		company: String,
		blog: String,
		location: String,
		email: String,
		hireable: String,
		bio: String,
		public_repos: Number,
		public_gists: Number,
		followers: Number,
		following: Number,
		// created_at: '2016-12-02T13:53:26Z',
		// updated_at: '2017-11-27T04:15:06Z'
});

// Export the Mongoose model
module.exports = mongoose.model('User', userSchema);