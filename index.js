var endpoint = "https://localhost:7193/";
var cardsEndpoint = "api/cards/";
var statusEndpoint = "api/statuses/";
var boardsEndpoint = "api/boards/";
var tasksEndpoint = "api/tasks/";
var commentsEndpoint = "api/comments/";
var usersBoardEndpoint = "api/users/boards/";
var usersEndpoint = "api/users/";
var teamuserEndpoint = "api/team-user/"

var ciObject;

var isPopupOpened = false;

function dateFormater(dateToFormat) {
    var day, month;
    day = dateToFormat.getDate();
    month = dateToFormat.getMonth();

    if (day < 10) {
        day = "0" + day;
    }

    if (month < 10) {
        month = `0${month}`;
    }

    return dateToFormat.getFullYear() + "-" + month + "-" + day;
}

function getUrlParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function setStatId(id) {
    $("#idcolCardCreate").val(id);
}

function getDataFormat(date) {
    return new Date(date).toLocaleString("en", {
        month: "short",
        day: "numeric",
    });
}

function getTask(taskId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `${endpoint}${tasksEndpoint}${taskId}`,
            success: function (response) {
                var responseTask = response;
                resolve(responseTask);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // reject(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    })

}

function getTasks(cardId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `${endpoint}${cardsEndpoint}${cardId}/tasks`,
            success: function (response) {
                var responseTasks = response;
                resolve(responseTasks);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // reject(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    })

}

function getCard(cardId) {
    return new Promise(resolve => {
        $.ajax({
            type: "GET",
            url: `${endpoint}${cardsEndpoint}${cardId}`,
            success: function (response) {
                var responseCard = response;
                resolve(responseCard);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // reject(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    })
}

function toggleTaskCompletion(taskid) {

    $.ajax({
        type: "GET",
        url: `${endpoint}${tasksEndpoint}${taskid}/change-complete-status`,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        contentType: "json",
        success: function (response) {
            console.log(response);
            getTask(taskid).then(task => {
                getTasks(task.idCard).then(responseTasks => {
                    updateProgress(responseTasks);

                    getCard(task.idCard).then(responseCard => {
                        miniatureRender(responseCard);
                    });
                })
            })
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(`Error: ${textStatus} - ${errorThrown}`);
        }
    });


}

function updateProgress(tasks, deletingTaskID = null) {
    const totalTasks = deletingTaskID != null ? tasks.length - 1 : tasks.length;
    const completedTasks = tasks.filter(task => task.iscompleted == true && task.id != deletingTaskID).length;
    const progressPercentage = Math.floor((totalTasks === 0) ? 0 : (completedTasks / totalTasks) * 100);
    

    $('.side-card-progress-bar-fill').stop().animate({
        width: `${progressPercentage}%`
    }, {
        duration: 500,
        easing: 'swing'
    });
    $('.side-card-progress-bar-fill').html(progressPercentage + "%");
}

function checkboxesReload(tasks) {
    $("input:checkbox").change(function (e) {
        e.stopImmediatePropagation()
        console.log(e.target);
        var identifier = $(e.target).attr("id").slice(0, 4) == "task" ? $(e.target).attr("id").slice(5) : undefined;
        if (identifier == undefined) return;

        toggleTaskCompletion(identifier);
        getTask(identifier).then(task => {
            getTasks(task.idCard).then(responseTasks => {
                updateProgress(responseTasks);
            })
        })

    })
}

function clickReload() {
    $(".main-card").off("dbclick").on("dbclick", function () {
        var sidePanelObj = $(".side-panel-card");

        if (sidePanelObj.css("right")[0] == "-") {
            sidePanelObj.animate({
                "right": "10px"
            }, 850)
        }
        else {
            sidePanelObj.animate({
                "right": "-65%"
            }, 850)
        }
    })
}

function dragulaReload() {
    var drake = dragula($(".helping-container").toArray(), {
        invalid: function (el, handle) {
            return el.classList.contains("card-plus-but");
        },
    });

    drake.on("drop", function (el, target, source, sibling) {
        var cardid = $(el).data("card-id");
        var columnid = $(target).attr("id");
        var cardTitle = $(el).find('.card-main-text').text();

        console.log(cardid + " " + columnid);
        console.log($(target));
        
        $.ajax({
            type: "PUT",
            url: endpoint + cardsEndpoint,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            data: JSON.stringify({
                id: cardid,
                title: cardTitle,
                idStatus: columnid,
            }),
            success: function (data, status) {
                console.log(data);
            },
            error: function (jqXHR, textStatus) {
                console.warn(textStatus + "|" + jqXHR.responseText);
            },
            dataType: "json",
        });
    });
}

function columnSettingsRender(id) {
    var target = "#" + id + ".main-card-men";
    console.log(target);
    getQuerryTemplate("Popup", { id: id }).then((resultHTML) => {
        $("#content").append(resultHTML);

        $("#" + id + ".popup-window").hide();

        $(target).on("click", function (e) {
            isPopupOpened = true;

            $("#" + id + ".popup-window").show();
            $("#" + id + ".popup-window").css("left", e.pageX).css("top", e.pageY);
        });
    }).catch(function (error) {
        console.log(error);
    });
}

function columnRender(data) {
    getQuerryTemplate("Column", { name: data.name, id: data.id }).then(
        (resultHTML) => {
            $("article.main-cards-container").append(resultHTML);
        }
    );

    columnSettingsRender(data.id);
}

// Функция для рендеринга карточки
function cardRender(data) {
    getQuerryTemplate("Card", {
        title: data.title,
        label: data.label,
        deadline: getDataFormat(data.deadline),
        cardid: data.id,
        columnid: data.idStatus,
    }).then((resultHTML) => {
        $.ajax({
            type: "GET",
            url: `${endpoint}api/cards/${data.id}/tags`,
            dataType: "json",
            success: function (response) {
                $("#" + data.idStatus + ".helping-container").prepend(resultHTML);

                var tags = response.map(tag => `${tag.name}`);
                tags.forEach(tag => { 
                    let htmlTag = `<p class="card-tag card-sm-text">${tag}</p>`;
                    $("#" + data.id + ".card-header-man").append(htmlTag);
                })

                miniatureRender(data);
                clickReload();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
            },
        });

        
        dragulaReload();
    });
}

function miniatureRender(card) {
    $("#" + card.id + ".card-footer-man").html("");
    console.log(card)

    if(card.deadline != null) {
        let div = `<div class="d-inline-flex">
                    <img
                        src="assets/free-icon-clock-2088617.png"
                        class="card-sm-img clock-img"
                    />
                    <p class="card-text card-sm-text text-footer sm-mar-l">
                        ${getDataFormat(card.deadline)}
                    </p>
                    </div>`;
        $("#" + card.id + ".card-footer-man").append(div);
    }


    if(card.label != null && card.label != "") {
        let div = `<div class="d-inline-flex m-mar-l">
                      <img src="assets/description_min.png" class="card-sm-img">
                   </div>`;
        $("#" + card.id + ".card-footer-man").append(div);
    }

    if(card.taskDTOs.length != 0) { 
        let maxTasks = card.taskDTOs.length
        let complated = 0;
        card.taskDTOs.forEach(task => {
            if(task.iscompleted){
                complated += 1;
            }
        });

        let style = "";

        if(maxTasks == complated) {
            style = "background-color: #318f4a; padding-right: 5px; border-radius: 5px;"
        }

        let div = `<div class="d-inline-flex m-mar-l" style="${style}">
                      <p class="card-text card-sm-text text-footer sm-mar-l">${complated}/${maxTasks}</p>
                   </div>`;
        $("#" + card.id + ".card-footer-man").append(div);
    }
    if(card.userDtos.length != 0) {
        console.log(card.userDtos.length);
        let styles = "width: 21px; height: 21px;";

        card.userDtos.forEach(item => {
            console.log(item)
            if(item.guid == Cookies.get("userGUID")) {
                
                styles = "background-color: #e65cdd; padding: 5px; width: 30px; height: 30px; border-radius: 5px;"
                return;
            };
        });

        let div = `<div class="d-inline-flex m-mar-l">
                    <img src="assets/group-icon-2.png" class="card-sm-img" style="${styles}">
                </div>`;
        $("#" + card.id + ".card-footer-man").append(div);
    }
}

function loadBoards() {
    //var boards = Cookies.get("recent") != undefined ? JSON.parse(Cookies.get("recent")) : [];
    var currentBoardId = getUrlParameter("boardid"); 
    var userGUID = Cookies.get("userGUID");
    var usedIdentifiers = [];
    console.log("fffffffffffff", currentBoardId);
    /* for(let i = 0; i < 3; i++) {
        let identifier;
        if(boards[i] != undefined) {
            identifier = boards[i];
        }
        else {
            continue;
        }
 */
        $.ajax({
            type: "GET",
            url: `${endpoint}${boardsEndpoint}${currentBoardId}&user=${userGUID}`,
            dataType: "json",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            success: function (response) {
                $(".My-boards-container-dropdown-menu").prepend(`<li><a type="button" href="http://127.0.0.1:5500/index.html?boardid=${currentBoardId}">${response.name}</a></li>`)
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(
                    `${textStatus} - ${errorThrown}`
                );
            },
        });
   // }
}

$(document).ready(function () {
    searchButtonLoad();

    getBoard().then(response => {
        Object.keys(response.statusColumns).forEach((item) => {
            columnRender(response.statusColumns[item]);
        });

        Object.keys(response.cards).forEach((item) => {
            cardRender(response.cards[item]);
        });

        getQuerryTemplate("Title", response).then((resultHTML) => {
            $(".aside-h-container").append($(resultHTML));
            ciObject = new ChangingInput();
            ciObject.reload();
        })
        
        loadBoards();

        dragulaReload();
    })


    $("#team-man").on("click", function() {
        loadTeamUsers();
    })
    $("#buttonColumnCreate").on("click", function () {
        $.ajax({
            type: "POST",
            url: endpoint + statusEndpoint,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            data: JSON.stringify({
                name: document.getElementById("titleColumnCreate").value.toString(), idBoard: getUrlParameter("boardid")
            }),
            success: function (data, status) {
                console.log(data);
                columnRender(data);
                dragulaReload();
            },
            error: function (jqXHR, textStatus) {
                console.warn(textStatus + "|" + jqXHR.responseText);
            },
            dataType: "json",
        });
    });

    $("#buttonCardCreate").on("click", function () {
        if ($("#titleCardCreate").val().length == 0) {
            console.warn("There is an error in data input!");
            return;
        }

        var data = {
            title: $("#titleCardCreate").val(),
            label: $("#textCardCreate").val(),
            startdate: dateFormater(new Date()),
            deadline: $("#dateCardCreate").val(),
            idStatus: $("#idcolCardCreate").val(),
            idBoard: getUrlParameter("boardid")
        };

       
        var userGuid = Cookies.get("userGUID");
        console.log(userGuid);

        Object.keys(data).forEach(function (k) {
            if (data[k] == undefined) data[k] = null;
        });

        console.log(JSON.stringify(data));

        $.ajax({
            type: "POST",
            url: endpoint + cardsEndpoint,
            data: JSON.stringify(data),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            success: function (cardData, status) {
                console.log(cardData);
                cardRender(cardData);
                dragulaReload();
                miniatureRender(cardData);

                
                if(userGuid){

                 addUserToCard(cardData.id,userGuid)

                }
             
            },
            error: function (jqXHR, textStatus) {
                console.warn(textStatus + "|" + jqXHR.responseText);
            },
            dataType: "json",
        });
    });

    $(document).on("click", ".main-card", function () {
        var cardId = $(this).data("card-id");
        var id_status = $(this).data("column-id");
        getCardObj(cardId).then(response => {
            console.log(response);
            updateCardSettingsMenu(response);
            loadComments(response.cardCommentDTOs)
        });
        
        updateColumnTitle(id_status);

        console.log("column-id" + id_status);

        var sidePanelObj = $(".side-panel-card");

        if (sidePanelObj.css("right")[0] == "-" || sidePanelObj.css("right")[0] == "0") {
            sidePanelObj.stop().animate({
                "right": "0.1px"
                
            }, 1500)
        }
        else {
            sidePanelObj.stop().animate({
                "right": "-65%"
            }, 1500)
        }

        $("textarea[placeholder='Add more detailed description...']").off('change').on('change', function () {
            var newLabel = $(this).val();
            saveCardLabel(cardId, newLabel);
        });

        $("#commentSaveButton").off("click").on("click", function() {
            let userId = Cookies.get("userGUID");
            addComment(userId, cardId, $("#commentText").val());
        })


        $(document).on("click", ".delete-card-button", function () {
            deleteCard(cardId);
        });

        function getCardObj(cardid) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: "GET",
                    url: `${endpoint}${cardsEndpoint}${cardId}`,
                    dataType: "json",
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
            })
        }

        function loadComments(comments) {
            $(".side-card-comments-container").html("");
            Object.keys(comments).forEach(key => {
                let comment = comments[key];
                console.log(comment)
                getQuerryTemplate("Comment", {firstletter: comment.user.userName[0].toUpperCase(), 
                                            username: comment.user.userName, 
                                            commenttext: comment.commentText}).then(resultHTML => {
                    $(".side-card-comments-container").append(resultHTML);
                })
            })
        }

        function addComment(userId, cardId, text) {
            $.ajax({
                type: "POST",
                url: `${endpoint}${commentsEndpoint}`,
                data: JSON.stringify({commentText: text, idCard: cardId, GuidUser: userId}),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                dataType: "json",
                success: function (response) {
                    getCardObj(cardId).then(response => {
                        loadComments(response.cardCommentDTOs);
                        $("#commentText").val("");
                    })
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(`Error: ${textStatus} - ${errorThrown}`);
                }
            })
        }

        function deleteCard(cardId) {
            $.ajax({
                type: "DELETE",
                url: `${endpoint}${cardsEndpoint}${cardId}`,
                success: function (response) {
                    console.log(response);

                    $(`[data-card-id='${cardId}']`).remove();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(`Error: ${textStatus} - ${errorThrown}`);
                }
            });
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////
      
        
           
        $(document).ready(function () {
                        var labelsList = $('#labelsList');
            var labelsPopup = $('#labelsPopup');
            var currentBoardId = getUrlParameter("boardid");
            var currentCardId = cardId;
        
            $('#showLabelsBtn').on('click', function () {
                labelsPopup.toggle();
                    loadBoardTags(currentBoardId);
            });
        
            $(document).mouseup(function (e) {
                if (!labelsPopup.is(e.target) && labelsPopup.has(e.target).length === 0) {
                    labelsPopup.hide();
                }
            });
        
            $('#createLabelBtn').off("click").on('click', function () {
                var newLabelName = $('#newLabelName').val().trim();
                if (newLabelName === "") {
                    alert("Введите название тега");
                    return;
                }
        
                var newTag = {
                    name: newLabelName,
                    idBoard: currentBoardId
                };
        
                $.ajax({
                    type: "POST",
                    url: `${endpoint}api/tags`,
                    contentType: "application/json",
                    data: JSON.stringify(newTag),
                    success: function (response) {
                        $('#newLabelName').val('');
                        loadBoardTags(currentBoardId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
            });
        
            function loadBoardTags(boardId) {
                $.ajax({
                    type: "GET",
                    url: `${endpoint}api/boards/${boardId}/tags`,
                    dataType: "json",
                    success: function (response) {
                        loadCardTags(currentCardId, response);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
              
            }
        
            function loadCardTags(cardId, allTags) {
                $.ajax({
                    type: "GET",
                    url: `${endpoint}${cardsEndpoint}${cardId}`,
                    dataType: "json",
                    success: function (card) {
                        renderLabels(allTags, card.tagDTOs || []);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error fetching card ${cardId}: ${textStatus} - ${errorThrown}`);
                    }
                });
            }
        
            function renderLabels(allLabels, cardLabels) {
                labelsList.empty();
                var cardLabelIds = cardLabels.map(label => label.id);
        
                if (allLabels && allLabels.length > 0) {
                    allLabels.forEach(function (label) {
                        var labelItem = $(`<div class="label-item" data-id="${label.id}">🏷️${label.name}</div>`);
                        if (cardLabelIds.includes(label.id)) {
                            labelItem.addClass('selected');
                        }
                        labelItem.hover(
                            function () {
                                $(this).css({ backgroundColor: 'black', border: '1px solid #fff' });
                            },
                            function () {
                                $(this).css({ backgroundColor: '', border: '' });
                            }
                        );
                        labelItem.click(function () {
                            var tagId = $(this).data('id');
                            if (labelItem.hasClass('selected')) {
                                removeTagFromCard(tagId);
                                labelItem.removeClass('selected');
                            } else {
                                addTagToCard(tagId);
                                labelItem.addClass('selected');
                            }
                        });
                        labelsList.append(labelItem);
                    });
                } else {
                    labelsList.append(`<div>Нет тегов, привязанных к этой карте</div>`);
                }
            }
        
            function addTagToCard(tagId) {
                var cardTag = { idCard: currentCardId, idTags: tagId };
                $.ajax({
                    type: "POST",
                    url: `${endpoint}api/card-tags`,
                    contentType: "application/json",
                    data: JSON.stringify(cardTag),
                    success: function (response) {
                        console.log(`Тег добавлен на карту: ${tagId}`);
                        updateCardTags(currentCardId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
            }
        
            function removeTagFromCard(tagId) {
                $.ajax({
                    type: "DELETE",
                    url: `${endpoint}api/card-tags/card=${currentCardId}&tag=${tagId}`,
                    success: function (response) {
                        console.log(`Тег удален с карты: ${tagId}`);
                        updateCardTags(currentCardId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
            }
        
            function updateCardTags(cardId) {
                $.ajax({
                    type: "GET",
                    url: `${endpoint}${cardsEndpoint}${cardId}`,
                    dataType: "json",
                    success: function (card) {
                        var cardTags = card.tagDTOs || [];
                        var tagsHtml = cardTags.map(tag => `<p class="card-tag card-sm-text">${tag.name}</p>`).join('');
                        $("#" + cardId + ".card-header-man").html(tagsHtml);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error fetching card ${cardId}: ${textStatus} - ${errorThrown}`);
                    }
                });
            }
        });
        
            
        
        
         ///     //////////////////////////////////////////////////////////
        $(document).ready(function () {
            var currentBoardId = getUrlParameter("boardid"); 
            currentCardId = cardId;
            var userGUID = Cookies.get("userGUID");
            $('#showMembersBtn').on('click', function () {
                console.log("members");
                $('#membersPopup').toggle();
        
                if ($('#membersPopup').is(':visible')) {
                    loadMembers(currentBoardId, currentCardId);
                }
            });
        
            $(document).mouseup(function (e) {
                var membersPopup = $('#membersPopup');
                if (!membersPopup.is(e.target) && membersPopup.has(e.target).length === 0) {
                    membersPopup.hide();
                }
            });
        
            function loadMembers(boardId, cardId) {
                $.ajax({
                    type: "GET",
                    url: `${endpoint}api/boards/${boardId}&user=${userGUID}`,
                    dataType: "json",
                    success: function (response) {
                        renderMembers(response, cardId);
                        getCard(cardId).then(responseCard => {
                            miniatureRender(responseCard);
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
        
            }
        
            function renderMembers(boardData, cardId) {
                var cardMembersList = $('#cardMembersList');
                var boardMembersList = $('#boardMembersList');
                cardMembersList.empty();
                boardMembersList.empty();
        
                var cardMembers = boardData.cards.find(card => card.id === cardId).userDtos || [];
                var boardMembers = boardData.users || [];
        
                var cardMemberGuids = cardMembers.map(member => member.guid);
                var nonCardMembers = boardMembers.filter(member => !cardMemberGuids.includes(member.guid));
        
                cardMembers.forEach(function (member) {
                    var memberItem = $(`<div class="member-item" data-guid="${member.guid}">👥${member.userName}</div>`);
                    memberItem.click(function () {
                        removeUserFromCard(currentCardId, member.guid);
                    });
                    cardMembersList.append(memberItem);
                });
        
                nonCardMembers.forEach(function (member) {
                    var memberItem = $(`<div class="member-item" data-guid="${member.guid}">👥${member.userName}</div>`);
                    memberItem.click(function () {
                        addUserToCard(currentCardId, member.guid);
                    });
                    boardMembersList.append(memberItem);
                });
            }
        
            function addUserToCard(cardId, userGuid) {
                    $.ajax({
                        type: "POST",
                        url: `${endpoint}api/user-card/cardId=${cardId}&userGuid=${userGuid}`,
                        success: function (response) {
                            console.log(`User added to card: ${userGuid}`);
                            loadMembers(currentBoardId, currentCardId);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.error(`Error: ${textStatus} - ${errorThrown}`);
                        }
                    });
            }
        
            function removeUserFromCard(cardId, userGuid) {
                $.ajax({
                    type: "DELETE",
                    url: `${endpoint}api/user-card/card=${cardId}&user=${userGuid}`,
                    success: function (response) {
                        console.log(`User removed from card: ${userGuid}`);
                        loadMembers(currentBoardId, currentCardId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
            }
        
            function getUrlParameter(name) {
                var urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(name);
            }
        });
        
            
    })

    function updateCardSettingsMenu(cardObj) {
        $("textarea[placeholder='Add more detailed description...']").val(cardObj.label);
        $(".side-card-side-card-text").text(cardObj.title);

        if (cardObj.taskDTOs != undefined) {
            getQuerryTemplate("Tasksdiv", {cardid: cardObj.id}).then(resultHTML => {

                    $("#task-cont-div").html(resultHTML);

                    renderTasks(cardObj.taskDTOs);
                    updateProgress(cardObj.taskDTOs);
                    miniatureRender(cardObj);
                })
                
            }
        };

    function updateColumnTitle(id_status) {

        $.ajax({
            type: "GET",
            url: `${endpoint}${statusEndpoint}${id_status}`,
            dataType: "json",
            success: function (response) {

                var columnTitle = response.name;


                $(".side-card-side-card-column-text").text("In the column " + columnTitle);


            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    }

    // function updateCardLabel(cardId) {
    //     $.ajax({
    //         type: "GET",
    //         url: `${endpoint}${cardsEndpoint}${cardId}`,
    //         dataType: "json",
    //         success: function (response) {
    //             var cardLabel = response.label;
    //             $("textarea[placeholder='Add more detailed description...']").val(cardLabel);
    //         },
    //         error: function (jqXHR, textStatus, errorThrown) {
    //             console.error(`Error: ${textStatus} - ${errorThrown}`);
    //         }
    //     });
    // }

    function saveCardLabel(cardId, newLabel) {
        $.ajax({
            type: "GET",
            url: `${endpoint}${cardsEndpoint}${cardId}`,
            dataType: "json",
            success: function (cardData) {

                cardData.label = newLabel;


                $.ajax({
                    type: "PUT",
                    url: `${endpoint}${cardsEndpoint}`,
                    contentType: "application/json",
                    data: JSON.stringify(cardData),
                    success: function (response) {
                        console.log(`Card ${cardId} label updated successfully`);
                        miniatureRender(cardData);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    }



    function createTask(taskData) {
        $.ajax({
            type: "POST",
            url: `${endpoint}${tasksEndpoint}`,
            data: JSON.stringify(taskData),
            contentType: "application/json",
            success: function (response) {
                renderTask(response);

                getTasks(response.idCard).then(responseTasks => {
                    updateProgress(responseTasks);
                });

                getCard(taskData.idCard).then(responseCard => {
                    miniatureRender(responseCard);
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    }

    function deleteTask(tasksId) {
        getTask(tasksId).then(task => {
            getTasks(task.idCard).then(responseTasks => {
                $.ajax({
                    type: "DELETE",
                    url: `${endpoint}${tasksEndpoint}${tasksId}`,
                    success: function (response) {
                        $("div.actualy-task-container#" + tasksId).remove();
                        updateProgress(responseTasks, tasksId);
                        getCard(task.idCard).then(responseCard => {
                            console.log(responseCard);
                            miniatureRender(responseCard);
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error: ${textStatus} - ${errorThrown}`);
                    }
                });
            })
        })


    }







    function renderTasks(tasks) {
        console.log(tasks);
        tasks.forEach(task => {
            renderTask(task);
        })

        $("#AddTask").on("click", function() {
            createTask({title: "click me", idCard: $(this).data("cardid")})
        })
    }

    function renderTask(task) {
        console.log(task);
        getQuerryTemplate("Taskobj", task).then(resultHTML => {
            var $result = $(resultHTML);

            $("#tasks-div").append($result);
            $result.find(".cross-ico-task").off("click").on("click", function() {
                deleteTask($(this).attr("id"))
            });
            checkboxesReload();
            ciObject.reload();
        })
    }


    $(document).mouseup(function (e) {
        var divs = $(".popup-window");
        if (divs == null) {
            return;
        }

        divs.hide();
    });


    $('#My-boards-button').on('click', function (event) {
        var $menu = $('.My-boards-container-dropdown-menu');
        if ($menu.hasClass('show')) {
            $menu.removeClass('show');
        } else {
            $menu.addClass('show');
        }
        event.stopPropagation();
    });

    $(document).on('click', function (event) {
        if (!$(event.target).closest('.My-boards-container').length) {
            $('.My-boards-container-dropdown-menu').removeClass('show');
        }
    });

    $('.My-boards-container-dropdown-menu li').on('click', function () {
        $('.My-boards-container-dropdown-menu').removeClass('show');
    });

    $(".header-main-text").on("click", function() {
        window.location.href = "http://127.0.0.1:5500/home_page_layout.html";
    })

    $(document).mouseup(function (e) {
        if (isPopupOpened &&
            (!$(e.target).hasClass("popup-window") &&
                $(e.target).closest(".popup-window").length == 0)) {
            console.log("Text;");
            isPopupOpened = false;
            $(".popup-window").toArray().forEach(element => {
                $(element).hide();
            })
        }

        if ($(".side-panel-card").css("right")[0] != "-"
            && $(e.target).closest(".side-panel-card").length == 0) {
            $(".side-panel-card").animate({
                "right": "-65%"
            }, 1500)
        }
    });



   
});


// BUTTON SETTINGS ROOTING

$(document).ready(function () {
    $("#settings-button-js").click(function () {
        var userGUID = Cookies.get("userGUID");
        if (userGUID != null) {
            var targetUrl = 'http://127.0.0.1:5500/profile-settings/profile_settings.html?userGUID=' + encodeURIComponent(userGUID) + '#public-profile';
            window.location.href = targetUrl;
        } else {
            console.log("userGUID is not available");
        }
    });
  });





  function getBoard() {
    var currentBoardId = getUrlParameter("boardid"); 
    return new Promise(resolve => {
        $.ajax({
            type: "GET",
            url: `${endpoint}${boardsEndpoint}${currentBoardId}&user=${Cookies.get("userGUID")}`, 
            contentType: "application/json",
            success: function (response) {
                resolve(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Error: ${textStatus} - ${errorThrown}`);
            }
        });
    })
    
}

$(document).ready(function () {
    // Закрытие модального окна при нажатии на крестик для create
    $('#closeModalBtn').on('click', function () {
        $.modal.close();
    });

    // Закрытие модального окна при нажатии на крестик для create-column
    $('#closeColumnModalBtn').on('click', function () {
        $.modal.close();
    });
});
