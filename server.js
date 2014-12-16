/* 
  Module dependencies:
  
  - Express
  - Http (to run Express)
  - Body parser (to parse JSON requests)
  
  It is a common practice to name the variables after the module name.
  Ex: http is the "http" module, express is the "express" module, etc.
*/
var express = require("express")
  , app = express()
  , http = require("http").createServer(app)
  , bodyParser = require("body-parser")
  , io = require("socket.io").listen(http)
  , _ = require("underscore");

/*DB Config*/
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/socket_table');

/* Server config */

//Server's IP address
app.set("ipaddr", process.env.HOST || '127.0.0.1');

//Server's port number 
app.set("port", process.env.PORT || 3000);

//Specify the views folder
app.set("views", __dirname + "/views");

//View engine is Jade
app.set("view engine", "jade");

//Specify where the static content is
app.use(express.static("public", __dirname + "/public"));

//Tells server to support JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*DB routing */
app.use(function(request,response,next){
    request.db = db;
    next();
});

/* Counter for DB insertion */
var i = 1;

/* Server routing */

//Handle route "GET /", as in "http://localhost:8080/"
app.get("/", function(request, response) {
  var db = request.db;
  var collection = db.get('users');
  collection.find({},{}, function(e,docs){
    response.render("index", {"userlist": docs});
  });  

});

app.get("/sample", function(request, response){
  response.render("sample");
});

app.get("/insert", function(request, response){
  response.render("insert");
});



app.post('/adduser', function(req, res){
  var db = req.db;
  var name = req.param('username');
  console.log(name);
  var age = req.param('userage');
  console.log(age);
  var collection = db.get('users');

  collection.insert({
    "name": name,
    "id": i
  }, function(err, doc){
    i = i + 1
    if(err){
      res.send("There was a problem inserting into the database");
    }
    else{
      res.location('insert');
      res.redirect('insert')
    }
  });

});

//Start the http server at port and IP defined before
http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});

io.sockets.on('connection', function (socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});