
var nconf = require( 'nconf' );
var _ = require( 'underscore' );
var CS = require( './CS' );



module.exports = exports = function( req, res, next ) {
  var id = req.params.id;
  CS.getTask( id, [ 'microtasks', 'objects' ], function taskRetrieved( err, task ) {
    if( err ) return next( err );

    CS.getAnswers( id, function( err, annotations ) {
      if( err ) return next( err );

      var answers = _.map( annotations, function( obj ) {
        return {
          id: obj.object,
          response: obj.response
        }
      } );
      answers = _.groupBy( answers, 'id' );
      
      var data = {
        task: task,
        answers: answers
      };

      

      // Render the Task
      res.format( {
        html: function() {
          res.render( 'dash', data );
        },
        json: function() {
          res.json( data );
        }
      } );
    } );
  });
};