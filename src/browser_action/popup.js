//alert ('Anderton is running');

function submitHandler() {
  //alert('submitHandler');
  var payload = {
    login: "none",
    pswd: "none"
  };
  var username = document.getElementById("login").value;
  var userpass = document.getElementById("pwd").value;
  payload.login= username;
  payload.pswd= userpass;  
  var resultToken = getToken(payload);
  console.log('Anderton_token=', localStorage['Anderton_token']);
  var checkedBoxes = document.querySelectorAll('input[name=check]:checked');
  console.log(checkedBoxes);
  chrome.browserAction.setBadgeText({text: "ON"});
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
     pswd: "none"
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
  var psword= userObject.pswd;
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
          }
          
       },
      error: function(exception){
        alert('Error Occured please try again in few minutes');
       },       
      dataType: "json"
   });
}



// BEGIN
document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById("signin").addEventListener("click",submitHandler);
  document.getElementById("signoff").addEventListener("click",signoff);
});


// END.