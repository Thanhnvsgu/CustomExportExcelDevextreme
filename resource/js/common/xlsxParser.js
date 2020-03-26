/*
    Relies on jQuery, underscore.js, Async.js (https://github.com/caolan/async), and zip.js (http://gildas-lormeau.github.com/zip.js).
    Tested only in Chrome on OS X.

    Call xlsxParser.parse(file) where file is an instance of File. For example (untested):

    document.ondrop = function(e) {
        var file = e.dataTransfer.files[0];
        excelParser.parse(file).then(function(data) {
            console.log(data);
        }, function(err) {
            console.log('error', err);
        });
    }
*/

xlsxParser = (function() {
    var pointBeginTable;
	function extractFiles(file) {
		var deferred = $.Deferred();

		zip.createReader(new zip.BlobReader(file), function(reader) {
			reader.getEntries(function(entries) {
				async.reduce(entries, {}, function(memo, entry, done) {
					var files = ['xl/worksheets/sheet1.xml', 'xl/sharedStrings.xml', 'xl/styles.xml'];
					if (files.indexOf(entry.filename) == -1) return done(null, memo);

					entry.getData(new zip.TextWriter(), function(data) {
						memo[entry.filename.split('/').pop()] = data;
						done(null, memo);
					});
				}, function(err, files) {
					if (err) deferred.reject(err);
					else deferred.resolve(files);
				});
			});
		}, function(error) { deferred.reject(error); });

		return deferred.promise();
	}

	function loadData(files) {
		var strings = $(files['sharedStrings.xml']);
		var data = [];
		var temp = 0;

        strings.find('si t').each(function(value){
            var dataString = strings.find('si t').eq(parseInt(value)).text();
            if(dataString == "value"){
                pointBeginTable = temp;
            }
            data.push(dataString);
            temp++;
        });
		return data;
	}

    function loadSheet(files) {
        var load = $(files['sheet1.xml']);
        var contentFile = files['sheet1.xml'];
        var columnsString;
        var columns = [];
        var sheet = new Object();
        var sheetData = [];
        var MergeCells = new Object();
        var IgnoreErrors;
        var colsBegin, colsEnd;

        //load
        colsBegin = files['sheet1.xml'].indexOf('<cols>');
        colsEnd = files['sheet1.xml'].indexOf('</cols>');
        if(colsBegin != -1){
            columnsString = files['sheet1.xml'].slice(colsBegin + 6, colsEnd);
        }

        // load columns 
        // load.find('cols col').each(function(i, c){
        //     var $columns = $(c);
        //     var c = {};
        //     c.style = $columns.attr("style");
        //     c.width = $columns.attr("width");
        //     c.max = $columns.attr("max");
        //     c.min = $columns.attr("min");
        //     if($columns.attr("customWidth") != undefined)
        //         c.customWidth = $columns.attr("customWidth")
        //     columns.push(c);
        // });

        //load vi tri du lieu
        load.find('sheetData row').each(function(i , r){
            var rowDetail = new Object();
            var cells = [], content = "";
            var check = false;
            var $row = $(r);
            rowDetail.r = $row.attr('r');
            rowDetail.spans = $row.attr('spans');
            $row.find('c').each(function(i, c)
            {
                var $cell = $(c),
                    position = $cell.attr('r'),
                    type = $cell.attr('t'),
                    value = $cell.find('v').text(),
                    style = $cell.attr('s');
                var cell = new Object();
                cell.t = type;
                cell.v = value;
                cell.s = style;
                cell.r = position;
                if((pointBeginTable == value) && (value != "")){
                    check = true;
                }

                cells.push(cell);
            });
            rowDetail.Cells = cells;
            // Start data
            if(check == true){
                sheet.rowBeginTable = rowDetail
            }
            else {
                sheetData.push(rowDetail);
            }
        });


        //load cac o merge
        var mergeBegin, mergeEnd, mergeString;
        MergeCells.count = load.find('mergeCells').attr('count');
        mergeBegin = files['sheet1.xml'].indexOf('<mergeCell ');
        mergeEnd = files['sheet1.xml'].indexOf('</mergeCells>');
        if(mergeEnd != -1){
            mergeString = files['sheet1.xml'].slice(mergeBegin, mergeEnd);
        }
        MergeCells.mergeString = mergeString;

        //load ignore errors
        var ignoreBegin, ignoreEnd, ignoreString;
        ignoreBegin = files['sheet1.xml'].indexOf('<ignoredError>');
        ignoreEnd = files['sheet1.xml'].indexOf('</ignoredErrors>');
        if(ignoreBegin != -1){
            ignoreString = files['sheet1.xml'].slice(ignoreBegin, ignoreEnd);
        }

        sheet.SheetData = sheetData;
        sheet.MergeCells = MergeCells;
        sheet.IgnoreErrors = IgnoreErrors;
        sheet.Columns = columnsString;

        return sheet;
    }


    function loadStyles(files){
        var load = $(files['styles.xml']);
        var styles = new Object();
        var numFmts = new Object();
        var fonts = new Object();
        var fills = new Object();
        var borders = new Object();
        var cellXfs = new Object();
        var cellStyleXfs = new Object();
        var cellStyles = new Object();

        // load numFmts

        numFmts.count = load.find('numFmts').attr('count');
        var numFmtBegin, numFmtEnd, numFmtString;
        
        numFmtBegin = files['styles.xml'].indexOf('<numFmt ');
        numFmtEnd = files['styles.xml'].indexOf('</numFmts>');
        if(numFmtBegin != -1)
            numFmtString = files['styles.xml'].slice(numFmtBegin, numFmtEnd);
        numFmts.numFmtString = numFmtString;
        styles.numFmts = numFmts;
        //load font
       fonts.count = load.find('fonts').attr('count');
       fonts.knownFonts = load.find('fonts').attr('knownFonts');
       var fontBegin, fontEnd, fontString;
        fontBegin = files['styles.xml'].indexOf('<font>');
        fontEnd = files['styles.xml'].indexOf('</fonts>');
        if(fontBegin != -1){
            fontString = files['styles.xml'].slice(fontBegin, fontEnd);
        }
        fonts.fontString = fontString;
        styles.fonts = fonts;

       //load fills
        fills.count = load.find('fills').attr('count');
        var fillBegin, fillEnd, fillString;
        fillBegin = files['styles.xml'].indexOf('<fill>');
        fillEnd = files['styles.xml'].indexOf('</fills>');
        if(fillBegin != -1){
            fillString = files['styles.xml'].slice(fillBegin, fillEnd);
        }
        fills.fillString = fillString;
        styles.fills = fills;

        //load border
        borders.count = load.find('borders').attr('count');
        var borderBegin, borderEnd, borderString;
        borderBegin = files['styles.xml'].indexOf('<border>');
        borderEnd = files['styles.xml'].indexOf('</borders>');
        if(borderBegin != -1){
            borderString = files['styles.xml'].slice(borderBegin, borderEnd);
        }
        borders.borderString = borderString;
        styles.borders = borders;

        //load cellXfs
        cellXfs.count = load.find('cellXfs').attr('count');
        var cellXfBegin, cellXfEnd, cellXfString;
        var cellXfsSource = files['styles.xml'].slice(files['styles.xml'].indexOf('<cellXfs'), files['styles.xml'].indexOf('</cellXfs>'));
        cellXfBegin = cellXfsSource.indexOf('<xf ');
        cellXfEnd = cellXfsSource.length;
        if(cellXfBegin != -1){
            cellXfString = cellXfsSource.slice(cellXfBegin, cellXfEnd);
        }
        cellXfs.cellXfString = cellXfString;
        styles.cellXfs = cellXfs;   

        //load cellStyleXfs
        cellStyleXfs.count = load.find('cellStyleXfs').attr('count');
        var cellStyleXfBegin, cellStyleXfEnd, cellStyleXfString;
        var cellStyleXfsSource = files['styles.xml'].slice(files['styles.xml'].indexOf('<cellStyleXfs'), files['styles.xml'].indexOf('</cellStyleXfs>'));
        cellStyleXfBegin = cellStyleXfsSource.indexOf('<xf ');
        cellStyleXfEnd = cellStyleXfsSource.length;
        if(cellStyleXfBegin != -1){
            cellStyleXfString = cellStyleXfsSource.slice(cellStyleXfBegin, cellStyleXfEnd);
        }
        cellStyleXfs.cellStyleXfString = cellStyleXfString;
        styles.cellStyleXfs = cellStyleXfs;

        // load cellStyle

        cellStyles.count = load.find('cellStyles').attr('count');
        var cellStyleBegin, cellStyleEnd, cellStyleString;
        cellStyleBegin = files['styles.xml'].indexOf('<cellStyle ');
        cellStyleEnd = files['styles.xml'].indexOf('</cellStyles>');
        if(cellStyleBegin != -1){
            cellStyleString = files['styles.xml'].slice(cellStyleBegin, cellStyleEnd);
        }
        cellStyles.cellStyleString = cellStyleString;
        styles.cellStyles = cellStyles;

        return styles;
    }


	return {
		parse: function(file) {
			return extractFiles(file).pipe(function(files) {
			    var excelFile = new Object();
                excelFile.data = loadData(files);
			    excelFile.sheet = loadSheet(files);
			    excelFile.style = loadStyles(files);
				return excelFile;
			});
		}
	}
})();
