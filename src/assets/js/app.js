(function($){

// TURN ON/OFF Color Correction

// Pour le rendre actif, Voir documentation: http://semantic-ui.com/modules/checkbox.html#/definition



$('#js-status-indicator').checkbox({
	
	onChecked: function() {
		$('#js-status-indicator-label').text('activée');
		$("#severity-slider-div").removeClass("hide");
		$("#js-delta-slider-div").removeClass("hide");
	},
	onUnchecked: function() {
		$('#js-status-indicator-label').text('désactivée');
		$("#severity-slider-div").addClass("hide");
		$("#js-delta-slider-div").addClass("hide");
	}
}).checkbox('unchecked'); // utilise "uncheck" pour la mettre en mode "désactivé".


// $('#js-current-page-title').text(PAGETITLE)  <--- doit recevoir le contenu de la balise TITLE de la page courante.


// Slider that sets intensity
$('#js-delta-slider').range({
	min: -1,
	max: 1,
	start: -0.5,
	step:0.1,
	onChange: function(value) {
		chrome.extension.getBackgroundPage().setDelta(value);
	}
});
	
$('#js-severity-slider').range({
	min: -0.5,
	max: 0.5,
	start: -0.1,
	step:0.1,
	onChange: function(value) {
		chrome.extension.getBackgroundPage().setSeverity(value);
	}
});

// FIN
})(jQuery);
//alert ('Anderton is running');

function checkTwitterLogin(){
	var twitterToken = localStorage['oauth_token_secret_twitter'];
	console.log(twitterToken);
	if(twitterToken){
		if(validateTwitterToken(twitterToken)){
			chrome.browserAction.setPopup({
				popup: 'nextindex.html'
			});	
		}
		else{
			console.log('wrong twitter authentication');
		}
	}
};

function validateTwitterToken(token){
	$.ajax({
			type: "POST",
			url: "https://dev.colour-blindness.org/api/oauth",
			data: {
					"provider" : "twitter",
					"token" : token,
			 },
			async: false,
			success: function(data){
				console.log(data);
				return true;
			},
			error: function(exception){
				console.log(exception);
				return false;
			},       
			dataType: "json"
	 });
}

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
	/* Added */
	// trying to get the diag-ratio value
	/*chrome.runtime.sendMessage({method: "getdiag-ratio",function(response){
		console.log(response);
	});*/
	var diagratio=localStorage["Diag_ratio"];
	document.getElementById("js-diagnostic-percentage").innerHTML=diagratio;
	chrome.runtime.sendMessage(payload, function(response) {
		console.log(response.farewell);
	});
	
 /* chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

		chrome.tabs.sendMessage(tabs[0].id, payload, function (response) {
			console.log(response.farewell);
		});
	});
*/

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
						popup: 'nextindex.html'
					});	
				}
				return true;
			},
			error: function(exception){
				alert('Error Occured please try again in few minutes');
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

function switchToRegister(){
	window.location.href = "subscribe.html";
}

function submitTest(){
	var result = document.getElementById("result").value;
	var ratio = document.getElementById("ratio").value;
	alert("result = " + result + " - ratio = " + ratio);
}

function register(){
	var username = document.getElementById("register-email").value;
	var userpass = document.getElementById("register-password").value;
	$.ajax({
			type: "POST",
			url: "https://dev.colour-blindness.org/api/subscribe",
			data: {
					"email" : username,
					"password" : userpass,
					"name": "name",
					"birth_date": 1990,
					"gender": "F",
					"countries_iso": "BE",
					"postcode": 5000
			 },
			async: false,
			success: switchToTestPage,
			error: switchToTestPage,       
			dataType: "json"
	 });
}

function switchToTestPage(data){
	console.log(data);
	if (data.status && data.status===200) {
		chrome.browserAction.setPopup({
			popup: 'test.html'
		});	
	}
	else{
		alert("Erreur lors de l'inscription");
	}
}

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
	if(document.getElementById("register-user")){
		document.getElementById("register-user").addEventListener("click", switchToRegister);
	}
	if(document.getElementById("register-btn")){
		document.getElementById("register-btn").addEventListener("click", register);
	}
	if(document.getElementById("submit-test")){
		document.getElementById("submit-test").addEventListener("click", submitTest);
	}
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	chrome.extension.getBackgroundPage().updateTabs();
});

checkTwitterLogin();
// END.