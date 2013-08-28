var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  var id = req.params.id;
  CS.deleteJob( id, function jobRemoved( err, job ) {
    if( err )
      res.status( parseInt( job.status||500, 10 ) );
    
    res.json( job );
  });
};