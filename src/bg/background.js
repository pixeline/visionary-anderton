///// LIBRARIES ///////////
//alert ('We are in background');
function getDistantProfile(login){

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://dev.colour-blindness.org/api/user/'+login.trim()+'/latest');
	xhr.onload = function () {
		var serverResponse = JSON.parse(xhr.responseText); 
		param = {profile_name: "visionarize_none"};
		console.log("serverResponse :" +serverResponse);
		//serverResponse = {profile_name: "visionarize_none"};
		console.log("CUrrent profile :" +serverResponse.diag_result);
		//alert("CUrrent profile :" +serverResponse.diag_result);
		chrome.storage.local.set({ "currentSession": serverResponse });
		if (serverResponse.diag_result == "protan"){
			param.profile_name = 'visionarize_protanope';
			setVisionMode(param)
		} else if (serverResponse.diag_result == "deutan"){
			param.profile_name = 'visionarize_deuteranope';
			setVisionMode(param);
		} else if (serverResponse.diag_result == "tritan"){
			param.profile_name = 'visionarize_tritanope';
			setVisionMode(param);
		}
		
		else setVisionMode(param);
		
	};
	//console.log("xhr :" +xhr);
	//alert("xhr :" +xhr);
	xhr.send();
};
/*{"diag_result":"tritan","diag_ratio":"61%","diag_serie":"0,1,2,3,4,5,6,7,15,8,14,9,13,10,11,12","email":"tritan.person@gmail.com","test_end_date":"2016-09-01 16:32:05"}*/ 

function setVisionMode(request) {
	//alert ('setVisionMode'+request);
	chrome.storage.local.set({ "currentMode": request }); //request = param; //profile_name 

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

			chrome.tabs.sendMessage(tabs[0].id, request, function (response) {
				// console.log(response.farewell);.
				console.log("tabs id: " +tabs[0].id);
			});
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

/*
function getRemoteProfile() {

	jQuery.ajax({
		type: "GET",
		url: "http://www.omdbapi.com/?t=star+wars&y=&plot=short&r=json",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (data, status, jqXHR) {
			alert(data);// do something
		},

		error: function (jqXHR, status) {
			alert('nono'); // error handler
		}
	});

};*/


////// INITIALIZATION //////

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		param = {profile_name: "visionarize_none"};

		console.log(sender.tab ?
						"from a content script:" + sender.tab.url :
							"from the extension");
	 

 //  console.log("We are currently basculing to: " + request.profile);
 //  param.profile_name = request.profile;


		console.log("LOGIN: "+request.login);
		getDistantProfile(request.login);// param mail
/*
chrome.runtime.sendMessage(request, function(response) {
	console.log(response.farewell);
});
*//*
 chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

		chrome.tabs.sendMessage(tabs[0].id, request, function (response) {
			console.log(response.farewell);
		});
	});*/

	 //defineCurrentColorCorrectionProfile(param);

	//to delete
		if (request.greeting == "hello")
		alert(request.greeting);
			sendResponse({farewell: "goodbye"});
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
	 		alert("No trace Please LogIn");
			param =  {profile_name: "visionarize_none"} ;
		} else {
			alert("remember you");
			param = result.currentMode;
		};
			setVisionMode(param);
		});
		console.log("[Anderton:] Detecting a Tab change");
	
});

chrome.runtime.onStartup.addListener(function () {

// chrome.storage.local.set({ "currentMode":  {profile_name: "visionarize_none"} });

	console.log("[Anderton:] I started up!");
	console.log("[Anderton:] Fetching profile...");

//getDistantProfile('tritan.person@gmail.com');

});
