var GUID = require('guid');
var newRoom = function(res,users_ids){
  console.log('creating room for : ',users_ids);
  if(users_ids.length){
    var uid = GUID.create().value;
    Room.create({uid:uid,users:users_ids})
        .then(function(room){
          Room.findOne(room.id).populate("users").then(function(room){
              res.ok(room);
          });
        })
  }
};

module.exports = {

  init: function(req,res){
    var vars = req.param('vars');
    var uid = GUID.create().value;
    var participants = vars.sort().join(',');
    Room.find({
      participants:participants
    })
    .populate("users")
    .exec(function(err,found){
      if(found.length){
        return res.ok(found[0])
      }else{
        Room.create({uid:uid,users:vars,participants:participants})
            .then(function(room){
              Room.findOne(room.id).populate("users").then(function(room){
                  res.ok(room);
              });
            })
      }
    });
  },
  message: function(req,res){
    var author = req.param('author');
    var uid = req.param('uid');
    var content = req.param('content');
    Message.create({uid:uid,content:content,author:author}).exec(function(err,message){
      if(err) return res.negotiate(err);
      return res.ok(message);
    });
  },
  getMessages: function(req,res){
    var uid = req.param('uid');
    Message.find({uid:uid}).exec(function(err,messages){
      if(err) return res.negotiate(err);
      return res.ok(messages);
    });
  }

};

// // Join a chat room -- this is bound to 'post /room/:roomId/users'
// join: function(req, res, next) {
//   // Get the ID of the room to join
//   var roomId = req.param('uid');
//   // Subscribe the requesting socket to the "message" context,
//   // so it'll get notified whenever Room.message() is called
//   // for this room.
//   Room.subscribe(req, roomId, ['message']);
//   // Continue processing the route, allowing the blueprint
//   // to handle adding the user instance to the room's `users`
//   // collection.
//   return next();
// },
//
// // Leave a chat room -- this is bound to 'delete /room/:roomId/users'
// leave: function(req, res, next) {
//   // Get the ID of the room to join
//   var roomId = req.param('uid');
//   // Unsubscribe the requesting socket from the "message" context
//   Room.unsubscribe(req, roomId, ['message']);
//   // Continue processing the route, allowing the blueprint
//   // to handle removing the user instance from the room's
//   // `users` collection.
//   return next();
// }
