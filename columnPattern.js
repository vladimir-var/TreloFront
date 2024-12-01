// function getTemplate(templates, target) {
//     var startTarget = "startPoint" + target;
//     var endTarget = "breakPoint" + target;

//     var startIndex = templates.indexOf(startTarget);
//     var endIndex = templates.lastIndexOf(endTarget);

//     return templates.substring(startIndex + startTarget.length, endIndex).trim();
// }

function getTemplate(templates, target) {
    var startTarget = "startPoint" + target;
    var endTarget = "breakPoint" + target;

    var startRegex = new RegExp(startTarget, "g");
    var endRegex = new RegExp(endTarget, "g");

    var startMatch = startRegex.exec(templates);
    if (!startMatch) {
        return "";
    }
    var startIndex = startMatch.index + startTarget.length;

    var endMatch;
    endRegex.lastIndex = startIndex;
    while ((endMatch = endRegex.exec(templates)) !== null) {
        if (endMatch.index > startIndex) {
            var endIndex = endMatch.index;
            return templates.substring(startIndex, endIndex).trim();
        }
    }

    return "";
}

function getQuerryTemplate(target, argumentalObject) {  
    return new Promise((resolve, reject) => {
        $.get('templates.html', function(templates) {
            var template = getTemplate(templates, target);

            if(template == "") {
                console.error("There is empty Template!");
                resolve("");
            }

            Object.keys(argumentalObject).forEach(key => {
                template = template.replaceAll("PLACEHOLDER" + key.toLowerCase(), argumentalObject[key]);
            });

            var resultHTML = template;
            resolve(resultHTML);
        });
    });
}
