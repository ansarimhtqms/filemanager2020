class fM2020 {

    constructor(elementId, options) {
        this.elementId = elementId;
        this.totalFiles = [];
        if (options != undefined && options != null && options != "") {
            this.allowedExtensions = options.allowedExtensions;
            this.minimumFileSize = options.minimumFileSize; //size in mb
            this.maximumFileSize = options.maximumFileSize; //size in mb
            this.minimumFiles = options.minimumFiles;
            this.maximumFiles = options.maximumFiles;
            this.uiMode = options.uiMode; //inline or table
            this.sortable = options.sortable //allow sorting of files true or false
            this.containerBackgroundColor = options.containerBackgroundColor;
            this.fileDialogueTriggerButtonColor = options.fileDialogueTriggerButtonColor;
            this.fileDialogueTriggerButtonTextColor = options.fileDialogueTriggerButtonTextColor;
            this.fileDialogueTriggerButtonText = options.fileDialogueTriggerButtonText;
            this.previewText = options.previewText;
            this.contentTextColor = options.contentTextColor;
        }
    }

    initialize() {
        var _this = this;

        // hide the default input.
        document.getElementById(_this.elementId).style.display = "none";

        // create custom upload container
        var container = ''
            + '<div id="_5d810f66cf0a4a7f9f6b841b81f4201e" style="' + _this.getElement("parentContainerStyle") + '">'
            + ' <button style="' + _this.getElement("fileDialogueTriggerButtonStyle") + '" onclick="document.getElementById(\'' + _this.elementId + '\').click()">' + _this.getElement("fileDialogueTriggerButtonText") + '</button>'
            + ' <div id="_f8ff8463348f4de08ce80818ff1a1126" style="padding:5px;margin-top:10px;overflow-x:auto;letter-spacing:2px;color:' + _this.getElement("contentTextColor") + ';">'
            + '  <div id="previewText">' + _this.getElement("previewText") + '</div>'
            + ' </div>'
            + ' <div id="_92a30ffff5564e68aab943fc489f10b3" style="color:red;"></div>'
            //+ ' <div style="text-align:left;">Total files: <span>0</span></div>'
            + '</div>';

        // insert the created custom container
        document.getElementById(_this.elementId).parentNode.innerHTML += container;
        _this.addDeleteEventToParent("_f8ff8463348f4de08ce80818ff1a1126");
        this.addChangeEventToInput();
    }

    addChangeEventToInput() {
        var _this = this;
        var invalidFileCounts = 0;
        var filePreviewContainerId = '_f8ff8463348f4de08ce80818ff1a1126';
        document.getElementById(_this.elementId).addEventListener("change", function () {

            //Resetting the invalidCount to 0 every time the input changes
            invalidFileCounts = 0;

            // get all files
            var _files = document.getElementById(_this.elementId).files;

            // min files validation
            if (_this.minimumFiles != undefined) {
                if (_files.length < _this.minimumFiles) {
                    invalidFileCounts++;
                    return;
                }
            }

            // max files validation
            if (_this.maximumFiles != undefined) {
                if (_files.length > _this.maximumFiles) {
                    invalidFileCounts++;
                    return;
                }
            }

            if (_this.uiMode == "table") {
                document.getElementById("_f8ff8463348f4de08ce80818ff1a1126").innerHTML =
                    '<table border="1" style="width: 100%;border-collapse: collapse;border:none;"><tbody id="_5ff38f445cef42bd97763aa1256759fa"></tbody></table>';
                filePreviewContainerId = '_5ff38f445cef42bd97763aa1256759fa';
            }

            //clearing the files container div inner html before we can append files
            document.getElementById(filePreviewContainerId).innerHTML = "";

            // loop over the files
            for (var j = 0; j < _files.length; j++) {

                // saving all required values
                var fileName = _files[j].name;
                var fileExtension = fileName.split('.')[fileName.split('.').length - 1].toLowerCase();
                var fileSize = _files[j].size;

                //type validation
                if (_this.allowedExtensions != undefined) {
                    var typeValidationResult = false;
                    for (var i = 0; i < _this.allowedExtensions.length; i++) {
                        if (fileExtension == _this.allowedExtensions[i].toLowerCase().trim()) {
                            typeValidationResult = true;
                            break;
                        }
                    }

                    if (typeValidationResult == false) {
                        invalidFileCounts++;
                        continue;
                    }
                }

                // min size validation
                if (_this.minimumFileSize != undefined) {
                    if (fileSize < (_this.minimumFileSize * 1000000)) {
                        invalidFileCounts++;
                        continue;
                    }
                }

                // max size validation
                if (_this.maximumFileSize != undefined) {
                    if (fileSize < (_this.maximumFileSize * 1000000)) {
                        invalidFileCounts++;
                        continue;
                    }
                }

                //add file to array
                var fileObjectJson = {};
                var fileId = _this.getRandomNumber();
                fileObjectJson.id = fileId;
                fileObjectJson.object = _files[j];
                _this.totalFiles.push(fileObjectJson);

                _this.insertFilesPreview(_files[j], filePreviewContainerId, fileId, fileExtension, fileName);

            }

            if (invalidFileCounts > 0) {
                document.getElementById("_92a30ffff5564e68aab943fc489f10b3").innerText = invalidFileCounts + " files found invalid and were not uploaded!";
            }

            //we shall clear the input values so on change will work again for the same files if reselected
            document.getElementById(_this.elementId).value = "";
        });
    }

    insertFilesPreview(file, filePreviewContainerId, fileIndex, fileExtension, fileName) {
        var _this = this;

        // get preview of file
        if (fileExtension == 'png' || fileExtension == 'jpg' || fileExtension == 'jpeg') {
            var reader = new FileReader();
            reader.onload = function (e) {
                var filesHTML = _this.getFileHTML(e.target.result, fileName, fileIndex);
                document.getElementById(filePreviewContainerId).innerHTML += filesHTML;
            }
            reader.readAsDataURL(file);
        }
        else {
            var filesHTML = _this.getFileHTML(_this.getFileBase64URL(fileExtension), fileName, fileIndex);
            document.getElementById(filePreviewContainerId).innerHTML += filesHTML;
        }
    }

    addDeleteEventToParent(filePreviewContainerId) {
        var _this = this;
        document.getElementById(filePreviewContainerId).addEventListener("click", function (event) {
            var __this = event.target;
            var targetIndex = __this.id.split("_")[1];
            if (event.target.className == "close-button") {
                // find the wrapping container of the file to remove it
                var fileContainer = __this.parentNode.parentNode;
                fileContainer.innerHTML = "";

                //with the help of the container of the wrapping container we are fiding the number of 
                //remaining files inorder to add preview text back when no files exist
                var filesContainer = fileContainer.parentNode;
                if (filesContainer.querySelectorAll('.file-container').length == 1) {

                    var existingFiles = _this.totalFiles;
                    for (var i = 0; i < existingFiles.length; i++) {
                        var item = existingFiles[i];

                        // this is the matching file in our file array 
                        if (item.id == targetIndex) {

                            //hence removing it from array
                            existingFiles.splice(i, 1);
                            _this.totalFiles = existingFiles;
                        }
                    }

                    //removing the file wrapping container of the file from html
                    filesContainer.removeChild(fileContainer);

                    //clearing error text
                    document.getElementById("_92a30ffff5564e68aab943fc489f10b3").innerText = "";

                    //inserting the preview back
                    document.getElementById("_f8ff8463348f4de08ce80818ff1a1126").innerHTML = '<div>' + _this.getElement("previewText") + '</div>';
                    
                }
                else {
                    var existingFiles = _this.totalFiles;
                    for (var i = 0; i < existingFiles.length; i++) {
                        var item = existingFiles[i];
                        if (item.id == targetIndex) {
                            existingFiles.splice(i, 1);
                            _this.totalFiles = existingFiles;
                        }
                    }

                    //removing the file wrapping container of the file from html
                    filesContainer.removeChild(fileContainer);
                }
            }
        });
    }

    getFileBase64URL(extension) {
        var base64 = '';
        if (extension == 'pdf') {
            base64 = 'data:image/png;base64,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';
        }
        else if (extension == 'xlx') {
            base64 = 'data:image/png;base64,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';
        }
        else if (extension == 'docx') {
            base64 = 'data:image/png;base64,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';
        }
        else if (extension == 'ppt') {
            base64 = 'data:image/png;base64,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';
        }
        else if (extension == 'txt') {
            base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAGfUlEQVR4XuWba2wUVRTH/+dOtxQQ5aFg8BEIGl8hmtSER0s7r12sPAyUkhiNGv0ijygmSiJqrCSiBhNjBKJfUD5gJAuRaLSydLbThQJGDIkBBHyAGp8UBAGLbeceM0vpLrTdnZ3ZBdqdT83sedzzm3PP3N45lxDwikTU2x3GEskchsSNQlBpQJM5qPNaq7H5iRwUeohSEGXD0JZKdlYIIZQgdgLpEr1gbW1a4deGbwC6qT5LwEq/jvOox2A8aFn2Bj82fQEIh6tulSz2AQj5cVoAnbMshRGPx3fkatsXACNc/TaYnuo5oXgfJNlEaHN/YxB3y5Ds/ps4dV9KpO4rafIyTZ5S95kxHYR7ewm0laWYHI/Hf8gFgl8Ae8F0V7ojBp6LN9pv5uLcj6xhqKtAWNSbrgQfKlXKpmzZsuW4V9u+AJimepyBEeedsOQP4/Hmh7w6DSKXCUDSLnNi5MjR4Wg02u7Fjy8Aml51WggxtNsBc8Symrd6cRhUJisAABJY39RoP+zFV14AKAITYzF7rxeHQWW8AOjKhOWW1fxyNn8DF8C5KvyYZdnrMkEY2ACADjBPt6zmpr4gDHQAbtwnFIEpsZh9oDcIxQAA0sHhUKh0ciwW++tiCLRwXsUf2QrFxb87EqMB6oZHxMcEoTNXO7nKDxk8dMKe39rf6GsdkHmuyy/PnOnQdu7cmVyknb9oUW1FarWW64gusTyL0LCDx/G6HwDnhio3WY2JumR57Lr6HYBDf+M1Bhb7Z08rrcampf0WwMHj/DyIlvkHkHz+T1qW/Z5ro0cGENF8Sfx7IAd5UCbmUWDanG6qawrMAOGjIC6klI4gMdOy7C96AHAcZ/y7m3cdCeIgH7oL69TrSXZc8CBcAIdPDxbtHW2/ArgqoJ9TUqFp/Q7Amqh92ghry8H8UkAAYClb+iWAurq60tbWo5ZQUBkIAsuv+yUAN+iKiophZWWh9SDM8g2hPwM4H7Qerp5DEotBNC3nLbpMABbWVs4icKAtZz9PRgix7J3otv19FUG3BvRm150WJ0/+eQMgBmXy60jsAVCWlMkEYNHciiUgvOUniCA6LDBtTbRle64AvPrU9KqzQnRBKkYAhql2ACgp2gwwTFW6C0APAKZWQWC219TKlxxRyepV0cThQkyB+vp6sW277XSPdSC8BXIBX15eHho+Ylhqt7jYAKiqWqaUnPtok3UK5EK2ELKFmAKRSGSoI9tTr9FMGfD07EljnFDJTYUILpPNfztwcO0nLacKAaCmpubq9o62k54yYCCuAypnVI4Y9F9J6rNZsa0DVFW9VinB0aLNAMMwxoCc1CZwsWVAOBweK7nD3UzJ/haoV9WSI+O6loyXsBKOG2e319dDFqIImqZ5M6PzJ08ALmHMvboqBIBIpGq8I8WPRQtAna7eojj4rmgBaJp2m1A49Y0wUxFcXDu1liUWBJkKpGD9qo073vdjoxBTwDCMO0GO29yVvQjmYyHEoFfXbNr+4pUCwDSrJjLEN0ULIBxW75Gc3BIrzgzQIlq5kLzbE4CF86ZMBSv3+0nf8zokuXn1xy2+mqcKUQO0iDZJSN7lCUCQwPOhWwgAuq5PJSFbihaAYVRPA1GiaAGYpqoykGqYKrYtsXBYMyRzY9FmgB7WI8RyS0YAEvIEIFJbx/moaD5sCEgBiO5+ZNeE2x/Q16cxLy50vbqGBH2eEYAXQ5dLJigAw1BngvBp0QIwTe0BBqfabnorgpfr6XrxGzQDTFOrZfDGCzJgwdyKyV6cp8v8fIa2Akp3j87VIefx4aX8ba52cpVvVcZ+FY1Gfdcn09TmMzh1tsjNgFwH4cprZtUJAXFNiiTrmRqS/fgohI5pao8wONU9HgBAq4AY1b3mB15pbLTrCzHofNrscdaAsdtXBui6up8E7kgbXKvTiYm2befcd5zPADPZ6toMcf8THJyWuQlfALSw+oFgPJrukCUOCIEFnZ3Ybtt2wRunvYJLfg5rb5vDjJUkcN2FerzGFwDDUO8DocHrIHzKZW3ilpKzyDBnOtXKQlT7AuAGpJrqDgWY4jO4y6/G8jPLSsz0DUDX9QmA3NkzrS5/bFlHQO4Bz5Jqy7KO+QaQfB2628xCbgDR3VmdXgECySZpQetKQ0OeaWho+McdUiAArgG37yaRaJouBFUASK0N+ghYph+nzQCF0o7a9ikm047aZgJM1A7G94riNMRiiV/SRf8HUnXNtYpV5b8AAAAASUVORK5CYII=';
        }
        else {
            base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABwElEQVR4Xu2bWW7DMAxEJ2jvWHS9XfcesUULfgRwVMURxcU0MP40RFl8HA1tBTkA+EWt6xvALYCvjGUdCgKQvAXCHYDPaAhVARwh3AP4iITQA/AT+cDO3FcrzxMlhELoAZB7mVfrQVKAJZRQCNUASPJS8ecGwvH+u3dlKgK4BnBzBsIDgDdPCFUBSI4pECoDWIPwCODVQwnVAaxBeALwYoWwBwChEPYCYA2CmOb0VQ3ATCKm9xYC6HwMmYhOlND6NWpabwUFyKuu5mq/HXYPQJO8jG0VQwBagsvxFbaAdv1UQEOMW0ArIW6BBQF6gHdbschxMDbdBK1vaoN5nR3WmhwBZHcBKsCqYWP85lvAuH738HQPcM/AOCEBZJugsWDu4ekKYBdwr6Fuws27ABWgK5j76M0V4J6RccJ0EzSu1z2cAPgecEog/EwwugtoE0jfAgTgbmM2CVMBNEGbgk6ieSzOY3Hnn5uDDVOmTzfBhJxUjyAAdgF2gX+dTLWHloPZBr1ddboU44E0QZogTZAm2Br5uIN09o+rqUyvZDzQdb1sg0X/OjuuB0B7pnjxPEDz8ApjCcBShZ4HWObbItakgD/0xKtBTLAZEAAAAABJRU5ErkJggg==';
        }
        return base64;
    }

    getFileHTML(fileURL, fileNameWithExtension, index) {
        var _this = this;
        var fileHtml = '';
        if (_this.uiMode != undefined) {
            if (_this.uiMode == "table") {
                fileHtml += ''
                    + '<tr class="file-container">'
                    + ' <td style="padding: 5px;text-align: center;"><img src="' + fileURL + '" style="width: 60px;border-radius: 5px;box-shadow: 7px 7px 15px 0 lightgrey;" /></td>'
                    + ' <td style="padding: 5px;text-align: left;">' + fileNameWithExtension + '</td>'
                    + ' <td style="padding: 5px;text-align: center;"><button id="id47064eac11c942a4a918787728d4d559_' + index + '" class="close-button" style="display: inline-block;font-weight: 400;text-align: center;vertical-align: middle;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;padding: .375rem .75rem;font-size: 1rem;line-height: 1.5;width: 100%;background-color: #e66161;border: 1px solid #e66161;color: white;width:50px;border-radius:10px;">&times;</button></td>'
                    + '</tr>';
            }
            else {
                fileHtml += ''
                    + '<div class="file-container" style="display: inline-block;padding: 15px;position: relative;">'
                    + '  <div style="display: block;position: relative;width: 80px;margin: auto;">'
                    + '    <div id="id47064eac11c942a4a918787728d4d559_' + index + '" class="close-button" style="position: absolute;top: 0;right: 10px;border-radius: 0;background-color: #e66161;color: white;padding: 0px 3px 0px 3px;cursor: pointer;border-top-right-radius: 5px;">&times;</div>'
                    + '    <img src="' + fileURL + '" style="width: 60px;border-radius: 5px;box-shadow: 7px 7px 15px 0 lightgrey;" />'
                    + '  </div>'
                    + '  <span>' + fileNameWithExtension + '</span>'
                    + '</div>';
            }
        }
        else {
            fileHtml += ''
                + '<div class="file-container" style="display: inline-block;padding: 15px;position: relative;">'
                + '  <div class="file" style="display: block;position: relative;width: 80px;margin: auto;">'
                + '    <div id="id47064eac11c942a4a918787728d4d559_' + index + '" class="close-button" style="position: absolute;top: 0;right: 10px;border-radius: 0;background-color: #e66161;color: white;padding: 0px 3px 0px 3px;cursor: pointer;border-top-right-radius: 5px;">&times;</div>'
                + '    <img src="' + fileURL + '" style="width: 60px;border-radius: 5px;box-shadow: 7px 7px 15px 0 lightgrey;" />'
                + '  </div>'
                + '  <span>' + fileNameWithExtension + '</span>'
                + '</div>';
        }
        return fileHtml;
    }

    getAllFiles() {
        var _this = this;
        var fileObjects = [];
        for (var i = 0; i < _this.totalFiles.length; i++) {
            var item = _this.totalFiles[i];
            fileObjects.push(item.object);
        }
        return fileObjects;
    }

    previewFileObjects(_files) {
        var _this = this;
        // loop over the files
        var start = _this.totalFiles.length;
        var end = _this.totalFiles.length + _files.length;
        var filePreviewContainerId = '_f8ff8463348f4de08ce80818ff1a1126';
        if (_this.uiMode == "table") {
            ff = '_f8ff8463348f4de08ce80818ff1a1126';
        }
        if (_this.uiMode == "table") {
            document.getElementById("_f8ff8463348f4de08ce80818ff1a1126").innerHTML =
                '<table border="1" style="width: 100%;border-collapse: collapse;border:none;"><tbody id="_5ff38f445cef42bd97763aa1256759fa"></tbody></table>';
            filePreviewContainerId = '_5ff38f445cef42bd97763aa1256759fa';
        }
        for (var j = start; j < end; j++) {

            // saving all required values
            var fileName = _files[j].name;
            var fileExtension = fileName.split('.')[fileName.split('.').length - 1].toLowerCase();

            //add file to array
            var fileObjectJson = {};
            var fileIndex = _this.getRandomNumber();
            fileObjectJson.id = fileIndex;
            fileObjectJson.object = _files[j];
            _this.totalFiles.push(fileObjectJson);
            _this.insertFilesPreview(_files[j], filePreviewContainerId, fileIndex, fileExtension, fileName);
        }
    }

    previewImagesFromURL(urlArray) {
        var _this = this;

    }

    //previewBase64Strings(_files) {
    //    var _this = this;
    //    var abc = [
    //        {
    //            name: "",

    //        }
    //    ];
    //    // loop over the files
    //    var start = _this.totalFiles.length;
    //    var end = _this.totalFiles.length + _files.length;
    //    for (var j = start; j < end; j++) {

    //        // saving all required values
    //        var fileName = _files[j].name;
    //        var fileExtension = fileName.split('.')[fileName.split('.').length - 1].toLowerCase();

    //        //add file to array
    //        var fileObjectJson = {};
    //        var fileIndex = _this.getRandomNumber();
    //        fileObjectJson.id = fileIndex;
    //        fileObjectJson.object = _files[j];
    //        _this.totalFiles.push(fileObjectJson);
    //        _this.insertFilesPreview(_files[j], filePreviewContainerId, fileIndex, fileExtension, fileName);
    //    }
    //}

    destroy() {
        var parentContainer = document.getElementById('5e0afbb23b6644228e5f3eab1d15610a');
        parentContainer.innerHTML = "";
        parentContainer.parentNode.removeChild(parentContainer);
        document.getElementById(this.elementId).value = "";
        document.getElementById(this.elementId).style.display = "initial";
    }

    getElement(element) {
        var _this = this;
        var result = '';
        if (element == "parentContainerStyle") {
            var bgColor = '';
            if (_this.containerBackgroundColor != undefined) {
                bgColor = _this.containerBackgroundColor;
            }
            else {
                bgColor = 'ghostwhite';
            }
            result = ''
                + 'background-color:' + bgColor + ';'
                + 'padding:10px;'
                + 'border-radius: 20px;'
                + 'text-align:center;';
        }
        else if (element == "fileDialogueTriggerButtonStyle") {
            var btnColor = '';
            var btnTextColor = '';
            if (_this.fileDialogueTriggerButtonColor != undefined) {
                btnColor = _this.fileDialogueTriggerButtonColor;
            }
            else {
                btnColor = 'cornflowerblue';
            }
            if (_this.fileDialogueTriggerButtonTextColor != undefined) {
                btnTextColor = _this.fileDialogueTriggerButtonTextColor;
            }
            else {
                btnTextColor = 'white';
            }
            result = ''
                + 'display: inline-block;'
                + 'font-weight: 400;'
                + 'text-align: center;'
                + 'vertical-align: middle;'
                + 'cursor: pointer;'
                + '-webkit-user-select: none;'
                + '-moz-user-select: none;'
                + '-ms-user-select: none;'
                + 'user-select: none;'
                + 'padding: .375rem .75rem;'
                + 'font-size: 1rem;'
                + 'line-height: 1.5;'
                + 'width: 100%;'
                + 'border-radius: 20px;'
                + 'letter-spacing: 1.5px;'
                + 'background-color: ' + btnColor + ';'
                + 'border: 1px solid ' + btnColor + ';'
                + 'color: ' + btnTextColor + ';';
        }
        else if (element == "fileDialogueTriggerButtonText") {
            if (_this.fileDialogueTriggerButtonText != undefined) {
                result = _this.fileDialogueTriggerButtonText;
            }
            else {
                result = 'Click to upload';
            }
        }
        else if (element == "previewText") {
            if (_this.previewText != undefined) {
                result = _this.previewText;
            }
            else {
                result = 'Your files will be previewed here';
            }
        }
        else if (element == "contentTextColor") {
            if (_this.contentTextColor != undefined) {
                result = _this.contentTextColor;
            }
            else {
                result = 'black';
            }
        }
        return result;
    }

    getRandomNumber() {
        return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
    }

}
