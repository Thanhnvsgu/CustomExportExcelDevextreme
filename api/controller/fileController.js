'use strict'

const fs = require('fs');

module.exports = {
    get: function(req, res){

        // res.writeHead(200, {
        //     'Content-Type': 'application/octet-stream; charset=UTF-8'
        // })

        res.download("./file/template/" + req.query.file);
    }
}