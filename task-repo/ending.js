var CS = require( './CS' );
var log = require( '../config' ).log.child( { component: 'Get Ending' } );

module.exports = exports = function( req, res, next ) {
  var id = req.query.id;

  CS.getEnding( {
    id: id,
  }, function ending( err, executions ) {
    if( err ) return next( err );
    // Render the answers
    res.format( {
      html: function() {
        res.render( 'answer', {
          executions: executions
        } );
      },
      json: function() {
        res.json( executions );
      }
    } );
  });
};