var GUID = require('guid');
module.exports = {
  all : function( req, res ){
    var me = req.param('me');
    var roomUid = req.param('roomUid');
    //  where: { name: 'foo' }, skip: 20, limit: 10, sort: 'name DESC' }
    Message.find({
      where : { roomUid : roomUid },
      sort: 'createdAt DESC'
    })
    .populateAll()
    .exec(function(err,found){
      if(err) return res.negotiate(err);
      return res.ok(found);
    });
  },
  one : function( req, res ){
    var me = req.param('me');
    var uid = req.param('uid');
    Room.findOne({
      uid : uid
    }).populate("author")
    .populate("room")
    .exec(function(err,found){
      if(err) return res.negotiate(err);
      return res.ok(found);
    });
  },
  create : function ( req, res ){
    var author = req.param('author');
    var content = req.param('content');
    var room = req.param('room');
    var roomUid = req.param('roomUid');
    var uid = GUID.create().value;
    var newMsg = {
      uid:uid,
      room:room,
      roomUid:roomUid,
      author:author,
      content:content
    };
    Message.create(newMsg)
    .then(function(message){
      Message.findOne(message.id).populateAll().then(function(message){
        return res.ok(message);
      });
    })
  },
  update : function( req, res ){
    var name = req.param('name');
    var uid = req.param('uid');
    Room.update({
      uid:uid
    },{
      name:name
    })
    .exec(function(err,updated){
      if(err) return res.negotiate(err);
      return res.ok(updated);
    });
  },
  remove : function( req, res ){
    var uid = req.param('uid');
    Room.destroy({
      uid: uid
    }).exec(function (err){
      if (err) return res.negotiate(err);
      return res.ok();
    })
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
