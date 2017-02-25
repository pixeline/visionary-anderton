var visionary = {
	api: 'https://dev.colour-blindness.org/api'
};


// BEGIN
chrome.storage.onChanged.addListener(function(changes, namespace) {
	chrome.extension.getBackgroundPage().updateTabs();
});
checkTwitterLogin();

// TURN ON/OFF Color Correction
// Pour le rendre actif, Voir documentation: http://semantic-ui.com/modules/checkbox.html#/definition
$('#js-status-indicator').checkbox({

	onChecked: function() {
		$('#js-status-indicator-label').text('activée');
		$("#severity-slider-div").removeClass("hide");
		$("#js-delta-slider").removeClass("hide");
	},
	onUnchecked: function() {
		$('#js-status-indicator-label').text('désactivée');
		$("#severity-slider-div").addClass("hide");
		$("#js-delta-slider").addClass("hide");
	}
}).checkbox('uncheck');
// utilise "uncheck" pour la mettre en mode "désactivé".
// $('#js-current-page-title').text(PAGETITLE)  <--- doit recevoir le contenu de la balise TITLE de la page courante.
// Slider that sets intensity
$('#js-delta-slider').range({
	min: -1,
	max: 1,
	start: -0.5,
	step: 0.1,
	onChange: function(value) {
		chrome.extension.getBackgroundPage().setDelta(value);
	}
});

$('#js-severity-slider').range({
	min: -0.5,
	max: 0.5,
	start: -0.1,
	step: 0.1,
	onChange: function(value) {
		//console.log('severity = ' + value);
		chrome.extension.getBackgroundPage().setSeverity(value);
	}
});


$("#signin").on('click', function(e) {

	e.preventDefault();
	
	var payload = {
		login: "none",
		pwd: "none"
	};
	var username = $("#email").val();
	var userpass = $("#mdp").val();
	payload.login = username;
	payload.pwd = userpass;

	console.log(payload);

	var resultToken = getToken(payload);

	console.log( resultToken );

	if (resultToken) {
		
		console.log('LS Anderton_token=', localStorage.getItem('Anderton_token'));
		var checkedBoxes = $('input[name=check]:checked');
		console.log(checkedBoxes);
		chrome.browserAction.setBadgeText({
			text: "ON"
		});
		var diagratio = localStorage.getItem("Diag_ratio");
		$("js-diagnostic-percentage").html(diagratio);
		chrome.runtime.sendMessage(payload, function(response) {
			console.log(response.farewell);
		});
		chrome.browserAction.setPopup({
			//tabId: tab.id[0],			// Set the new popup for this tab.
			popup: 'anderton.html' // Open this html file within the popup.
		});
	}
});

$("#twitter").on("click", twitterLogin);

// Google Login
$("#google").on('click', function(e) {
	e.preventDefault();
	$('#js-sso-result').html("start...");

	chrome.identity.getAuthToken({
		'interactive': false
	}, function(token) {
		localStorage.setItem('google_access_token', token);
		$('#js-sso-result').html("Token received: " + token);
	});
	$('#js-sso-result').html("finished...");
});
$("#register-user").on("click", function() {
	window.location.href = "subscribe.html";
});
$("#register-btn").on("click", register);
$("#signout").on("click", signoff);

// END ----

function getToken(userObject) {
	console.log("userObject", userObject);
	var usrname = userObject.login;
	var psword = userObject.pwd;
	console.log("contacting server at " +  visionary.api + "/oauth");
	$.ajax({
		type: "POST",
		url: visionary.api + "/oauth",
		data: {
			"email": usrname,
			"password": psword,
		},
		async: true,
		success: function(data) {
			// return object with token
			console.log( 'testing data value' + data);
			if (data.code && data.code === 401) {
				$('#js-sso-result').html("erreur: " + data.error);
				console.log('DAta error', data.error);
				//window.location.href = "anderton.html";
				return false;
			} else if (data.token && data.token !== null) {
				console.log('IN Local Storage');
				localStorage.setItem('Anderton_token', data.token);
				return data.token;
			}
		},
		error: function(exception, message) {
			$('#js-sso-result').html("Erreur: type: " + message + " exception: " + exception);
			console.log( "Erreur: type: " + message + " exception: " , (exception) );
			return false;
		},
		dataType: "json"
	});
}

function checkTwitterLogin() {
	var twitterToken = localStorage.getItem('oauth_token_secret_twitter');
	if (twitterToken) {
		if (validateTwitterToken(twitterToken)) {
			chrome.browserAction.setPopup({
				popup: 'anderton.html'
			});
		} else {
			console.log('wrong twitter authentication');
		}
	}
}

function validateTwitterToken(token) {
	$.ajax({
		type: "POST",
		url: visionary.api + "/oauth",
		data: {
			"provider": "twitter",
			"token": token,
		},
		async: false,
		success: function(data) {
			return true;
		},
		error: function(exception) {
			return false;
		},
		dataType: "json"
	});
}

function signoff() {
	var payload = {
		login: "none",
		pwd: "none"
	};
	chrome.browserAction.setBadgeText({
		text: "OFF"
	});
	localStorage.clear();

	param = {
		profile_name: "visionarize_none"
	};
	param.profile_name = "visionarize_none";

	chrome.extension.getBackgroundPage().setVisionMode(param);
	chrome.extension.getBackgroundPage().logoutTwitter();

	chrome.browserAction.setPopup({
		popup: 'index.html'
	});

	chrome.extension.getBackgroundPage().clearDeltaAndSeverity();
}


function twitterLogin() {
	chrome.extension.getBackgroundPage().authenticateTwitter();
}

function register() {
	var username = $("#register-email").val();
	var userpass = $("#register-password").val();
	$.ajax({
		type: "POST",
		url: visionary.api + "/subscribe",
		data: {
			"email": username,
			"password": userpass
		},
		async: false,
		success: function(data) {
			console.log('working');
			console.log(data);
		},
		error: function(exception) {
			console.log('not working');
			console.log(exception);
		},
		dataType: "json"
	});
}