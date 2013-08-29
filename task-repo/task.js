var CS = require( './CS' );
var config = require( '../config' );

module.exports = exports = function( req, res, next ) {
  var id = req.params.id;

  CS.getTask( {
    id: id,
    populate: [ 'operations', 'platforms', 'microtasks', 'objects' ],
    /*
    select: [
      'operations',
      'platforms',
      'microtasks',
      'objects',
      'metadata',
      'implementationStrategy',
      'splittingStrategy',
      'microTaskAssignmentStrategy',
      'controlrules',
    ],
    */
    settings: req.query
  }, function taskRetrieved( err, task ) {
    if( err ) return next( err  );

    // Render the Task
    res.format( {
      html: function() {
        res.render( 'task', {
          task: task,
          csUrl: config.csUrl
        } );
      },
      json: function() {
        res.json( task );
      }
    } );
  });
};