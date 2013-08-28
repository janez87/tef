
var nconf = require( 'nconf' );
var config = require( '../config' );
var log = config.log.child( { component: 'POST Answer' } );

var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  var execution = req.query.execution;

  var data = req.body;

  log.trace( 'New Answer POSTED redirecting data to the CS' );
  log.trace( 'Data: %j', data );

  CS.postAnswer( execution, data, function taskPosted( err, object ) {
    if( err )
      res.status( parseInt( object.status||500, 10 ) );

    log.debug( 'Answer posted' );
    res.json( object );
  });
};