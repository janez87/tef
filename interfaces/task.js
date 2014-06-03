// Wrap the function so it wont pollute the global object
( function( w, $, HBS ) {
  // # Module-wide available properties
  //
  // TEF compiled fields
  var csBaseUrl = '${csUrl}';


  // ## Parse query string
  //
  function parseQueryString( querystringInput ) {
    // Use the passed querystring or retrive it from the location.
    querystringInput = querystringInput || location.search.slice( 1 );

    var querystring = {};
    var params = querystringInput.split( '&' );
    for ( var i = 0; i < params.length; i++ ) {
      var matches = params[ i ].match( /(.*)?=(.*)?/i );
      if ( matches ) {
        var key = matches[ 1 ];
        var value = matches[ 2 ];
        if ( querystring[ key ] ) {
          if ( !$.isArray( querystring[ key ] ) )
            querystring[ key ] = [ querystring[ key ] ];
          querystring[ key ].push( value );
        } else {
          querystring[ key ] = value;
        }
      }
    }

    return querystring;
  }

  // # CrowdSearcher class
  //
  function CrowdSearcher( url ) {
    if ( !url )
      throw new Error( 'Missing url' );

    if ( url[ url.length - 1 ] === '/' )
      url = url.slice( 0, -1 );

    this.baseUrl = url + '/api/';
  }

  CrowdSearcher.prototype.callAPI = function( data, callback ) {
    var api = data.api;
    var method = data.method || 'GET';
    var body = data.data;
    method = method.toUpperCase();

    var url = this.baseUrl + api;
    // Append query string
    if ( data.qs )
      url += '?' + $.param( data.qs );

    var req = $.ajax( {
      url: url,
      processData: false,
      type: method,
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      data: JSON.stringify( body )
    } );

    if ( $.isFunction( callback ) ) {
      req.done( function requestSuccess( data ) {
        return callback( null, data );
      } );

      req.fail( function requestFailed( jqXHR, status, err ) {
        return callback( err );
      } );
    }

    return req;
  };


  // ## Getters
  //
  CrowdSearcher.prototype.getExecution = function( inputData, callback ) {
    if ( $.type( inputData ) === 'string' )
      inputData = {
        execution: inputData
      };

    var data = {
      api: 'execution',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };

  CrowdSearcher.prototype.getMicrotask = function( inputData, callback ) {
    if ( $.type( inputData ) === 'string' )
      inputData = {
        microtask: inputData
      };

    var data = {
      api: 'microtask',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getTask = function( inputData, callback ) {
    if ( $.type( inputData ) === 'string' )
      inputData = {
        task: inputData
      };

    var data = {
      api: 'task',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getJob = function( inputData, callback ) {
    if ( $.type( inputData ) === 'string' )
      inputData = {
        job: inputData
      };

    var data = {
      api: 'job',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getObject = function( inputData, callback ) {
    if ( $.type( inputData ) === 'string' )
      inputData = {
        object: inputData
      };

    var data = {
      api: 'object',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getUser = function( inputData, callback ) {
    if ( $.type( inputData ) === 'string' )
      inputData = {
        user: inputData
      };

    var data = {
      api: 'user',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getPerformer = CrowdSearcher.prototype.getUser;


  // ## Setters
  //
  CrowdSearcher.prototype.postAnswer = function( executionId, answers, callback ) {
    if ( !$.isArray( answers ) )
      answers = [ answers ];

    var data = {
      api: 'answer/' + executionId,
      method: 'POST',
      data: {
        data: answers
      }
    };
    return this.callAPI( data, callback );
  };




  // # Operations implementation
  //
  // ## Classify
  //
  HBS.registerHelper( 'printObject', function( object, asList ) {
    if ( !asList ) {
      return '<pre>' + JSON.stringify( object, null, 2 ) + '</pre>';
    } else {
      var out = '<dl class="dl-horizontal">';
      $.each( object, function( key, value ) {
        out += '<dt title="' + key + '">' + key + '</dt>';

        var type = $.type( value );
        if ( type === 'string' || type === 'number' || type === 'boolean' ) {
          out += '<dd title="' + value + '">' + value + '</dd>';
        } else {
          out += '<dd title="' + JSON.stringify( object, null, 2 ) + '"><pre>' + JSON.stringify( object, null, 2 ) + '</pre></dd>';
        }
      } );
      out += '</dl>';
      return out;
    }
  } );
  HBS.registerHelper( 'op-classify', function( operation ) {
    var categories = operation.params.categories;
    if( !$.isArray( categories ) )
      categories = JSON.parse( categories );
    
    var select = '<select class="form-control">';
    $.each( categories, function( i, category ) {
      select += '<option data-category="' + category + '">' + category + '</option>';
    } );
    select += '</select>';
    return select;
  } );
  // ## Like
  //
  HBS.registerHelper( 'op-like', function() {
    var out = '<div class="checkbox"><label><input type="checkbox"> Like</label></div>';
    return out;
  } );
  // ## Tag
  //
  HBS.registerHelper( 'op-tag', function() {
    var out = '<input type="text" class="form-control">';
    return out;
  } );

  HBS.registerHelper( 'printOperation', function( operation, object ) {
    /* jshint multistr: true*/
    var out = '<div class="cs-operation \
      cs-operation-' + operation.name + '" \
      data-operation-name="' + operation.name + '" \
      data-operation="' + operation._id + '" \
      data-object="' + object._id + '">';

    var opHelper = HBS.helpers[ 'op-' + operation.name ];
    out += opHelper.apply( this, [ operation, object ] );

    out += '</div>';
    return out;
  } );
  var operationImplementation = {};
  operationImplementation[ 'classify' ] = function( div ) {
    var $selectedOption = $( 'select option:selected', div );
    return $selectedOption.data( 'category' );
  };
  operationImplementation[ 'like' ] = function( div ) {
    var $chk = $( ':checkbox', div );
    return $chk.is( ':checked' );
  };
  operationImplementation[ 'tag' ] = function( div ) {
    var $input = $( 'input', div );
    var value = $input.val();
    value = value.trim();
    if ( value.length > 0 ) {
      return value.split( ',' );
    } else {
      return undefined;
    }
  };






  // # Exports
  //
  window.CS = {
    // Operation list
    operationImplementation: operationImplementation,

    // CS class
    instance: new CrowdSearcher( csBaseUrl ),
    constructor: CrowdSearcher,

    // QueryString
    qs: parseQueryString(),
    parseQueryString: parseQueryString
  };
} )( window, jQuery, Handlebars );
/*

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

})( window, jQuery );
*/