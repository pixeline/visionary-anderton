// Get Global Extension Config values.
var visionary = chrome.extension.getBackgroundPage().config();

chrome.storage.onChanged.addListener(function(changes, namespace) {
	chrome.extension.getBackgroundPage().updateTabs();
});

(function($) {

	// Set Startup screen
	if (localStorage['visionary_logged_in'] !== 'ok') {
		goTo('login');
	} else {
		goTo('anderton', anderton_javascript);
	}

	// Events bindings to document, so that it works with ajax-ed DOM.
	$(document).on('click', "#do-signout", signoff).on('click', "#do-signin", signin).on('click', "#do-subscribe", register).on('click', "#do-refresh", refresh).on('click', "#submit-test", submitTest).on('click', "#take-screenshot", takeScreenshot).on('click', "#print-help", reportBug).on('click', "#do-forget", forgetPasswordOrNoEmail).on('click', "#link-to-register-user", forgetPasswordOrNoEmail)

	// FIN
})(jQuery);


function forgetPasswordOrNoEmail() {
	var newURL = "https://test-your.colour-blindness.org/";
	chrome.tabs.create({
		url: newURL
	});
}

function takeScreenshot() {
	//$('#page').removeClass("hide");
	$('#js-send-bug-div').removeClass("hide");
	$('#js-take-screenshot-div').addClass("hide");
	localStorage['operating_system'] = window.navigator.platform;
	localStorage['browser'] = window.navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9\.]+)/);
	localStorage['user_agent'] = window.navigator.userAgent;
	localStorage['screen_height'] = window.screen.availHeight;
	localStorage['screen_width'] = window.screen.availWidth;
	
	var button_label = $('#js-submit-bug span.send-label').text();

	$('#js-submit-bug').on('click', function() {
		$(this).find('span.send-label').text('Un instant...');
		var txt;
		var screenshot_description = $('#js-screenshot-description').val();
		if (screenshot_description == null) {
			txt = "User cancelled the prompt.";
		} else if (screenshot_description == "") {
			txt = "User send a blank prompt.";
		} else {
			txt = screenshot_description;
		}
		chrome.tabs.captureVisibleTab(function(screenshot) {
			localStorage['screenshot'] = screenshot;
			localStorage['screenshot_description'] = txt;
			var request = $.ajax({
				type: "POST",
				url: visionary.api + '/bugtracker/add',
				data: {
					'profile_name': localStorage['profile_name'],
					'user_email': localStorage['user_email'],
					'diag_ratio': localStorage["Diag_ratio"],
					'diag_label': localStorage["Diag_label"],
					'delta': localStorage['delta'],
					'severity': localStorage['severity'],
					'user_agent': localStorage['user_agent'],
					'browser': localStorage['browser'],
					'operating_system': localStorage['operating_system'],
					'screen_height': localStorage['screen_height'],
					'screen_width': localStorage['screen_width'],
					'page_url': localStorage['page_url'],
					'page_title': localStorage['page_title'],
					'screenshot_description': localStorage['screenshot_description'],
					'screenshot': localStorage['screenshot'],
				//	'screenshot_cropped_result': localStorage['screenshot_cropped_result']
				},

				beforeSend: function() {
					console.log("url : " + visionary.api + '/bugtracker/add');
					console.log("data to be sent:");
					console.log(this.data);
				},
				async: true,
				cache: false,
				dataType: "json"
			});
			request.done(function(data) {
				console.log(data);
				if (data.status == 'error') {
					console.log('error in sending data tracker to server');
				} else {
					console.log('everything seems to be perfect, data are stocked in our DB');
				}
				$('#js-submit-bug span.send-label').text(button_label);
				$('#js-screenshot-description').val('Merci pour votre message, nous allons l\'examiner.');
				return true;
			});
			request.fail(function(jqXHR, textStatus) {
				console.log(textStatus);
			});
		});

	});
}

function refresh() {
	window.location.reload();
};

function reportBug() {
	$('#hidden-demo').croppie('bind');
};

function anderton_javascript() {

/*
		Javascript to launch when screen goes to "Anderton"
	*/
	$('#js-current-page-title').html(localStorage['page_title']);
	$("#js-diagnostic-percentage").html(localStorage["Diag_ratio"]);

	switch (localStorage['Diag_label']) {
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

	$('#js-username').html(localStorage['user_email']);
	$('#js-delta-slider').html(localStorage['delta']);
	$('#js-severity-slider').html(localStorage['severity']).show();
	// Turn ON/OFF Color Correction
	// Set initial values.
	if (typeof localStorage['delta'] === 'undefined') {
		localStorage['delta'] = 0;
	}
	if (typeof localStorage['severity'] === 'undefined') {
		localStorage['severity'] = 0;
	}
	console.log(localStorage);

	$('#js-status-indicator').checkbox({
		onChecked: function() {
			$('#js-status-indicator-label').text('activée');
			$("#js-severity-slider-div").removeClass("hide");
			$("#js-delta-slider-div").removeClass("hide");
			$('#js-diagnostic-div').removeClass('hide');
			localStorage['anderton_active'] = 'active';
			param = {
				profile_name: localStorage['profile_name']
			};
			chrome.extension.getBackgroundPage().setVisionMode(param);
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

/*
		Voir documentation: http://semantic-ui.com/modules/checkbox.html#/definition
	*/
	if ('inactive' == localStorage['anderton_active']) {
		$('#js-status-indicator').checkbox('uncheck');
		param = {
			profile_name: "visionarize_none"
		};
		chrome.extension.getBackgroundPage().setVisionMode(param);
		chrome.browserAction.setBadgeText({
			text: "OFF"
		});
	} else {
		$('#js-status-indicator').checkbox('check');
		$('#js-status-indicator-label').text('activée');
		$('#js-delta-slider').range('set value', localStorage['delta']);
		$('#js-severity-slider').range('set value', localStorage['severity']);
		param = {
			profile_name: localStorage['profile_name']
		};
		chrome.extension.getBackgroundPage().setVisionMode(param);
		chrome.browserAction.setBadgeText({
			text: "ON"
		});
	}

/*
		utiliser "uncheck" pour la mettre en mode "désactivé".
	*/
	$('#js-delta-slider').range({
		min: -1,
		max: 1,
		start: localStorage['delta'],
		step: 0.1,
		input: "#js-delta-slider",
		onChange: function(value) {
			console.log('delta in slider = ' + value);
			localStorage['delta'] = value;
			chrome.storage.local.set({
				"delta": value
			});
			chrome.extension.getBackgroundPage().setDelta(value);
		}
	});

	$('#js-severity-slider').range({
		min: -0.5,
		max: 0.5,
		start: localStorage['severity'],
		step: 0.1,
		input: "#js-severity-slider",
		onChange: function(value) {
			console.log('severity in slider = ' + value);
			localStorage['severity'] = value;
			chrome.storage.local.set({
				"severity": value
			});
			chrome.extension.getBackgroundPage().setSeverity(value);
		}
	});
}

/*
	
*/
function signin(e) {
	e.preventDefault();
	console.log(e);
	var user = {
		login: $("#email").val(),
		pwd: $("#mdp").val()
	}
	console.log('user email' + user.login);

	var request = $.ajax({
		type: "POST",
		url: visionary.api + '/oauth',
		data: {
			"email": user.login,
			"password": user.pwd,
		},
		async: false,
		dataType: "json"
	});

	request.done(function(data) {

		console.log('+++ data received from server: +++');
		console.log(data);
		console.log('++++++++++++++++++++++++++++++++++');

/*
			return object with token
		*/
		if (data.code && data.code === 401) {
			$('#js-feedback').html(data.error).show();
			localStorage['visionary_logged_in'] = 'ko';

		} else if (data.token) {
			//$('#js-feedback').html('').show();
			// User is recognized, log her in...
			localStorage['visionary_logged_in'] = 'ok';
			localStorage['Anderton_token'] = data.token;
			localStorage["Diag_ratio"] = data.test.diag_ratio;
			localStorage["Diag_label"] = data.test.diag_result;
			localStorage['user_email'] = data.user.email;
			localStorage['profile_name'] = data.user.email;
			console.log('Diag ratio = ' + localStorage["Diag_ratio"]);
			console.log('Diag_label=' + localStorage['Diag_label']);

			chrome.runtime.sendMessage(user, function(response) {
				try {
					console.log(response.farewell);
				} catch (e) {
					console.log(e);
				}
			});
			var diagratio = localStorage["Diag_ratio"];
			console.log('Diag ratio = ' + diagratio);
			goTo('anderton', anderton_javascript);

		}
		return true;
	});

	request.fail(function(jqXHR, textStatus) {
		$('#js-feedback').html("Error Occured please try again in few minutes: " + textStatus).show();
	});
}

function submitTest() {
	var result = $("#result").val();
	var ratio = $("#ratio").val();
	// alert("result = " + result + " - ratio = " + ratio);
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

	request.done(function(result) {
		console.log('result in Register ' + result);
		$('#js-feedback').html(result.data).show();
		if (result.status === 'ok') {
			localStorage['visionary_logged_in'] = 'ok';
			localStorage['user_email'] = result.data.email;
			localStorage['profile_name'] = result.data.email;
			localStorage['visionary_userid'] = result.data.id;
			goTo('test-de-classement');
		}
	});
	request.fail(function(jqXHR, textStatus) {
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

chrome.tabs.getSelected(null, function(tab) { // null defaults to current window
	var page_title = tab.title;
	localStorage['page_title'] = page_title;
	console.log('title of the current page: ' + page_title);
});


chrome.tabs.query({
	currentWindow: true,
	active: true
}, function(tabs) {

	var page_url = tabs[0].url;
	localStorage['page_url'] = page_url;
	console.log('current page url: ' + page_url);
});

function goTo(htmlPageName, callback) {

	$('#ui-interactive-zone').stop().fadeOut(visionary.screen_transition_speed, function() {
		$(this).load('./ui/' + htmlPageName + '.html').fadeIn(visionary.screen_transition_speed, callback);
	});
}