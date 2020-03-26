$(function () {
    var listControl = [];
    var listControlService = [];
    var currentReportId;
    var listFilter = [];

    if ($("#checkLogin").val() == "false") {
        $("#settingButton").remove();
    } else {
        initModal();
        //load list report
        $.ajax({
            method: "GET",
            url: "/web-reportviewer/services/get/listReport",
            dataType: "JSON",
            beforeSend: function () {
                $("#listReport").dxSelectBox().dxSelectBox("instance");
                $("#listReport").parent().append('<div class="dark-blur">' +
                    '                        <img src="/web-reportviewer/img/Spinner.gif"/>' +
                    '                    </div>');
            },

            success: function (success) {
                //tao selectbox
                $("#listReport").dxSelectBox({
                    items: success,
                    displayExpr: "name",
                    valueExpr: "id",
                    searchEnabled: true,
                    acceptCustomValue: true
                }).dxSelectBox("instance");
                $("#listReport").parent().find('.dark-blur').remove();
            }
        });
    }

    initReport();

    //Generate controls từ json nhận về
    function generateControl(jsonString) {
        listControlService = [];
        listControl = [];
        var layoutFilter = jsonString["reportLayoutFilter"][0].layoutFilter;
        var colWidth = defineColumnWidth(layoutFilter);
        var temp = 0, countRow = 1;
        var rowId = "countRow" + countRow.toString();
        $("#controls").append('<div class="row" id="' + rowId + '" style="margin-bottom: 10px;">' +
            '</div>');
        jsonString["reportControl"].forEach(function (control) {
            var infor = new Object();
            var element = control["reportFilter"];
            var controlType = control["controlType"];
            var title = element["title"];
            var code = element["code"];
            var lookupId = element["lookupId"];
            var id = element["id"];
            if (temp == layoutFilter) {
                countRow++;
                rowId = "countRow" + countRow.toString();
                $("#controls").append('<div class="row" id="' + rowId + '" style="margin-bottom: 10px;">' +
                    '</div>');
                temp = 0;
            }
            var html = '<div class="' + colWidth + '">' +
                '                <div class="dx-field col-12 row">' +

                '                    <div class="dx-field-label col-3"><div style="text-align: right; color: #578ebe;font-size:14px; font-weight: 600;">' + title + '</div></div>' +
                '                    <div class="dx-field-value col-7">' +
                '                        <div id="' + code + '"></div>' +
                '                    </div>' +
                '                </div>' +
                '            </div>';
            temp = temp + 1;
            //tao du lieu cho infor
            infor.controlType = controlType;
            infor.elm = element;
            infor.lookupId = lookupId;
            infor.code = code;
            infor.id = id;
            //them code control (html)
            $("#" + rowId).append(html);
            //them 1 control vao trong list control
            var control_1 = new Object();
            control_1.code = code;
            control_1.type = controlType;
            listControl.push(control_1);
            ///khoi tao control
            generateControlType(infor);
        })
        $("#controls").append('</div>');

        //khoi tao du lieu cho cac control la service
        if (listControlService.length > 0) {
            getContentSelectBoxService(listControlService);
        }

        //them button search
        $("#controls").append('<div class="row col-12">' +
            '            <div style="width: 100%;text-align: center; margin-top: 20px;">' +
            '                <button class="button" id="searchButton">Xuất báo cáo</button>' +
            '            </div>' +
            '        </div>');
        createSearchEvent();
    }

    //Tao code tuong ung cho tung loai combo
    function generateControlType(infor) {
        var controlService = new Object();
        switch (infor["controlType"]) {
            case "Combobox": {
                //khoi tao control
                if (infor.elm["dataType"] == 0) {
                    getContentSelectBoxLookup(infor["lookupId"], infor["code"]);
                } else if (infor.elm["dataType"] == 1) {
                    controlService.code = infor["code"];
                    controlService.parentControl = infor.elm["parentComboId"];

                    controlService.serviceId = infor.elm.serviceId;
                    controlService.id = infor["id"];
                    listControlService.push(controlService);
                }
            }
                break;
            case "Textbox": {
                $("#" + infor["code"]).dxTextBox({
                    placeholder: "Nhập tại đây...."
                });
            }
                break;
            case "Calendar": {
                var date = new Date();
                var _day = date.getDate();
                var _month = date.getMonth();
                var _year = date.getFullYear();
                var val = "";
                if (infor.code == "TUNGAY") {
                    val = _month.toString() + "/" + _day.toString() + "/" + _year.toString();
                } else if (infor.code == "DENNGAY") {
                    val = (_month + 1).toString() + "/" + _day.toString() + "/" + _year.toString();
                }
                $("#" + infor["code"]).dxDateBox({
                    opened: false,
                    activeStateEnabled: true,
                    value: val,
                    displayFormat: "dd/MM/yyyy"
                });
            }
                break;
        }
    }

    //xac dinh do rong cho moi layout
    function defineColumnWidth(countLayout) {
        var col = Math.floor(12 / countLayout);
        return "col-" + col.toString();
    }

    //lay danh sach cua tung control
    function getContentSelectBoxLookup(value, controlId) {
        var param = {lookupId: value};
        $.ajax({
            method: "GET",
            url: "/web-reportviewer/services/get/listLookupDetail",
            dataType: "JSON",
            data: param,
            beforeSend: function () {
                $("#" + controlId).dxSelectBox().dxSelectBox("instance");
                $("#" + controlId).parent().append('<div class="dark-blur">' +
                    '                        <img src="/web-reportviewer/img/Spinner.gif"/>' +
                    '                    </div>');
            },
            success: function (success) {
                //tao selectbox
                $("#" + controlId).dxSelectBox({
                    items: success,
                    displayExpr: "value",
                    valueExpr: "code",
                    searchEnabled: true
                });
                $("#" + controlId).parent().find('.dark-blur').remove();
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#" + controlId).dxSelectBox({
                    items: null
                });
                $("#" + controlId).parent().find('.dark-blur').remove();
            }
        });
    }

    function getContentSelectBoxService(listControlService) {
        var param = {reportId: currentReportId};
        listControlService.forEach(function (control) {
            var code = control.code;
            if (control.parentControl != null) {
                $("#" + code).dxSelectBox({
                    items: null
                });
            } else {
                param.controlId = control.serviceId;
                param.code = control.code;
                $.ajax({
                    method: "GET",
                    url: "/web-reportviewer/services/get/initServiceList",
                    dataType: "JSON",
                    data: param,
                    beforeSend: function () {
                        $("#" + code).dxSelectBox().dxSelectBox("instance");
                        $("#" + code).parent().append('<div class="dark-blur">' +
                            '                          <img src="/web-reportviewer/img/Spinner.gif"/>' +
                            '                          </div>');
                    },
                    success: function (success) {
                        //tao selectbox
                        $("#" + code).dxSelectBox({
                            items: success,
                            displayExpr: "value",
                            valueExpr: "code",
                            searchEnabled: true,
                            onSelectionChanged: function (info) {
                                var parent = new Object();
                                parent.code = code;
                                parent.value = this.option("value");
                                getChildrenSelectBox(control.code, listControlService, parent);
                            }
                        });
                        $("#" + code).parent().find('.dark-blur').remove();
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        $("#" + code).dxSelectBox({
                            items: null
                        });
                        $("#" + code).parent().find('.dark-blur').remove();
                    }
                });
            }
        })
    }

    //xu ly event click cho search button
    function createSearchEvent() {
        var headerTemplate = function (header, info) {
            $('<div>').html(info.column.caption)
                .css('text-align', 'center')
                .css('font-size', '15px')
                .css('color', 'white')
                .css('font-weight', '600').appendTo(header);

        };
        $("#searchButton").click(function () {
            var param = generatePramList(currentReportId);
            $.ajax({
                url: "/web-reportviewer/services/get/listReportDisplay",
                method: "GET",
                dataType: "JSON",
                data: param,
                beforeSend: function () {
                    $("#gridContainer").dxDataGrid().dxDataGrid("instance");
                    $("#gridContainer").parent().append('<div class="dark-blur">' +
                        '                          <img src="/web-reportviewer/img/Spinner.gif"/>' +
                        '                          </div>');
                },
                success: function (success) {
                    var listDate = [];
                    var listNum = [];
                    var listFormatNum = [];
                    for(var i = 0; i < success[0].length; i++){
                        if(success[0][i]['type'].toLowerCase() == 'date')
                            listDate.push(success[0][i]['name'].toLowerCase())
                        else if (success[0][i]['type'].toLowerCase() == 'number' && success[0][i]['isParent'] == false) {
                            listNum.push(success[0][i]['name'].toLowerCase());
                            listFormatNum.push(success[0][i]['format'].toLowerCase());
                        }
                    }
                    for(var i = 0; i < success[1].length; i++){
                        for(var j = 0; j < listDate.length; j++){
                            var date = new Date(success[1][i][listDate[j]]);
                            success[1][i][listDate[j]] = date.toLocaleDateString('vi-VN');
                        }
                    }
                    //for(var i = 0; i < success[1].length; i++){
                    //    for(var j = 0; j < listNum.length; j++){
                    //        success[1][i][listNum[j]] = $.formatNumber( success[1][i][listNum[j]], {format: listFormatNum[j], locale: "en"});
                    //    }
                    //}
                    $("#gridContainer").dxDataGrid({
                        dataSource: success[1],
                        allowColumnReordering: true,
                        grouping: {
                            autoExpandAll: true
                        },
                        columnFixing: {
                            enabled: true
                        },
                        allowColumnResizing: true,
                        searchPanel: {
                            visible: false
                        },
                        paging: {
                            pageSize: 100
                        },
                        customizeColumns: function (columns) {
                            $.each(columns, function (_, element) {
                                element.headerCellTemplate = headerTemplate;
                            });
                        },
                        //onRowPrepared: function (info) {
                        //    if (info.rowType == "header"){
                        //        info.rowElement.css('background', '#578ebe');
                        //        info.rowElement.css('text-align', 'center');
                        //    }
                        //    else if (info.rowType != "header") {
                        //        if (info.rowIndex % 2 == 0)
                        //            info.rowElement.css("background", "aliceblue");
                        //    }
                        //},
                        pager: {
                            showPageSizeSelector: true,
                            allowedPageSizes: [50, 100, 200],
                            showInfo: true
                        },
                        export: {
                            enabled: false
                        },
                        groupPanel: {
                            visible: true
                        },
                        dateSerializationFormat: "dd-MM-yyyy",
                        columns: generateColumns(success),
                        summary: {
                            totalItems: sumColumns(success),
                            groupItems: generateTotalEachGroup(success)
                        }
                    }).dxDataGrid("instance");
                    $("#gridContainer").parent().find('.dark-blur').remove();
                },
                error: function (xhr, textStatus, errorThrown) {
                    $("#gridContainer").parent().find('.dark-blur').remove();
                }

            });
            $("td[role='columnheader']").css("text-align", "center !important");
        });
    }

    //tong tung group
    function generateTotalEachGroup(jsonString) {
        var reportDisplayList = jsonString[0];
        var listGroup = [];
        reportDisplayList.forEach(function (reportDisplay) {
            if (reportDisplay.sum == true) {
                var elm = new Object();
                elm.column = reportDisplay.name.toString().toLowerCase();
                elm.summaryType = "sum";
                elm.showInGroupFooter = false;
                elm.alignByColumn = true;
                elm.displayFormat = "{0}";
                elm.customizeText = function (e) {
                    var param = e.value;
                    param = $.formatNumber(param, {format: "#,###", locale: "en"});
                    return param;
                };
                listGroup.push(elm);
            }
        });
        return listGroup;
    }

    var columnBuilder = [];
    var columnConfig = [];

    function getColumnConfig(columnBuilder) {
        if (columnBuilder.length == 0) {
            columnConfig.forEach(function (column) {
                var t = new Object();
                if (column.parent == true && !column.isAdd) {
                    t['code'] = column.code.toString();
                    t['dataField'] = column.name.toString().toLowerCase();
                    t['caption'] = convertFieldName(column.name.toString());
                    if (column.display == 1)
                        t['visible'] = true;
                    else
                        t['visible'] = false;
                    if (column.freePane == 1)
                        t['fixed'] = true;
                    else
                        t['fixed'] = false;
                    if (column.width = "")
                        t['width'] = "*";
                    else
                        t['width'] = column.width;
                    t['alignment'] = column.textAlign;
                    if (column.groupLevel != null && column.groupLevel != 0) {
                        t['groupIndex'] = column.groupLevel;
                    }
                    //set type
                    t['dataType'] = column.type;

                    //set format cho cot
                    var formatObject = new Object();
                    formatObject.type = column.type;
                    formatObject.formatString = column["format"];
                    t["format"] = function (param) {
                        return formatString(formatObject, param);
                    };
                    t['ID'] = column.id;
                    t['columns'] = getColumnConfig(t);
                    column.isAdd = true;
                    columnBuilder.push(t);
                }
                else if ((column.parent == false || column.parent == null) &&
                    ((column.parentCode == "" || column.parentCode == null) && !column.isAdd)) {
                    t['code'] = column.code.toString();
                    t['dataField'] = column.name.toString().toLowerCase();
                    t['caption'] = convertFieldName(column.name.toString());
                    if (column.display == 1)
                        t['visible'] = true;
                    else
                        t['visible'] = false;
                    if (column.freePane == 1)
                        t['fixed'] = true;
                    else
                        t['fixed'] = false;
                    if (column.width == "")
                        t['width'] = "*";
                    else
                        t['width'] = column.width;
                    t['alignment'] = column.textAlign;
                    if (column.groupLevel != null && column.groupLevel != 0) {
                        t['groupIndex'] = column.groupLevel;
                    }
                    //set type
                    t['dataType'] = column.type;

                    //set format cho cot
                    var formatObject = new Object();
                    formatObject.type = column.type;
                    formatObject.formatString = column["format"];
                    t["format"] = function (param) {
                        return formatString(formatObject, param);
                    };
                    t['ID'] = column.id;
                    column.isAdd = true;
                    columnBuilder.push(t);

                }
            });
            return columnBuilder;
        }
        else {
            var child = [];
            columnConfig.forEach(function (column) {
                var t = new Object();
                if (column.parentCode == columnBuilder.code && !column.isAdd) {
                    t['dataField'] = column.name.toString().toLowerCase();
                    t['caption'] = convertFieldName(column.name.toString());
                    if (column.display == 1)
                        t['visible'] = true;
                    else
                        t['visible'] = false;
                    if (column.freePane == 1)
                        t['fixed'] = true;
                    else
                        t['fixed'] = false;
                    if (column.width = "")
                        t['width'] = "*";
                    else
                        t['width'] = column.width;
                    t['alignment'] = column.textAlign;
                    if (column.groupLevel != null && column.groupLevel != 0) {
                        t['groupIndex'] = column.groupLevel;
                    }
                    //set type
                    t['dataType'] = column.type;

                    //set format cho cot
                    var formatObject = new Object();
                    formatObject.type = column.type;
                    formatObject.formatString = column["format"];
                    t["format"] = function (param) {
                        return formatString(formatObject, param);
                    };
                    t['ID'] = column.id;
                    if (column.isParent) {
                        t['columns'] = getColumnConfig(t);
                    }
                    column.isAdd = true;
                    child.push(t);
                }
            });
            return child;
        }

    }

    //tao cot cho bang
    function generateColumns(jsonString) {
        var reportDisplayList = jsonString[0];
        reportDisplayList.forEach(function (reportDisplay) {
            reportDisplay['isAdd'] = false;
        });
        columnConfig = reportDisplayList;
        columnBuilder = [];
        var columns = getColumnConfig(columnBuilder);


        //lấy header
        /*var j;
        reportDisplayList.forEach(function (reportDisplay) {
            var col = new Object();
            //set cot du lieu
            col.dataField = reportDisplay.name.toString().toLowerCase();
            col.caption = reportDisplay.name;
            //set an/hien
            if (reportDisplay.display == 1) {
                col.visible = true;
            } else {
                col.visible = false;
            }
            //set fixed
            if(reportDisplay.freePane == 1){
                col.fixed = true;
            } else {
                col.fixed = false;
            }
            //set width
            if(reportDisplay.width == ""){
                col.width = 70;
            } else {
                col.width = reportDisplay.width;
            };
            //set can le
            col.alignment = reportDisplay.textAlign;
            //set group index
            if (reportDisplay.groupLevel != null && reportDisplay.groupLevel != 0) {
                col.groupIndex = reportDisplay.groupLevel;
            }
            //set type
            col.dataType = reportDisplay.type;
            ;
            //set format cho cot
            var formatObject = new Object();
            formatObject.type = reportDisplay.type;
            formatObject.formatString = reportDisplay["format"];
            col["format"] = function (param) {
                return formatString(formatObject, param);
            };
            columns.push(col);
        });*/
        return columns;
    }

    //tinh tong cac cot yeu cau
    function sumColumns(jsonString) {
        var result = [];
        var reportDisplayList = jsonString[0];
        reportDisplayList.forEach(function (reportDisplay) {
            var col = new Object();
            if (reportDisplay["sum"] == true) {
                col.column = reportDisplay.name.toString().toLowerCase();
                col.summaryType = "sum";
                if (reportDisplay["format"].toString() != "") {
                    col.valueFormat = reportDisplay["format"];
                }
                result.push(col);
                col.customizeText = function (e) {
                    var param = e.value;
                    param = $.formatNumber(param, {format: col["formatString"], locale: "en"});
                    return param;
                };
            }
        })
        return result;
    }

    //tao list param cho search button
    function generatePramList(reportId) {
        var params = new Object();
        params.reportId = reportId;
        listFilter = [];

        listControl.forEach(function (control) {
            switch (control["type"]) {
                case "Combobox": {
                    try {
                        params[control["code"]] = $("#" + control["code"]).dxSelectBox('instance').option('value');
                    }
                    catch (ex) {
                        params[control["code"]] = "";
                    }
                    control.value = $("#" + control["code"]).dxSelectBox('instance').option('displayValue');
                }
                    break;
                case "Textbox": {
                    params[control["code"]] = $("#" + control["code"]).dxTextBox('instance').option('value');
                    control.value = params[control["code"]];
                }
                    break;
                case "Calendar": {
                    var formatObject = new Object();
                    formatObject.type = "DATE";
                    formatObject.formatString = "dd/mm/yyyy";
                    params[control["code"]] = formatStringTieuChi(formatObject, $("#" + control["code"]).dxDateBox('instance').option('value'));
                    control.value = params[control["code"]];
                }
                    break;
            }
            var obj = new Object();
            obj.code = control["code"];
            obj.value = control["value"];
            listFilter.push(obj);

        });
        return params;
    }

    function getChildrenSelectBox(parentCode, listControlService, parent) {
        var param = {
            reportId: currentReportId,
            parentCode: parentCode,
            code: parent.code,
            value: parent.value
        };
        $.ajax({
            method: "GET",
            url: "/web-reportviewer/services/get/childrenContentSelectBox",
            dataType: "JSON",
            data: param,
            beforeSend: function () {
                listControlService.forEach(function (control) {
                    var code = control.code;
                    if (control.parentControl == parentCode) {
                        $("#" + code).dxSelectBox().dxSelectBox("instance");
                        $("#" + code).parent().append('<div class="dark-blur">' +
                            '                          <img src="/web-reportviewer/img/Spinner.gif"/>' +
                            '                          </div>');
                    }
                })
            },
            success: function (success) {
                //tao selectbox
                listControlService.forEach(function (control) {
                    var code = control.code;
                    if (control.parentControl == parentCode) {
                        $("#" + code).dxSelectBox({
                            items: success[code],
                            displayExpr: "value",
                            valueExpr: "code",
                            searchEnabled: true
                        });
                        $("#" + code).parent().find('.dark-blur').remove();
                    }
                })
            },
            error: function (xhr, textStatus, errorThrown) {
                listControlService.forEach(function (control) {
                    var code = control.code;
                    if (control.parentControl == parentCode) {
                        $("#" + control.id).dxSelectBox({
                            items: null
                        });
                        $("#" + code).parent().find('.dark-blur').remove();
                    }
                })
            }
        });

    }

    function formatString(formatObject, param) {
        switch (formatObject["type"].toLowerCase()) {
            case "date": {
                //var dateString = param.format(formatObject["formatString"]);
                var date = new Date(param);
                return date.toLocaleDateString('vi-VN');
            }
                break;
            case "number": {
                param = $.formatNumber(param, {format: formatObject["formatString"], locale: "en"});
                return param;
            }
                break;
            case "string": {
                return param;
            }
                break;
        }
    }

    //format date theo format string
    function formatStringTieuChi(formatObject, param) {
        switch (formatObject["type"]) {
            case "DATE": {
                if (param.length <= 10) {
                    var str = "";
                    if (param.indexOf("/") == 4) {
                        str = param.split("/")[2] + "/" + param.split("/")[1] + "/" + param.split("/")[0];
                    }
                    else {
                        str = param.split("/")[1] + "/" + param.split("/")[0] + "/" + param.split("/")[2];

                    }
                    return str;
                }
                else {
                    return param.format(formatObject["formatString"]);
                }
            }
                break;
            case "NUMBER": {
                param = $.formatNumber(param, {format: formatObject["formatString"], locale: "en"});
                return param;
            }
                break;
            case "TEXT": {
                return param;
            }
                break;
        }
    }

    function loadAjaxTemplate(template) {
        var blob = null;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/excelUpload/" + template);
        xhr.responseType = "blob";
        xhr.onreadystatechange = function () {
            // if (xhr.readyState === 4) {
            blob = xhr.response;
            loadTemplateFile(template, blob);
            // }
        };
        xhr.send();
        return blob;
    }

    //
    function loadTemplateFile(template, blobFile) {
        var file = new File([blobFile], template);
        xlsxParser.parse(file).then(function (data) {
            $("#gridContainer").dxDataGrid({
                "export": {
                    enabled: false,
                    fileName: $("#reportName").html(),
                    allowExportSelectedData: false,
                    template: data
                }
            });
        }, function (err) {
            console.log('error', err);
        });
    };

    $("#excelsButton").click(function () {
        var varible;
        $("#gridContainer").dxDataGrid({
            "export": {
                enabled: false,
                listControl: listControl

            },
            onExporting: function (e) {
                e.fileName = "BaoCao";
            },
            onExported: function (e) {

            },
            onFileSaving: function (e) {
                //e.cancel = true;
                //var blob = e.data;
                //var a = document.createElement("a");
                //document.body.appendChild(a);
                ////var url = window.URL.createObjectURL(blob);
                ////a.href = url;
                ////a.download = "BC.xlsx";
                ////a.click();
                ////window.URL.revokeObjectURL(url);
                //var formData = new FormData();
                //formData.append("file", blob);
                //var xhr = new XMLHttpRequest();
                //xhr.open("POST", "http://localhost:8003/temp/");
                //xhr.send(formData);
            }
        });
        var excel = $("#gridContainer").dxDataGrid("instance").exportToExcel(false);

    });

    $("#saveModal").click(function () {
        loadReportForm(-1);
        $('.hin-modal-content').css({'animation-name': 'fadeOutUp', '-webkit-animation-name': 'fadeOutUp'});
        setTimeout(function () {
            $('#myModal').css('display', 'none');
        }, 800);
    });

    function loadReportForm(reportId) {
        //xoa moi controls dang hien
        $("#controls").html("");
        //lấy thông tin report filter
        var param = new Object();
        if (reportId == -1) {
            param = {reportId: $("#listReport").dxSelectBox("instance").option("value")};
        } else {
            param.reportId = reportId;
        }

        param.portletId = $('#layoutId').val();
        currentReportId = param.reportId;

        $.ajax({
            method: "GET",
            url: "/web-reportviewer/services/get/reportFilter",
            dataType: "JSON",
            data: param,
            success: function (success) {
                generateControl(success);
            }
        })

        $.ajax({
            method: "GET",
            url: "/web-reportviewer/services/get/template",
            dataType: "text",
            data: param,
            success: function (success) {
                loadAjaxTemplate(success)
            }
        })
    }

    function initReport() {
        var param = new Object();
        param.portletId = $('#layoutId').val();
        $.ajax({
            method: "GET",
            url: "/web-reportviewer/services/get/reportPortlet",
            dataType: "JSON",
            data: param,
            success: function (success) {
                if (success.portletId != -1) {
                    loadReportForm(success.reportId);
                    $.ajax({
                        method: "GET",
                        url: "/web-reportviewer/services/get/reportName",
                        dataType: "JSON",
                        data: param,
                        success: function (success) {

                            $('#reportName').text(success.reportName);
                        }
                    });
                }
            }
        })
    }

    function initModal() {
        $('#settingButton').click(function () {
            $('#myModal').css('display', 'block');
            $('.hin-modal-content').css({'animation-name': 'fadeInDownBig', '-webkit-animation-name': 'fadeInDownBig'});
        });

// When the user clicks on <span> (x), close the modal
        $('#cancelModal').click(function () {
            $('.hin-modal-content').css({'animation-name': 'fadeOutUp', '-webkit-animation-name': 'fadeOutUp'});
            setTimeout(function () {
                $('#myModal').css('display', 'none');
            }, 800);
        });

// When the user clicks anywhere outside of the modal, close it
        $(document).click(function (event) {
            if (event.target == $('#myModal')) {
                $('.hin-modal-content').css({'animation-name': 'fadeOutUp', '-webkit-animation-name': 'fadeOutUp'});
                setTimeout(function () {
                    $('#myModal').css('display', 'none');
                }, 800);
            }
        });
    }

    // doi ten field
    function convertFieldName(name) {

        var numParam = (name.match(new RegExp("{{", "g")) || []).length;

        if (numParam == 1) {
            for (var i = 0; i < listFilter.length; i++) {
                if (name.toLowerCase().indexOf("{" + listFilter[i].code.toLowerCase() + "}") != -1) {
                    var _temp1 = "";
                    var _temp2 = "";
                    var _temp3 = "";
                    if (name.indexOf("{{") > 0 && name.indexOf("}}") != -1) {
                        if (name.indexOf("}}") == name.length - 2) {
                            _temp1 = name.substring(0, name.indexOf("{{"));
                        }
                        else {
                            _temp1 = name.substring(0, name.indexOf("{{"));
                            _temp3 = name.substring(name.indexOf("}}") + 2);
                        }
                    } else if (name.indexOf("{{") > 0 && name.indexOf("}}") == -1) {
                        if (name.substring(name.length - 1).indexOf("}") == -1) {
                            _temp1 = name.substring(0, name.indexOf("{{"));
                            _temp2 = name.split("}")[1];
                        }
                        else {
                            _temp1 = name.substring(0, name.indexOf("{{"));
                            _temp2 = name.split("}")[1];
                            _temp3 = name.split("}")[2];
                        }
                    } else if (name.indexOf("{{") == 0 && name.indexOf("}}") != -1) {
                        if (name.indexOf("}}") != name.length - 2)
                            _temp3 = name.split("}}")[1];
                    }
                    else {
                        if (name.substring(name.length - 1).indexOf("}}") != -1) {
                            _temp2 = name.split("}")[1];
                        }
                        else {
                            _temp2 = name.split("}")[1];
                            _temp3 = name.split("}")[2];
                        }
                    }
                    if (_temp2 != "") {
                        _temp2 = (parseInt(listFilter[i].value) + parseInt(_temp2)).toString();
                    }
                    else {
                        _temp2 = parseInt(listFilter[i].value).toString();
                    }
                    name = _temp1 + _temp2 + _temp3;
                }
            }
        }
        else if (numParam == 2) {
            var strName = name;
            var _temp1 = "";
            var _tempValue1 = "";
            var _temp2 = "";
            var _tempValue2 = "";
            var _temp3 = "";
            if (strName.indexOf("{{") > 0) {
                _temp1 = strName.substring(0, strName.indexOf("{{"));
            }
            var indextempValue = strName.indexOf("}", strName.indexOf("}") + 1);
            _tempValue1 = strName.substring(_temp1.length, indextempValue + 1);
            _temp2 = strName.substring(_temp1.length + _tempValue1.length,
                strName.indexOf("{{", _temp1.length + _tempValue1.length));
            indextempValue = strName.indexOf("}", strName.indexOf("}", _temp1.length + _tempValue1.length + _temp2.length) + 1);
            _tempValue2 = strName.substring(_temp1.length + _tempValue1.length + _temp2.length, indextempValue + 1);
            _temp3 = strName.substring(_temp1.length + _tempValue1.length + _temp2.length + _tempValue2.length);
            var reportValue1 = "";
            var reportValue2 = "";
            for (var i = 0; i < listFilter.length; i++) {
                if (_tempValue1.toLowerCase().indexOf("{" + listFilter[i].code.toLowerCase() + "}") != -1) {
                    reportValue1 = listFilter[i].value;
                }
            }
            for (var i = 0; i < listFilter.length; i++) {
                if (_tempValue2.toLowerCase().indexOf("{" + listFilter[i].code.toLowerCase() + "}") != -1) {
                    reportValue2 = listFilter[i].value;
                }
            }
            if (_tempValue1.indexOf("}}") > 0) {
                _tempValue1 = reportValue1;
            }
            else {
                var strTemp = _tempValue1.substring(_tempValue1.indexOf("}") + 1, _tempValue1.length - 1);
                if (strTemp != "") {
                    _tempValue1 = (parseInt(reportValue1) + parseInt(strTemp)).toString();
                }
                else {
                    _tempValue1 = parseInt(reportValue1).toString();
                }
            }
            if (_tempValue2.indexOf("}}") > 0) {
                _tempValue2 = reportValue2;
            }
            else {
                var strTemp = _tempValue2.substring(_tempValue2.indexOf("}") + 1, _tempValue2.length - 1);
                if (strTemp != "") {
                    _tempValue2 = (parseInt(reportValue2) + parseInt(strTemp)).toString();
                }
                else {
                    _tempValue2 = parseInt(reportValue2).toString();
                }
            }
            name = _temp1 + _tempValue1 + _temp2 + _tempValue2 + _temp3
        }
        else if (numParam == 3) {

            var strName = name;
            var _temp1 = "";
            var _tempValue1 = "";
            var _temp2 = "";
            var _tempValue2 = "";
            var _temp3 = "";
            var _tempValue3 = "";
            var _temp4 = "";
            if (strName.indexOf("{{") > 0) {
                _temp1 = strName.substring(0, strName.indexOf("{{"));
            }
            var indextempValue = strName.indexOf("}", strName.indexOf("}") + 1);
            _tempValue1 = strName.substring(_temp1.length, indextempValue + 1);
            _temp2 = strName.substring(_temp1.length + _tempValue1.length,
                strName.indexOf("{{", _temp1.length + _tempValue1.length));
            indextempValue = strName.indexOf("}", strName.indexOf("}", _temp1.length + _tempValue1.length + _temp2.length) + 1);
            _tempValue2 = strName.substring(_temp1.length + _tempValue1.length + _temp2.length, indextempValue + 1);
            _temp3 = strName.substring(_temp1.length + _tempValue1.length + _temp2.length + _tempValue2.length,
                strName.indexOf("{{", _temp1.length + _tempValue1.length + _temp2.length + _tempValue2.length));
            var count = 0;
            var indexTemp = 0;
            for (var i = 0; i < strName.length; i++) {
                if (strName.charAt(i) == '}') {
                    count++;
                    indexTemp = i;
                }
                if (count == 6)
                    break;
            }
            _tempValue3 = strName.substring(_temp1.length + _temp2.length + _temp3.length + _tempValue1.length +
                _tempValue2.length, indexTemp + 1);
            _temp4 = strName.substring(_temp1.length + _temp2.length + _temp3.length + _tempValue1.length +
                _tempValue2.length + _tempValue3.length);
            var reportValue1 = "";
            var reportValue2 = "";
            var reportValue3 = "";
            for (var i = 0; i < listFilter.length; i++) {
                if (_tempValue1.toLowerCase().indexOf("{" + listFilter[i].code.toLowerCase() + "}") != -1) {
                    reportValue1 = listFilter[i].value;
                }
            }
            for (var i = 0; i < listFilter.length; i++) {
                if (_tempValue2.toLowerCase().indexOf("{" + listFilter[i].code.toLowerCase() + "}") != -1) {
                    reportValue2 = listFilter[i].value;
                }
            }
            for (var i = 0; i < listFilter.length; i++) {
                if (_tempValue3.toLowerCase().indexOf("{" + listControl[i].code.toLowerCase() + "}") != -1) {
                    reportValue3 = filter[i].value;
                }
            }
            if (_tempValue1.indexOf("}}") > 0) {
                _tempValue1 = reportValue1;
            }
            else {
                var strTemp = _tempValue1.substring(_tempValue1.indexOf("}") + 1, _tempValue1.length - 1);
                if (strTemp != "") {
                    _tempValue1 = (parseInt(reportValue1) + parseInt(strTemp)).toString();
                }
                else {
                    _tempValue1 = parseInt(reportValue1).toString();
                }
            }

            if (_tempValue3.indexOf("}}") > 0) {
                _tempValue3 = reportValue3;
            }
            else {
                var strTemp = _tempValue3.substring(_tempValue3.indexOf("}") + 1, _tempValue3.length - 1);
                if (strTemp != "") {
                    _tempValue3 = (parseInt(reportValue3) + parseInt(strTemp)).toString();
                }
                else {
                    _tempValue3 = parseInt(reportValue3).toString();
                }
            }

            if (_tempValue2.indexOf("}}") > 0) {
                _tempValue2 = reportValue2;
            }
            else {
                var strTemp = _tempValue2.substring(_tempValue2.indexOf("}") + 1, _tempValue2.length - 1);
                if (strTemp != "") {
                    _tempValue2 = (parseInt(reportValue2) + parseInt(strTemp)).toString();
                }
                else {
                    _tempValue2 = parseInt(reportValue2).toString();
                }
            }
            name = _temp1 + _tempValue1 + _temp2 + _tempValue2 + _temp3 + _tempValue3 + _temp4;
        }

        return name;
    }

    function base64ToArrayBuffer(base64) {
        var binaryString = window.atob(base64);
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var i = 0; i < binaryLen; i++) {
            var ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

    var saveByteArray = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, name) {
            var blob = new Blob(data, {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());

    $('#pdfButton').click(function () {
        var varible;
        $("#gridContainer").dxDataGrid({
            "export": {
                enabled: false,
                listControl: listControl

            },
            onExporting: function (e) {
                e.fileName = "BaoCao.xlsx";
            },
            onExported: function (e) {

            },
            onFileSaving: function (e) {
                var blob = e.data;
                var fd = new FormData();
                fd.append('file', blob);
                fd.append('name', "BaoCao.xlsx");
                $.ajax({
                    type: 'POST',
                    url: '/web-reportviewer/services/file/excel2pdf',
                    data: fd,
                    processData: false,
                    contentType: false,
                    beforeSend: function () {
                        $("#pdfButton").parent().append('<div class="dark-blur">\n' +
                            '                    <img src="/web-reportviewer/img/Spinner.gif"/>\n' +
                            '                </div>');
                    }
                }).done(function (data) {
                    window.open(data,"_self");
                    $("#pdfButton").parent().find('.dark-blur').remove();
                });
                e.cancel = true;
            }
        });
        $("#gridContainer").dxDataGrid("instance").exportToExcel(false);
    });

})
