/**
 * WebSocket Server Settings
 * (sails.config.sockets)
 *
 * These settings provide transparent access to the options for Sails'
 * encapsulated WebSocket server, as well as some additional Sails-specific
 * configuration layered on top.
 *
 * For more information on sockets configuration, including advanced config options, see:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.sockets.html
 */


var ObjectID = require('mongodb').ObjectID;

module.exports.sockets = {


  /***************************************************************************
  *                                                                          *
  * Node.js (and consequently Sails.js) apps scale horizontally. It's a      *
  * powerful, efficient approach, but it involves a tiny bit of planning. At *
  * scale, you'll want to be able to copy your app onto multiple Sails.js    *
  * servers and throw them behind a load balancer.                           *
  *                                                                          *
  * One of the big challenges of scaling an application is that these sorts  *
  * of clustered deployments cannot share memory, since they are on          *
  * physically different machines. On top of that, there is no guarantee     *
  * that a user will "stick" with the same server between requests (whether  *
  * HTTP or sockets), since the load balancer will route each request to the *
  * Sails server with the most available resources. However that means that  *
  * all room/pubsub/socket processing and shared memory has to be offloaded  *
  * to a shared, remote messaging queue (usually Redis)                      *
  *                                                                          *
  * Luckily, Socket.io (and consequently Sails.js) apps support Redis for    *
  * sockets by default. To enable a remote redis pubsub server, uncomment    *
  * the config below.                                                        *
  *                                                                          *
  * Worth mentioning is that, if `adapter` config is `redis`, but host/port  *
  * is left unset, Sails will try to connect to redis running on localhost   *
  * via port 6379                                                            *
  *                                                                          *
  ***************************************************************************/
  adapter: 'memory',

  //
  // -OR-
  //

  // adapter: 'socket.io-redis',
  // host: '127.0.0.1',
  // port: 6379,
  // db: 0,
  // pass: '<redis auth password>',



 /***************************************************************************
  *                                                                          *
  * Whether to expose a 'get /__getcookie' route with CORS support that sets *
  * a cookie (this is used by the sails.io.js socket client to get access to *
  * a 3rd party cookie and to enable sessions).                              *
  *                                                                          *
  * Warning: Currently in this scenario, CORS settings apply to interpreted  *
  * requests sent via a socket.io connection that used this cookie to        *
  * connect, even for non-browser clients! (e.g. iOS apps, toasters, node.js *
  * unit tests)                                                              *
  *                                                                          *
  ***************************************************************************/

  grant3rdPartyCookie: true,



  /***************************************************************************
  *                                                                          *
  * `beforeConnect`                                                          *
  *                                                                          *
  * This custom beforeConnect function will be run each time BEFORE a new    *
  * socket is allowed to connect, when the initial socket.io handshake is    *
  * performed with the server.                                               *
  *                                                                          *
  * By default, when a socket tries to connect, Sails allows it, every time. *
  * (much in the same way any HTTP request is allowed to reach your routes.  *
  * If no valid cookie was sent, a temporary session will be created for the *
  * connecting socket.                                                       *
  *                                                                          *
  * If the cookie sent as part of the connection request doesn't match any   *
  * known user session, a new user session is created for it.                *
  *                                                                          *
  * In most cases, the user would already have a cookie since they loaded    *
  * the socket.io client and the initial HTML page you're building.         *
  *                                                                          *
  * However, in the case of cross-domain requests, it is possible to receive *
  * a connection upgrade request WITHOUT A COOKIE (for certain transports)   *
  * In this case, there is no way to keep track of the requesting user       *
  * between requests, since there is no identifying information to link      *
  * him/her with a session. The sails.io.js client solves this by connecting *
  * to a CORS/jsonp endpoint first to get a 3rd party cookie(fortunately this*
  * works, even in Safari), then opening the connection.                     *
  *                                                                          *
  * You can also pass along a ?cookie query parameter to the upgrade url,    *
  * which Sails will use in the absence of a proper cookie e.g. (when        *
  * connecting from the client):                                             *
  * io.sails.connect('http://localhost:1337?cookie=smokeybear')              *
  *                                                                          *
  * Finally note that the user's cookie is NOT (and will never be) accessible*
  * from client-side javascript. Using HTTP-only cookies is crucial for your *
  * app's security.                                                          *
  *                                                                          *
  ***************************************************************************/
  // beforeConnect: function(handshake, cb) {
  //   try {
  //     console.log(sails.sockets.getId(handshake));
  //     var sessionId = sails.session.parseSessionIdFromCookie(handshake.headers.cookie);
  //     sails.session.get(sessionId,function(err,session){
  //       if(session.user && session.user.id){
  //         var cookies = handshake;
  //         // console.log(`${session.user.username} is online socket : `,cookies);
  //       }else{
  //         console.log(`Anonymous user is online`);
  //       }
  //     });
  //     return cb(null, true);
  //   } catch (e) {
  //     return cb(null, true);
  //   }
  // },


  /***************************************************************************
  *                                                                          *
  * `afterDisconnect`                                                        *
  *                                                                          *
  * This custom afterDisconnect function will be run each time a socket      *
  * disconnects                                                              *
  *                                                                          *
  ***************************************************************************/
  // This custom onDisconnect function will be run each time a socket disconnects
  afterDisconnect: function(session, socket, cb) {
    try {
      var THE_SOCKET = sails.sockets.getId(socket);
      // if we have a set user object stored in the session
      if(session.user){
        // if we have the socket id stored in the session
        if(session.user.sockets.indexOf(THE_SOCKET)!=-1){
          // first remove it from session.user.sockets
          var newSocks = new Array;
          for(var i in session.user.sockets){
            // console.log(i,session.user.sockets[i]!=THE_SOCKET);
            if(session.user.sockets[i]!=THE_SOCKET) newSocks.push(session.user.sockets[i]);
          }
          session.user.sockets = newSocks;
          // then count if we have no open sockets left BUT a session.user.id set
          if(session.user.sockets.length===0 && session.user.id){
            // if not update the user status
            // var where = { id: new ObjectID(session.user.id) };
            User.native(function (err, collection) {
              collection.update(
                { _id : new ObjectID(session.user.id) },
                { $set :
                  { is_online : false,
                    last_seen : new Date().toISOString()
                  }
                }
              ).then(function(result){
                console.log(`${session.user.username} is offline socket : ${THE_SOCKET}`);
                var user_copy = Object.assign({},session.user);
                // add the session id
                user_copy['session_id'] = sails.session.parseSessionIdFromCookie(socket.handshake.headers.cookie);
                delete user_copy.messages;
                delete user_copy.rooms;
                delete user_copy.sockets;
                // emit user offline
                sails.sockets.blast('user_offline', {
                  msg: 'User #' + user_copy.id + ' went offline.',
                  user: user_copy
                });
                return cb();
              },function(e){
                console.log(e);
              });
            });
          }
        }
      }
      return cb();
    } catch (e) {
      console.log(e);
      return cb();
    }
  }

  /***************************************************************************
  *                                                                          *
  * `transports`                                                             *
  *                                                                          *
  * A array of allowed transport methods which the clients will try to use.  *
  * On server environments that don't support sticky sessions, the "polling" *
  * transport should be disabled.                                            *
  *                                                                          *
  ***************************************************************************/
  // transports: ["polling", "websocket"]

};
