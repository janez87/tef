
var nconf = require( 'nconf' );
var config = require( '../config' );
var log = config.log.child( { component: 'POST new Job' } );

var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  var data = req.body;
  log.trace( 'New Job POSTED redirecting data to the CS' );

  CS.postJob( data, function taskPosted( err, object ) {
    if( err )
      res.status( parseInt(object.status||500,10) );

    log.debug( 'Job posted' );
    res.json( object );
  });
};