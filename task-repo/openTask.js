
var config = require( '../config' );
var log = config.log.child( { component: 'Open Task' } );

var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  var task = req.params.id;

  CS.openTask( task, function( err, result ) {
    log.trace( 'Run of Task worked, result is %j', result );
    if( err ) return next( err );

    res.redirect( config.baseUrl+'task/'+task );
  } );
};