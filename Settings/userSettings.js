var endpoint = "https://localhost:7193/";
var notificationsEndpoint = "api/team-user-notifications/";
var friendsEndpoint = "api/friendship/";

$(document).ready(function() {

    if (CSS.supports('scrollbar-gutter', 'stable')) {
        console.log('Поддерживается');
    } else {
        console.log('Не поддерживается');
    }
    getQuerryTemplate("UserInterface", {}).then(InterfaceHTML => {
        $("header").append(InterfaceHTML);

        $(".account-button").on("mouseup", function (e) {
            if ($(".user-settings-container").css("display") == "none") {
                $("#not-cont").html("");
                $(".user-settings-container").show();
            }
        })
    
        $(document).on("click", function (e) {
            if ($(".user-settings-container").css("display") != "none" &&
                (!$(e.target).hasClass(".user-settings-container") &&
                    $(e.target).closest(".account-button").length == 0)) {
                $("#not-cont").html("");
                $(".user-settings-container").hide();
            }
        })


        $(".logout-butt").on("click", function () {
            console.log(Cookies.get("userGUID"));
            if (Cookies.get("userGUID") != null) {
                Cookies.remove("userGUID");
                window.location.href = 'http://127.0.0.1:5500/reglog.html';
            }
        })

        $(".notifications-butt").on("click", function (e) {
            getQuerryTemplate("NotificationContainer", {}).then(container => {
                $("#not-cont").html("");
                $("#not-cont").append(container);

                $(".notifications-container-inner").html("");

                notificationsAjax().then(notifications => {
                    if(notifications.length != 0) {
                        notifications.forEach(notification => {
                            notificationRender(notification);
                        })
                    }
                    else {
                        $(".notifications-container-inner").append("<p>There is nothing here...</p>")
                    }
                })
            })
        })    
    })
});


function notificationsAjax() {
    return new Promise((resolve, reject) => {
        var notification = [];
        let counter = 0;
        notificationsBoardAjax().then(notificationsBoard => {
            notification.push(...notificationsBoard);
            console.log(notificationsBoard);
            counter += 1;
        });
        notificationsFriendAjax().then(notificationsFriends => {
            notification.push(...notificationsFriends);
            console.log(notificationsFriends);
            counter += 1;
        });
        
        var ajInterval = setInterval(function() {
            if(counter == 2) {
                console.log(notification)
                resolve(notification);
                clearInterval(ajInterval);          
            } 
        }, 500)
    });
}

function notificationsFriendAjax() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `${endpoint}${friendsEndpoint}requests/user=${Cookies.get("userGUID")}`, 
            contentType: "application/json",
            // data: JSON.stringify(newTag),
            success: function (response) {
                Object.keys(response).forEach(item => {
                    item.type = "friend"
                })
                resolve(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    });
}

function notificationsBoardAjax() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `${endpoint}${notificationsEndpoint}user=${Cookies.get("userGUID")}`, 
            contentType: "application/json",
            // data: JSON.stringify(newTag),
            success: function (response) {
                Object.keys(response).forEach(item => {
                    response[item].type = "board";
                    response[item].sender = response[item].teamName;
                })

                resolve(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    });
}

function notificationRender(notification) {
    getQuerryTemplate("Notifications", notification).then(response => {
        $(".notifications-container-inner").append(response);
    })
}

function notificationManage(id, decision) {
    $.ajax({
        type: "PUT",
        url: `${endpoint}${notificationsEndpoint}notification=${id}&decision=${decision}`, 
        contentType: "application/json",
        // data: JSON.stringify(newTag),
        success: function (response) {
            console.log(response)
            $("#" + id + ".notification").remove();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(`Error: ${textStatus} - ${errorThrown}`);
        }
    });
}