var IndigoAppName_Original = "IndigoServer";
var IndigoAppName = IndigoAppName_Original;
var IndigoWidgetDebug = false;
var currentView = "Devices";
var IndigoWidgetName = "IndigoWidget";
var IndigoWidgetVersion = "2.0";
var IndigoUpdateTimer = "20"; // seconds
var timerInterval;
var numTransactions = 0;
var IndigoWidgetInitialWidth = 381;
var IndigoWidgetInitialHeight = 380;

var recentUpdateInterval;
var recentUpdateTime = 2;

// Use this for remote applescripting to server Indigo
var IndigoServerIP = "";
var IndigoServerUsername = "";
var IndigoServerPassword = "";
var IndigoRemoteServer = false;

// UI Handling
//----------------------------------------------------------------------------
// Function: showContent
//  Obtain and display the content by name. This is like the 'refresh' function 
//  and should be called whenever it is necessary to refresh the widget's view.
//
// Parameters:
//  contentName - name of the content view to show: Devices, Actions, Variables
//
// See also:
//      <getDevices> <getActions> <getDevices>
//----------------------------------------------------------------------------
function showContent(contentName) {
    IndigoDebug("showContent( " + contentName + " )");

    if(contentName == "Devices")
        getDevices();
    else if(contentName == "Actions")
        getActions();
    else if(contentName == "Variables")
        getVariables();
    else
        getDevices();

    // only update the nav item if it is changing   
    if(contentName != currentView)
    {
        var contentLink = getObj(currentView+"NavText");
        contentLink.setAttribute('class','navtext');

        currentView = contentName;
        contentLink = getObj(currentView+"NavText");
        contentLink.setAttribute('class','navtextSelected');
    }

}

function pausedRefresh() {
    showContent(currentView);    
}

//----------------------------------------------------------------------------
// Function: load
//  Load the widget for the first time. This is the "init"
//
// Parameters:
//
// See also:
//      <show> 
//----------------------------------------------------------------------------
function load() {	
  name = IndigoWidgetName;
  version = IndigoWidgetVersion;
    
  IndigoDebug("load()");
    
	window.resizeTo(IndigoWidgetInitialWidth, IndigoWidgetInitialHeight);
	if (!window.widget) {
		show();
	}
}

//----------------------------------------------------------------------------
// Function: show
//  Show the widget when the dashboard is displayed. This function starts up
//  the automatic timer which calls <showContent> at specific intervals.
//
// Parameters:
//
// See also:
//      <load> <onhide> <showContent>
//----------------------------------------------------------------------------
function show() {
	IndigoDebug("show");
	
    showContent(currentView);
    startTimer();
}

function startTimer() {
	if (timerInterval == null) {
        timerInterval = setInterval("showContent(currentView);", IndigoUpdateTimer * 1000);
    }
}

function stopTimer() {
	if (timerInterval != null) {
        clearInterval(timerInterval);
        timerInterval = null;
	}
}

//----------------------------------------------------------------------------
// Function: onhide
//  The dashboard has been minimized, hide the widget. Shut off the automatic 
//  timer
//
// See also:
//      <load> <show> <onremove>
//----------------------------------------------------------------------------
function onhide() {
    stopTimer();
}

//----------------------------------------------------------------------------
// Function: onremove
//  The widget has been 'closed', clean up the timer and anything else.
//
// Parameters:
//
// See also:
//      <load> <onhide> <show>
//----------------------------------------------------------------------------
function onremove() {
    if (timerInterval != null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

if (window.widget) {
    widget.onshow = show;
    widget.onhide = onhide;
    widget.onremove = onremove;
    
    updateFromPreferences();
}

//----------------------------------------------------------------------------
// Function: updateFromPreferences
//  Updates all of the widget variables that were stored in the preferences
//
// See also:
//      <updatePreferences> 
//----------------------------------------------------------------------------
function updateFromPreferences() {
    IndigoServerIP = widget.preferenceForKey("serverIP");
    IndigoServerUsername = widget.preferenceForKey("serverUsername");
    IndigoServerPassword = widget.preferenceForKey("serverPassword");
    IndigoRemoteServer = widget.preferenceForKey("remoteServer");
    
    if(     (IndigoServerIP != '')
        &&  (IndigoServerUsername != '')
        &&  (IndigoServerPassword != '')
        &&  (IndigoRemoteServer)
    ) {
        IndigoAppName = IndigoAppName_Original + "\" of machine \"eppc://" + IndigoServerUsername + ":" + IndigoServerPassword + "@" + IndigoServerIP;
    }
    else
        IndigoAppName = IndigoAppName_Original;
}

//----------------------------------------------------------------------------
// Function: showBack
//  Show the back of the widget and hide the front.
//
// See also:
//      <hideBack> 
//----------------------------------------------------------------------------
function showBack() {
    // stop the timer from updating
    stopTimer();
    alert(IndigoServerIP);
    IndigoServerIP = widget.preferenceForKey("serverIP");
    IndigoServerUsername = widget.preferenceForKey("serverUsername");
    IndigoServerPassword = widget.preferenceForKey("serverPassword");
    IndigoRemoteServer = widget.preferenceForKey("remoteServer");
    if(IndigoServerIP != undefined && IndigoServerIP != "")
        getObj("serverIP").value = IndigoServerIP;
    if(IndigoServerUsername != undefined && IndigoServerUsername != "")
        getObj("serverUsername").value = IndigoServerUsername;
    if(IndigoServerPassword != undefined && IndigoServerPassword != "")
        getObj("serverPassword").value = IndigoServerPassword;
    if(IndigoRemoteServer != undefined && IndigoRemoteServer != "")
        getObj("remoteServer").value = IndigoRemoteServer;

    var front = document.getElementById("front");
    var back = document.getElementById("back");
    if (window.widget)
        widget.prepareForTransition("ToBack");

    front.style.display="none";
    back.style.display="block";

    if (window.widget)
        setTimeout ('widget.performTransition();', 0);  
}

//----------------------------------------------------------------------------
// Function: hideBack
//  Hide the back of the widget and show the front.
//
// See also:
//      <hideBack> 
//----------------------------------------------------------------------------
function hideBack() {
    //start the timer updating again
    startTimer();
     
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    widget.setPreferenceForKey(getObj("serverIP").value, "serverIP");
    widget.setPreferenceForKey(getObj("serverUsername").value, "serverUsername");
    widget.setPreferenceForKey(getObj("serverPassword").value, "serverPassword");
    widget.setPreferenceForKey(getObj("remoteServer").checked, "remoteServer");

    updateFromPreferences();

    if (window.widget)
        widget.prepareForTransition("ToFront");

    back.style.display="none";
    front.style.display="block";
    exitflip();
    if (window.widget)
        setTimeout ('widget.performTransition();', 0);
        
}

//----------------------------------------------------------------------------
// Function: changeDim
//  change the Dim (brightness) of an object and it's displayed value
//
// Parameters:
//  slider - slider object which contains the name and value and device id of the 
//          device to change
//
// See also:
//      <setDeviceValue>
//----------------------------------------------------------------------------
function changeDim(slider) {
    var slider_value = document.getElementById(slider.getAttribute("name") + '_value');
    slider_value.innerText = slider.value + "%";
    
    setDeviceValue(slider.getAttribute("device"), slider.value);
}

//----------------------------------------------------------------------------
// Function: createDeviceRow
// add data to the next row in the widget body. Rows have 
// alternating (light and dark backgound). The title and date as displayed 
// for each item. The link is used  when the user clicks on a device. 
//
// Parameters:
//  title - title of the device
//  state - current state (true or false) of the device (on or off)
//  supportsDim - true if the device is dimmable (lamp), false if it does not
//  value - current value of dimmable device (0 ~ 100)
//  even - simple value that flips b/w 0,1 to determine if row is light or dark colored
// Returns:
//  Adds a device row, on/off state, and possible slider dimmer to the widget
//  by manipulating the DOM.
//
// See also:
//      <getDevices>
//----------------------------------------------------------------------------
function createDeviceRow (title, state, supportsDim, value, even) {
	var row = document.createElement ('div');
	row.setAttribute ('class', 'row ' + (even ? 'light' : 'dark'));
	
	var title_div = document.createElement ('div');
	title_div.innerText = title;
	title_div.setAttribute ('class', 'title');
	title_div.setAttribute ('the_device',title);
	title_div.setAttribute ('state',state);
   	title_div.setAttribute ('onclick', 'clickOnDevice (event, this);');	

   	IndigoDebug("createDeviceRow: " + title_div.getAttribute("the_device"));

   	row.appendChild (title_div);


	if (state != null)
	{
	   if(supportsDim == 'true')
	   {
            var slider_div = document.createElement ('div');
            var slider_form = document.createElement ('form');
            var slider_value = document.createElement ('span');
            var slider_input = document.createElement ('input');
            slider_div.appendChild(slider_form);
            slider_div.setAttribute ('class', 'slider');
            
            slider_form.setAttribute('form','#');
            slider_form.appendChild(slider_input);
            
            slider_value.setAttribute ('id', 'slider_' + title + '_value');
            slider_value.setAttribute ('class', 'slider_value');
            slider_value.innerText = value+'%';
            slider_form.appendChild(slider_value);
            
            slider_input.setAttribute ('name', 'slider_' + title);
            slider_input.setAttribute ('class', 'slider_input');
            slider_input.setAttribute('type','range');
            slider_input.setAttribute('min','0'); 
            slider_input.setAttribute('max','100'); 

// Previous technique that broke with WebKit change by Safari 5.0 (2010/06/17):
//          slider_input.setAttribute('value',value);
// New technique that seems to work correctly:
			slider_input.value = value;

            slider_input.setAttribute ('device', title);
            slider_input.setAttribute('onmouseup','changeDim(this);');

            row.appendChild (slider_div);	
       }		

        // Create the div and accompanying span, which will hide the text & replace with the lightbulb.
		var state_div = document.createElement ('div');
		var state_span = document.createElement ('span');
        if(supportsDim == 'true')
        {
            state_div.setAttribute ('class', 'state bulb' + state);
        }    
        else
            state_div.setAttribute ('class', 'state device' + state);

		state_span.setAttribute ('class', 'state');
            
		if(state == "true")
		  state_span.innerText = "100%";
        else
          state_span.innerText = "0%";
		    
		state_div.setAttribute ('the_device',title);
		state_div.setAttribute ('state',state);
    	state_div.setAttribute ('onclick', 'clickOnDevice (event, this);');

        state_div.appendChild(state_span);
		row.appendChild (state_div);
	}

	return row;	
}

//----------------------------------------------------------------------------
// Function: createActionRow
//  Creates a new row with an Indigo Action Group
//
// Parameters:
//  title - title of the action group, used to display the name 
//  even - flipped flag if the row is even or odd (dark or light row)
//
// Returns:
//  This function returns a "row" div element which can be inserted into the content 
//  view of the widget
// See also:
//       <createDeviceRow> <createVariableRow>
//----------------------------------------------------------------------------
function createActionRow (title, even) {
	var row = document.createElement ('div');
	row.setAttribute ('class', 'row ' + (even ? 'light' : 'dark'));
	
	var title_div = document.createElement ('div');
	title_div.innerText = title;
	title_div.setAttribute ('class', 'title');
	title_div.setAttribute ('the_device',title);
   	title_div.setAttribute ('onclick', 'triggerAction ("'+title+'");');
	row.appendChild (title_div);

	return row;	
}

//----------------------------------------------------------------------------
// Function: createVariableRow
//  Creates a new row with an Indigo Variable
//
// Parameters:
//  title - title of the variable, used to display the name 
//  state - current state (true or false) of the variable
//  even - flipped flag if the row is even or odd (dark or light row)
//
// Returns:
//  This function returns a "row" div element which can be inserted into the content 
//  view of the widget
// See also:
//       <createDeviceRow> <createActionRow>
//----------------------------------------------------------------------------
function createVariableRow (title, state, even) {
	var row = document.createElement ('div');
	row.setAttribute ('class', 'row ' + (even ? 'light' : 'dark'));
	
	var title_div = document.createElement ('div');
	title_div.innerText = title;
	title_div.setAttribute ('class', 'title');
	title_div.setAttribute ('the_device',title);
	title_div.setAttribute ('state',state);
	row.appendChild (title_div);

	if (state != null)
	{		
        // Create the div and accompanying span, which will hide the text & replace with the lightbulb.
		var state_div = document.createElement ('div');
		var state_span = document.createElement ('span');

        // removed since no icon is to be shown
//		state_div.setAttribute ('class', 'variable variable' + state);
        state_div.setAttribute ('class', 'state device' + state);
		state_span.setAttribute ('class', 'state');
		  
		state_div.setAttribute ('the_device',title);
		state_div.setAttribute ('state',state);
        if(state != "true" && state != "false")
        {
            state_div.setAttribute ('class', 'state device');
            state_div.innerHTML = state;
            state_div.setAttribute ('style','width: 80%;');
        }
        IndigoDebug(state_div.getAttribute('class'));

        state_div.appendChild(state_span);
		row.appendChild (state_div);
	}

	return row;	
}

//----------------------------------------------------------------------------
// Function: clickOnDevice
//  Handle user clicking on a device (turn on/off). 
//
//  This function calls the "showContect(currentView)" or update view
//
// Parameters:
//  event - event object, not currently used
//  div - div element which contains the_device (name of the device) and state (on or off)
//
// Returns:
//  
//----------------------------------------------------------------------------
function clickOnDevice(event, div) {
    IndigoDebug("Click On Device: " + div.getAttribute("the_device"));

    if(div.getAttribute("state") == "true")
          turnDeviceOnOff(div.getAttribute("the_device"), "off");
    else
          turnDeviceOnOff(div.getAttribute("the_device"), "on");
    
//    showContent(currentView);
}

//----------------------------------------------------------------------------
// Function: IndigoDebug
//  A utility function for outputting debug information.
//
//  This function uses the IndigoWidgetDebug global variable. Any function 
//  block can arbitrarily call this function. However, debugging info is only 
//  output when IndigoWidgetDebug is true.
//
//----------------------------------------------------------------------------
function IndigoDebug(debugOutput) {
    if(IndigoWidgetDebug)
    {
        alert("IndigoWidget: " + debugOutput);
    }
}

//////////////////////
// Indigo Functions //
//////////////////////

//----------------------------------------------------------------------------
// Function: endHandler
//  Simple asynchronous receiver function
//
// Parameters:
//
//  obj - widget.system() command object, has obj.outputString and obj.errorString
//----------------------------------------------------------------------------
function endHandler(obj) {
    IndigoDebug("endHandler status: " + obj.status);
    IndigoDebug("endHandler output:" + obj.outputString);
    IndigoDebug("endHandler error: " + obj.errorString);

    if(obj.status != 0) {
    	getObj("statusbar").innerHTML = "error";
    	alert(obj.erroString);
    }
    spinLockDecrement();

    // do a recent update check
    recentUpdateInterval = setTimeout("pausedRefresh();", recentUpdateTime * 1000);
}
function IndigoAppleScript(asCommand, callbackHandler, refreshingUI) {
    asCommand = "/usr/bin/osascript" + asCommand;
    widget.system(asCommand, callbackHandler);
   	spinLockIncrement(refreshingUI);

   	IndigoDebug("AppleScript Command = " + asCommand);
   	IndigoDebug("NumTransactions: " + numTransactions);
   	
}
//----------------------------------------------------------------------------
// Function: turnDeviceOnOff
//  Sends a command to Indigo to change the state (on or off) of a device
//
// Parameters:
//  deviceName - Indigo string name of the device
//  deviceState - new state to change the device, on or off
//
// Returns:
//  
//----------------------------------------------------------------------------
function turnDeviceOnOff(deviceName, deviceState) {
    var asCommand = " -e 'tell application \""+IndigoAppName+"\"'"   
            + " -e 'turn " + deviceState + " \"" + deviceName + "\"'"   
        + " -e \"end tell\"";
    IndigoAppleScript(asCommand, endHandler, false);
}

//----------------------------------------------------------------------------
// Function: setDeviceValue
//  Sets the value (brightness) of an Indigo Device
//
// Parameters:
//
//  deviceName - Indigo string name of the device
//  deviceValue - new value to set the device, 0 ~ 100%
//
// Returns:
//  
//----------------------------------------------------------------------------
function setDeviceValue(deviceName, deviceValue) {
    IndigoDebug("Dimming: " + deviceName + " to " + deviceValue);


    var asCommand = " -e 'tell application \""+IndigoAppName+"\"'"
            + " -e 'dim \"" + deviceName + "\" to "+ deviceValue + "'"
        + " -e \"end tell\"";
    IndigoAppleScript(asCommand, endHandler, false);
}

//----------------------------------------------------------------------------
// Function: triggerAction
//  Triggers an action in Indigo
//
// Parameters:
//
//  actionName - Indigo string name of the action
//
// Returns:
//  
//----------------------------------------------------------------------------
function triggerAction(actionName) {
    var asCommand = " -e 'tell application \""+IndigoAppName+"\"'"
            + " -e 'execute group \"" + actionName + "\"'"
    + " -e \"end tell\"";

    IndigoAppleScript(asCommand, endHandler, false);
}

//----------------------------------------------------------------------------
// Function: getDevices
//  Gets all of the Indigo devices that have checked "Show in UI" and adds them
//  as rows to the widget.
//
//  Because the Applescript call has badly formatted array of the devices, the extra 
//  whitespace must be removed to allow proper device name matching.
//
// Parameters:
//
// Returns:
//  This function creates the content of the widget by calling createDeviceRow for 
//  each device that exists in Indigo and is marked as "Show in UI"
//
//  See Also:
//      <createDeviceRow> <getActions> <getVariables>
//----------------------------------------------------------------------------
function getDevices() {
    var asCommand = " -e 'set deviceNames to {}'"
            + " -e'set deviceStates to {}'"
            + " -e'set deviceDoesDim to {}'"
            + " -e'set deviceValues to {}'"
            + " -e 'tell application \"" + IndigoAppName + "\"'"
                + " -e 'repeat with curDevice in devices'"
                + " -e 'if(display in remote ui of curDevice) is true then'"
                    + " -e 'set deviceNames to deviceNames & (name of curDevice)'"
                    + " -e 'set deviceStates to deviceStates & (on state of curDevice)'"
                    + " -e 'set deviceDoesDim to deviceDoesDim & (supports dimming of curDevice)'"
                    + " -e 'set deviceValues to deviceValues & (brightness of curDevice)'"
                + " -e 'end if' -e 'end repeat'"
                + " -e 'return deviceNames & \": \" & deviceStates & \": \" & deviceDoesDim & \": \" & deviceValues'"
            + " -e 'end tell'";
    IndigoAppleScript(asCommand, getDevicesHandler, true);
}

function getDevicesHandler(obj) {
    spinLockDecrement();
    if(obj != null)
    {
    if(spinLockFree() && obj.status == 0)
    {
        var contents = getObj('contents');
        while (contents.hasChildNodes())
        {
            contents.removeChild(contents.firstChild);
        }
        var even = true;
        if(obj.outputString != undefined)
        {
            var columnsArray = obj.outputString.split(", : ,");
            var devicesArray = columnsArray[0].split(",");
            var deviceStateArray = columnsArray[1].split(",");
            var deviceDimsArray = columnsArray[2].split(",");
            var deviceValueArray = columnsArray[3].split(",");
            for(var i=0; i<devicesArray.length; ++i)
            {
                // trim the whitespace
                devicesArray[i] = devicesArray[i].replace(/^\s*(.*?)\s*$/g, "$1");
                deviceStateArray[i] = deviceStateArray[i].replace(/^\s*(.*?)\s*$/g, "$1");
                deviceDimsArray[i] = deviceDimsArray[i].replace(/^\s*(.*?)\s*$/g, "$1");
                deviceValueArray[i] = deviceValueArray[i].replace(/^\s*(.*?)\s*$/g, "$1");
                // create the rows
                var row = createDeviceRow (  devicesArray[i], 
                                             deviceStateArray[i], 
                                             deviceDimsArray[i],  
                                             deviceValueArray[i], 
                                             even);
                even = !even;
                
                contents.appendChild (row);
                
                // update the scrollbar so scrollbar matches new data
            }
        }
        else
        {
            getObj("statusbar").innerHTML = "error";
        }
    }
    else
    {
		if(obj.status != 0) {
			getObj("statusbar").innerHTML = "error";
			alert("getDevicesHandler: " + obj.errorString + "( " + numTransactions + " )[" + obj.status + "]"  );
		} else {
			getObj("statusbar").innerHTML = "updating...";
		}

    }
    }
}

//----------------------------------------------------------------------------
// Function: getActions
//  Gets all of the Indigo action groups that have checked "Show in UI" and adds them
//  as rows to the widget.
//
//  Because the Applescript call has badly formatted array of the actions, the extra 
//  whitespace must be removed to allow proper action name matching.
//
// Parameters:
//
// Returns:
//  This function creates the content of the widget by calling createActionRow for 
//  each action that exists in Indigo and is marked as "Show in UI"
//
//  See Also:
//      <createActionRow> <getDevices> <getVariables>
//----------------------------------------------------------------------------
function getActions() {
    var asCommand = " -e 'set groupNames to {}'"
        + " -e 'set groupChanged to {}'"
        + " -e 'tell application \"" + IndigoAppName + "\"'"
            + " -e 'repeat with curGroup in action groups'"
                + " -e 'if(display in remote ui of curGroup) is true then'"
                    + " -e 'set groupNames to groupNames & (name of curGroup)'"
                + " -e 'end if'"
            + " -e 'end repeat'"
            + " -e 'return groupNames & \": \" & groupChanged'"
        + " -e 'end tell'";
    IndigoAppleScript(asCommand, getActionsHandler, true);
}

function getActionsHandler(obj) {
    spinLockDecrement();
    if(obj != null)
    {
    if(obj.status == 0 && spinLockFree())
    {
        var contents = document.getElementById('contents');
        while (contents.hasChildNodes())
        {
            contents.removeChild(contents.firstChild);
        }
        var even = true;
        if(obj.outputString != undefined)
        {
            var columnsArray = obj.outputString.split(", :");
            var actionsArray = columnsArray[0].split(",");
        
            for(var i=0; i<actionsArray.length; ++i)
            {
                //var item = results[i];
                // trim the whitespace
                actionsArray[i] = actionsArray[i].replace(/^\s*(.*?)\s*$/g, "$1");
        
                // create the rows
                var row = createActionRow (actionsArray[i], even);
                even = !even;
                
                contents.appendChild (row);
                // update the scrollbar so scrollbar matches new data
          
            }
        }
        else
            getObj("statusbar").innerHTML = "error";
    }
    else
    {
        getObj("statusbar").innerHTML = "error";
        alert("getActionsHandler: " + obj.errorString + "( " + numTransactions + " )" );
    }
    }
}

//----------------------------------------------------------------------------
// Function: getVariables
//  Gets all of the Indigo variables and adds them
//  as rows to the widget.
//
//  Because the Applescript call has badly formatted array of the variables, the extra 
//  whitespace must be removed to allow proper variable name matching.
//
// Parameters:
//
// Returns:
//  This function creates the content of the widget by calling createVariableRow for 
//  each variable that exists in Indigo.
//
//  See Also:
//      <createVariableRow> <getDevices> <getActions>
//----------------------------------------------------------------------------
function getVariables() {
    var asCommand = " -e 'set variableNames to {}'"
        + " -e 'set variableValues to {}'"
            + " -e 'tell application \""+IndigoAppName+"\"'"
            + " -e 'repeat with curVariable in variables'"
                + " -e 'if(display in remote ui of curVariable) is true then'"
                    + " -e 'set variableNames to variableNames & (name of curVariable)'"
                    + " -e 'set variableValues to variableValues & (value of curVariable)'"
                + " -e 'end if'"
            + " -e 'end repeat'"
            + " -e 'return variableNames & \": \" & variableValues'"
        + " -e 'end tell'";
    IndigoAppleScript(asCommand, getVariablesHandler, true);
}

function getVariablesHandler(obj) {
    spinLockDecrement();
    if(obj != null)
    {
        if(obj.status == 0 && spinLockFree())
        {
            var contents = document.getElementById('contents');
            while (contents.hasChildNodes())
            {
                contents.removeChild(contents.firstChild);
            }
            var even = true;
            if(obj.outputString != undefined)
            {
                var columnsArray = obj.outputString.split(", : ,");
                var variablesArray = columnsArray[0].split(",");
                var variablesStateArray = columnsArray[1].split(",");
                for(var i=0; i<variablesArray.length; ++i)
                {
                    //var item = results[i];
                    // trim the whitespace
                    variablesArray[i] = variablesArray[i].replace(/^\s*(.*?)\s*$/g, "$1");
                    variablesStateArray[i] = variablesStateArray[i].replace(/^\s*(.*?)\s*$/g, "$1");
                    // create the rows
                    var row = createVariableRow (variablesArray[i], variablesStateArray[i], even);
                    even = !even;
                    
                    contents.appendChild (row);
                    // update the scrollbar so scrollbar matches new data
               
                }
            }
            else
                getObj("statusbar").innerHTML = "error";
        }
        else
        {
            getObj("statusbar").innerHTML = "error";
            alert("getVariablesHandler: " + obj.errorString + "( " + numTransactions + " )" );
        }
    }
}

function spinLockFree() {
    if(numTransactions == 0)
        return true;
    else
        return false;
    
    return true;
}
function spinLockIncrement(refreshingUI) {
    // clean up possible "zombie" comms that weren't accounted for and rec'd
    if(numTransactions < 0)
        numTransactions = 0;
        
    numTransactions++;

    var statusbar = getObj("statusbar");
    statusbar.innerHTML = refreshingUI ? "updating..." : "sending...";
}

function spinLockDecrement() {
    // only decrement the counter if we expected some incoming message
    numTransactions--;
    if(numTransactions <= 0)
    {
       var statusbar = getObj("statusbar");
       statusbar.innerHTML = "";
       numTransactions = 0;
    }
}

/**
 *	Miscellaneous utilities
 */
function getObj(id) {
	return document.getElementById(id);
}

function wrapURL(URL) {
  if (window.widget)
    widget.openURL(URL);
  else
    window.location = URL;
}
