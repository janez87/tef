
var nconf = require( 'nconf' );
var config = require( '../config' );
var log = config.log.child( { component: 'POST new Task' } );

var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  var data = req.body;
  log.trace( 'New task POSTED redirecting data to the CS' );

  CS.postTask( data, function taskPosted( err, object ) {
    if( err )
      res.status( parseInt(object.status||500,10) );

    log.debug( 'Task posted' );
    res.json( object );
  });
};