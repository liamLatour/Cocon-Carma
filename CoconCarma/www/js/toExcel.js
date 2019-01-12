// TODO: if an item is at 0 supress it

var wscols = [{
    wch: 25
}, {
    wch: 16
}, {
    wch: 8
}, {
    wch: 8
}, {
    wch: 7
}, {
    wch: 13
}, {
    wch: 15
}]; // Cols for "Jour X"

var days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
var payments = {"cb":5, "es":6, "ti":7, "ch":8};

function exportExcel(alreadyHere, summarySheet) {

    var newsPaper_data = [];
    var ws_data = [];
    var now = new Date();
    var day = new Date().getDate();
    var totalNb = 0;
    var totalMoney = 0;
    var totalCmd = 0;
    var percentageId = -1; // To decrease complexity

    if (summarySheet != undefined) {
        newsPaper_data = summarySheet;
    } else {
        newsPaper_data.push(["Jour", "Quantité", "Prix", "", "", "CB", "Espèces", "Tickets", "Chèques", "", "TOTAL"]);
    }

    // Fills the newsPaper sheet
    if (newsPaper_data.length < day){
        for(var i=newsPaper_data.length; i<day+1; i++){
            newsPaper_data.push([days[new Date(now.getFullYear(), now.getMonth(), i).getDay()] + " " + i, 0, 0, "", "", 0, 0, 0, 0, "", 0]);
        }
    }


    if (alreadyHere != undefined) {
        ws_data = alreadyHere;

        // HARD CODED for the '6' and the rest
        totalCmd = Number(ws_data[1][6]);
        ws_data[1] = ws_data[1].slice(0, 4);

        for (var i = 0; i < ws_data.length; i++) {
            if (ws_data[i][0] == "TOTAL") {
                totalNb = Number(ws_data[i][1]);
                totalMoney = Number(ws_data[i][3]);
                ws_data.length = i - 1;
                break;
            }
        }

        ws_data.shift(); // Removes title row
    }

    // loop through commands
    for (var item in getData()) {
        if (item[0] == 'C') {
            var obj = JSON.parse(getData(item));

            // Check that the time of the command is superior to the last save time
            if (obj.time === undefined || getData("lastSave") > Date.parse(obj.time)) {
                continue;
            }

            if (obj.modified !== undefined) {
                console.log("MODIFIED");
                if (isEmpty(obj.modified)) {
                    continue;
                } else {
                    var newObj = JSON.parse(JSON.stringify(obj));
                    delete newObj.modified;
                    obj = obj.modified;
                    saveData(item, JSON.stringify(newObj));
                    console.log(obj);
                }
            }

            totalCmd++;
            var remise = 0;
            var normalSum = 0;
            var percentagedSum = 0;

            for (var key in obj) {
                try {
                    var thisName = "";
                    var thisCost = 0;
                    var isPercentaged = false;

                    if (isNaN(key)) {
                        // Check whether it is a payment mode or not
                        if (key[0] != key[0].toUpperCase()) {
                            if (key != "time"){
                                newsPaper_data[day][payments[key]] += parseFloat(obj[key]);
                                newsPaper_data[day][10] += parseFloat(obj[key]);
                            }      
                            continue;
                        }

                        console.log("real shit", key);
                        var meal;

                        if (key.includes('M')) {
                            meal = key.match(/(M)\d+/)[0].substring(1);

                            isPercentaged = true;
                            thisName = "Menu " + products[meal][3][2];
                            thisCost = products[meal][3][1] * obj[key];
                            if (key.includes('B')) {
                                thisName += " + Boisson";
                                thisCost += (products[key.match(/(B)\d+/)[0].substring(1)][1] - 0.5) * obj[key];
                            }
                        } else if (key.includes('F')) {
                            meal = key.match(/(F)\d+/)[0].substring(1);

                            isPercentaged = true;
                            thisName = "Formule " + products[meal][3][2];
                            thisCost = products[meal][3][0] * obj[key];
                        } else {
                            console.log("HU HO !!!");
                        }
                    } else {
                        // If it is a remise in %
                        if (products[key][1] < 0 && products[key][3] === 'P') {
                            remise = obj[key];
                        } else {
                            // If it is a:  meal || dessert || starter || drink
                            if ((products[key].length === 4 && products[key][1] > 0 && products[key][3] != 'M') || products[key][2] === 1) {
                                isPercentaged = true;
                            }

                            if (products[key][1] == 0) {
                                thisCost = obj[key];
                            } else {
                                thisCost = products[key][1] * obj[key];
                            }

                            thisName = products[key][0];

                            // If it is a newsPaper
                            if (products[key].length === 4 && products[key][3] == 'M') {
                                newsPaper_data[day][1] += obj[key];
                                newsPaper_data[day][2] += thisCost;
                            }
                        }
                    }

                    if (!(products[key] !== undefined && products[key].length > 3 && products[key][3] == 'P')) { // To check if it's a percentaged
                        var id = isItHere(thisName);

                        if (id != -1) {
                            ws_data[id][1] = Number(ws_data[id][1]) + Number(obj[key]);
                            ws_data[id][3] = Number(ws_data[id][3]) + Number(thisCost);
                        } else {
                            ws_data.push([thisName, obj[key], thisCost / obj[key], thisCost]);
                        }

                        if (isPercentaged) {
                            percentagedSum += thisCost;
                        } else {
                            normalSum += thisCost;
                        }

                        if (thisCost > 0) {
                            totalNb++;
                        }
                    }
                } catch (err) {
                    errorHandle("Erreur: " + err, colourPallets.Error);
                }
            }

            if (remise > 0) {
                var reduc = percentagedSum / 100 * Math.abs(remise);

                if (percentageId != -1) {
                    ws_data[percentageId][1] += 1;
                    ws_data[percentageId][3] -= reduc;
                } else {
                    percentageId = ws_data.push([products[0][0], 1, -1, -reduc]) - 1;
                }

                totalMoney += normalSum + percentagedSum - reduc;
            } else {
                totalMoney += normalSum + percentagedSum;
            }
        }
    }

    ws_data.sort(sortCommand);
    ws_data.unshift(['Plats par popularités', 'Nombre de produits', 'Coût seul', 'Coût total', '', 'Ticket moyen', 'Nombre de repas']);
    ws_data.push([], ['TOTAL', totalNb, "", totalMoney]);
    if (ws_data[1] != undefined) {
        ws_data[1].push("", coolRound(totalMoney / totalCmd), totalCmd);
    }

    function isItHere(thisName) {
        var id = -1;
        for (var i = 0; i < ws_data.length; i++) {
            if (ws_data[i][0] == thisName) {
                id = i;
                break;
            }
        }
        return id;
    }

    function sortCommand(a, b) {
        if (a[2] < 0) {
            return 1;
        } else if (b[2] < 0) {
            return -1;
        }
        if (a[1] === b[1]) {
            if (a[2] === b[2]) {
                return 0;
            } else {
                return (a[2] < b[2]) ? 1 : -1;
            }
        } else {
            return (a[1] < b[1]) ? 1 : -1;
        }
    }

    errorHandle("Création du nouveau Excel fini", colourPallets.Succes);
    return [ws_data, newsPaper_data];
}

function updateExcel() {
    try {
        var myPath = cordova.file.externalRootDirectory; // Path to excels

        window.resolveLocalFileSystemURL(myPath, function (dirEntry) {
            var directoryReader = dirEntry.createReader();
            directoryReader.readEntries(onSuccessCallback, errorCallback);
        });
    } catch (error) {
        var name = "Bilan " + new Date().toDateString().slice(4, 7) + " " + new Date().getFullYear();

        var wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Cocon Carma",
            Subject: name,
            Author: "Cocon-Carma",
            CreatedDate: new Date()
        };

        oldExcel = {};
        newExcel = exportExcel();
        oldExcel["Résumé"] = newExcel[1];
        oldExcel["Jour " + new Date().getDate()] = newExcel[0];

        for (var sheet in oldExcel) {
            wb.SheetNames.push(sheet);
            var ws = XLSX.utils.aoa_to_sheet(oldExcel[sheet]);
            if (sheet.includes('Jour')) {
                ws['!cols'] = wscols;
            }
            wb.Sheets[sheet] = ws;
        }

        var wbout = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'binary'
        });

        saveAs(new Blob([s2ab(wbout)], {
            type: "application/octet-stream"
        }), name + ".xlsx");
    }

    function onSuccessCallback(entries) {
        for (var i = 0; i < entries.length; i++) {
            var row = entries[i];
            if (!row.isDirectory && row.name.includes('.xlsx')) {
                var month = row.name.substring(6, 9);
                var year = row.name.substring(10, 14);
                if (new Date().toDateString().substring(4, 7) == month && new Date().getFullYear() == year) {
                    errorHandle("Trouvé un Excel pour ce mois:" + row.name, colourPallets.Succes);
                    retrieveData(row.name);
                    return;
                }
            }
        }
        mergeExcel(); // If no Excel was found
    }

    function retrieveData(foundExcel) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, successCallback, errorCallback);

        function successCallback(fs) {
            fs.root.getFile(foundExcel, {}, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        var excel = {};
                        var workbook = XLSX.read(this.result, {
                            type: 'binary'
                        });
                        workbook.SheetNames.forEach(function (sheetName) {
                            // Pass through each sheet, convert it to AoA and finally put it in 'excel' along with it's name
                            var XL_row_object = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                            excel[sheetName] = Papa.parse(XL_row_object).data;
                        });
                        console.log(excel);
                        mergeExcel(excel);
                    };
                    reader.onerror = function (e) {
                        errorCallback(e);
                    };
                    reader.readAsBinaryString(file);
                }, function (e) {
                    errorCallback(e);
                });
            }, function (e) {
                errorCallback(e);
            });
        }
    }

    function errorCallback(error) {
        errorHandle("Impossible de compléter le Excel: : " + error, colourPallets.Error);
    }
}

function mergeExcel(oldExcel) {
    // oldExcel is of the form:
    /*
        {
            sheetName: [['Title1', 'Title2'], ['Value1', 'Value2'], ...],
            sheetName2: [[], [], ...],
            ...,
        }
    */

    var workingSheet;
    var newsSheet;

    if (oldExcel != undefined) {
        var day = new Date().getDate();
        for (var title in oldExcel) {
            if (title.includes(day)) {
                workingSheet = oldExcel[title];
            }
            if (title.includes("Résumé")) {
                newsSheet = oldExcel[title];
            }
        }
    } else {
        oldExcel = {};
    }

    var mergedSheet = exportExcel(workingSheet, newsSheet);

    if (workingSheet != undefined) {
        workingSheet = mergedSheet[0];
    } else {
        oldExcel["Jour " + new Date().getDate()] = mergedSheet[0];
    }

    if (newsSheet != undefined) {
        newsSheet = mergedSheet[1];
    } else {
        oldExcel["Résumé"] = mergedSheet[1];
    }


    // Does the normal thing
    var name = "Bilan " + new Date().toDateString().slice(4, 7) + " " + new Date().getFullYear();

    // Declaring work book
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Cocon Carma",
        Subject: name,
        Author: "Cocon-Carma",
        CreatedDate: new Date()
    };

    // Add sheets to excel
    for (var sheet in oldExcel) {
        wb.SheetNames.push(sheet);
        var ws = XLSX.utils.aoa_to_sheet(oldExcel[sheet]);

        if (sheet.includes('Jour')) {
            ws['!cols'] = wscols;
        }

        wb.Sheets[sheet] = ws;
    }

    var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'binary'
    });

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        var fileName = name + ".xlsx";

        fs.root.getFile(fileName, {
            create: true,
            exclusive: false
        }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function () {
                    errorHandle(fileName + " sauvegardé dans vos documents.", colourPallets.Succes);
                    saveData("lastSave", Date.now());
                    $("#cmds").css('visibility', 'hidden');
                };
                fileWriter.onerror = function (e) {
                    errorHandle("Erreur: " + e, colourPallets.Error);
                };
                fileWriter.write(new Blob([s2ab(wbout)], {
                    type: "application/octet-stream"
                }));
            });

        }, function (e) {
            errorHandle("Erreur: " + e, colourPallets.Error);
        });
    }, function (e) {
        errorHandle("Erreur: " + e, colourPallets.Error);
    });
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}