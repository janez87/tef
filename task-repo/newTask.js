
var config = require( '../config' );
var log = config.log.child( { component: 'Get new Task' } );
var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  log.trace( 'Getting UI for Task creation' );
  CS.getConfiguration( function( err, configuration ) {
    if( err ) return next( err );

    log.trace( 'Config:', configuration );
    res.render( 'task/newTask' , configuration );
  } );

};