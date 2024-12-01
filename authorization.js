var endpoint = "https://localhost:8080/";
var usersEndpoint = "api/users/";
var cardsEndpoint = "api/cards/";
var statusEndpoint = "api/statuses/";


$(document).ready(function () {
    if(Cookies.get("userGUID") != null) {
        window.location.href = 'http://127.0.0.1:5500/home_page_layout.html';
    }
   
   
    function emailValidator(email) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    function usernameValidator(username){
        const usernamePattern = /^[a-zA-Z0-9_]+$/;
        return usernamePattern.test(username);
    }

    function fieldsTests(...fields) {
        for (let field of fields) {
            if (typeof field !== "string" || field.trim().length === 0) {
                return false;
            }
        }
        return true;
    }
          
    function showNotification(message, type) {
        var notification = $("#notification");
        notification.text(message);
        notification.removeClass("error success").addClass(type).addClass("show");

        setTimeout(function() {
            notification.removeClass("show");
        }, 5000);
    }

    $("#registrationButton").on("click", function(){
        var email = $("input[name='email']").val().trim();
        var username = $("input[name='username']").val().trim();
        var password = $("input[name='password']").val().trim();

        if (!fieldsTests(email, username, password) || !emailValidator(email) || !usernameValidator(username)) {
            showNotification("Please fill in all fields.", "error");
            return;
        }

        $.ajax({
            url: endpoint + usersEndpoint,
            method: "POST",
            dataType: "json",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({email: email, username: username, password: password}),
            success: function(data) {
                showNotification("Registration successful.", "success");
                console.log(data);
                $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                showNotification(jqXHR.responseText, "error");
            }
        });
      
    });

    $("#loginButton").on("click", function() {
        var identifier = $("input[name='loginIdentifier']").val().trim(); 
        var password = $("input[name='loginPassword']").val().trim();
    
        if (!fieldsTests(identifier, password)) {
            showNotification("Please fill in all fields.", "error");
            return;
        }
    
        var requestData = {email:"",username:""}; 
        if (identifier.includes("@") && emailValidator(identifier)) { 
            requestData.email = identifier;
        } else if(usernameValidator(identifier)) { 
            requestData.username = identifier;
        }
        else {
            showNotification("Use please only common charecters {a-z; A-Z; 0-9} .", "error");
        }
    
        requestData.password = password; 
        console.log(JSON.stringify(requestData))
    
        $.ajax({
            url: endpoint + usersEndpoint + "auth",
            method: "POST",
            dataType: "json",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(requestData), 
            success: function(data) {
                showNotification("Login successful.", "success");
                Cookies.set("userGUID", data.guid);

                    timer = setTimeout(function(){
                        timer = null; 
                        $(document).ready(function(){
                            window.location.href = 'http://127.0.0.1:5500/home_page_layout.html';
                        });
                    }, 1000);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                showNotification(jqXHR.responseText, "error");
            }
        });
    });
});
