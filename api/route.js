var fs = require('fs');

module.exports = function(app) {
    let fileController = require('./controller/fileController');
  
    // todoList Routes
    app.route('/file')
      .get(fileController.get)
    app.route('/test')
      .get(function(req,res){
        return res.json({
          message: "success"
        })
      });
    app.route('/testdata')
      .get(function(req,res){
          var rs = [];
          for(var i = 0 ;i< 50; i++){
            var s = {
              id: i + 1,
              name: "S" + (i+1),
              group: i%2==0?"Group Even":"Group Odd",
              location: `{"x": ${i/(i+1)}, "y": ${i/(i+2)}, "z": ${i/(i+3)}}`
            }
            rs.push(s);
          }
          return res.json(rs);
      })
    app.route('/page/index')
      .get(function(req,res){
        fs.readFile('./index.html', function(err, html){
            if(err)
              throw err;
            res.writeHeader(200, {"Content-Type": "text/html"});  
            res.write(html);  
            res.end();  
        });
        return res;
      });
  };