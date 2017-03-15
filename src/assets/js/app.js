var visionary = {
	api: 'https://dev.colour-blindness.org/api',
	screen_transition_speed: "fast",
	user_is_logged_in : localStorage["visionary_logged_in"]
};

chrome.storage.onChanged.addListener(function(changes, namespace) {
	chrome.extension.getBackgroundPage().updateTabs();
});

(function($) {

	// Set Startup screen
		
	if( visionary.user_is_logged_in !=='ok' ){
		goTo('login');
	} else{
		goTo('anderton', anderton_javascript );
	}

	// Events binding.
	
	$( document )
	.on('click', "#link-to-register-user", function(){
		goTo('subscribe');
	})
	.on('click', "#link-to-login-user", function(){
		goTo('login');
	})
	.on( 'click', "#do-signout", signoff)
	.on( 'click', "#do-signin", function(e) {

		e.preventDefault();
		var user = {
			email : $("#email").val(),
			password: $("#mdp").val()
		}
		$.ajax({
			type: "POST",
			url: visionary.api + '/oauth',
			data: user,
			async: false,
			success: function(data) {
				// return object with token
				console.log(('testing data value'), data);
				if (data.code && data.code === 401) {
					$('#js-feedback').html(data.error).show();
					localStorage['visionary_logged_in'] = 'ko';

				} else if (data.token) {
					$('#js-feedback').html('IN Local Storage').show();
					localStorage['Anderton_token'] = data.token;
					localStorage['visionary_logged_in'] = 'ok';
					visionary.user_is_logged_in = localStorage['visionary_logged_in'];
					chrome.browserAction.setBadgeText({
						text: "ON"
					});
					
					goTo('anderton', anderton_javascript);
/*
					chrome.browserAction.setPopup({
						popup: 'anderton.html'
					});
*/
				}
				return true;
			},
			error: function(exception) {
				$('#js-feedback').html('Error Occured please try again in few minutes');
			},
			dataType: "json"
		});

/*
		chrome.runtime.sendMessage(user, function(response) {
			console.log(response.farewell);
		});
*/
	})
	.on("click", "#do-subscribe", register)
	.on("click", "#submit-test", submitTest)
	.on("click", "#js-open-website", function(){
		goTo('test-de-classement');
	});

	// ANDERTON SCREEN
	// TURN ON/OFF Color Correction
	// Pour le rendre actif, Voir documentation: http://semantic-ui.com/modules/checkbox.html#/definition

	// FIN
})(jQuery);

function anderton_javascript(){

/*
	Javascript to launch when screen goes to "Anderton"
*/
	$("#js-diagnostic-percentage").html(localStorage["Diag_ratio"]);

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
	// utiliser "uncheck" pour la mettre en mode "désactivé".
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

	chrome.extension.getBackgroundPage().setVisionMode(param);
	chrome.extension.getBackgroundPage().clearDeltaAndSeverity();
	//chrome.extension.getBackgroundPage().logoutTwitter();
	goTo('login');
/*
	chrome.browserAction.setPopup({
		popup: 'index.html'
	});
*/

}


function goTo(htmlPageName, callback) {
/*
		This function takes care of changing the Extension screen to the right UI
		
		how-to:
		- Give your screen a short descriptive lowercase, no-space filename (ex: "login", "delete-user", ...)
		- create the interface html in a specific html file inside folder "/ui" using EXACTLY the same name (with .html as extension) .
		
		If you need special javascript for that screen, wrap it into a function and use it as the Callback.
	*/
	
	$('#ui-interactive-zone').stop().fadeOut(visionary.screen_transition_speed, function() {
		$(this).load('./ui/' + htmlPageName + '.html').fadeIn(visionary.screen_transition_speed, callback);
	});

}

function submitTest() {
	var result = $("#result").val();
	var ratio = $("#ratio").val();
	alert("result = " + result + " - ratio = " + ratio);
}

function register(e) {
	e.preventDefault();
	var request = $.ajax({
		type: "POST",
		url: visionary.api + '/register',
		data: {
			"email": $("#register-email").val(),
			"password": $("#register-password").val()
		},
		async: true,
		dataType: "json"
	});
	
	request.done(function( result ){
		console.log(result);
		$('#js-feedback').html( result.data ).show();
		if(result.status === 'ok'){
			localStorage['visionary_logged_in'] = 'ok';
			visionary.user_is_logged_in = localStorage['visionary_logged_in'];
			goTo('test-de-classement');
		}
	});
	request.fail(function( jqXHR, textStatus ) {
		$('#js-feedback').html("Erreur: " + textStatus).show();
	});
}
/*

function switchToTestPage(data) {
	console.log(data);
	if (data.status && data.status === 200) {
		chrome.browserAction.setPopup({
			popup: 'test-de-classement.html'
		});
	} else {
		alert("Erreur lors de l'inscription");
	}
}
*/

// BEGIN


// END.