// Process stuff
var processTitle = 'Task Execution Framework';
process.title = processTitle;
//TODO: remove, debug only
Error.stackTraceLimit = Infinity;

// Load libraries
var express = require('express');
var routes = require('./routes');
var _ = require( 'underscore' );
var glob = require( 'glob' );
var path = require( 'path' );
var moment = require( 'moment' );

var Showdown = require('showdown');
var converter = new Showdown.converter();

var config = require( './config' );
var nconf = require( 'nconf' );
var log = config.log;

// Domains
var domain = require( 'domain' );


// Create express webserver
var app = express();

var interfacesPath = path.join( __dirname, nconf.get( 'interfaces:path' ) || 'interfaces' );
log.trace( 'Interfaces path: %s', interfacesPath );

app.configure( function() {
  //app.set('port', process.env.PORT || 3000);

  var publicPath = path.join(__dirname, 'public');
  var viewsPath = path.join(__dirname, 'views');


  // Behind proxy
  app.enable( 'trust proxy' );

  // View settings
  app.set('views', viewsPath);
  app.set('view engine', 'jade');

  // Locals
  app.locals( {
    title: processTitle,
    baseUrl: config.baseUrl,
    moment: moment,
    md: converter.makeHtml,
    _: _
  } );

  //app.use(express.favicon( __dirname + '/public/images/favicon.ico') ));
  app.use(express.favicon());

  // Create a Domain to handle the errors properly
  app.use( function( req, res, next ) {
    var d = domain.create();

    d.on( 'error', function( err ) {
      return next( err );
    } );

    d.run( next );
  } );

  // Log requests
  //app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // Session support
  /*
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  */

  // Complie on the fly coffeescripts and stylus

  /* global js, css */
  app.use( require('connect-assets')( {
    src: 'public',
    buildDir: 'public/compiledAssets',
    servePath: config.baseUrl.slice( 0, -1 )
  } ) );
  js.root = 'coffeescripts';
  css.root = 'stylesheets';

  app.use( express.static( publicPath ) );


  app.use(app.router);

  // Error handling
  app.use( routes.error );
});


if( !process.env.PRODUCTION )
  app.get( '/', routes.index );

// Endpoints

// Configuration endpoints
app.get( '/configuration', require( './task-repo/configuration' ) );

// Job
app.get( '/job/new', require( './task-repo/newJob' ) );
if( !process.env.PRODUCTION )
  app.post( '/job/new', require( './task-repo/postJob' ) );
if( !process.env.PRODUCTION )
  app.get( '/jobs', require( './task-repo/jobs' ) );

app.get( '/job/:id', require( './task-repo/job' ) );
if( !process.env.PRODUCTION )
  app.del( '/job/:id', require( './task-repo/deleteJob' ) );

// Task
app.get( '/task/new', require( './task-repo/newTask' ) );
if( !process.env.PRODUCTION )
  app.post( '/task/new', require( './task-repo/postTask' ) );
app.get( '/task/:id', require( './task-repo/task' ) );
app.get( '/task/:id/open', require( './task-repo/openTask' ) );
if( !process.env.PRODUCTION )
  app.del( '/task/:id', require( './task-repo/deleteTask' ) );

// Mirotask
app.get( '/microtask/:id', require( './task-repo/microtask' ) );

// Object
app.get( '/object/:id', require( './task-repo/object' ) );

// Object
app.get( '/user/:id', require( './task-repo/user' ) );

// Execution
app.get( '/execution/:id', require( './task-repo/execution' ) );
app.get( '/run', require( './task-repo/run' ) );

// Answer
app.get( '/answer', require( './task-repo/answer' ) );
app.post( '/answer', require( './task-repo/postAnswer' ) );

// Ending
app.get( '/ending', require( './task-repo/ending' ) );

// Run
app.get( '/task.js', function( req, res ) {
  res.type( '.js' );
  res.sendfile( path.join( interfacesPath, 'task.js' ) );
} );




// Execution
var options = {
  mark: true,
  nomount: true,
  sync: true,
  cwd: interfacesPath
};
var interfaceList = glob.sync( '*', options );

_.each( interfaceList, function( interfaceName ) {
  // Only directories
  if( interfaceName.slice(-1)==='/' ) {
    log.trace( 'Adding interface %s', interfaceName );

    // Execution
    app.get( '/'+interfaceName+'*', function( req, res ) {
      log.trace( 'Got %s', req.path );

      // Add security check
      var destFile = interfacesPath+req.path;

      // If the requested file is not inside the *interface* folder return an ERROR
      if( path.relative( interfacesPath, destFile )[0]==='.' ) {
        res.send( 403, 'You cannot access: '+req.path );
      } else {
        res.sendfile( destFile );
      }
    } );
  }
} );

// Handle random request
app.all('*', function randomUrlHandler( req, res ) {
  log.trace( 'Requested "%s" by %s', req.originalUrl, req.ip );
  res.status( 404 );
  res.format( {
    html: function() {
      res.render( 'YUHERE' );
    },
    json: function() {
      res.json( {
        id: 'MISSING_RESOURCE',
        message: 'Y U HERE????!?!?!'
      } );
    }
  } );
});



// Handle server error
var serverError = function( error ) {
  log.error( error );
  if( error.code==='EADDRINUSE' )
    log.error( 'Address is in use, try to change the PORT parameter in the configuration' );

  if( error.code==='EACCESS' )
    log.error( 'The user does not have the required privileges to run the application\nTry changing the PORT parameter in the configuration file or run as a different user' );

  log.error( 'The server will be stopped and the process will exit' );
  setTimeout( function() {
    process.exit(1);
  }, 1000 );
};
app.on( 'error', serverError );

// START server
log.debug( 'Starting server on port %s', config.port );
app.listen( config.port, function runningServer() {
  log.info( 'Server running on port %s', config.port );
} );