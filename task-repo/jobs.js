var nconf = require( 'nconf' );

var CS = require( './CS' );



module.exports = exports = function( req, res, next ) {

  CS.getJobs( function jobsRetrieved( err, jobs ) {

    // Render the jobs
    res.render( 'jobs', {
      jobs: jobs
    } );
  });
};