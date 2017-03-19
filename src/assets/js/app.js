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
		
	if( localStorage['visionary_logged_in'] !=='ok' ){
		goTo('login');
	} else{
		goTo('anderton', anderton_javascript);
	}

	// Events bindings to document, so that it works with ajax-ed DOM.
	
	$( document )
	.on( 'click', "#do-signout", signoff)
	.on( 'click', "#do-signin", signin)
	.on( 'click', "#do-subscribe", register)
	.on( 'click', "#submit-test", submitTest)
	.on( 'click', "#link-to-register-user", function(){
		goTo('subscribe');
	})
	.on( 'click', "#link-to-login-user", function(){
		goTo('login');
	})
	.on( 'click', "#js-open-website", function(){
		goTo('test-de-classement');
	});

	// FIN
})(jQuery);


// Helpers. --------------------------------------------------------

function anderton_javascript(){

	/*
		Javascript to launch when screen goes to "Anderton"
	*/
	$("#js-diagnostic-percentage").html(localStorage["Diag_ratio"]);
	
	
	switch (localStorage['Diag_label']){
		case 'deutan':
		var diag_label = '<strong>deutéranope</strong> <small>(difficulté à percevoir le vert)</small>';
		break;
		case 'protan':
		var diag_label = '<strong>protanope</strong> <small>(difficulté à percevoir le rouge)</small>';
		break;
		case 'tritan':
		var diag_label = '<strong>tritanope</strong> <small>(difficulté à percevoir le bleu)</small>';
		break;
	}
	
	$('#js-diagnostic-label').html(diag_label);
	
	$('#js-username').html(localStorage['visionary_username']);
	$('#js-delta-slider').html(localStorage['delta']);
	$('#js-severity-slider').html(localStorage['severity']).show();
	// Turn ON/OFF Color Correction
	
	// Set initial values.
	if (typeof localStorage['delta'] === 'undefined' ){
		localStorage['delta'] = 0;
	}
	if (typeof localStorage['severity'] === 'undefined' ){
		localStorage['severity'] = 0;
	}
	console.log(localStorage);

	$('#js-status-indicator').checkbox().checkbox({
		onChecked: function() {
			$('#js-status-indicator-label').text('activée');
			$("#js-severity-slider-div").removeClass("hide");
			$("#js-delta-slider-div").removeClass("hide");
			$('#js-diagnostic-div').removeClass('hide');
			localStorage['anderton_active'] = 'active';
			param = {
				profile_name: localStorage['profile_name']
			};
			chrome.extension.getBackgroundPage().setVisionMode( param );
			chrome.browserAction.setBadgeText({
				text: "ON"
			});
		},
		onUnchecked: function() {
			$('#js-status-indicator-label').text('désactivée');
			$("#js-severity-slider-div").addClass("hide");
			$("#js-delta-slider-div").addClass("hide");
			$('#js-diagnostic-div').addClass('hide');
			localStorage['anderton_active'] = 'inactive';
			param = {
				profile_name: "visionarize_none"
			};
			chrome.extension.getBackgroundPage().setVisionMode(param);
			chrome.browserAction.setBadgeText({
				text: "OFF"
			});
		}
	});

	// Voir documentation: http://semantic-ui.com/modules/checkbox.html#/definition
	if( 'inactive' == localStorage['anderton_active'] ){
		$('#js-status-indicator').checkbox('uncheck');
			param = {
				profile_name: "visionarize_none"
			};
			chrome.extension.getBackgroundPage().setVisionMode( param );
			chrome.browserAction.setBadgeText({
				text: "OFF"
			});
	} else{
		$('#js-status-indicator').checkbox('check');
		$('#js-status-indicator-label').text('activée');
		param = {
			profile_name: "visionarize_none"
		};
		chrome.extension.getBackgroundPage().setVisionMode( param );
		chrome.browserAction.setBadgeText({
			text: "ON"
		});
	}
	
	$('#js-delta-slider').range({
		min: -1,
		max: 1,
		start: localStorage['delta'],
		step: 0.1,
		input: "#js-delta-slider",
		onChange: function(value) {
			console.log('delta slider = ' + value);
			localStorage['delta'] = value;
			chrome.extension.getBackgroundPage().setDelta(value);
		} 
	});

	$('#js-severity-slider').range({
		min: -1,
		max: 1,
		start: localStorage['severity'],
		step: 0.1,
		input: "#js-severity-slider",
		onChange: function(value) {
			console.log('severity slider = ' + value);
			localStorage['severity'] = value;
			chrome.extension.getBackgroundPage().setSeverity(value);
		}
	});
}


function signin(e) {
	e.preventDefault();

	var user = {
		login : $("#email").val(),
		pwd: $("#mdp").val()
	}
	
	var request = $.ajax({
		type: "POST",
		url: visionary.api + '/oauth',
		data: {
			"email" : user.login,
			"password" : user.pwd,
		},
		async: false,
		dataType: "json"
	});
			
	request.done(function( data) {
		
		console.log('+++ data received from server: +++');
		console.log(data);
		console.log('++++++++++++++++++++++++++++++++++');

		// return object with token
		if (data.code && data.code === 401) {
			$('#js-feedback').html(data.error).show();
			localStorage['visionary_logged_in'] = 'ko';

		} else if (data.token) {
			
			// User is recognized, log her in...
			
			localStorage['visionary_logged_in'] = 'ok';
			localStorage['Anderton_token'] = data.token;
			localStorage["Diag_ratio"] = data.test.diag_ratio;
			localStorage["Diag_label"] = data.test.diag_result;
			localStorage['visionary_username'] = data.user.email;
			
			console.log('Diag ratio = '+ localStorage["Diag_ratio"]);
			console.log('Diag_label=' + localStorage['Diag_label']);
			
			chrome.runtime.sendMessage(user, function(response) {
				try{
					console.log(response.farewell);
				}catch(e){
					console.log(e);
				}
			});
			
			goTo('anderton', anderton_javascript);
			
		}
		return true;
	});
		
	request.fail(function( jqXHR, textStatus ) {
		$('#js-feedback').html("Error Occured please try again in few minutes: " + textStatus).show();
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
		url: visionary.api + '/subscribe',
		data: {
			"email": $("#register-email").val(),
			"password": $("#register-password").val()
		},
		async: true,
		dataType: "json"
	});
	
	request.done(function( result ){
		console.log('result in Register '+ result);
		$('#js-feedback').html( result.data ).show();
		if(result.status === 'ok'){
			localStorage['visionary_logged_in'] = 'ok';
			localStorage['visionary_username'] = result.data.email;
			localStorage['visionary_userid'] = result.data.id;
			goTo('test-de-classement');
		}
	});
	request.fail(function( jqXHR, textStatus ) {
		$('#js-feedback').html("Erreur: " + textStatus).show();
	});
}

function signoff() {
	var user = {
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
	
	goTo('login');
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