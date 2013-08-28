var nconf = require( 'nconf' );
var _ = require( 'underscore' );

var log = require( '../config' ).log.child( { component: 'CS Configutation' } );

module.exports = exports = function( req, res, next ) {
  
  var properties = req.query;
  log.trace( 'Properties %j', req.query );

  CS.getConfiguration( function configurationRetrieved( err, configuration ) {
    // Render the configuration
    res.json( configuration );
  });
};