jQuery.event.props.push 'dataTransfer'

window.round = (number, decimal=3 )->
  pow = Math.pow 10, decimal
  number *= pow
  number = Math.round number
  number /= pow

$ ->
  $( 'button.delete' ).click ->
    $btn = $ this
    rel = $btn.attr 'rel'
    href = $btn.attr 'href'

    url = $( 'base' ).prop 'href'
    url += rel+'/'+href


    confirmed = confirm 'Delete the '+rel+'?'
    if not confirmed
      return

    req = $.ajax
      url: url
      dataType: 'json'
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
      method: 'DELETE'
    req.done (data, status)->
      alert "#{rel} removed!"
      backUrl = $( 'base' ).prop 'href'
      location.href = backUrl+'jobs'
    req.fail (xhr, status, message )->
      alert "Oooops...\n#{message}"

  $dropzone = $ '.dropzone'
  if $dropzone.length>0
    $( document.body ).on 'drop', (evt)->
      evt.preventDefault()

  # create the hidden input filed
  $hiddenInput = $dropzone.find 'input[type="file"]'
  if $hiddenInput.length!=1
    $hiddenInput = $ '<input type="file">'
    $dropzone.append $hiddenInput
    $hiddenInput.prop 'multiple', true

  $dropzone.on 'click', 'input[type="file"]', ( evt ) ->
    evt.stopImmediatePropagation()

  $dropzone.on 'change', 'input[type="file"]', ( evt ) ->
    $dropzone.trigger 'fileReady', [ @files, null ]


  $dropzone.on 'click', ( evt ) ->
    $hiddenInput.trigger 'click'


  $dropzone.on 'drop', ( evt ) ->
    $( @ ).removeClass 'active'
    $dropzone.trigger 'fileReady', [ evt.dataTransfer.files, evt.dataTransfer ]

  $dropzone.on 'dragenter', (evt) ->
    evt.dataTransfer.dropEffect = 'copy'
    $( @ ).addClass 'active'

  $dropzone.on 'dragleave', (evt)->
    $( @ ).removeClass 'active'