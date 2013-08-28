var CS = require( './CS' );
var log = require( '../config' ).log.child( { component: 'Get Answer' } );

module.exports = exports = function( req, res, next ) {
  var params = req.query;

  CS.getAnswers( {
    id: params,
    populate: [ 'performer', 'platform', 'annotations.operation' ],
    settings: req.query
  }, function answersRetrieved( err, executions ) {
    if( err ) return next( err );
    // Render the answers
    res.format( {
      html: function() {
        res.render( 'answer', {
          executions: executions
        } );
      },
      json: function() {
        res.json( executions );
      }
    } );
  });
};