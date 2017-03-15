//alert ('Anderton is running');

function submitHandler() {
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
	alert("See you newt time");
	var payload = {
		 login: "none",
		 pwd: "none"
	};
	chrome.browserAction.setBadgeText({text: "OFF"});
	localStorage.clear();
	chrome.runtime.sendMessage(payload, function(response) {
		console.log(response.farewell);
	});

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
					$("#login-form").addClass("hide");
					$("#user-has-existing-test").removeClass("hide");
					$("#user-has-no-existing-test").removeClass("hide");
					/*chrome.browserAction.setPopup({
						tabId: tab.id[0],			// Set the new popup for this tab.
						popup: 'nextindex.html'	// Open this html file within the popup.
					});*/		
				}},
			error: function(exception){
				alert('Error Occured please try again in few minutes');
			},       
			dataType: "json"
	 });
}

// BEGIN
document.addEventListener("DOMContentLoaded", function(event) {
	document.getElementById("signin").addEventListener("click",submitHandler);
	
});


// END.