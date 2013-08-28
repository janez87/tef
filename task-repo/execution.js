var nconf = require( 'nconf' );

var CS = require( './CS' );



module.exports = exports = function( req, res, next ) {
  var id = req.params.id;
  CS.getExecution( id, function executionRetrieved( err, execution ) {

    // Render the execution
    res.format( {
      html: function() {
        res.render( 'execution', execution );
      },
      json: function() {
        res.json( execution );
      }
    } );
  });
};