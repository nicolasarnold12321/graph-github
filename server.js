

//my acccess keys to my app
const GITHUB_CLIENT_ID = "yourgithubclientid";
const GITHUB_CLIENT_SECRET = "yourgithubclientsecret";



//the specified credentails for this said server
var express = require("express"),
    passport = require("passport"),
    request = require("request"),
    cookieParser = require("cookie-parser"),
    bodyParser = require('body-parser'),
    app = express(),
    // mongoose = require('mongoose'),
    port = 3000,
    portDB=27017,
    user=require("./models/github_users"),
    repo=require("./models/github_repo");

    // mongoose.connect('mongodb://localhost:'+portDB+"/github_app");

app.set('view engine', 'ejs');

//params that the server may take
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function (req, res, next){
  if (req.headers['x-forwarded-proto'] === 'https') {
    res.redirect('http://' + req.hostname + req.url);
  } else {
    next();
  }
});

var GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://github-graph-api.herokuapp.com/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    cb(null, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      profile: profile
    });  
  }
));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

app.get('/auth/github', passport.authenticate('github'));


app.get('/graph.json.repo', function(req,res){
  var repo=req.query.repo;
  var owner=req.query.owner;
  var token = req.cookies['token'];
  request({
    url:'https://api.github.com/repos/'+owner+'/'+repo+'/commits',
    headers: { 'User-Agent': 'request'
                // 'Authorization': 'token '+ token
              }
  }, function(err,response,body){
    if(!err&&response.statusCode == 200){
    var d=createJSONDATAInteractive(JSON.parse(body),owner);
    res.send(d);
  }
  else{
    res.status(400);
    res.send(body);
  }
  });
});

app.get('/graph.json', function(req,res){
  var name=req.query.name;
  var token = req.cookies['token'];
  request({
    url: 'https://api.github.com/orgs/'+name+'/public_members',
    headers: { 'User-Agent': 'request',
                'name' : name
                // 'Authorization': 'token '+ token
             }
  }, function(err,response,body){
    var d;
    if(!err&&response.statusCode == 200){
    if(req.query.type==0)
      d=createJSONDATAInteractive(JSON.parse(body),req.query.name);
    else 
      d=createJSONDATA(JSON.parse(body),req.query.name);
    res.send(d);
  }
  else{
    res.status(req.statusCode);
    res.send(body);
  }
  });
});
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    var token=req.user.accessToken
    var username=req.user.profile.username
    var url=req.user.profile.profileUrl
    var avatar=req.user.profile._json.avatar_url
    res.cookie('token', token, {maxAge:900000})
    res.cookie('username', username, {maxAge:900000})
    res.cookie('avatar_url', avatar, {maxAge:900000})
    res.cookie('profileUrl', url, {maxAge:900000})
    res.redirect('/');
  }
);
app.get('/logout', function(req, res) {
  res.clearCookie("token");
  res.render('login.ejs',{a:7});
});

app.get('/login', function(req, res) {
  res.render('login.ejs',{a:7});
});

app.get('/index', function(req, res) {
var token = req.cookies['token'];
  if (!token) {
    return res.redirect('/login');
  }
    res.render('index');
});

app.get('/', function(req, res) {
   var token = req.cookies['token'];

  if (!token) {
    return res.redirect('/login');
  }
    res.render('index.ejs',{pic :req.cookies['avatar_url'],
                            username :req.cookies['username'],
                            url :req.cookies['profileUrl']
                            });
  });

app.use(express.static('public'));

//creates the server specified

var server = app.listen(process.env.PORT||port, function() {
  console.log('Listening on port %d', server.address().port);
});


function generateData(listkeys,body,jsondata){
  
    var count=0;
    var keys = ["login","id","type"];
    for(var i =0;i<body.length;i++){
        var tmp=body[i];
        for(var j=0;j<keys.length;j++){      
            var x=keys[j];
            var y=tmp[x];
            if(!keys[j].includes('url')||!keys[j].includes('URL')){
            var valuetoput={}
            valuetoput.id=listkeys[j]+"."+y;
            valuetoput.value=count++;
           jsondata.push(valuetoput);
        }
        else{console.log("yes;");}
    }
    }
    return jsondata;
}
function createJSONDATA(data,name){
  let keys_to_display = Object.keys(data[0]);
  let d3_elements = ([
      {id: name, value: ""}
  ]).concat(
      keys_to_display.map(k => ({id: name+"." + k, value: ""}))
  ).concat(
      data.reduce(function(d3list, gh_user, user_index) {
          keys_to_display.forEach(function(key, key_index) {
              d3list.push({
                  id: name+"." + key + "." + gh_user[key].toString().replace(/\./g, "*"),
                  value: (user_index*keys_to_display.length) + key_index
              })
          });
          return d3list;
      },[])
  )
  return d3_elements;
}

function createJSONDATAInteractive(data,name){
  var d3_elements;
  var children=new Array();
    for(var i=0; i<data.length;i++){ 
     children.push({name:"commits #"+(i+1),children:getChildren(data[i],Object.keys(data))});
    }
   d3_elements={name:name, children:children};
   return d3_elements;
}

  function getChildren(data,key){
       if(data==null||Object.keys(data)[0]==null||Object.keys(data)[0]==0){
        return new Array({name:data});
      }
     var newkeys=Object.keys(data);
     var children=new Array();
      for(var i=0;i<newkeys.length;i++){
        children.push({name:newkeys[i], children: getChildren(data[newkeys[i]],newkeys[i])});
      }
      return children;
}