/* jshint browser: true */
/* global CS */


var cs = CS.instance;

var execution;
var $sendBtn = $( '.send' );
var $modal = $( '#modal' );
var $closeBtn = $( '#close', $modal );
var $moreBtn = $( '#more', $modal );

var $modal = $( '#modal' );
$closeBtn.click( function() {
  window.close();
  return false;
} );


// Error handlers
function winError( title, text ) {
  $modal.find( '.modal-header .modal-title' ).text( title );
  $modal.find( '.modal-body' ).html( '<p class="text-error">'+text+'</p>' );

  $modal.modal( 'show' );
}
function handleError( jqXHR ) {
  var json = jqXHR.responseJSON;
  return winError( json.id, json.message );
}


// Main display function
function displayObjects( objects, operations ) {
  var $objects = $( '#objects' );
  var $headers = $( '#headers' );
  $.each( operations, function( i, op ) {
    $headers.append( '<th class="action">'+op.label+'</th>' );
  } );

  $.each( objects, function( i, obj ) {

    var $tr = $( '<tr></tr>' );
    $tr.attr( 'data-id', obj._id );

    // Data
    var $td = $( '<td></td>' );
    $td.append( '<pre>'+JSON.stringify( obj.data, null, 2 )+'</pre>' );
    $tr.append( $td );

    // Operations
    $.each( operations, function( i, op ) {
      var $td = $( '<td></td>' );

      var opImpl = CS.operationImplementation[ op.name ];
      if( opImpl && opImpl.create ) {
        $td.append( opImpl.create( op, obj ) );
      } else {
        $td.append( 'Woops... not implemented' );
      }

      $tr.append( $td );
    } );

    $objects.append( $tr );
  } );
}


// Main entry point
cs.getExecution( CS.qs.execution )
.done( function( json ) {
  execution = json;

  if( execution.closed )
    return winError( 'Execution closed', 'The current execution is closed.' );


  var moreUrl = cs.baseUrl+'run?task='+execution.task;
  if( execution.performer )
    moreUrl += '&performer='+execution.performer;
  $moreBtn.attr( 'href', moreUrl );

  cs.getMicrotask( {
    microtask: json.microtask,
    populate: [ 'objects', 'platforms', 'operations' ]
  } ).done( function( json ) {

    // Filter out the closed objects
    var objects = $.grep( json.objects, function( obj ) {
      return !obj.closed;
    } );

    if( objects.length===0 )
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



$sendBtn.click( function() {
  $sendBtn.button( 'loading' );

  var $responses = $( '.cs-operation' );

  var answers = [];
  $responses.each( function( i, opContainer ) {
    var $container = $( opContainer );
    var operation = $container.data( 'operationName' );

    var opImpl = CS.operationImplementation[ operation ];
    var answer;
    if( opImpl && opImpl.retrieve ) {
      answer = opImpl.retrieve( $container );
    }

    if( answer!==undefined && answer!==null ) {
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