var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var session = require('express-session');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));



app.get('/',
function(req, res) {
  console.log('in get this is req.session --> ', req.session, '<-- in get this is req.session');
  if (checkUser(req, res)) {
    res.render('index');
  }
  else {
    res.render('login');
  }
});

app.get('/create',
function(req, res) {
  if (checkUser(req, res)) {
    res.render('index');
  }
  else {
    res.render('login');
  }
});

app.get('/signup',
function(req, res) {
  res.render('signup');
});

app.get('/links',
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;
  // console.log(uri, 'uri in app.post');
  // console.log(res.body, 'res.body in app.post');
  // console.log(util.isValidUrl(uri), 'uri is valid function result in app.post');
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }
  console.log("url is valid");
  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

app.post('/signup',
function(req, res) {
  console.log(req.body, "request body");
  new User({ username: req.body.username }).fetch().then(function(found) {
    if (found) {
      // the username already exists
      res.send(200, 'Username taken, please pick another');
    }
    else {
      // new user to add?
      var newUser = new User({
        username: req.body.username,
        password: req.body.password
      });

      newUser.save().then(function(thisUser) {
        Users.add(thisUser);
        // make sure ther's a session here, then divert to index
        makeSession();
        //res.send(303);
        res.setHeader('Location', './');
        res.redirect(303);
      });
    }
  // res.send(200);
  });
});
/************************************************************/
// Write your authentication routes here
/************************************************************/
function makeSession (){
  app.use(session({
    genid: function(req){
      return req.body.username;
    },
    secret: 'madeline gabe nyan',
    resave: false,
    saveUninitialized: false,
    cookie: {}
  }));
}
// request.session <-- the object that is in the cookie
// after they sucessfully provide password,
  // request.session.username = username provided in box
  //request.session.genid

// check request.session.username every time they do something that needs a logged-in user
var checkUser = function(req, res){
  if( !req.session ){
    return false;
  }
  return true;
};
/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
