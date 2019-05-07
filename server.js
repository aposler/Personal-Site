var http = require('http')
  , fs = require('fs')
  , url = require('url')
  , sql = require('sqlite3')
  , port = 8080
  , querystring = require('querystring');

var db = new sql.Database('grids.sqlite')

const { DATABASE_URL } = process.env;
var server = http.createServer(function (req, res) {
  if (req.method === 'POST') {
    var body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      var jsonData = JSON.parse(body);
      if (jsonData.requestType === "add") {
        addGrid(res, jsonData);
      } else if (jsonData.requestType === "request") {
        returnNames(res, jsonData);
      } else if (jsonData.requestType === "grid") {
        returnGrid(res, jsonData);
      }
    })
  } else {
    var uri = url.parse(req.url)
    switch (uri.pathname) {
      case '/':
        sendFile(res, 'public/index.html')
        break
      case '/index.html':
        sendFile(res, 'public/index.html')
        break
      case '/styles/style.css':
        sendFile(res, 'public/styles/style.css', 'text/css')
        break
      case '/scripts/main.js':
        sendFile(res, 'public/scripts/main.js', 'text/javascript')
        break
      default:
        res.end('404 not found')
    }
  }
})

server.listen(process.env.PORT || port);
console.log('listening on 8080')

// subroutines
// NOTE: this is an ideal place to add your data functionality

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html';

  fs.readFile(filename, function (error, content) {
    res.writeHead(200, { 'Content-type': contentType })
    res.end(content, 'utf-8')
  })

}

//Finds the smallest number not currently used as an id in the database "db" 
function findMapKey(callback, username) {
  db.all("SELECT id FROM grids WHERE username = '" + username + "'", function (err, rows) {
    if (rows === undefined) {
      callback(0);
    } else {
      var existsFlags = [];
      for (i = 0; i < rows.length; i++) {
        existsFlags[rows[i].id] = 1;
      }
      var newKey = 0;
      while (existsFlags[newKey]) {
        newKey++;
      }

      callback(newKey);
    }
  })
}

//Adds a date/time pair to data, then calls buildSendHtml and sends the results back
function addGrid(res, newData) {
  findMapKey(function (newKey) {
    db.all("SELECT grid FROM grids WHERE username = '" + newData.username +
      "' AND gridName = '" + newData.gridName + "'", function (err, rows) {
        if (rows.length > 0) {
          var sendStruct = {
            "valid": false,
            "names": []
          };
          res.writeHead(200, { 'Content-type': 'application/json' });
          res.end(JSON.stringify(sendStruct));
          return;
        }
        var sqlGrid = JSON.stringify(newData.grid);
        var gridName = newData.gridName;
        if (gridName === "" || !gridName) {
          gridName = "grid " + newKey;
        }
        db.run("INSERT INTO grids VALUES (" + newKey + ", '" + gridName + "', '" + newData.username +
          "', '" + sqlGrid + "')", function () { }, function () {
            returnNames(res, newData);
          });
      });
  }, newData.username)
}

function returnGrid(res, newData) {
  db.all("SELECT grid FROM grids WHERE username = '" + newData.username +
    "' AND gridName = '" + newData.gridName + "'", function (err, rows) {
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.end(JSON.stringify(rows[0]));
    });
}

function returnNames(res, newData) {
  db.all("SELECT gridName FROM grids WHERE username = '" + newData.username + "'", function (err, rows) {
    var sendStruct = {
      "valid": true,
      "names": rows
    };
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(JSON.stringify(sendStruct));
  });
}