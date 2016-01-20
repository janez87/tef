// Module loading
var url = require( 'url' );
var path = require( 'path' );
var nconf = require( 'nconf' );

var CONFIGURATION_FILE = path.join( __dirname, 'configuration.json' );
var OVERRIDE_FILE = path.join( __dirname, 'override.json' );

var config = {};

// Load configuration
try {
  console.log( 'Configuring nconf' );
  // Load configuration with nconf
  nconf
  .argv()
  .env()
  .file( 'user', OVERRIDE_FILE )
  .file( 'global', CONFIGURATION_FILE );
} catch( err ) {
  console.error( err );
  process.exit( 1 );
}

// Configure Logger
config.log = console.log.bind( console );


// Export port
config.port = nconf.get( 'webserver:port' );
config.protocol = nconf.get( 'webserver:protocol' );
config.hostname = nconf.get( 'webserver:hostname' );




// CS url
try {
  var csUrl = nconf.get( 'crowdsearcher' );

  // If not defined use the data defined in the `webserver` configuration section
  if( !csUrl ) throw new Error( 'No url defined for the Crowdsearcher' );

  // if string then use as is, otherwise parse the object
  if( typeof(csUrl)!=='string' )
    csUrl = url.format( csUrl );

  // Put the configuration in the config object
  config.csUrl = csUrl;
} catch( err ) {
  console.error( err );
  process.exit( 1 );
}


exports = module.exports = config;