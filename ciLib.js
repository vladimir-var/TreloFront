class ChangingInput {
    #changeToInput(element) {
        const self = this;

        var newElement = $(`<input 
                                id="${$(element).data("ci-id")}"
                                data-element-type="${$(element).prop('nodeName')}" 
                                data-element-class="${$(element).attr("class")}" 
                                data-element-id="${$(element).attr("id")}"
                                data-ci-url="${$(element).data("ci-url")}"
                                data-req-var-name="${$(element).data("req-var-name")}"
                                class="ci-input-form"
                                value="${$(element).html().trim()}"
                                style="font-size: 80%"
                            />`);
        $(element).before(newElement);
        $(element).remove();
    }
    
    #changeFromInput(element) {
        const self = this;

        var newElement = $(`<${$(element).data('element-type')} 
                                data-ci-id="${$(element).attr("id")}" 
                                data-ajax="${$(element).attr("id")}" 
                                class="${$(element).data("element-class") || ""}" 
                                data-ci-url="${$(element).data("ci-url")}"
                                data-req-var-name="${$(element).data("req-var-name")}"
                                id="${$(element).data("element-id")}"
                            >
                                ${$(element).val().trim()}
                            </${$(element).data('element-type')}>`);
        $(element).before(newElement);
        $(element).remove();

        self.#reload(newElement);
    }

    #initialization() {
        const self = this;
        $(`[data-ci-id]`).off("click").on("click", function() {
            var selectedElement = $(this);
            self.#changeToInput(selectedElement);

            setTimeout(() => {
                var selectedInput = $(`input#${selectedElement.data("ci-id")}.ci-input-form`);

                if (selectedInput.length > 0) {
                    selectedInput.focus();
                    selectedInput.on("blur", function() {
                        var data = { id: selectedInput.attr("id") };
                        data[selectedInput.data("req-var-name")] = selectedInput.val();
                        Ajax.request(selectedInput.data("ci-url"), "PUT", data).then(() => {
                            self.#changeFromInput(selectedInput);
                        }).catch(err => {
                            console.error("Ajax request failed:", err);
                        });
                    });
                } else {
                    console.error("Selected input not found:", selectedInput);
                }
            }, 100);
        });
    }

    reloadElement(reloadingElement) {
        const self = this;
        self.#reload(reloadingElement);
    }

    reload() {
        const self = this;
        self.#initialization();
    }

    #reload(reloadingElement) {
        const self = this;
        reloadingElement.off("click").on("click", function() {
            var selectedElement = $(this);
            self.#changeToInput(selectedElement);
            setTimeout(() => {
                var selectedInput = $(`input#${selectedElement.data("ci-id")}.ci-input-form`);

                if (selectedInput.length > 0) {
                    selectedInput.focus();
                    selectedInput.on("blur", function() {
                        var data = { id: selectedInput.attr("id") };
                        data[selectedInput.data("req-var-name")] = selectedInput.val();
                        Ajax.request(selectedInput.data("ci-url"), "PUT", data).then(() => {
                            self.#changeFromInput(selectedInput);
                        }).catch(err => {
                            console.error("Ajax request failed:", err);
                        });
                    });
                } else {
                    console.error("Selected input not found:", selectedInput);
                }
            }, 100);
        });
    }

    constructor() {
        this.#initialization();
    }

    // #subRequest(url, sendingDataName, sendingData) {
    //     var data = {};
    //     data[sendingDataName] = sendingData;

    //     Ajax.request(url, "PUT", data);
    // }
}

class Ajax {
    static request(url, method, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: method,
                url: url,
                data: JSON.stringify(data),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                dataType: "json",
                success: function (response) {
                    resolve(response);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    reject(`${textStatus} - ${errorThrown}`);
                },
            });
        });
    }
}

