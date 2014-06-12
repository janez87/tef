/* jshint browser: true, jquery: true */
/* global CS, Handlebars, purl, markdown */


var cs = CS.instance;
var params = purl().param();

var $sendBtn = $( '.send' );
var $modal = $( '#modal' );
var $content = $( '#content' );
//var $closeBtn = $( '#close', $modal );
//var $moreBtn = $( '#more', $modal );

var $modal = $( '#modal' );

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
  var task = data.task;

  // Generate a renderer of the view
  var render = Handlebars.compile( template );

  // Generate the html from the data
  var html = render( data );
  // insert the data in the content
  $content.html( html );

  // Refinig touches
  $( '#name' ).text( task.name );
  $( '.description' ).html( markdown.toHTML( task.description ) );
}



function getTemplate( task ) {
  var template = task.template || '';
  
  // If the task contains the template parameter then return it
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
function renderPreview( taskId ) {
  var data = {};

  return cs
  .getTask( {
    task: taskId,
    populate: [ 'objects', 'operations' ]
  } )
  .then( function( json ) {
    var task = json;
    var operations = task.operations;

    // Take a random number of objects
    var numObjectsToShow = Math.ceil( Math.random()*5 );

    // Pick random objects
    var objects = [];
    for( var i=0; i<numObjectsToShow; i++ ) {
      var idx = Math.floor( Math.random()*task.objects.length );
      objects.push( task.objects[ idx ] );
    }

    // Add the properties to the data object
    data.task = task;
    data.operations = operations;
    data.objects = objects;

    // Get the template and render the view
    return task;
  } )
  .then( getTemplate )
  .then( function( template ) {
    data.template = template;
    return data;
  } )
  .then( hideSendButtons )
  .then( renderView )
  ;
}
function retrieveExecution( taskId, username ) {
  return cs
  .getExecutionByTask( {
    task: taskId,
    username: username
  } )
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
if( params.assignmentId && params.hitId ) {
  var assignmentId = params.assignmentId;
  //var hitId = params.hitId;
  
  if( assignmentId==='ASSIGNMENT_ID_NOT_AVAILABLE' ) {
    console.log( 'AMT preview' );
    promise = renderPreview( params.run || params.preview );
  } else {
    console.log( 'AMT execution' );
    promise = retrieveExecution( params.run, params.workerId );
  }

} else if( params.preview ) {
  console.log( 'TEF preview' );
  promise = renderPreview( params.preview );

} else if( params.run ) {
  console.log( 'TEF get execution' );
  promise = retrieveExecution( params.run, params.username );

} else if( params.execution ) {
  console.log( 'Render execution' );
  promise = cs
  .getExecution( params.execution )
  .then( renderExecution );
}


function handleSendClick() {
  $sendBtn.button( 'loading' );
  
  var answers = [];
  $( '.cs-operation' ).each( function( i, opContainer ) {
    var $container = $( opContainer );
    var operation = $container.data( 'operationName' );

    var opImpl = CS.operationImplementation[ operation ];

    var answer;
    if( opImpl )
      answer = opImpl( $container );

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

  // Post the answer
  cs
  .postAnswer( executionId, answers )
  .then( function( data ) {
    console.log( data );
  } )
  .then( function() {
    // Show thanks modal
    $modal.find( '.modal-header .modal-title' ).text( 'Thanks' );
    $modal.find( '.modal-body' ).html( '<p class="text-success">Data sent!</p>' );

    $modal.modal( 'show' );
  } )
  ;
}

// At the end enable the send buttons
promise
.done( function() {
  if( !params.execution && !params.run ) return;

  $sendBtn.click( handleSendClick );
} )
;

window.onerror = handleError;