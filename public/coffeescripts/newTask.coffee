slugify = (text)->
  text
  .toString()
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '')

checkPlatform = ( platform )->
  $availablePlatforms = $ '#selected_platforms li[data-name="'+platform+'"]'
  return $availablePlatforms.length>0
getAvailablePlatform = ( query )->
  $availablePlatforms = $ '#selected_platforms li'
  return $availablePlatforms.map( ->
    return $(this).data 'name'
  ).get()

addObject = ( obj )->
  if $.isEmptyObject obj
    return
  $dataList = $ '#objects-list'
  $row = $ '<tr></tr>'
  #$id = $ "<td>#{$dataList.children().length}</td>"
  $action = $ "<td class='cell remove danger'><i class='icon-trash'></i></td>"
  $row.append $action
  $.each obj, ( name, value )->
    $cell = $ "<td></td>"
    $cell.addClass 'cell'
    $cell.attr 'title', value
    $cell.attr 'data-name', name
    $cell.attr 'data-value', value
    $cell.text value
    $row.append $cell
  $dataList.append $row
  return $row

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





addField = ( name, type )->
  $fieldList = $ '#field-list'


  # Add to the fueld list
  $field = $ '<li></li>'
  $field.addClass 'list-group-item'
  $field.append "<span class='label label-info'>#{type}</span> "
  $field.attr 'data-type', type
  $field.attr 'data-name', name
  $field.append name

  $fieldList.append $field


  # Add header to table
  $tableHeaders = $ '#data-header-list'
  $th = $ '<th></th>'
  $th.attr 'data-name', name
  $th.text name
  $tableHeaders.append $th


  # Add to the table footer and header
  inputType = type
  inputType = 'text' if type.toLowerCase()=='string'
  # Objects tab
  $dataInput = $ '#data-input tr'
  $input = $ '<input />'
  $input.addClass 'form-control input-small'
  $input.attr 'placeholder', 'Insert '+name
  $input.attr 'data-name', name
  $input.attr 'type', inputType
  $td = $ '<td></td>'
  $td.append $input
  $dataInput.append $td


createControlPanelEntry = ( $li )->
  $cpLi = $ '<li></li>'

  action = $li.data 'action'
  $cpLi.attr 'data-action', action
  $cpLi.attr 'data-event', $li.data 'event'

  strategy = $li.data 'category'
  if strategy
    $cpLi.attr 'data-strategy', $li.data 'strategy'
    $cpLi.append "<span class='label label-info'>#{strategy}</span> "

  params = $li.data 'params'
  if not $.isEmptyObject params
    $cpLi.attr 'data-params', JSON.stringify params
    $cpLi.attr 'data-html', true
    $cpLi.attr 'data-placement', 'top'
    $cpLi.attr 'data-title', 'Parameters'
    $cpLi.attr 'data-content', '<b>Volo</b> Yeahh'
    $cpLi.popover()

  $cpLi.append action

  return $cpLi






















# Review specific methods
getJsonTaskData = ()->
  task = {}

  # Task info
  task.name = $( '#title' ).val()
  task.description = $( '#question' ).val()
  task.description = undefined if task.description.length==0

  task.landing = $( '#landing_mark' ).val()
  task.landing = undefined if task.landing.length==0

  task.private = $( '#private' ).prop 'checked'
  task.alias = $( '#alias' ).val()
  task.job = $( '#job' ).val()
  task.job = undefined if task.job.length==0

  # Connect to the Job
  #TODO add job
  #task.job = $().val()

  # Task type
  task.operations = []
  # Cycle through selected types
  $selectedTypes = $ '#task_operations > li'
  $selectedTypes.each ->
    $li = $ this
    task.operations.push
      name: $li.data 'category'
      label: $li.data 'name'
      params: $li.data 'params'

  task.operations = undefined if task.operations.length==0

  # Task platforms
  task.platforms = []
  # Cycle through selected platforms
  $selectedPlatforms = $ '#selected_platforms > li'
  $selectedPlatforms.each ->
    $li = $ this
    data = $li.data()
    data.invitation = data.settings.invitation
    data.execution = data.settings.execution
    data.enabled = data.settings.enabled
    task.platforms.push data
  task.platforms = undefined if task.platforms.length==0



  # Task objects
  dataUsed = $( 'input:radio[name=data]:checked' ).val()
  if dataUsed=='external'
    $dataFile = $ '#data-file'
    task.objects = $dataFile.data 'data'
  else if dataUsed=='manual'
    $objectList = $ '#objects-list tr'
    objects = [];
    $objectList.each ->
      $row = $ this

      data =
        name: 'No name'
        data: {}

      $fields = $ 'td', $row
      $fields.each ->
        $field = $ this
        fieldName = $field.data 'name'
        fieldValue = $field.data 'value'
        if fieldName
          data.data[ fieldName ] = fieldValue

      objects.push data

    task.objects = objects;

  task.objects = undefined if not(task.objects) or task.objects.length==0


  # Task strategies
  parseStrategy = ( $strategyName )->
    data = {}
    $selectedStrategy = $ 'option:selected', $strategyName

    # Get the name
    data.name = $selectedStrategy.data 'name'

    # Missing strategy
    if not data.name
      return undefined

    # add events
    data.events = $selectedStrategy.data( 'events' ) || []

    # Get the extra parameters
    $controller = $strategyName.closest '.list-controller'
    data.params = getParams $ '.param-container', $controller

    # return the data
    return data

  task.splittingStrategy = parseStrategy $ '#splitting_strategy_name'
  task.microTaskAssignmentStrategy = parseStrategy $ '#assignment_strategy_name'
  task.implementationStrategy = parseStrategy $ '#execution_strategy_name'
  #task.executionAssignmentStrategy = parseStrategy $ '#strategy-'
  task.invitationStrategy = parseStrategy $ '#invitation_strategy_name'


  # Control rules
  task.controlrules = []
  # First add the strategies
  if task.splittingStrategy
    $.each task.splittingStrategy.events, ( index, event )->
      task.controlrules.push
        event: event,
        type: 'SPLITTING'
    delete task.splittingStrategy.events

  if task.microTaskAssignmentStrategy
    $.each task.microTaskAssignmentStrategy.events, ( index, event )->
      task.controlrules.push
        event: event,
        type: 'MICROTASK_ASSIGN'
    delete task.microTaskAssignmentStrategy.events

  if task.implementationStrategy
    $.each task.implementationStrategy.events, ( index, event )->
      task.controlrules.push
        event: event,
        type: 'IMPLEMENTATION'
    delete task.implementationStrategy.events
  ###
  if task.executionAssignmentStrategy
    $.each task.executionAssignmentStrategy.events, ( index, event )->
      task.controlrules.push
        event: event,
        type: 'EXECUTION_ASSIGN'
    delete task.executionAssignmentStrategy.events
  ###

  if task.invitationStrategy
    $.each task.invitationStrategy.events, ( index, event )->
      task.controlrules.push
        event: event,
        type: 'INVITATION'
    delete task.invitationStrategy.events


  # Then add the rules
  $eventList = $ '.control-panel-list .list > li'
  $eventList.each ()->
    $li = $ this
    data = $li.data()

    task.controlrules.push
      event: data.event
      action: data.name
      params: data.params

  task.controlrules = undefined if task.controlrules.length==0


  return task

convertJson2Html = ( task )->
  html = ""
  #html += "<pre>#{JSON.stringify(task, null,2)}</pre>"

  icon = if task.private then 'icon-lock' else 'icon-unlock'
  html += "<h4>#{task.name} <i class='#{icon} icon-2x'></i></h4>"

  if task.description
    html += "<p><h5>Description:</h5>"
    html += "<blockquote>#{task.description}</blockquote></p>"


  # Task types
  if task.operations
    html += "<h4>Task types:</h4>"
    html += "<ol>"
    $.each task.operations, ->
      html += "<li><span class='label label-info'>#{@name}</span> #{@label}"
      if not $.isEmptyObject @params
        html += ": [ "
        $.each @params, ( key, val )->
          html += "<code>#{key}</code>: "
          html += "<tt><b>#{val}</b></tt>, "
        html = html.slice 0, -2
        html += " ]"
      html += "</li>"
    html += "</ol>"


  # Task platforms
  if task.platforms
    html += "<h4>Selected platforms:</h4>"
    html += "<ul>"
    $.each task.platforms, ->
      html += "<li><strong>#{@name}</strong>"
      if not $.isEmptyObject @params
        html += ": [ "
        $.each @params, ( key, val )->
          html += "<code>#{key}</code>: "
          html += "<tt><b>#{val}</b></tt>, "
        html = html.slice 0, -2
        html += " ]"
      html += "</li>"
    html += "</ul>"


  # Strategies
  printStrategy = ( strategy, name )->
    strategyHtml = ''
    if strategy
      strategyHtml += "<p>#{name} strategy: <code>#{strategy.name}</code>"

      # if we have parameters
      if not $.isEmptyObject( strategy.params )
        strategyHtml += " <b>[</b>"

        # cycle though the parameters
        $.each strategy.params, ( key, value )->
          if key!='name'
            strategyHtml += "<tt>#{key}</tt>=#{value},"

        strategyHtml = strategyHtml.slice 0, -1
        strategyHtml += "<b>]</b>"

      strategyHtml += "</p>"
    return strategyHtml

  if  task.splittingStrategy or
      task.microTaskAssignmentStrategy or
      task.implementationStrategy or
      task.executionAssignmentStrategy or
      task.invitationStrategy

    html += "<h4>Planning:</h4>"

    html += printStrategy task.splittingStrategy, 'Splitting'
    html += printStrategy task.microTaskAssignmentStrategy, 'Microtask assignment'
    html += printStrategy task.implementationStrategy, 'Execution'
    #html += printStrategy task.executionAssignmentStrategy, 'Execution assignment'
    html += printStrategy task.invitationStrategy, 'Invitation'


  # Control rules

  if task.controlrules
    html += "<h4>Control rules:</h4>"
    html += "<ol>"
    $.each task.controlrules, ( key, value )->
      html += "<li>On <code>#{@event}</code> will run "
      if @action
        html += "<tt><b>#{@action}</b></tt>."
      else
        html += "the <tt><b>#{@type}</b></tt> strategy."
      html += "</li>"
    html += "</ol>"



  return html

updateReview = ( $review )->
  task = getJsonTaskData()
  html = convertJson2Html task
  $review.hide()
  $review.empty()
  $review.append html
  $review.show()
  console.log task










appendParams = ( $li )->
  params = $li.data 'params'
  if not $.isEmptyObject params
    $li.attr 'data-params', JSON.stringify( params )

    $data = $ '<ul></ul>'
    $data.addClass 'data-param-list'
    $data.hide()

    #$data.addClass 'dl-horizontal'
    $.each params, ( name, value )->
      $data.append "<li><code title='#{name}'><strong>#{name}:</strong></code><tt title='#{value}'>#{value}</tt></li>"

    $li.append $data

    $li.click ->
      $data.slideToggle()

createListElement = ( data )->
  #name, data, event, category
  name = data.name
  params = data.params
  event = data.event
  category = data.category
  settings = data.settings

  $li = $ '<li></li>'
  $li.addClass 'list-group-item'

  # Add action if present
  if category
    $li.append "<span class='label label-info'>#{category}</span> "
    $li.attr 'data-category', category

  # Add name
  $li.attr 'data-name', name
  $li.append "<span title='#{name}' class='name'>#{name}</span>"

  # Add event if present
  if event
    $li.attr 'data-event', event

  # Add parameters if present
  if params
    $li.attr 'data-params', JSON.stringify params
    appendParams $li

  # Add settings if present
  if settings
    $li.attr 'data-settings', JSON.stringify settings

  $removeBtn = $ '<span></span>'
  $removeBtn.addClass 'label label-danger'
  $removeBtn.append '<i class="icon icon-trash"></i>'
  $li.prepend ' '
  $li.prepend $removeBtn

  $removeBtn.click ->
    $li.remove()
    updateControlPanel()

  return $li

getSettings = ( $paramContainer )->
  settings = {}
  $settingInputList = $paramContainer.find 'input:not(.param-list input), select:not(.param-list select)'

  $settingInputList.each ->
    $element = $ this

    name = $element.data 'name'
    value = $element.val()

    # Convert to boolean
    if 'checkbox'==$element.prop 'type'
      value = $element.prop 'checked'

    # if not available then is false
    if $element.prop 'disabled'
      value = false

    settings[ name ] = value
    return

  return settings

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

showEvents = ( events, $paramContainer )->
  $eventList = $ '.event-list', $paramContainer

  $eventList.empty()

  if events
    $eventList.append '<code>'+events.join( '</code> <tt>and</tt> <code>' )+'</code>'
    $eventList.prev().show()
  else
    $eventList.prev().hide()

showParams = ( params, $paramContainer )->
  $paramList = $ '.param-list', $paramContainer

  $paramList.empty()

  if params
    index = 1
    $.each params, ( name, type )->
      $paramList.append createInput type, name, index
      index++

updateControlPanel = ->
  $controlPanelList = $ '.control-panel-list'

  # Hide and empty the control panel lists
  $controlPanelList.find( '.list' ).empty();
  $controlPanelList.hide()

  $rules = $ '.events > li'
  if $rules.length>0
    $clonedRules = $rules.clone()
    $clonedRules.each ->
      $rule = $ this
      $rule.find( '.label-danger' ).remove();
      event = $rule.data 'event'

      # Find corresponding control panel list
      $container = $ ".control-panel-#{event}"
      $list = $ '.list', $container
      # Add the rule to the list
      $list.append $rule

      # Show the list container
      $container.show()



addRule = ( events, action, strategy, params, mapping, $container )->
  strategy = strategy || {}
  if not $.isArray events
    events = [ events ]

  $.each events, (index, event )->
    $eventContainer = $ ".event-#{event}", $container
    $eventContainer.show()
    $eventList = $ '.events', $eventContainer

    if mapping
      params = {}
      $.each mapping, ( source, dest )->
        params[ dest ] = strategy.params[ source ]

    listData =
      name: action
      params: params
      event: event
      category: strategy.name
    $eventList.append createListElement listData
  updateControlPanel()

addToList = ( data )->
  $container = data.container
  $container.append createListElement data


$ ->
  converter = new Showdown.converter()
  ###
  $body = $ document.body
  navHeight = $('.page-header:first').outerHeight true

  $body.scrollspy
    target: '.side-navigation',
    offset: navHeight+10


  navLinkClick = ( el )->
    return if el.length==0

    $el = $ el
    dest = $el.attr 'href'
    highlightPanel dest
    return dest

  $body.on 'activate.bs.scrollspy', ( e )->
    navLinkClick $( e.target ).children 'a'

  highlightPanel = ( panel )->
    $( '.panel' ).removeClass 'panel-primary'
    $( '.panel', panel ).addClass 'panel-primary'

  $( '.panel' ).on 'click', ->
    $p = $ @
    if not $p.hasClass 'panel-primary'
      highlightPanel $p.parent()
  ###
  $( '.collapse' ).on 'show.bs.collapse', ( e )->
    id = e.target.id
    $groups = $ '.accordion-group.active'
    $activeLink = $ '.side-navigation .list-group-item.active'
    $activeLink.removeClass 'active'
    $groups.removeClass 'active'

    $parent = $( e.target ).closest '.accordion-group'
    $parent.addClass 'active'
    $links = $ '.side-navigation .list-group-item[data-target="#'+id+'"][data-toggle="collapse"]'
    $links.addClass 'active'

  $( '[href^="#"]:not([data-modal])' ).click ( e )->
    e.preventDefault()


  $( '#save' ).on 'show.bs.modal', ->
    updateReview $ '#review'

  #$( '[id^="data_"]' ).hide()
  #$( '#data_external' ).show()
  $( 'a[href^="#data_"]' ).click ( evt )->
    $link = $ evt.currentTarget
    $radio = $ 'input:radio', $link
    $radio.prop 'checked', true
    dest = $link.attr 'href'
    #$( '[id^="data_"]' ).hide()
    #$( dest ).show()

  # Task question management
  $question = $ '#question'
  $questionPreview = $ '#question_preview'
  $question.on 'change keyup', ->
    $questionPreview.html converter.makeHtml $question.val()

  # Alias
  $title = $ '#title'
  $job = $ '#job'
  $alias = $ '#alias'
  $title.on 'change keyup', ->
    $alias.val slugify $title.val()


  # Landing page preview
  $landing = $ '#landing_mark'
  $landingPreview = $ '#landing_preview'
  $landing.on 'change keyup', ->
    $landingPreview.html converter.makeHtml $landing.val()

  # List controller
  $listControllers = $ '.list-controller'
  $listControllers.each ->
    $controller = $ this
    $name = $ '.list-controller-name', $controller
    $btnAdd = $ '.list-controller-add', $controller
    $selected = $ '.list-controller-selected', $controller

    $paramContainer = $ '.param-container', $controller

    # Handle slection change to update the param list
    $name.on 'change', ->
      $paramContainer.hide()

      $selectedElement = $ 'option:selected', $name
      data = $selectedElement.data()
      if data.type=='type'
        console.log 'type'
        $label = $ '#task_operation_label'
        # Generate custom label
        idx = $selected.find( 'li[data-category="'+data.name+'"]' ).length
        label = data.name+'_'+idx
        $label.val label
      else if data.type=='platform'
        console.log 'platform'
        $invitation = $ '#platform_invitation'
        $execution = $ '#platform_execution'
        $enabled = $ '#platform_enabled'

        $invitation.prop 'checked', false
        $invitation.prop 'disabled', !data.invitation
        $execution.prop 'checked', false
        $execution.prop 'disabled', !data.execution
        $enabled.prop 'checked', data.enabled
      else if data.type=='strategy'
        console.log 'strategy'
        showEvents data.events, $paramContainer
      else if data.type=='rule'
        console.log 'rule'
      else if data.type=='customrule'
        console.log 'customrule'

      showParams data.params, $paramContainer

      if data.params
        $paramContainer.show()
    # Trigger the change event on start
    $name.change()


    # Handle btn add click
    $btnAdd.click ->
      $selectedElement = $ 'option:selected', $name
      data = $selectedElement.data()

      if data.name
        params = getParams $paramContainer
        settings = getSettings $paramContainer

        if data.type=='type'
          console.log 'type'
          $label = $ '#task_operation_label'

          addToList
            name: $label.val()
            params: params
            container: $selected
            category: data.name

          $label.val ''
        else if data.type=='platform'
          console.log 'platform'
          addToList
            name: data.name
            params: params
            container: $selected
            settings: settings

        else if data.type=='strategy'
          console.log 'strategy'
        else if data.type=='rule'
          console.log 'rule'
          strategy =
            name: data.name
            params: params
          $.each data.actions, ->
            @mapping = {} if not @mapping
            @params = {} if not @params
            addRule @events, @action, strategy, @params, @mapping, $controller
        else if data.type=='customrule'
          console.log 'customrule'
          $event = $ '#custom_rule_event', $controller
          event = $event.val()
          addRule event, data.name, null, params, null, $controller


        # Select none
        $name.val 'None'
        $name.change()






  # Data management
  # External File
  $dataFile = $ '#data-file'
  $dataPreview = $ '#dataPreviewArea'
  $dataFile.on 'change', ( evt )->
    $dataFile.prev().val $dataFile.val()

    reader = new FileReader();
    reader.onerror = ->
      console.error arguments
    reader.onprogress = ->
      console.log arguments
    reader.onabort = ->
      console.log 'Aborted'

    reader.onloadstart = ->
      console.log 'Loading'
    reader.onload = (evt)->
      console.log 'Load complete'

      try
        $data = $dataPreview.children '.data'
        $data.empty()

        json = JSON.parse evt.target.result
        data = json.data

        $dataFile.attr 'data-data', JSON.stringify data

        for rowIndex in [0..4]
          row = data[ rowIndex ]
          if row
            $data.append "<pre>#{JSON.stringify( row.data, null, 2 )}</pre>"
        $dataPreview.show()
      catch err
        console.error err
        alert "Unable to parse JSON file\n#{err.message}"

    reader.readAsText evt.target.files[0]


  $btnBrowse = $dataFile.next()
  $btnBrowse.click ->
    $dataFile.click()



  $fieldList = $ '#field-list'
  $fieldName = $ '#field-name'
  $fieldType = $ '#field-type'
  $btnAddField = $ '#addField'
  $btnAddField.on 'click', ->
    if not $fieldName[0].checkValidity()
      alert "Thou should insert a valid name"
      $fieldName[0].select()
      return

    if $fieldList.find( "li[data-name='#{$fieldName.val()}']" ).length!=0
      alert "Thou should insert a unique field name"
      $fieldName[0].select()
      return

    fieldName = $fieldName.val()
    addField fieldName, $fieldType.val()

    $fieldName[0].select()


  $( '#objects-list' ).on 'click', '.remove', ( evt )->
    $row = $( evt.currentTarget ).closest 'tr'
    $row.remove()

  $btnAddObject = $ '#btnAddObject'
  $btnAddObject.on 'click', ->
    $container = $ '#data-input'
    addObject getParams $container
























  # Make list sortable
  $sortable = $ '.sortable'
  $sortable.sortable
    placeholder: 'empty-placeholder list-group-item'
  $sortable.disableSelection()


  $saveModal = $ '#save_modal'
  $content = $ '.modal-body', $saveModal
  $footer = $ '.modal-footer', $saveModal
  $saveBtn = $ '#save_btn'
  $saveBtn.click ->
    json = getJsonTaskData()

    # hacks
    json.controlrules = json.controlrules || []
    json.controlrules.push
      event: 'ADD_MICROTASK'
      action: 'init_platforms'
    # END hacks



    url = $( 'base' ).prop 'href'
    url += 'task/new'

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
      $job.val data.job
      $alias.closest( '.form-group' ).hide()
      $content.append """
        <div class='alert alert-success text-center'>
          <strong>Task posted successfully</strong>
        </div>
      """
      $footer.append """
        <div class='btn-group pull-left'>
          <a href='task/#{data.task}' class='btn btn-small btn-info'>
            <i class='icon-chevron-left'></i>
            Go to Task
          </a>
          <a href='job/#{data.job}' class='btn btn-small btn-info'>
            <i class='icon-chevron-left'></i>
            Go to Job
          </a>
        </div>
        <div class='btn-group'>
          <button class='btn btn-small btn-default' data-dismiss='modal' aria-hidden='true'>
            <i class='icon-edit'></i>
            Close
          </button>
          <a href='task/new' class='btn btn-small btn-info'>
            <i class='icon-file-alt'></i>
            New Task
          </a>
        </div>
      """

    req.fail (jqXHR, status, err )->
      error = JSON.parse jqXHR.responseText or '{}'
      $content.append """
        <div class='alert alert-error'>
          <strong>#{error.id}</strong>
          <p>#{error.message}</p>
        </div>
      """

      $footer.append """
        <button class='btn btn-default' type='button' data-dismiss='modal'>Close</button>
      """