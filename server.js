

//my acccess keys to my app
const GITHUB_CLIENT_ID = "da1ac7f832db7c4d5efa";
const GITHUB_CLIENT_SECRET = "69ae815eb6593c68bf080f9b2f8b162d86acc14c";



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

var GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "https://agile-brushlands-46898.herokuapp.com/auth/github/callback"
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
  request({
    url:'https://api.github.com/repos/'+owner+'/'+repo+'/commits',
    headers: { 'User-Agent': 'request'}
  }, function(error,response,body){
    var d=createJSONDATAInteractive(JSON.parse(body),owner);
    res.send(d);
  });
});

app.get('/graph.json', function(req,res){
  var name=req.query.name;
  request({
    url: 'https://api.github.com/orgs/'+name+'/public_members',
    headers: { 'User-Agent': 'request',
                'name' : name
             }
  }, function(error,response,body){
    var d;
    if(req.query.type==0)
      d=createJSONDATAInteractive(JSON.parse(body),req.query.name);
    else 
      d=createJSONDATA(JSON.parse(body),req.query.name);
    res.send(d);
  });
});

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    var token=req.user.accessToken
    res.cookie('token', token, {maxAge:900000})
    res.redirect('/');
  }
);

app.get('/login', function(req, res) {
  res.render('login.ejs',{a:7});
});


app.get('/', function(req, res) {
   var token = req.cookies['token'];

  if (!token) {
    return res.redirect('/login');
  }
    res.redirect('index.html');
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

//  function createJSONDATAInteractive(data,name){
//   let keys_to_display = new Array("login","id","avatar_url",
//                           "url","html_url","followers_url","following_url",
//                           "gists_url","starred_url","subscriptions_url","organizations_url",
//                           "repos_url","events_url","received_events_url" );
//   var d3_elements=new Array();
//   var keys= new Array();

//   for(var i=0; i<keys_to_display.length;i++){
//     var childrens= getChildren(keys_to_display[i],data);
//     var key={name:keys_to_display[i].toString().replace((/[\.{}]/g), "*"), children :childrens};
//     keys.push(key);
//   }
//   var name= {name:name, children:keys};
//   d3_elements.push(name);
//   return name;
// }

//   function getChildren(key,data){
//       var children= new Array();
//     for(var j=0;j<data.length;j++){
//       var tmp={name :data[j][key], size:(j*18+j)}
//       children.push(tmp);
//     }
//     return children;
//   }


function createJSONDATAInteractive(data,name){
  var d3_elements;
  var children=new Array();
    for(var i=0; i<data.length;i++){ 
     children.push({name:"commits #"+(i+1),children:getChildren(data[0],Object.keys(data))});
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