// Wrap the function so it wont pollute the global object
( function createObject( window, $ ) {

  var qs = {};
  var params = location.search.slice( 1 ).split( '&' );
  for (var i = 0; i < params.length; i++) {
    var matches = params[i].match( /(.*)?=(.*)?/i );
    if( matches ) {
      qs[ matches[1] ] = qs[ matches[1] ] || [];
      qs[ matches[1] ].push( matches[2] );
    }
  }

  var CrowdSearcherManager = function( id ) {
    if( $.type( id )==='undefined' ) {
      console.log( 'Infer the id from the location.search property' );
      id = qs.execution? qs.execution[ 0 ] : null;

      if( !id )
        return alert( 'Unable to infer the execution id from\n"'+location.search+'"' );
    }

    this.execution = id;
    console.log( 'Execution id:', this.execution );

    // Strip index.html and "operation"
    var appUrl = location.pathname.split('/').slice( 0, -2 ).join( '/' )+'/';
    this.baseUrl = location.protocol+'//'+location.host+appUrl;
    console.log( 'Base url: ', this.baseUrl );
  };

  // Call API main method
  CrowdSearcherManager.prototype.callAPI = function( data, callback ) {
    var api = data.api;
    var id = data.id;
    var settings = $.isFunction( data.settings )? null : data.settings;

    if( $.type( api )!=='string' ) {
      return alert( 'No API specified' );
    }

    if( !$.isFunction( callback ) ) {
      return alert( 'No callback specified' );
    }

    var url = this.baseUrl+api+'/'+id;
    var request = $.getJSON( url, settings );
    request.done( function( data ) {
      return callback( null, data );
    } );
    request.fail( function( xhr, status, error ) {
      return callback( error );
    } );

    return request;
  };

  // API calls
  CrowdSearcherManager.prototype.getExecution = function( settings, callback ) {
    var data = {
      api: 'execution',
      id: this.execution,
      settings: settings
    };

    if( !$.isFunction( callback ) )
      callback = settings;

    return this.callAPI( data, callback );
  };
  CrowdSearcherManager.prototype.getJob = function( data, callback ) {
    data = {
      api: 'job',
      id: data.id,
      settings: data.settings
    };

    return this.callAPI( data, callback );
  };
  CrowdSearcherManager.prototype.getTask = function( data, callback ) {
    data = {
      api: 'task',
      id: data.id,
      settings: data.settings
    };

    return this.callAPI( data, callback );
  };
  CrowdSearcherManager.prototype.getMicrotask = function( data, callback ) {
    data = {
      api: 'microtask',
      id: data.id,
      settings: data.settings
    };

    return this.callAPI( data, callback );
  };
  CrowdSearcherManager.prototype.getObject = function( data, callback ) {
    data = {
      api: 'object',
      id: data.id,
      settings: data.settings
    };

    return this.callAPI( data, callback );
  };
  CrowdSearcherManager.prototype.getObjects = function( data, callback ) {
    data = {
      api: 'object',
      ids: data.ids,
      settings: data.settings
    };

    return this.callAPI( data, callback );
  };
  CrowdSearcherManager.prototype.getUser = function( data, callback ) {
    data = {
      api: 'user',
      id: data.id,
      settings: data.settings
    };

    return this.callAPI( data, callback );
  };

  // Post answer
  CrowdSearcherManager.prototype.postAnswer = function( data, callback ) {
    if( $.type( data )==='undefined' ) {
      return alert( 'No DATA specified' );
    }

    if( !$.isFunction( callback ) ) {
      return alert( 'No callback specified' );
    }

    var url = this.baseUrl+'answer?execution='+this.execution;

    var postData = {
      data: data
    };

    var request = $.ajax( url, {
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify( postData ),
      processData: true
    } );
    request.done( function( data ) {
      return callback( null, data );
    } );
    request.fail( function( xhr, status, error ) {
      return callback( error, JSON.parse( xhr.responseText ) );
    } );
  };


  console.log( 'CrowdSearcherManager ready' );
  window.CSM = window.CrowdSearcherManager = CrowdSearcherManager;
  window.qs = window.querystring = qs;
})( window, jQuery );
