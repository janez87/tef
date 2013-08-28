var url = require( 'url' );
var _ = require( 'underscore' );
var request = require( 'request' );
var config = require( '../config' );
var log = config.log.child( { component: 'CS' } );


function apiCall( method, api, params, callback ) {
  // Default value
  method = method || 'get';

  // Load the CS url
  var csUrl = url.resolve( config.csUrl, 'api/' );

  var options = {
    url: url.resolve( csUrl, api ),
    json: true,
    method: method,
    qs: params
  };

  log.debug( 'Calling %s %s with %j', options.method.toUpperCase(), options.url, options.qs );

  request( options, function( err, response, body ) {
    if( !err && response.statusCode!==200 )
      err = new Error( body.message );
    return callback( err, body );
  } );
}

// Object to export
var CS = {};



// Static methods
CS.getJobs = function getJobs( callback ) {
  log.trace( 'Requesting job list' );

  apiCall( null, 'jobs', null, callback );
};

CS.getJob = function getJob( data, callback ) {
  var id = data.id;
  var populate = data.populate;
  var select = data.select;
  var settings = data.settings;
  var params = _.extend( settings, {
    job: id,
    populate: populate,
    select: select
  } );

  log.trace( 'Requesting job' );

  apiCall( null, 'job', params, callback );
};






CS.getTask = function getTask( data, callback ) {
  var id = data.id;
  var populate = data.populate;
  var select = data.select;
  var settings = data.settings;
  var params = _.extend( settings, {
    task: id,
    populate: populate,
    select: select
  } );

  log.trace( 'Requesting task' );


  apiCall( null, 'task', params, callback );
};



CS.getAnswers = function getAnswers( data, callback ) {
  var populate = data.populate;
  var select = data.select;
  var settings = data.settings;
  var params = _.extend( settings, {
    populate: populate,
    select: select
  }, data.id );

  log.trace( 'Requesting answers' );

  apiCall( null, 'answer', params, callback );
};


CS.getMicrotask = function getMicrotask( data, callback ) {
  var id = data.id;
  var select = data.select;
  var populate = data.populate;
  var settings = data.settings;
  var params = _.extend( settings, {
    microtask: id,
    populate: populate,
    select: select
  } );

  log.trace( 'Requesting microtask' );


  apiCall( null, 'microtask', params, callback );
};


CS.getObject = function getObject( id, callback ) {
  log.trace( 'Requesting object' );

  var params = {
    object: id
  };

  apiCall( null, 'object', params, callback );
};

CS.getUser = function getUser( data, callback ) {
  var id = data.id;
  var populate = data.populate;
  var select = data.select;
  var settings = data.settings;
  var params = _.extend( settings, {
    user: id,
    populate: populate,
    select: select
  } );

  log.trace( 'Requesting user' );


  apiCall( null, 'performer', params, callback );
};


CS.getExecution = function getExecution( id, callback ) {
  log.trace( 'Requesting execution' );

  var params = {
    execution: id
  };

  apiCall( null, 'execution', params, callback );
};
CS.startExecution = function startExecution( params, callback ) {
  log.trace( 'Starting execution: %j', params );

  apiCall( null, 'run', params, callback );
};

CS.getLanding = function getLanding( params, callback ) {
  log.trace( 'Get landing: %j', params );

  apiCall( null, 'landing', params, callback );
};
CS.getEnding = function getEnding( params, callback ) {
  log.trace( 'Get ending: %j', params );

  apiCall( null, 'ending', params, callback );
};

CS.postTask = function postTask( data, callback ) {
  log.trace( 'Posting Task' );

  var options = {
    url: url.resolve( config.csUrl, 'api/task' ),
    json: data,
    method: 'POST'
  };

  request( options, function( err, response, body ) {
    if( err ) log.error( err );

    if( !err && response.statusCode!==200 )
      err = body;

    return callback( err, body );
  } );
};

CS.postAnswer = function postAnswer( execution, data, callback ) {
  log.trace( 'Posting Answer' );

  var options = {
    url: url.resolve( config.csUrl, 'api/answer' ),
    json: data,
    method: 'POST',
    qs: {
      execution: execution
    }
  };

  request( options, function( err, response, body ) {
    if( err ) log.error( err );

    if( !err && response.statusCode!==200 )
      err = body;

    return callback( err, body );
  } );
};

CS.openTask = function openTask( id, callback ) {
  log.trace( 'Opening task' );

  var params = {
    task: id
  };

  apiCall( 'post', 'opentask', params, callback );
};

CS.getConfiguration = function getConfiguration( properties, callback ) {
  if( arguments.length===1 ) callback = properties;

  log.trace( 'Configuration' );

  apiCall( null, 'configuration', properties, callback );
};


CS.deleteJob = function deleteJob( id, callback ) {
  log.trace( 'Removing Job' );

  var params = {
    job: id
  };

  apiCall( 'DELETE', 'job', params, callback );
};

CS.deleteTask = function deleteTask( id, callback ) {
  log.trace( 'Removing Task' );

  var params = {
    task: id
  };

  apiCall( 'DELETE', 'task', params, callback );
};

module.exports = exports = CS;