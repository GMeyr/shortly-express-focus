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