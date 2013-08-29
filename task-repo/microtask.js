var CS = require( './CS' );
var config = require( '../config' );


module.exports = exports = function( req, res ) {
  var id = req.params.id;

  CS.getMicrotask( {
    id: id,
    populate: [ 'objects', 'operations', 'platforms' ],
    //select: [ 'metadata' ],
    settings: req.query
  }, function microtaskRetrieved( err, microtask ) {

    // Render the microtask
    res.format( {
      html: function() {
        res.render( 'microtask', {
          microtask: microtask,
          csUrl: config.csUrl
        } );
      },
      json: function() {
        res.json( microtask );
      }
    } );
  });
};