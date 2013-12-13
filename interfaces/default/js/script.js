/* jshint browser: true, jquery: true */
/* global CS, Handlebars */


var cs = CS.instance;

var execution;
var $sendBtn = $( '.send' );
var $modal = $( '#modal' );
var $closeBtn = $( '#close', $modal );
//var $moreBtn = $( '#more', $modal );

var $modal = $( '#modal' );
$closeBtn.click( function() {
  window.close();
  return false;
} );


// Error handlers
function winError( title, text ) {
  $modal.find( '.modal-header .modal-title' ).text( title );
  $modal.find( '.modal-body' ).html( '<p class="text-error">' + text + '</p>' );

  $modal.modal( 'show' );
}

function handleError( jqXHR ) {
  var json = jqXHR.responseJSON;
  return winError( json.id, json.message );
}


function render( task, operations, objects ) {

  if ( task.template && task.template.trim().length > 0 ) {
    var compiledTemplate = Handlebars.compile( task.template );
    var html = compiledTemplate( {
      task: task,
      operations: operations,
      objects: objects
    } );

    $( '#content' ).html( html );

  } else {
    $.get( 'default.hbs' )
      .fail( handleError )
      .done( function( template ) {
        task.template = template;
        return render( task, operations, objects );
      } );
  }

}

// Main entry point

// Based on the passed parameter display a preview or an actual execution

if ( CS.qs.execution ) {
  // Render a an actual execution.
  var executionId = CS.qs.execution;
  cs
    .getExecution( {
      execution: executionId,
      populate: [ 'platform', 'performer', 'task' ]
    } )
    .done( function( json ) {
      execution = json;

      cs.getMicrotask( {
        microtask: execution.microtask,
        populate: [ 'objects', 'platforms', 'operations' ]
      } )
        .fail( handleError )
        .done( function( microtask ) {

          // Filter out the closed objects
          var objects = $.grep( microtask.objects, function( obj ) {
            return !obj.closed;
          } );

          if ( objects.length === 0 )
            return winError( 'No available objects', 'The current execution have no available objects.' );

          return render( execution.task, microtask.operations, objects );
        } );
    } )
    .fail( handleError );


  // Render a preview of the Task
} else if ( CS.qs.preview ) {
  var taskId = CS.qs.preview;
  cs
    .getTask( {
      task: taskId,
      populate: [ 'objects', 'operations' ]
    } )
    .done( function( json ) {
      var task = json;
      $sendBtn.closest( '.row' ).remove();

      var objects = task.objects.slice( 0, 2 );

      return render( task, task.operations, objects );
    } )
    .fail( handleError );
}
/*
cs.getExecution( CS.qs.execution )
  .done( function( json ) {
    execution = json;

    if ( execution.closed )
      return winError( 'Execution closed', 'The current execution is closed.' );


    var moreUrl = cs.baseUrl + 'run?task=' + execution.task;
    if ( execution.performer )
      moreUrl += '&performer=' + execution.performer;
    $moreBtn.attr( 'href', moreUrl );

    cs.getMicrotask( {
      microtask: json.microtask,
      populate: [ 'objects', 'platforms', 'operations' ]
    } ).done( function( json ) {

      // Filter out the closed objects
      var objects = $.grep( json.objects, function( obj ) {
        return !obj.closed;
      } );

      if ( objects.length === 0 )
        return winError( 'No available objects', 'The current execution have no available objects.' );

      return displayObjects( objects, json.operations );
    } )
      .fail( handleError );

    cs.getTask( {
      task: json.task
    } ).done( function( json ) {

      $( '#name' ).text( json.name );
      $( '.description' ).html( markdown.toHTML( json.description ) );

    } )
      .fail( handleError );
  } )
  .fail( handleError );
*/



$sendBtn.click( function() {
  $sendBtn.button( 'loading' );

  var $responses = $( '.cs-operation' );

  var answers = [];
  $responses.each( function( i, opContainer ) {
    var $container = $( opContainer );
    var operation = $container.data( 'operationName' );

    var opImpl = CS.operationImplementation[ operation ];
    var answer;
    if ( opImpl ) {
      answer = opImpl( $container );
    }

    if ( answer !== undefined && answer !== null ) {
      answers.push( {
        object: $container.data( 'object' ),
        operation: $container.data( 'operation' ),
        response: answer
      } );
    }
  } );

  cs
    .postAnswer( execution._id, answers )
    .done( function( data ) {
      console.log( data );
      $modal.find( '.modal-header .modal-title' ).text( 'Thanks' );
      $modal.find( '.modal-body' ).html( '<p class="text-success">Data sent!</p>' );

      $modal.modal( 'show' );
    } )
    .fail( handleError );
} );