/* jshint unused: false */
var log = require( '../config' ).log.child( { component: 'Base Routes' } );

exports.index = function(req, res){
  res.render( 'index' );
};

exports.error = function( err, req, res, next ){
  log.error( 'ERROR', err );

  res.status( 500 );
  var errorData = {
    error: err,
    stack: err.stack.split( '\n' )
  };
  res.format( {
    html: function() {
      res.render( 'error', errorData );
    },
    json: function() {
      res.json( errorData );
    }
  } );
};
