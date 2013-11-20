// Process stuff
var processTitle = 'Task Execution Framework';
process.title = processTitle;
//TODO: remove, debug only
Error.stackTraceLimit = Infinity;

// Load libraries
var express = require('express');
var fs = require( 'fs' );
var _ = require( 'lodash' );
var glob = require( 'glob' );
var path = require( 'path' );

var config = require( './config' );
var nconf = require( 'nconf' );
var log = config.log;

// Create express webserver
var app = express();

var interfacesPath = path.join( __dirname, nconf.get( 'interfaces:path' ) || 'interfaces' );
log( 'Interfaces path: %s', interfacesPath );

// Behind proxy
app.enable( 'trust proxy' );
app.use( app.router );

// Error handling
app.use( function( err, req, res, next ) {
  log( err );

  res.status( 500 );
  var errorData = {
    error: err,
    stack: err.stack.split( '\n' )
  };
  res.format( {
    html: function() {
      res.render( 'error', errorData );
    },
    json: function() {
      res.json( errorData );
    }
  } );
} );

// Compile and serve task.js file

app.get( '/task.js', function( req, res ) {
  res.type( '.js' );
  var taskJsFile = path.join( interfacesPath, 'task.js' );
  var taskJs = fs.readFileSync( taskJsFile, 'utf8' );
  taskJs = _.template( taskJs, { csUrl: config.csUrl } );
  res.send( taskJs );
} );




// Interfaces
var options = {
  mark: true,
  nomount: true,
  sync: true,
  cwd: interfacesPath
};
var interfaceList = glob.sync( '*', options );


// Used to send the user the files requested
function serveInterfaceFile( req, res ) {
  // Add security check
  var destFile = interfacesPath+req.path;

  // If the requested file is not inside the *interface* folder return an Error
  if( path.relative( interfacesPath, destFile )[0]==='.' ) {
    res.send( 403, 'You cannot access: '+req.path );
  } else {
    res.sendfile( destFile );
  }
}

for (var i = 0; i < interfaceList.length; i++) {
  var interfaceName = interfaceList[i];
  if( interfaceName.slice(-1)==='/' ) {
    log( 'Adding interface %s', interfaceName );

    // Execution
    app.get( '/'+interfaceName+'*', serveInterfaceFile );
  }
}

// Handle random request
app.all( '*', function randomUrlHandler( req, res ) {
  log( 'Requested "%s" by %s', req.originalUrl, req.ip );
  res.status( 404 );
  res.format( {
    html: function() {
      res.send( 'Missing resource.' );
    },
    json: function() {
      res.json( {
        id: 'MISSING_RESOURCE',
        message: 'Y U HERE????!?!?!'
      } );
    }
  } );
} );


// Handle server error
var serverError = function( error ) {
  log( error );
  if( error.code==='EADDRINUSE' )
    log( 'Address is in use, try to change the PORT parameter in the configuration' );

  if( error.code==='EACCESS' )
    log( 'The user does not have the required privileges to run the application\nTry changing the PORT parameter in the configuration file or run as a different user' );

  log( 'The server will be stopped and the process will exit' );
  setTimeout( function() {
    process.exit(1);
  }, 1000 );
};
app.on( 'error', serverError );

// START server
log( 'Starting server on port %s', config.port );
app.listen( config.port, function runningServer() {
  log( 'Server running on port %s', config.port );
} );