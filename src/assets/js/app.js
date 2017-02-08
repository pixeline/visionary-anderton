(function($){

// TURN ON/OFF Color Correction

// Pour le rendre actif, Voir documentation: http://semantic-ui.com/modules/checkbox.html#/definition



$('#js-status-indicator').checkbox({
	
	onChecked: function() {
		$('#js-status-indicator-label').text('activée');
		$("#severity-slider-div").removeClass("hide");
	},
	onUnchecked: function() {
		$('#js-status-indicator-label').text('désactivée');
		$("#severity-slider-div").addClass("hide");
	}
}).checkbox('uncheck'); // utilise "uncheck" pour la mettre en mode "désactivé".


// $('#js-current-page-title').text(PAGETITLE)  <--- doit recevoir le contenu de la balise TITLE de la page courante.


// Slider that sets intensity
$('#js-delta-slider').range({
	min: -1,
	max: 1,
	start: -0.5,
	step:0.1,
	onChange: function(value) {
		console.log('delta = ' + value);
		chrome.extension.getBackgroundPage().setDelta(value);
	}
});
	
$('#js-severity-slider').range({
	min: -0.5,
	max: 0.5,
	start: -0.1,
	step:0.1,
	onChange: function(value) {
		console.log('severity = ' + value);
		chrome.extension.getBackgroundPage().setSeverity(value);
	}
});

// FIN
})(jQuery);
//alert ('Anderton is running');

function checkTwitterLogin(){
	if(localStorage['oauth_token_secret_twitter']){
		chrome.browserAction.setPopup({
			//tabId: tab.id[0],			// Set the new popup for this tab.
			popup: 'nextindex.html'	// Open this html file within the popup.
		});	
	}
};

function login() {
	//alert('submitHandler');
	var payload = {
		login: "none",
		pwd: "none"
	};
	var username = document.getElementById("email").value;
	var userpass = document.getElementById("mdp").value;
	payload.login= username;
	payload.pwd= userpass;  
	var resultToken = getToken(payload);
	console.log('Anderton_token=', localStorage['Anderton_token']);
	var checkedBoxes = document.querySelectorAll('input[name=check]:checked');
	console.log(checkedBoxes);
	chrome.browserAction.setBadgeText({text: "ON"});
	var diagratio=localStorage["Diag_ratio"];
	document.getElementById("js-diagnostic-percentage").innerHTML=diagratio;
	chrome.runtime.sendMessage(payload, function(response) {
		console.log(response.farewell);
	});
	
}

function signoff() {
	var payload = {
		 login: "none",
		 pwd: "none"
	};
	chrome.browserAction.setBadgeText({text: "OFF"});
	localStorage.clear();
	
	param = {profile_name: "visionarize_none"};
	param.profile_name = "visionarize_none";
	
	chrome.extension.getBackgroundPage().setVisionMode(param);
	chrome.extension.getBackgroundPage().logoutTwitter();
	
	chrome.browserAction.setPopup({
		popup: 'index.html'
	});	
	
	chrome.extension.getBackgroundPage().clearDeltaAndSeverity();
}

function getToken(userObject){
	console.log("userObject",userObject);
	var usrname= userObject.login;
	var psword= userObject.pwd;
	$.ajax({
			type: "POST",
			url: "https://dev.colour-blindness.org/api/oauth",
			data: {
					"email" : usrname,
					"password" : psword,
			 },
			async: false,
			success: function(data){
				// return object with token
				console.log(('testing data value'),data);
				if (data.code && data.code===401) {
					alert(data.error);
					console.log('DAta error', data.error);
				}else if(data.token){
					console.log('IN Local Storage');
					localStorage['Anderton_token'] = data.token;
					chrome.browserAction.setPopup({
						//tabId: tab.id[0],			// Set the new popup for this tab.
						popup: 'nextindex.html'	// Open this html file within the popup.
					});	

				}
			},
			error: function(exception){
				alert('Une erreur est survenue veuillez s\'il vous plaît essayer plus tard / Error Occured please try again in few minutes');
			},       
			dataType: "json"
	 });
}

function twitterLogin(){
	chrome.extension.getBackgroundPage().authenticateTwitter();
};

function googleLogin(){
	chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
		localStorage['google_access_token'] = token;
	});
};

// BEGIN
document.addEventListener("DOMContentLoaded", function(event) {
	if(document.getElementById("signin")){
		document.getElementById("signin").addEventListener("click",login);	
	}
	if(document.getElementById("twitter")){
		document.getElementById("twitter").addEventListener("click",twitterLogin);	
	}
	if(document.getElementById("signout")){
		document.getElementById("signout").addEventListener("click",signoff);
	}
	if(document.getElementById("google")){
		document.getElementById("google").addEventListener("click",googleLogin);
	}
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	chrome.extension.getBackgroundPage().updateTabs();
});

checkTwitterLogin();
// END.