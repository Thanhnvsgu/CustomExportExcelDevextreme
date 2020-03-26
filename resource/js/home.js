$(function(){

    $.ajax({
        method: "GET",
        url: "/get/allReport",
        dataType: "json",
        success: function(success){
            createDatatable(success)
        }
    });

    function createDatatable(jsonData) {
        var dataGrid = $("#gridContainer").dxDataGrid({
            dataSource: jsonData,
            allowColumnReordering: true,
            grouping: {
                autoExpandAll: true,
            },
            searchPanel: {
                visible: true
            },
            paging: {
                pageSize: 10
            },
            groupPanel: {
                visible: true
            },
            columns: [
                "name",
                "sqlContent",
                "version",
            ]
        }).dxDataGrid("instance");

        $("#autoExpand").dxCheckBox({
            value: true,
            text: "Expand All Groups",
            onValueChanged: function (data) {
                dataGrid.option("grouping.autoExpandAll", data.value);
            }
        });
    };
});