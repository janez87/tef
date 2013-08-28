var CS = require( './CS' );
var config = require( '../config' );

module.exports = exports = function( req, res, next ) {
  var id = req.params.id;

  CS.getUser( {
    id: id,
    settings: req.query
  }, function userRetrieved( err, user ) {
    if( err ) return next( err );
    // Render the Task
    res.format( {
      html: function() {
        res.render( 'user', {
          user: user,
          csUrl: config.csUrl
        } );
      },
      json: function() {
        res.json( user );
      }
    } );
  });
};