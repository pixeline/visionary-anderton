// Get Global Extension Config values.
//var visionary = chrome.extension.getBackgroundPage().config();
var visionary = {
	api: 'https://dev.colour-blindness.org/api',
	screen_transition_speed: "fast",
	user_is_logged_in : localStorage["visionary_logged_in"],
	data: []
};


chrome.storage.onChanged.addListener(function(changes, namespace) {
	chrome.extension.getBackgroundPage().updateTabs();
});

function set(key,value){
	return chrome.extension.getBackgroundPage().set(key, value);
}
function get(key){
	return chrome.extension.getBackgroundPage().get(key);
}

function exposeAll(){
	return chrome.extension.getBackgroundPage().exposeAll();
}


(function($) {

	// Set Startup screen
		
	if( get('visionary_logged_in') !=='ok' ){
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
	$("#js-diagnostic-percentage").html(get("Diag_ratio"));
	
	switch (get('Diag_label')){
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
	
	$('#js-username').html(get('visionary_username'));
	$('#js-delta-slider').html( get('delta') );
	$('#js-severity-slider').html( get('severity') ).show();
	// Turn ON/OFF Color Correction
	
	// Set initial values.
	if (typeof get('delta') == 'undefined' ){
		set('delta', 0) ;
		//chrome.storage.local.set({"delta": 0 });
	}
	if (typeof get('severity') == 'undefined' ){
		set('severity', 0);
		// chrome.storage.local.set({"severity": 0 });
	}
	
	$('#anderton-status').on('change', function(){
		if( $(this).is(':checked')){
			$('#js-status-indicator-label').text('activée');
			$("#js-severity-slider-div").removeClass("hide");
			$("#js-delta-slider-div").removeClass("hide");
			$('#js-diagnostic-div').removeClass('hide');
			set('anderton_active', 'active');
			param = {
				profile_name: get('profile_name')
			};
			$('#js-delta-slider').range('set value' , get('delta') );
			$('#js-severity-slider').range('set value' , get( 'severity') );
			chrome.extension.getBackgroundPage().setVisionMode( param );
			chrome.browserAction.setBadgeText({
				text: "ON"
			});
		}
		 else {
			$('#js-status-indicator-label').text('désactivée');
			$("#js-severity-slider-div").addClass("hide");
			$("#js-delta-slider-div").addClass("hide");
			$('#js-diagnostic-div').addClass('hide');
			set('anderton_active', 'inactive');
			$('#js-delta-slider').range('set value' , 0);
			$('#js-severity-slider').range('set value' , 0);
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
	if( 'inactive' === get('anderton_active') ){
		$('#js-delta-slider').range('set value' , 0);
		$('#js-severity-slider').range('set value' , 0);
		
		param = {
			profile_name: "visionarize_none"
		};
		chrome.extension.getBackgroundPage().setVisionMode( param );
		chrome.browserAction.setBadgeText({
			text: "OFF"
		});
	} else{
		$('#js-status-indicator-label').text('activée');
		$('#js-delta-slider').range('set value' , get('delta') );
		$('#js-severity-slider').range('set value' , get('severity') );
		param = {
				profile_name: get('profile_name')
			};
		chrome.extension.getBackgroundPage().setVisionMode( param );
		chrome.browserAction.setBadgeText({
			text: "ON"
		});
	}
	
	// utiliser "uncheck" pour la mettre en mode "désactivé".
	$('#js-delta-slider').range({
		min: -1,
		max: 1,
		start: get('delta'),
		step: 0.1,
		input: "#js-delta-slider",
		onChange: function(value) {
			console.log('delta in slider = ' + value);
			set('delta', value);
			// chrome.storage.local.set({"delta": value });
			chrome.extension.getBackgroundPage().setDelta(value);
		}
	});

	$('#js-severity-slider').range({
		min: -0.5,
		max: 0.5,
		start: get('severity'),
		step: 0.1,
		input: "#js-severity-slider",
		onChange: function(value) {
			console.log('severity in slider = ' + value);
			set('severity', value);
			// chrome.storage.local.set({"severity": value });
			chrome.extension.getBackgroundPage().setSeverity(value);
		}
	});
}


function signin(e) {
	e.preventDefault();
	console.log(e);
	var user = {
		login : $("#email").val(),
		pwd: $("#mdp").val()
	}
	console.log('user email'+user.login);
	
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
			set('visionary_logged_in', 'ko');

		} else if (data.token) {
			$('#js-feedback').html('IN Local Storage').show();
			// User is recognized, log her in...
			set('visionary_logged_in','ok') ;
			set('Anderton_token', data.token) ;
			set('Diag_ratio', data.test.diag_ratio);
			set('Diag_label', data.test.diag_result);
			set('visionary_username',data.user.email);
/*
			console.log('Diag ratio = '+ localStorage["Diag_ratio"]);
			console.log('Diag_label=' + localStorage['Diag_label']);
*/
			
			chrome.runtime.sendMessage(user, function(response) {
				try{
					console.log(response.farewell);
				}catch(e){
					console.log(e);
				}
			});
			var diagratio= get('Diag_ratio');
// 			console.log('Diag ratio = '+ diagratio);
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
			set('visionary_logged_in', 'ok');
			set('visionary_username', result.data.email );
			set('visionary_userid', result.data.id );
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
	//localStorage.clear();
	chrome.extension.getBackgroundPage().reset();
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