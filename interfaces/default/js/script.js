/* global CS, Handlebars, purl, markdown */


var cs = CS.instance;
var params = purl().param();

var $sendBtn = $( '.send' );
var $modal = $( '#modal' );
var $content = $( '#content' );

var $modal = $( '#modal' );
var $more = $( '#more' , $modal );
var $close = $( '#close' , $modal );


// Error handlers
function winError( title, text ) {
  $modal.find( '.modal-header .modal-title' ).text( title );
  $modal.find( '.modal-body' ).html( '<p class="text-error">' + text + '</p>' );

  $modal.modal( 'show' );
}

function handleError( strError, file, row, col, err ) {
  if( $.type(err)==='error' ) {
    return winError( err.type, err.message );
  } else {
    var json = err.responseJSON;
    return winError( json.id, json.message );
  }
}



function renderView( data ) {
  var template = data.template;
  var task = data.task || data.entity;

  // Generate a renderer of the view
  var render = Handlebars.compile( template );

  // Generate the html from the data
  var html = render( data );
  // insert the data in the content
  $content.html( html );

  // Refinig touches
  $( '#name' ).text( task.name || 'Task' );
  $( '#instructions' ).html( markdown.toHTML( task.description || '' ) );
}


function getTemplate( entity ) {
  var template = entity.template || '';

  // If the entity contains the template parameter then return it
  if( template.trim().length>0 ) {
    var deferred = $.Deferred();
    return deferred.resolve( template );
  } else {
    return $.get( 'default.hbs' );
  }
}


function showSendButtons() {
  $sendBtn.removeClass( 'hide' );
}
function hideSendButtons() {
  $sendBtn.addClass( 'hide' );
}

function disableControls() {
  $( 'input, select, textarea, button, .btn' )
  .prop( 'disabled', true )
  .addClass( 'disabled' )
  ;
}

function renderPreview( id, type ) {
  var data = {};
  var options =  {
    populate: [ 'objects', 'operations' ]
  };
  var deferred;

  if( type==='task' ) {
    options.task = id;

    deferred = cs
    .getTask( options );
  } else if( type==='microtask' ) {
    options.microtask = id;
    options.task = id;

    deferred = cs
    .getMicrotask( options )
    .then( function( entity ) {
      options.task = entity.task;

      var d = cs.getTask( options )
      .then( function( task ) {
        data.task = task;
        return entity;
      });

      return d;
    } );
  }

  return deferred
  .then( function( json ) {
    var entity = json;
    var operations = entity.operations;
    var objects = entity.objects;

    // Add the properties to the data object
    data.entity = entity;
    data.operations = operations;
    data.objects = objects;

    // Get the template and render the view
    return entity;
  } )
  .then( getTemplate )
  .then( function( template ) {
    data.template = template;
    return data;
  } )
  .then( renderView )
  .then( hideSendButtons )
  .then( disableControls )
  ;
}


function retrieveExecution( id, type, username ) {
  var deferred;
  var data = {
    username: username,
    platform: 'amt'
  };

  if( type==='task' ) {
    data.task = id;

    deferred = cs
    .getExecutionByTask( data );
  } else if( type==='microtask' ) {
    data.microtask = id;

    deferred = cs
    .getExecutionByMicrotask( data );
  }

  return deferred
  .then( renderExecution );
}

function renderExecution( execution ) {
  var data = {};
  var deferred = $.Deferred();

  return deferred
  .resolve( execution )
  .then( function( rawExecution ) {
    if( execution.closed )
      throw new Error( 'Execution already closed' );

    data.execution = rawExecution;
    $( document.body ).attr( 'data-execution', rawExecution._id );

    return rawExecution.microtask;
  } )
  .then( function( microtaskId ) {
    return cs.getMicrotask( {
      microtask: microtaskId,
      populate: [ 'objects', 'platforms', 'operations' ]
    } );
  } )
  .then( function( rawMicrotask ) {
    data.microtask = rawMicrotask;

    // Keep only the NON CLOSED objects
    var objects = $.grep( rawMicrotask.objects, function() {
      return !this.closed;
    } );

    if( objects.length===0 )
      throw new Error( 'No available objects' );

    data.objects = objects;
    data.operations = rawMicrotask.operations;

    return data.execution.task;
  } )
  .then( function( taskId ) {
    return cs.getTask( taskId );
  } )
  .then( function( rawTask ) {
    data.task = rawTask;

    $( document.body ).attr( 'data-task', rawTask._id );

    return rawTask;
  } )
  .then( getTemplate )
  .then( function( template ) {
    data.template = template;
    return data;
  } )
  .then( renderView )
  .then( showSendButtons )
  ;
}

// Main entry point
// Based on the passed parameter display a preview or an actual execution
var promise;
var type = params.microtask? 'microtask': 'task';
var id = type==='task'? params.task : params.microtask;
if( params.assignmentId && params.hitId ) {
  var assignmentId = params.assignmentId;
  //var hitId = params.hitId;

  if( assignmentId==='ASSIGNMENT_ID_NOT_AVAILABLE' ) {
    //console.log( 'AMT preview' );
    promise = renderPreview( id, type );
  } else {
    //console.log( 'AMT execution' );
    promise = retrieveExecution( id, type, params.workerId );
  }

} else if( params.preview ) {
  //console.log( 'TEF preview' );
  promise = renderPreview( id, type );

} else if( params.run ) {
  //console.log( 'TEF get execution' );
  promise = retrieveExecution( id, type, params.username );

} else if( params.execution ) {
  //console.log( 'Render execution' );
  promise = cs
  .getExecution( params.execution )
  .then( renderExecution );
}



function handleSendClick() {

  var answers = [];
  $( '.cs-operation' ).each( function( i, opContainer ) {
    var $container = $( opContainer );
    var operation = $container.data( 'operationName' );

    var opImpl = CS.operationImplementation[ operation ];
    var answer = opImpl? opImpl( $container ) : undefined;

    if( answer!==undefined && answer!==null ) {
      answers.push( {
        object: $container.data( 'object' ),
        operation: $container.data( 'operation' ),
        response: answer
      } );
    }
  } );

  // Get the execution ID from the url parameters
  var executionId = params.execution;
  if( !executionId ) {
    executionId = $( document.body ).data( 'execution' );
  }
  $sendBtn.button( 'loading' );

  // Post the answer
  $modal.find( '.modal-header .modal-title' ).text( 'Sending data' );
  $modal.find( '.modal-body' ).html( '<p class="text-success">Wait please...</p>' );
  $modal.find( '.modal-footer' ).hide();
  $modal.modal( 'show' );

  cs
  .postAnswer( executionId, answers )
  .always( function() {
    // Show thanks modal
    $modal.find( '.modal-header .modal-title' ).text( 'Thanks' );
    $modal.find( '.modal-body' ).html( '<p class="text-success">Data sent!</p>' );
    $modal.find( '.modal-footer' ).show();
    $modal.modal( 'show' );

    if( params.assignmentId && params.hitId ) {
      var $form = $( 'form' );
      var action = params.turkSubmitTo+'/mturk/externalSubmit';
      $form.prop( 'action', action );
      var $assignmentId = $form.find( 'input[name="assignmentId"]' );
      var $executionId = $form.find( 'input[name="executionId"]' );
      var $microtaskId = $form.find( 'input[name="microtaskId"]' );
      var $workerId = $form.find( 'input[name="workerId"]' );
      $assignmentId.val( params.assignmentId );
      $microtaskId.val( params.microtask );
      $executionId.val( executionId );
      $workerId.val( params.workerId );

      $form.submit();
    }
  } )
  ;
}

// At the end enable the send buttons
promise
.done( function() {
  if( !params.task && !params.microtask && !params.execution && !params.run ) return;

  $sendBtn.click( handleSendClick );
} )
;




$more.click( function() {
  var taskId = $( document.body ).data( 'task' );
  var moreUrl = cs.baseUrl+'run?task='+taskId;
  location.href = moreUrl;
} );
$close.click( function() {
  window.close();

  $close.off( 'click' );
  setTimeout( function() {
    $close.html( 'Cannot close the window automatically, close it with the &times;' );
  }, 300 );
} );

window.onerror = handleError;


$( '.panel-title' ).click( function() {
  var $pan = $( this );
  $pan.find( 'i.fa' ).toggleClass( 'fa-chevron-down' );
  $pan.find( 'i.fa' ).toggleClass( 'fa-chevron-up' );
  $( '#instructions' ).slideToggle();
} );


if( window.localStorage ) {
  if( localStorage.closed )
    $( '.panel-title' ).click();

  localStorage.setItem( 'closed', true );
}