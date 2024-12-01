
var endpoint = "https://localhost:7193/";

$(document).ready(function () {
    $("#go-back-js").click(function () {
        window.location.href = 'http://127.0.0.1:5500/home_page_layout.html';
    });

    $('#password-fields').hide();
    $('.change-password-setting').click(function () {
        $('#password-fields').toggle();
    });

    function getQueryParam(param) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    var userGUID = getQueryParam('userGUID');
    if (userGUID != null) {
        $.ajax({
            type: "GET",
            url: `${endpoint}api/users/guid=${userGUID}`,
            dataType: "json",
            success: function (response) {
                updateUserInfo(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    } else {
        console.log("userGUID is not available in URL");
    }

    function updateUserInfo(user) {
        if (user) {
            $('.username').text(user.userName);
            $('.email').text(user.email);
            console.log(user.configurationDTO); 
            if (user.configurationDTO && user.configurationDTO.isprivateTeamNotification) {
                $('#accessibilitySelect').val('private');
            } else {
                $('#accessibilitySelect').val('public');
            }
        } else {
            console.error("User data is not available");
        }
    }

    $('#accessibilitySelect').change(function () {
        var selectedValue = $(this).val();

        $.ajax({
            type: "PUT",
            url: `${endpoint}api/config/change/team-notification-privacy/guid=${userGUID}`,
            contentType: "application/json",
            success: function (response) {
                console.log("Response:", response);
                alert(`Accessibility changed to ${selectedValue}`);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
                alert("Error changing accessibility");
            }
        });
    });


    
});

$(document).ready(function () {
 
  var userGUID = getQueryParam('userGUID');
 

  $('#changeUsernameBtn').click(function () {
      $('#usernameChangeForm').toggle();
      console.log(userGUID);
  });


  $('#saveUsernameBtn').click(function () {
      var newUsername = $('#newUsername').val().trim();
      if (newUsername === "") {
          alert("Please enter a new username");
          return;
      }

      var userUpdateData = {
          Guid: userGUID,
          UserName: newUsername
      };

      $.ajax({
          type: "PUT",
          url: `${endpoint}api/users/`,
          contentType: "application/json",
          data: JSON.stringify(userUpdateData),
          success: function (response) {
              alert("Username successfully updated");
              $('#usernameChangeForm').hide();
              
              $('.username').text(newUsername);
          },
          error: function (jqXHR, textStatus, errorThrown) {
              console.error(`Error: ${textStatus} - ${errorThrown}`);
              alert("Error updating username");
          }
      });
  });



 
  $('#changePasswordBtn').click(function () {
    $('#passwordChangeForm').toggle();
  });


  $('#updatePasswordBtn').click(function () {
    var newPassword = $('#new-password').val().trim();
    var confirmNewPassword = $('#confirm-new-password').val().trim();

    if (newPassword === "" || confirmNewPassword === "") {
      alert("Please fill out all password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match");
      return;
    }

    var passwordUpdateData = {
      Guid: userGUID,
      password: newPassword
    };
    
    $.ajax({
      type: "PUT",
      url: `${endpoint}api/users/`, 
      contentType: "application/json",
      data: JSON.stringify(passwordUpdateData),
      success: function (response) {
        alert("Password successfully updated");
        $('#passwordChangeForm').hide();

        $('#new-password').val(''); 
        $('#confirm-new-password').val('');
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(`Error: ${textStatus} - ${errorThrown}`);
        alert("Error updating password");
      }
    });

    console.log(passwordUpdateData)
  });















  function getQueryParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }




});


