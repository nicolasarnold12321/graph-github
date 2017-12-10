var mongoose = require('mongoose');

// Define our beer schema
var repoSchema   = new mongoose.Schema({
	id: Number,
    name: String,
    full_name: String,
    owner_id: Number,
    owner_name :String,
    private: Boolean,
    html_url: String,
    description: String,
    url: String,
    teams_url: String,
    created_at: String,
    updated_at: String,
    pushed_at: String,
    language: String
 });

// // Export the Mongoose model
module.exports = mongoose.model('repo', repoSchema);