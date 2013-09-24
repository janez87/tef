
var config = require( '../config' );
var log = config.log.child( { component: 'Get new Job' } );
var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  log.trace( 'Getting UI for Job creation' );
  CS.getConfiguration( function( err, configuration ) {
    if( err ) return next( err );

    res.render( 'job/newJob' , configuration );
  } );

};