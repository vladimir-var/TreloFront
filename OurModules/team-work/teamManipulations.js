function userSelectReload() {
    $(".team-list-item-content").off("click").on("click", function(e) {
      getUser("", $(e.target).closest(".team-list-item-content").attr("id")).then(user => {
        getBoard().then(response => {       
            addUser(response.idTeam, user.guid);
            $(".users-select").hide();
        })
      })
    })
  }

  function addUser(teamid, userid) {
    $.ajax({
        type: "POST",
        url: `${endpoint}${teamuserEndpoint}add/team=${teamid}&user=${userid}&isAdmin=${Cookies.get("userGUID")}`,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          // data: JSON.stringify({team: teamid, user: userid}),
  
          success: function(data) {
            if(data == "User added to team") {
              loadTeamUsers();
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log("AJAX error:", textStatus, errorThrown);
            console.log("Response:", jqXHR.responseText);
          },
      });
  }

  function searchButtonLoad() {
    $("#searchButton").on("click", function() {
        $(".users-select").show();
        $(".users-select").html("");
    
        getUser($("#search_user_input").val()).then((user) => {
          Object.keys(user).forEach(key => {
            var tempUser = user[key];

            console.log(tempUser);
    
            getQuerryTemplate("Teamusercard", {guid: tempUser.guid, username: tempUser.userName}).then((resultHTML) =>{
              $(".users-select").append(resultHTML);
              userSelectReload();
            })       
          })
        })
      })
}

function getUser(username, guid = null) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "GET",
        url: guid == null ? `${endpoint}${usersEndpoint}search/${username}` : `${endpoint}${usersEndpoint}guid=${guid}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // data: guid == null ? {} : {guid: guid},
  
        success: function(data) {
          var user = data;
          // console.log("guid");
          // console.log(data);
          resolve(user);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error(
            `Ошибка при получении данных: ${textStatus} - ${errorThrown}`
          );
        },
      })
    });
  }

  function deleteUserFromTeam(teamid, userid) {
      $.ajax({
        type: "DELETE",
        url: `${endpoint}${teamuserEndpoint}team=${teamid}&user=${userid}&isAdmin=${Cookies.get("userGUID")}`,
        success: function(response) {
          loadTeamUsers();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(`Error: ${textStatus} - ${errorThrown}`);
        }
    });
  }

  function loadTeamUsers() {
    $(".team-list-item").html("");

        getBoard().then(response => {
            Object.keys(response.users).forEach(key => {
                console.log(response.users[key]);
                getQuerryTemplate("Teamusercard", response.users[key]).then(resultHTML => {
                    $(".team-list-item").append(resultHTML);
                    $("#" + response.users[key].guid + ".cross-ico-team-list").off("click").on("click", function() {
                      deleteUserFromTeam(response.idTeam, response.users[key].guid);
                    })
                })
            })
        })
}