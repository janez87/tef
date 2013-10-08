// Module loading
var _ = require( 'underscore' );
var url = require( 'url' );
var path = require( 'path' );
var nconf = require( 'nconf' );
var bunyan = require('bunyan');

var CONFIGURATION_FILE = path.join( __dirname, 'configuration.json' );
var OVERRIDE_FILE = path.join( __dirname, 'override.json' );

var config = {};

// Load configuration
try {
  console.log( 'Configuring nconf' );
  // Load configuration with nconf
  nconf.argv();
  nconf.env();
  nconf.file( 'user', OVERRIDE_FILE );
  nconf.file( 'global', CONFIGURATION_FILE );
} catch( err ) {
  console.error( err );
  process.exit( 1 );
}

// Configure Logger
try {
  console.log( 'Configuring logger' );
  var loggerConfig = nconf.get( 'logger' );

  var log = bunyan.createLogger( {
    name: 'TEF',
    level: loggerConfig.level
  } );

  config.log = log;

  log.debug( 'Logger Active' );
} catch( err ) {
  console.error( err );
  process.exit( 1 );
}


// Export port
config.port = nconf.get( 'webserver:port' );




// Base url for the layout
try {
  var baseUrl = nconf.get( 'webserver:externalAddress' );

  // If not defined use the data defined in the `webserver` configuration section
  if( !baseUrl ) {
    baseUrl = {
      protocol: 'http',
      hostname: nconf.get( 'webserver:hostname' ),
      port: nconf.get( 'webserver:port' ),
      pathname: '/'
    };
  }

  // if string then use as is, otherwise parse the object
  if( !_.isString( baseUrl ) )
    baseUrl = url.format( baseUrl );

  log.trace( 'baseUrl: %s', baseUrl );

  // Put the configuration in the config object
  config.baseUrl = baseUrl;
} catch( err ) {
  console.error( err );
  process.exit( 1 );
}







// CS url
try {
  var csUrl = nconf.get( 'crowdsearcher:url' );

  // If not defined use the data defined in the `webserver` configuration section
  if( !csUrl ) throw new Error( 'No url defined for the Crowdsearcher' );

  // if string then use as is, otherwise parse the object
  if( !_.isString( csUrl ) )
    csUrl = url.format( csUrl );

  // Put the configuration in the config object
  config.csUrl = csUrl;
} catch( err ) {
  console.error( err );
  process.exit( 1 );
}


exports = module.exports = config;