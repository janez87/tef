var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  var id = req.params.id;
  CS.deleteTask( id, function taskRemoved( err, task ) {
    if( err )
      res.status( parseInt( task.status||500, 10 ) );

    res.json( task );
  });
};