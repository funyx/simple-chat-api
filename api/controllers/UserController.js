module.exports = {


  login : function(req, res){
    var identifier = req.param('identifier'),
        password = req.param('password');
    var USER = {error:true,error_msg:'Wrong Cridentials'};
    User.findOne({username:identifier})
    .populate('rooms')
    .exec(function(err, user){
      if (err) return res.negotiate(err);
      if(!user){
        User.findOne({email:identifier})
        .populate('rooms')
        .exec(function(err, user){
          if (err) return res.negotiate(err);
          if (user){
            USER = user.toJSON();
            USER['error'] = false;
          }
        })
      }else{
        USER = user.toJSON();
        USER['error'] = false;
      }
    });
    // check password
    if(USER.password === password){
      return res.ok(USER);
    }else{
      USER['error'] = true;
      USER['error_msg'] = 'Wrong Password';
      return res.ok(USER);
    }
  },
  autoLogin : function(req, res){
    var identifier = req.param('identifier');
    var USER = {error:true};
    User.findOne({username:identifier})
    .populate('rooms')
    .exec(function(err, user){
      if (err) return res.negotiate(err);
      if(!user){
        User.findOne({email:identifier})
        .populate('rooms')
        .exec(function(err, user){
          if (err) return res.negotiate(err);
          if (user){
            USER = user.toJSON();
            USER.error = false;
          }
        })
      }else{
        USER = user.toJSON();
        USER.error = false;
      }
    });
    res.ok(USER);
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
      return res.ok(newUser.toJSON());
    })
  },
  // Create a new user and tell the world about them.
  // This will be called every time a socket connects, so that each socket
  // represents one user--this is so that it's easy to demonstrate inter-user
  // communication by opening a bunch of tabs or windows.  In the real world,
  // you'd want multiple tabs to represent the same logged-in user.
  announce: function(req, res) {

    // Get the socket ID from the reauest
    var socketId = sails.sockets.id(req);

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
      User.subscribe(req, user, 'message');

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
