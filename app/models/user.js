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
    this.on('creating', function(model, attrs, options){
      var hashedPW = bcrypt.hash(model.get('password'), null, null, function(err, hash) {
        // Store hash in your password DB.
        if (err) {
          console.log(err);
          return;
        }
        model.set('password', hash);
      });
    });
  }
});

module.exports = User;