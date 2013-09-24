slugify = (text)->
  text
  .toString()
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '')

createInput = ( config, name, index )->
  if config.type
    type = config.type
  else
    type = config
  multiple = $.isArray type
  type = type[ 0 ] if $.isArray type


  originalType = type

  type = 'text' if type=='string'
  type = 'text' if type=='platform'
  type = 'checkbox' if type=='boolean'
  placeholder = 'Insert '+name
  id = 'id_'+name
  value = config.default
  if value=='$baseUrl$'
    pathname = location.pathname.split '/'
    pathname.pop() # Remove "new"
    pathname.pop() # Remove "task"
    mountPoint = '/'+pathname.pop()
    if mountPoint.length>1
      mountPoint += '/'
    value = location.protocol+'//'+location.host+mountPoint

  $ctrlGroup = $ '<div></div>'

  $label = $ '<label></label>'
  $label.attr 'for', id


  if type!='checkbox'
    $ctrlGroup.addClass 'form-group'
    $ctrlGroup.append $label
  else
    $ctrlGroup.addClass 'input-group'

  $input = $ '<input />'
  $input.attr 'type', type
  $input.attr 'id', id
  $input.attr 'name', name
  $input.attr 'data-name', name
  $input.attr 'data-multiple', multiple
  #$input.attr 'required', 'required'
  $input.attr 'placeholder', placeholder
  if type!='checkbox'
    $input.addClass 'form-control'

  if type!='checkbox'
    $input.val value
    $ctrlGroup.append $input
  else
    $input.prop 'checked', value
    $wrap = $ '<span class="input-group-addon input-small"></span>'
    $wrap.append $input
    $ctrlGroup.append $wrap
    $ctrlGroup.append $label

  if originalType=='platform'
    $input.val ''
    $input.attr 'role', 'platform'
    $tagsContainer = $ '<div></div>'
    $tagsContainer.addClass 'platform-list'
    $input.parent().prepend $tagsContainer
    $input.tagsManager
      typeahead: true
      prefilled: value
      typeaheadSource: getAvailablePlatform
      validator: checkPlatform
      tagsContainer: $tagsContainer
      onlyTagList: true,
      maxTags: if multiple then 0 else 1

  $label.append name
  return $ctrlGroup

showParams = ( params, $paramContainer )->
  $paramList = $ '.param-list', $paramContainer
  $paramList.empty()

  if params
    index = 1
    $.each params, ( name, type )->
      $paramList.append createInput type, name, index
      index++
getParams = ( $paramContainer )->
  data = {}
  $dataInputList = $paramContainer.find '.param-list input:not(input[type="hidden"]),.param-list select'

  $dataInputList.each ->
    $element = $ this
    multiple = $element.data 'multiple'

    name = $element.data 'name'
    value = $element.val()

    if 'platform'==$element.attr 'role'
      value = $element.siblings( 'input[type="hidden"]' ).val()

    value = value.split( ',' ) if multiple

    # Convert to float
    if 'number'==$element.prop 'type'
      value = parseFloat value, 10
      if multiple
        value = $.map value, ( idx, val )->
          parseFloat val, 10
    # Convert to boolean
    else if 'checkbox'==$element.prop 'type'
      value = $element.prop 'checked'


    data[ name ] = value
    return

  return data

$ ->
  $lists = $ '.list-controller'
  $params = $ '.param-container', $lists
  $params.hide();

  $select = $ '.list-controller-name', $lists

  $select.on 'change', ->
    $name = $ @
    $selected = $ 'option:selected', $name
    $paramContainer = $name.closest( '.list-controller' ).find '.param-container'
    $paramContainer.hide();

    params = $selected.data 'params'
    if params
      showParams params, $paramContainer
      $paramContainer.show();

  $name = $ '#name'
  $alias = $ '#alias'
  $description = $ '#description'
  $landing = $ '#landing'
  $ending = $ '#ending'
  $taskAssignmentStrategy = $ '#task_assignment_strategy_name'

  $name.on 'keyup', ->
    $alias.val slugify @.value

  $send = $ '#send'
  $send.on 'click', ->
    name = $name.val()
    alias = $alias.val()
    alias = undefined if alias==''

    description = $description.val()
    description = undefined if description==''

    landing = $landing.val()
    landing = undefined if landing==''

    ending = $ending.val()
    ending = undefined if ending==''

    $strategy = $ 'option:selected', $taskAssignmentStrategy
    $paramContainer = $taskAssignmentStrategy.closest '.list-controller'
    $paramContainer = $ '.param-container', $paramContainer
    strategyName = $strategy.data 'name'
    taskAssignmentStrategy =
      name: strategyName
      params: getParams $paramContainer
    taskAssignmentStrategy = undefined if not strategyName

    json =
      name: name
      alias: alias
      description: description
      landing: landing
      ending: ending
      taskAssignmentStrategy: taskAssignmentStrategy


    url = $( 'base' ).prop 'href'
    url += 'job/new'


    $saveModal = $ '#save_modal'
    $content = $ '.modal-body', $saveModal
    $footer = $ '.modal-footer', $saveModal
    $saveModal.modal 'show'
    $content.empty()
    $content.append '<div class="text-center">Performing request...</div>'

    req = $.ajax
      url: url

      contentType: 'application/json; charset=UTF-8'
      dataType: 'json'
      processData: true
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }

      method: 'POST'
      data: JSON.stringify json

    req.always ->
      $content.empty()
      $footer.empty()

    req.done (data)->
      $content.append """
        <div class='alert alert-success text-center'>
          <strong>Job posted successfully</strong>
        </div>
      """
      $footer.append """
        <div class='btn-group pull-left'>
          <a href='job/#{data.job}' class='btn btn-small btn-info'>
            <i class='icon-chevron-left'></i>
            Go to Job
          </a>
        </div>
      """

    req.fail (jqXHR, status, err )->
      error = JSON.parse jqXHR.responseText or '{}'
      $content.append """
        <div class='alert alert-error'>
          <strong>#{error.id}</strong>
          <p>#{error.message}</p>
          <pre>#{JSON.stringify( error, null, 2 )}</pre>
        </div>
      """

      $footer.append """
        <button class='btn btn-default' type='button' data-dismiss='modal'>Close</button>
      """