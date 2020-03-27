// ==UserScript==
// @author  wesinator
// @match   https://www.secureworks.com/research/*
// @name    Hash indicator gatherer
// @version 0.1
// ==/UserScript==

function returnSplitFirstElement(string, splitStr) {
    return string.split(splitStr)[0];
}

function objArrayToFile(list, filename) {
    var jsonStr = JSON.stringify(list, null, indent=2);
    return fileDataDownload(jsonStr, filename, "text/json");
}

function fileDataDownload(contents, name, mimeType) {
    // https://stackoverflow.com/questions/34101871/save-data-using-greasemonkey-tampermonkey-for-later-retrieval
    var a = document.createElement("a");

    a.href = `data:${mimeType};charset=utf-8,` + encodeURIComponent(contents);

    a.download = name;
    a.click();
}

var tables = document.getElementsByTagName("table");
for (table of tables) {
    firstHeader = table.children[0] // thead
                .children[0] // 1st row
                .children[0].innerText; // 1st column

    if (firstHeader.toLowerCase().includes("indicator")) {
        var fileIndicators = [];

        var tbody = table.children[1];
        var rows = tbody.children;

        var i;
        for (i = 0 ; i < rows.length ; i++) {
            var fileHashes = {md5:"", sha1:"", sha256:""};

            var col1 = rows[i].children[0].innerText;
            var col2 = rows[i].children[1].innerText;
            //console.log(col1, col2);
            if (col2.toLowerCase().includes("md5")) {
                var hashtype = returnSplitFirstElement(col2.toLowerCase(), " ");
                fileHashes[hashtype] = col1.replace("\n", "");

                var row2_col1 = rows[i+1].children[0].innerText;
                var row2_col2 = rows[i+1].children[1].innerText;
                //console.log("Row 2:", row2_col1, row2_col2);
                if (row2_col2.toLowerCase().includes("sha")) {
                    var hashtype = returnSplitFirstElement(row2_col2.toLowerCase(), " ");
                    fileHashes[hashtype] = row2_col1.replace("\n", "");
                }

                var row3_col1 = rows[i+2].children[0].innerText;
                var row3_col2 = rows[i+2].children[1].innerText;
                //console.log("Row 3:", row3_col1, row3_col2);
                if (row3_col2.toLowerCase().includes("sha")) {
                    var hashtype = returnSplitFirstElement(row3_col2.toLowerCase(), " ");
                    fileHashes[hashtype] = row3_col1.replace("\n", "");
                }
            }
            if (fileHashes.md5)
                fileIndicators.push(fileHashes);
        }

        console.log(fileIndicators);
        objArrayToFile(fileIndicators, window.location.hostname + "_file_indicators.json");
    }
}
