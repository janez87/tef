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
      if( opImpl ) {
        $td.append( opImpl( op ) );
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

/*
( function() {

  var csm = new CSM();

  // IDs
  var jobId, taskId, microtaskId, executionId, performerId;
  var taskObj;



  // Operation specific
  function createLikeAction( operation ) {
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
  }
  function getLikeData( $objects, operation ) {
    var $rows = $( '.action[data-operation="'+operation._id+'"][data-liked="true"]', $objects );

    var data = $rows.map( function() {
      var id = $( this ).closest( 'tr' ).data( 'id' );

      return {
        objectId: id
      };
    } ).get();

    return data;
  }

  function createClassifyAction( operation ) {
    var $div = $( '<div></div>' );
    $div.addClass( 'action '+operation.name );
    $div.attr( 'data-operation', operation._id );

    var categories = operation.params.categories;
    var select = '<select class="form-control">';
    $.each( categories, function( i, val ) {
      select += '<option data-category="'+val+'">'+val+'</option>';
    } );
    select += '</select>';

    $div.append( select );
    return $div;
  }
  function getClassifyData( $objects, operation ) {
    var $rows = $( '.action[data-operation="'+operation._id+'"] select', $objects );

    var data = $rows.map( function() {
      var category = $( this ).find( 'option:selected').data( 'category' );
      var id = $( this ).closest( 'tr' ).data( 'id' );

      return {
        objectId: id,
        value: category
      };
    } ).get();

    return data;
  }

  function createFuzzyClassifyAction( operation ) {
    var $div = $( '<div></div>' );
    $div.addClass( 'action '+operation.name );
    $div.attr( 'data-operation', operation._id );

    var categories = operation.params.categories;
    var select = '<select class="form-control">';
    $.each( categories, function( i, val ) {
      select += '<option data-category="'+val+'">'+val+'</option>';
    } );
    select += '</select>';

    $div.append( select );
    return $div;
  }

  function getFuzzyClassifyData( $objects, operation ) {
    var $rows = $( '.action[data-operation="'+operation._id+'"] select', $objects );

    var data = $rows.map( function() {
      var category = $( this ).find( 'option:selected').data( 'category' );
      var id = $( this ).closest( 'tr' ).data( 'id' );

      return {
        objectId: id,
        value: category
      };
    } ).get();

    return data;
  }

  function createTagAction( operation ) {
    var $div = $( '<div></div>' );
    $div.addClass( 'action '+operation.name );
    $div.attr( 'data-operation', operation._id );

    $div.append('<input type="text" class="form-control">' );
    return $div;
  }
  function getTagData( $objects, operation ) {
    var $rows = $( '.action[data-operation="'+operation._id+'"] input', $objects );

    var data = $rows.map( function() {
      var tags = this.value;
      var id = $( this ).closest( 'tr' ).data( 'id' );

      if( tags.length===0 )
        return;
      else
        return {
          objectId: id,
          value: tags.split( ',' )
        };
    } ).get();

    return data;
  }

  var actions = {
    like: {
      create: createLikeAction,
      retrieve: getLikeData
    },
    classify: {
      create: createClassifyAction,
      retrieve: getClassifyData
    },
    tag: {
      create: createTagAction,
      retrieve: getTagData
    },
    fuzzyclassify:{
      create: createFuzzyClassifyAction,
      retrieve: getFuzzyClassifyData
    }

  };





  var $send = $( '.send' );
  $send.click( function() {

    $send.button( 'loading' );

    var $objects = $( '#objects' );

    var postData = [];
    $.each( taskObj.operations, function() {
      var operationData = null;
      var action = actions[ this.name ];
      if( action && action.retrieve )
        operationData = action.retrieve( $objects, this ) || null;

      postData.push( operationData );
    } );

    csm.postAnswer( postData, function( err, data ) {
      if( err ) {
        $modal.find( '.modal-header .modal-title' ).text( err );
        $modal.find( '.modal-body' ).html( '<p class="text-error">'+data.id+'</p><p class="text-error">'+data.message+'</p>' );

        $send.button( 'reset' );
      } else {
        $modal.find( '.modal-header .modal-title' ).text( 'Post success' );
        $modal.find( '.modal-body' ).html( '<p class="text-success text-center">Data sent!</p>' );
      }

      $modal.modal( 'show' );
    } );
  } );
} )();
*/