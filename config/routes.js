/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // '/': {
  //   view: 'homepage'
  // },
  // 'get /auth/identifier/:identifier': 'UserController.identifier',
  'post /auth/login': 'UserController.login',
  'post /auth/autoLogin': 'UserController.autoLogin',
  'post /auth/register': 'UserController.register',
  'post /users/online': 'UserController.online',
  'get /sync'           : 'UserController.sync',
  // 'post /room/init': 'RoomController.init',
  // 'post /room/message': 'RoomController.message',
  // 'post /room/messages': 'RoomController.getMessages',
  // 'post /room/:roomId/users': 'RoomController.join',
  // 'delete /room/:roomId/users': 'RoomController.leave'
  'get /rooms'          : 'RoomController.all',
  'get /rooms/:uid'     : 'RoomController.one',
  'post /rooms'         : 'RoomController.create',
  'put /rooms/:uid'     : 'RoomController.update',
  'delete /rooms/:uid'  : 'RoomController.remove',

  'get /rooms/:roomUid/messages'                : 'MessageController.all',
  'get /rooms/:roomUid/messages/:uid'           : 'MessageController.one',
  'post /rooms/:roomUid/messages'               : 'MessageController.create',
  'put /rooms/:roomUid/messages/:uid'           : 'MessageController.update',
  'delete /rooms/:roomUid/messages/:uid'        : 'MessageController.remove'
  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
