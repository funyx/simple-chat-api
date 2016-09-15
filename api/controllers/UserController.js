var handle = function(req,user){
  var socketId = sails.sockets.getId(req);
  req.session.user = user;
  req.session.user['sockets'] = [socketId];
  User.subscribe(req, user, 'SYS_MESSAGE');
  User.watch(req);
  Room.watch(req);
  User.publishCreate(user, req);
}
var set_online = function(req,user){
  User.update({username:user.username},{is_online:true}).exec(function afterwards(err, updated){
    if (err) {
      console.log(`error updating ${u.username}->is_online`, err);
      return;
    }
    var u = Object.assign({},user);
    delete u.password;
    sails.sockets.blast('user_logged_in', {
      msg: 'User #' + u.id + ' just logged in.',
      user: u
    }, req);
    console.log(`${u.username} is now online`);
  });

}
var load_rooms = function(u){
  var uids=[];
  if(u.rooms.length){
    for(var i in u.rooms){
      if(u.rooms[i].uid) uids.push(u.rooms[i].uid);
    }
    console.log(u.username,'has rooms',uids);
  }else{
    console.log(u.username,'has no rooms');
  }

  return Room.find({uid:uids}).populate('users')
};
module.exports = {
  login : function(req, res){
    var identifier = req.param('identifier'),
        password = req.param('password'),
        WRONG_PASS = {error:true,error_msg:'Wrong Cridentials'};
    User.findOne({username:identifier})
    .populate('rooms')
    .then(function(user){
      if(!user){
        User.findOne({email:identifier})
        .populate('rooms')
          .then(function(user){
            if (user){
              if(user.password === password){
                handle(req,user);
                set_online(req,user);
                load_rooms(user)
                  .then(function(rooms){
                    var r = rooms;
                    var u = Object.assign({},user);
                    delete u.password;
                    delete u.rooms;
                    u['rooms'] = r;
                    return res.ok(u);
                  });
              }else{
                return res.ok(WRONG_PASS);
              }
            }else{
              return res.ok(WRONG_PASS);
            }
          })
          .catch(function(err){
            return res.negotiate(err);
          });
      }else{
        if(user.password === password){
          handle(req,user);
          load_rooms(user)
            .then(function(rooms){
              var r = rooms;
              var u = Object.assign({},user);
              delete u.password;
              delete u.rooms;
              u['rooms'] = r;
              return res.ok(u);
            });
        }else{
          return res.ok(WRONG_PASS);
        }
      }
    })
    .catch(function(err){
      return res.negotiate(err);
    });
  },
  autoLogin : function(req, res){
    var identifier = req.param('identifier'),
        USER = {error:true};

    User.findOne({username:identifier})
    .populate('rooms')
    .then(function(user){
        if (err)
        if(!user){
          User.findOne({email:identifier})
          .populate('rooms')
          .then(function(user){
              if (user){
                handle(req,user);
                set_online(req,user);
                res.ok(user);
              }
            })
          .catch(function(err){
            return res.negotiate(err);
          });
        }else{
          handle(req,user);
          set_online(req,user);
          res.ok(user);
        }
      })
    .catch(function(err){
      return res.negotiate(err);
    });
  },
  register : function(req, res){
    var username = req.param('username'),
        email = req.param('email'),
        public_name = req.param('public_name'),
        password = req.param('password'),
        timezone = req.param('timezone');

    User.create({
      username: username,
      public_name: public_name,
      email: email,
      password: password,
      timezone: timezone,
      avatar: '',
      is_online: true
    }).exec(function (err, newUser) {
      // If there was an error, we negotiate it.
      if (err) return res.negotiate(err);
      handle(req,newUser);
      set_online(req,newUser);
      return res.ok(newUser.toJSON());
    })
  },

  online: function(req,res){
    User.find({is_online:true})
        .exec(function(err,users){
      if(err)return res.negotiate(err);
      return res.ok(users);
    });
  },
  // Create a new user and tell the world about them.
  // This will be called every time a socket connects, so that each socket
  // represents one user--this is so that it's easy to demonstrate inter-user
  // communication by opening a bunch of tabs or windows.  In the real world,
  // you'd want multiple tabs to represent the same logged-in user.
  announce: function(req, res) {

    // Get the socket ID from the reauest
    var socketId = sails.sockets.getId(req);

    // Get the session from the request
    var session = req.session;

    // Create the session.users hash if it doesn't exist already
    session.users = session.users || {};

    User.create({
      name: 'unknown',
      socketId: socketId
    }).exec(function(err, user) {
      if (err) {
        return res.serverError(err);
      }

      // Save this user in the session, indexed by their socket ID.
      // This way we can look the user up by socket ID later.
      session.users[socketId] = user;

      // Subscribe the connected socket to custom messages regarding the user.
      // While any socket subscribed to the user will receive messages about the
      // user changing their name or being destroyed, ONLY this particular socket
      // will receive "message" events.  This allows us to send private messages
      // between users.
      User.subscribe(req, user, 'SYS_MESSAGE');
      // Get updates about users being created
      User.watch(req);
      // Get updates about rooms being created
      Room.watch(req);
      // Publish this user creation event to every socket watching the User model via User.watch()
      User.publishCreate(user, req);

      res.json(user);

    });


  }

};
