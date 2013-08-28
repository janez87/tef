var CS = require( './CS' );
var config = require( '../config' );

module.exports = exports = function( req, res, next ) {
  var id = req.params.id;

  CS.getJob( {
    id: id,
    populate: [ 'objects', 'tasks' ],
    select: [ 'tasks', 'objects', 'taskAssignmentStrategy', 'metadata' ],
    settings: req.query
  }, function jobRetrieved( err, job ) {
    if( err ) return next( err );

    // Render the job
    res.format( {
      html: function() {
        res.render( 'job', {
          job: job,
          csUrl: config.csUrl
        } );
      },
      json: function() {
        res.json( job );
      }
    } );
  });
};