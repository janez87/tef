var _ = require( 'underscore' );
var url = require( 'url' );
var querystring = require( 'querystring' );
var config = require( '../config' );
var CS = require( './CS' );

module.exports = exports = function( req, res, next ) {
  CS.startExecution( req.query, function executionRetrieved( err, data ) {
    if( err && data.id==='UNAUTHORIZED' ) {
      var loginUrl = url.resolve( config.csUrl, 'login' );
      req.query.continueTo = data.requestedUrl;
      return res.redirect( loginUrl+'?'+querystring.stringify( req.query ) );
    }

    var noMore = [
      'NO_AVAILABLE_MICROTASKS',
      'NO_AVAILABLE_TASKS',
      'CLOSED_MICROTASK',
      'CLOSED_TASK',
      'CLOSED_JOB',
      'NO_TASK_SELECTED',
      'NO_MICROTASK_SELECTED'
    ];
    var handleError = _.contains( noMore, data.id );
    if( err && !handleError ) return next( err );

    if( err && handleError ) {
      var endingUrl = url.resolve( config.csUrl, 'api/ending' );
      return res.redirect( endingUrl+'?'+querystring.stringify( req.query ) );
    }

    return res.redirect( data.url );
  });
};