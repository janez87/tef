// Wrap the function so it wont pollute the global object
( function( w, $ ) {

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
    for (var i = 0; i < params.length; i++) {
      var matches = params[i].match( /(.*)?=(.*)?/i );
      if( matches ) {
        var key = matches[ 1 ];
        var value = matches[ 2 ];
        if( querystring[ key ] ) {
          if( !$.isArray( querystring[ key ] ) )
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
    if( !url )
      throw new Error( 'Missing url' );

    if( url[url.length-1]==='/' )
      url = url.slice( 0, -1 );

    this.baseUrl = url+'/api/';
  }

  CrowdSearcher.prototype.callAPI = function( data, callback ) {
    var api = data.api;
    var method = data.method || 'GET';
    var body = data.data;
    method = method.toUpperCase();

    var url = this.baseUrl + api;
    // Append query string
    if( data.qs )
      url += '?'+$.param( data.qs );

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


    if( $.isFunction( callback ) ) {
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
    if( $.type( inputData )==='string' )
      inputData = { execution: inputData };

    var data = {
      api: 'execution',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };

  CrowdSearcher.prototype.getMicrotask = function( inputData, callback ) {
    if( $.type( inputData )==='string' )
      inputData = { microtask: inputData };

    var data = {
      api: 'microtask',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getTask = function( inputData, callback ) {
    if( $.type( inputData )==='string' )
      inputData = { task: inputData };

    var data = {
      api: 'task',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getJob = function( inputData, callback ) {
    if( $.type( inputData )==='string' )
      inputData = { job: inputData };

    var data = {
      api: 'job',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getObject = function( inputData, callback ) {
    if( $.type( inputData )==='string' )
      inputData = { object: inputData };

    var data = {
      api: 'object',
      method: 'GET',
      qs: inputData
    };
    return this.callAPI( data, callback );
  };
  CrowdSearcher.prototype.getUser = function( inputData, callback ) {
    if( $.type( inputData )==='string' )
      inputData = { user: inputData };

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






  // # Operations implementation
  //
  var operationImplementation = {};

  // ## Classify
  //
  operationImplementation[ 'classify' ] = function createClassify( operation ) {
    var $div = $( '<div></div>' );
    $div.addClass( 'action '+operation.name );
    $div.attr( 'data-operation', operation._id );

    var categories = operation.params.categories;
    var select = '<select class="form-control">';
    $.each( categories, function( i, category ) {
      select += '<option data-category="'+category+'">'+category+'</option>';
    } );
    select += '</select>';

    $div.append( select );
    return $div;
  };

  // ## Like
  //
  operationImplementation[ 'like' ] = function createLike( operation ) {
    var $div = $( '<div></div>' );
    $div.addClass( 'action '+operation.name );
    $div.attr( 'data-operation', operation._id );

    var $btn = $( '<button class="btn btn-link"><i class="fa fa-square-o"></i> Liked?</button>' );

    $btn.on( 'click', function() {
      var $i = $btn.find( 'i:first' );
      var liked = !$i.hasClass( 'fa fa-check-square-o' );

      $i.removeClass( 'fa fa-square-o fa fa-check-square-o' );
      if( liked ) {
        $i.addClass( 'fa fa-check-square-o' );
      } else {
        $i.addClass( 'fa fa-square-o' );
      }

      $div.attr( 'data-liked', liked );
    } );

    $div.append( $btn );

    return $div;
  };

  // ## Tag
  //
  operationImplementation[ 'tag' ] = function createTag( operation ) {
    var $div = $( '<div></div>' );
    $div.addClass( 'action '+operation.name );
    $div.attr( 'data-operation', operation._id );

    $div.append('<input type="text" class="form-control">' );
    return $div;
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
} )( window, jQuery );
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