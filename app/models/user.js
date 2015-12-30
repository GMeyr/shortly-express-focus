var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,
  // defaults: {
    // visits: 0
  // },
  // clicks: function() {
  //   return this.hasMany(Click);
  // },

  // the promise verion, calling it with then, might have worked if we promisified this compare
  // Ben says it's odd to mix callbacks and promises
  // Ben says that if we can get at an attribute directly in the user object, we should
  // ie, replace hashedPassword below with a var on line 20
  checkPassword: function(password, callback){
    var hashedPassword = this.get('password');
    bcrypt.compare(password, hashedPassword, function(err, res){
      console.log(res, 'in checkPassword');
      callback(res);
      // if (res){
      //   //login
      //   res.render('index');
    });
  },

  initialize: function(){
    var encodedFn = Promise.promisify(bcrypt.hash);
    this.on('creating', function(model, attrs, options){
      return encodedFn(model.get('password'), null, null).then(function(hash){
          model.set('password', hash);
          console.log(hash, "<-- this is the hash");
        });
      // var hashedPW = bcrypt.hash(model.get('password'), null, null, function(err, hash) {
      //   // Store hash in your password DB.
      //   if (err) {
      //     console.log(err);
      //     return;
      //   }
      //   model.set('password', hash);
      // });
    });
  }
});

module.exports = User;