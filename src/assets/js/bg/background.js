var visionary = {
	api: 'https://dev.colour-blindness.org/api',
	screen_transition_speed: "fast",
	user_is_logged_in : localStorage["visionary_logged_in"]
};

///// LIBRARIES ///////////
function config(){
	return visionary;
}
function updateTabs(){
	chrome.windows.getAll({'populate': true}, function(windows) {
		for (var i = 0; i < windows.length; i++) {
			var tabs = windows[i].tabs;
			for (var j = 0; j < tabs.length; j++) {
				var url = tabs[j].url;
				var msg = {
				  'delta': 'd',
				  'severity': 'v'
				};
				chrome.tabs.sendRequest(tabs[j].id, msg);
			}
		}
	});
};

function getDistantProfile(login){
	console.log('ojectLogin='+login);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', visionary.api + '/user/'+login.trim()+'/latest');
	xhr.onload = function () {
		var serverResponse = JSON.parse(xhr.responseText); 
		param = {profile_name: "visionarize_none"};
		console.log("serverResponse :" +serverResponse);
		console.log("CUrrent profile :" +serverResponse.diag_result);
		
		chrome.storage.local.set({ "currentSession": serverResponse });
		/* Added */
		
		var diag_ratio = serverResponse.diag_ratio;
		console.log("CUrrent diag=diag_ratio :" +diag_ratio);
		/*Storing diag_ratio*/
		localStorage['Diag_ratio'] = diag_ratio;
		localStorage['Diag_label'] = serverResponse.diag_result;
		localStorage['visionary_username'] = serverResponse.email;
		localStorage['profile_name'] = serverResponse.diag_result;
	
		var param = {profile_name: "visionarize_none"};
		switch (serverResponse.diag_result){
			case 'protan':
				param.profile_name = 'visionarize_protanope';
			break;

			case 'deutan':
				param.profile_name = 'visionarize_deuteranope';
			break;

			case 'tritan':
				param.profile_name = 'visionarize_tritanope';
			break;
			default: 
				setVisionMode(param);
		}
		localStorage['profile_name']  = param.profile_name;
		console.log('setVisionMode Asynchrone');

	};
	console.log("xhr :" +xhr);
	//alert("xhr :" +xhr);
	xhr.send();
};
/*{"diag_result":"tritan","diag_ratio":"61%","diag_serie":"0,1,2,3,4,5,6,7,15,8,14,9,13,10,11,12","email":"tritan.person@gmail.com","test_end_date":"2016-09-01 16:32:05"}*/ 
function reset(){
	localStorage.clear();
};
function setDelta(value){
	console.log("delta in set = "+value);
	//chrome.storage.local.set({"delta": value });
	localStorage['delta'] = value;
}

function setSeverity(value){
	console.log("severity in set = "+value);
	//chrome.storage.local.set({"severity": value });
	localStorage['severity'] = value;
}

function clearDeltaAndSeverity(){
	/*chrome.storage.local.set({"delta": 0 });
	chrome.storage.local.set({"severity": 0 });*/
	localStorage['delta'] = 0;
	localStorage['severity'] = 0;
}

function setVisionMode(request) {
	chrome.storage.local.set({ "currentMode": request });
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, request, function (response) {
			console.log("tabs id: " +tabs[0].id);
		});
	});
};

chrome.contextMenus.onClicked.addListener(function(info, tab) {

	param = {profile_name: "visionarize_none"};

	if (info.menuItemId === "anderton_item2a"){

		param.profile_name = "visionarize_protanope";
		setVisionMode(param);
	 
	}

	if (info.menuItemId === "anderton_item2b"){

		param.profile_name = "visionarize_deuteranope";
		setVisionMode(param);
	 
	}

	if (info.menuItemId === "anderton_item2c"){

		param.profile_name = "visionarize_tritanope";
		setVisionMode(param);
	 
	}
	if (info.menuItemId === "anderton_item2d"){

		param.profile_name = "visionarize_none";
		setVisionMode(param);
	 
	}

});


////// INITIALIZATION //////

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('request in runtime '+ request.greeting);
	param = {profile_name: "visionarize_none"};

	console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
						"from the extension");

	console.log("LOGIN: "+request.login);
	getDistantProfile(request.login);// param mail
	console.log('setVisionMode Synchrone');
	setVisionMode(param);
	if (request.name == 'screenshot') {
        chrome.tabs.captureVisibleTab(null, null, function(dataUrl) {
            sendResponse({ screenshotUrl: dataUrl });
        });
    }
    return true;

});


chrome.runtime.onInstalled.addListener(function () {

	chrome.contextMenus.create({
		id: "anderton_item1",
		type: "checkbox",
		title: "Visionarize",
		contexts: ["all"],  // ContextType

	});
	chrome.contextMenus.create({
		id: "anderton_item2",
		type: "normal",
		title: "Mode",
		contexts: ["all"],  // ContextType

	});

	chrome.contextMenus.create({
		id: "anderton_item2a",
		parentId: "anderton_item2",
		type: "radio",
		title: "Protanope",
		contexts: ["all"],  // ContextType

	});  
	chrome.contextMenus.create({
		id: "anderton_item2b",
		parentId: "anderton_item2",
		type: "radio",
		title: "Deuteranope",
		contexts: ["all"],  // ContextType

	}); 

	chrome.contextMenus.create({
		id: "anderton_item2c",
		parentId: "anderton_item2",
		type: "radio",
		title: "Tritanope",
		contexts: ["all"],  // ContextType

	}); 

	chrome.contextMenus.create({
		id: "anderton_item2d",
		parentId: "anderton_item2",
		type: "radio",
		title: "Unaltered",
		contexts: ["all"],  // ContextType

	}); 
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.storage.local.get('currentMode', function (result) {
	 	if (typeof result.currentMode === "undefined"){
	 		//alert("No trace Please LogIn");
			param = 	{profile_name: "visionarize_none"} ;
		} else {
			//alert("remember you");
			param = result.currentMode;

		};
			setVisionMode(param);
		});
		console.log("[Anderton:] Detecting a Tab change");
	
});

chrome.runtime.onStartup.addListener(function () {
	console.log("[Anderton:] I started up!");
	console.log("[Anderton:] Fetching profile...");
});

console.log("background");

