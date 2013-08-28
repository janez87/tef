var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  var id = req.params.id;
  CS.getObject( id, function objectRetrieved( err, objects ) {

    // Render the object
    res.format( {
      html: function() {
        res.render( 'object', { object: objects[0] } );
      },
      json: function() {
        res.json( objects[0] );
      }
    } );
  });
};