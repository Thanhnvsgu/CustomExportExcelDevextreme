<%@ page import="java.util.Date" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="-1" />
    <title>ReportFilter</title>
    <!-- declare bootstrap css file -->
    <link rel="stylesheet" type="text/css" href="/web-reportviewer/css/bootstrap-grid-fixed.css"/>
    <link rel="stylesheet" type="text/css" href="/web-reportviewer/css/bootstrap-reboot-fixed.css"/>
    <!-- declare devextreme css file -->
    <link rel="stylesheet" type="text/css" href="/web-reportviewer/css/dx.common.css"/>
    <link rel="stylesheet" type="text/css" href="/web-reportviewer/css/dx.light.css"/>
    <link rel="stylesheet" type="text/css" href="/web-reportviewer/css/dx.spa.css"/>
    <link rel="stylesheet" type="application/x-font-woff" href="/web-reportviewer/css/icons/dxicons.woff"/>
    <!-- declare common css file -->
    <link rel="stylesheet" type="text/css" href="/web-reportviewer/css/common.css"/>
    <link rel="stylesheet" type="text/css" href="/web-reportviewer/css/ReportFilter.css"/>
</head>
<body>
<input type="text" value="<%=(Long)request.getAttribute("layoutId")%>" id="layoutId" hidden="true"/>
<input type="text" value="<%=(Boolean) request.getAttribute("checkLogin")%>" id="checkLogin" hidden="true"/>
<div id="myModal" class="hin-modal">
    <!-- Modal content -->
    <div class="hin-modal-content">
        <div class="hin-modal-header">
            <h1>Danh sách báo cáo</h1>
        </div>
        <div class="hin-modal-body">
            <div class="dx-fieldset">
                <div class="dx-field">
                    <div class="dx-field-label">Chọn báo cáo:</div>
                    <div class="dx-field-value">
                        <div id="listReport"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="hin-modal-footer">
            <button type="button" class="button" id="cancelModal">Huỷ</button>
            <button type="button" class="button" id="saveModal">Lưu</button>
        </div>
    </div>

</div>
<div style="text-align: center">
    <h3 style="color: #578ebe" ><div id="reportName"></div></h3>
</div>
<div class="middle-page">

    <div class=" ">
        <div class ="widget-box ">
            <div class ="widget-header " >
               <h5 style=" font-weight: 600;">Tiêu chí tìm kiếm </h5>

                <span class="widget-toolbar"> <a href="#" data-action="collapse">
                    <i class="icon-chevron-up"></i> </a>
                </span>
            </div>
            <div class="widget-body">
                <br>
                <div class="" id="controls">
                </div>
                <br>
            </div>

            </div>
    </div>
    <hr>
    <div class="demo-container col-12" style="margin-top: 20px;">
        <div class="button-container">
            <div class="button_elm">
                <button type="button" class="button-image" id="pdfButton">
                    <image src="/web-reportviewer/img/icon-pdf.png" width="32px" height="32px"/>
                </button>
            </div>
            <div class="button_elm">
                <button type="button" class="button-image"  id="excelsButton">
                    <image src="/web-reportviewer/img/excel.ico" width="32px" height="32px"/>
                </button>
            </div>
            <div class="button_elm">
                <button type="button" class="button-image"  id="settingButton" data-toggle="modal" data-target="#exampleModal">
                    <image src="/web-reportviewer/img/setting.png" width="32px" height="32px"/>
                </button>
            </div>
        </div>
        <div class="demo-container">
            <div class="borderline">
                <div id="gridContainer"></div>
            </div>

        </div>
    </div>
</div>
<!-- Declare jquery library -->
<script src="/web-reportviewer/js/common/popper.js"></script>
<!-- Declare devextreme library -->
<!--Decalre calendar librarylibrary-->
<script src="/web-reportviewer/js/common/cldr.min.js"></script>
<script src="/web-reportviewer/js/cldr/event.min.js"></script>
<script src="/web-reportviewer/js/cldr/supplemental.min.js"></script>
<script src="/web-reportviewer/js/cldr/unresolved.min.js"></script>
<!--Decalre globalize y-->
<script type="text/javascript" src="/web-reportviewer/js/common/globalize.min.js"></script>
<script type="text/javascript" src="/web-reportviewer/js/globalize/message.min.js"></script>
<script type="text/javascript" src="/web-reportviewer/js/globalize/number.min.js"></script>
<script type="text/javascript" src="/web-reportviewer/js/globalize/currency.min.js"></script>
<script type="text/javascript" src="/web-reportviewer/js/globalize/date.min.js"></script>
<!--Decalre export excel-->
<script src="/web-reportviewer/js/common/z-worker.js"></script>
<script src="/web-reportviewer/js/common/deflate.js"></script>
<script src="/web-reportviewer/js/common/inflate.js"></script>
<script src="/web-reportviewer/js/common/underscore.js"></script>
<script src="/web-reportviewer/js/common/async.js"></script>
<script src="/web-reportviewer/js/common/zip.js"></script>
<script src="/web-reportviewer/js/common/xlsxParser.js?"></script>
<!--Declare date formatter-->
<script src="/web-reportviewer/js/common/jquery.dateformatter.js"></script>
<!--Declare number jquery-->
<script src="/web-reportviewer/js/common/jhashtable.js"></script>
<script src="/web-reportviewer/js/common/jquery.numberformatter-1.2.4.min.js"></script>
<!--Declare dx.all-->
<script src="/web-reportviewer/js/common/jszip.js"></script>
<script src="/web-reportviewer/js/common/dx.all.js?6512325662"></script>
<!-- declare report filter jquery -->
<script src="/web-reportviewer/js/ReportFilter.js"></script>
<style>
    .borderline{
        margin-bottom: 0px !important;
        margin-top: 2.0em !important;
        border: 1px solid #DDD !important;
        background: #FFF !important;
        position: relative;
        color: #5b5b5b;
        margin-bottom: 20px;
    }
    .dx-datagrid-headers .dx-header-row {
        background: #578ebe;

    }
    td[role=columnheader]{
        text-align: center!important;
    }
</style>
</body>
</html>