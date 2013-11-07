/* global CSM, markdown */
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













  // Create UI

  function printObjects( err, objects ) {
    if( err ) return console.error( err );

    var $objects = $( '#objects' );
    var $headers = $( '#headers' );
    $.each( taskObj.operations, function() {
      $headers.append( '<th class="action">'+this.label+'</th>' );
    });

    $.each( objects, function() {
      var obj = this;
      if( obj.closed ) return;

      //var data = obj.data;
      var $tr = $( '<tr></tr>' );
      $tr.attr( 'data-id', obj._id );

      // ID
      //$tr.append( '<td class="id" title="'+obj._id+'">'+obj._id+'</td>' );

      // Data
      var $td = $( '<td></td>' );
      $td.append( '<pre>'+JSON.stringify( obj.data, null, 2 )+'</pre>' );
      $tr.append( $td );


      // Actions
      $.each( taskObj.operations, function() {

        var $td = $( '<td></td>' );
        var action = actions[ this.name ];
        if( action && action.create ) {
          $td.append( action.create( this ) );
        } else {
          $td.append( 'Woops... not implemented' );
        }

        $tr.append( $td );
      } );

      $objects.append( $tr );
    } );
  }
  function getObjects( err, microtask ) {
    if( err ) return console.error( err );

    printObjects( null, microtask.objects );
  }
  function printData( err, task ) {
    if( err ) return console.error( err );
    taskObj = task;

    var $name = $( '#name' );
    $name.prepend( task.name );

    var $description = $( '.description' );
    $description.html( markdown.toHTML( task.description ) );

    csm.getMicrotask( {
      id: microtaskId,
      settings: {
        shuffle: true
      }
    }, getObjects );
  }
  function getTask( err, execution ) {
    if( err ) return console.error( err );

    jobId = execution.job;
    taskId = execution.task;
    microtaskId = execution.microtask;
    executionId = execution.id;
    performerId = execution.performer;

    if( execution.closed ) {
      $modal.find( '.modal-header .modal-title' ).text( 'Execution closed'  );
      $modal.find( '.modal-body' ).html( '<p class="text-error">The current execution is closed.</p>' );

      $modal.modal( 'show' );
    } else {
      return csm.getTask( {
        id: taskId
      }, printData );
    }

  }



  // Entry point
  csm.getExecution( null, getTask );



  // handle the save button
  var $modal = $( '#modal' );
  $modal.find( '#close' ).click( function() {
    window.close();
    return false;
    /*
    var url = location.protocol+'//';
    url += location.host;
    url += '/ending/?task='+taskId;
    location.href = url;
    */
  } );
  $modal.find( '#more' ).click( function() {
    var url = location.protocol+'//';
    url += location.host;
    url += '/run/?task='+taskId;
    if( performerId )
      url += '&performer='+performerId;
    //console.log( url );
    location.href = url;
  } );

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