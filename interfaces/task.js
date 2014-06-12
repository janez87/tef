/*! purl v2.3.1 | MIT */
(function(factory){if(typeof define==="function"&&define.amd){define(factory)}else{window.purl=factory()}})(function(){var tag2attr={a:"href",img:"src",form:"action",base:"href",script:"src",iframe:"src",link:"href"},key=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","fragment"],aliases={anchor:"fragment"},parser={strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/},isint=/^[0-9]+$/;function parseUri(url,strictMode){var str=decodeURI(url),res=parser[strictMode||false?"strict":"loose"].exec(str),uri={attr:{},param:{},seg:{}},i=14;while(i--){uri.attr[key[i]]=res[i]||""}uri.param["query"]=parseString(uri.attr["query"]);uri.param["fragment"]=parseString(uri.attr["fragment"]);uri.seg["path"]=uri.attr.path.replace(/^\/+|\/+$/g,"").split("/");uri.seg["fragment"]=uri.attr.fragment.replace(/^\/+|\/+$/g,"").split("/");uri.attr["base"]=uri.attr.host?(uri.attr.protocol?uri.attr.protocol+"://"+uri.attr.host:uri.attr.host)+(uri.attr.port?":"+uri.attr.port:""):"";return uri}function getAttrName(elm){var tn=elm.tagName;if(typeof tn!=="undefined")return tag2attr[tn.toLowerCase()];return tn}function promote(parent,key){if(parent[key].length===0)return parent[key]={};var t={};for(var i in parent[key])t[i]=parent[key][i];parent[key]=t;return t}function parse(parts,parent,key,val){var part=parts.shift();if(!part){if(isArray(parent[key])){parent[key].push(val)}else if("object"==typeof parent[key]){parent[key]=val}else if("undefined"==typeof parent[key]){parent[key]=val}else{parent[key]=[parent[key],val]}}else{var obj=parent[key]=parent[key]||[];if("]"==part){if(isArray(obj)){if(""!==val)obj.push(val)}else if("object"==typeof obj){obj[keys(obj).length]=val}else{obj=parent[key]=[parent[key],val]}}else if(~part.indexOf("]")){part=part.substr(0,part.length-1);if(!isint.test(part)&&isArray(obj))obj=promote(parent,key);parse(parts,obj,part,val)}else{if(!isint.test(part)&&isArray(obj))obj=promote(parent,key);parse(parts,obj,part,val)}}}function merge(parent,key,val){if(~key.indexOf("]")){var parts=key.split("[");parse(parts,parent,"base",val)}else{if(!isint.test(key)&&isArray(parent.base)){var t={};for(var k in parent.base)t[k]=parent.base[k];parent.base=t}if(key!==""){set(parent.base,key,val)}}return parent}function parseString(str){return reduce(String(str).split(/&|;/),function(ret,pair){try{pair=decodeURIComponent(pair.replace(/\+/g," "))}catch(e){}var eql=pair.indexOf("="),brace=lastBraceInKey(pair),key=pair.substr(0,brace||eql),val=pair.substr(brace||eql,pair.length);val=val.substr(val.indexOf("=")+1,val.length);if(key===""){key=pair;val=""}return merge(ret,key,val)},{base:{}}).base}function set(obj,key,val){var v=obj[key];if(typeof v==="undefined"){obj[key]=val}else if(isArray(v)){v.push(val)}else{obj[key]=[v,val]}}function lastBraceInKey(str){var len=str.length,brace,c;for(var i=0;i<len;++i){c=str[i];if("]"==c)brace=false;if("["==c)brace=true;if("="==c&&!brace)return i}}function reduce(obj,accumulator){var i=0,l=obj.length>>0,curr=arguments[2];while(i<l){if(i in obj)curr=accumulator.call(undefined,curr,obj[i],i,obj);++i}return curr}function isArray(vArg){return Object.prototype.toString.call(vArg)==="[object Array]"}function keys(obj){var key_array=[];for(var prop in obj){if(obj.hasOwnProperty(prop))key_array.push(prop)}return key_array}function purl(url,strictMode){if(arguments.length===1&&url===true){strictMode=true;url=undefined}strictMode=strictMode||false;url=url||window.location.toString();return{data:parseUri(url,strictMode),attr:function(attr){attr=aliases[attr]||attr;return typeof attr!=="undefined"?this.data.attr[attr]:this.data.attr},param:function(param){return typeof param!=="undefined"?this.data.param.query[param]:this.data.param.query},fparam:function(param){return typeof param!=="undefined"?this.data.param.fragment[param]:this.data.param.fragment},segment:function(seg){if(typeof seg==="undefined"){return this.data.seg.path}else{seg=seg<0?this.data.seg.path.length+seg:seg-1;return this.data.seg.path[seg]}},fsegment:function(seg){if(typeof seg==="undefined"){return this.data.seg.fragment}else{seg=seg<0?this.data.seg.fragment.length+seg:seg-1;return this.data.seg.fragment[seg]}}}}purl.jQuery=function($){if($!=null){$.fn.url=function(strictMode){var url="";if(this.length){url=$(this).attr(getAttrName(this[0]))||""}return purl(url,strictMode)};$.url=purl}};purl.jQuery(window.jQuery);return purl});


// Wrap the function so it wont pollute the global object
( function( w, $, HBS ) {
  // # Module-wide available properties
  //
  // TEF compiled fields
  var csBaseUrl = '${csUrl}';


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
  CrowdSearcher.prototype.getExecutionByTask = function( inputData, callback ) {
    if ( $.type( inputData ) === 'string' )
      inputData = {
        task: inputData
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

    function isImage( url ) {
      var validUrl = isUrl( url );
      var ext = purl( url ).attr( 'file' ).split( '.' )[1];
      if( ext ) {
        ext = ext.toLowerCase();
        return validUrl && (ext==='jpg' || ext==='png' || ext==='jpeg' || ext==='gif');
      } else {
        return false;
      }
    }
    function isUrl( url ) {
      try {
        return purl( url ).attr( 'protocol' )!=='';
      } catch( ex ) {
        return false;
      }
    }

    function isMail( email ) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test( email );
    }


    if ( !asList ) {
      return '<pre>' + JSON.stringify( object, null, 2 ) + '</pre>';
    } else {
      var out = '<dl class="dl-horizontal">';
      $.each( object, function( key, value ) {
        out += '<dt title="' + key + '">' + key + '</dt>';

        var type = $.type( value );
        if( type==='string' && isMail( value ) ) {
          out += '<dd title="' + value + '"><a href="mailto:' + value + '">' + value + '</a></dd>';
        } else if( type==='string' && isImage( value ) ) {
          out += '<dd title="' + value + '"><img class="img-responsive" src="' + value + '" alt="'+key+'"/></dd>';
        } else if( type==='string' && isUrl( value ) ) {
          out += '<dd title="' + value + '"><a href="' + value + '" target="_blank">' + value + '</a></dd>';
        } else if ( type === 'string' || type === 'number' || type === 'boolean' ) {
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

    // QS
    qs: purl().param(),

    // CS class
    instance: new CrowdSearcher( csBaseUrl ),
    constructor: CrowdSearcher,
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