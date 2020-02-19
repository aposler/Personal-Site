let http = require('http')
  , fs = require('fs')
  , url = require('url')
  , sql = require('sqlite3')
  , port = 8080
  , querystring = require('querystring');

let db = new sql.Database('grids.sqlite')

const { DATABASE_URL } = process.env;
let server = http.createServer(function (req, res) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        let newData = JSON.parse(body);
        if (newData.requestType === "add") {
          addGrid(res, newData);
        } else if (newData.requestType === "request") {
          returnNames(res, newData);
        } else if (newData.requestType === "grid") {
          returnGrid(res, newData);
        }
      } catch (e) {
        let newData = querystring.parse(body);
        if (newData.Home == "Home") {

        } else if (newData.Resume = "Resume") {

        } else if (newData.Projects = "Projects") {

        }
      }
    })
  } else {
    let uri = url.parse(req.url)
    console.log(uri.pathname)
    switch (uri.pathname) {
      case '/':
        sendHTML(res, 'home/index.html')
        break
      case '/index.html':
        sendHTML(res, 'home/index.html')
        break
      case '/home/styles/style.css':
        sendFile(res, 'home/styles/style.css', 'text/css')
        break
      case '/home/scripts/main.js':
        sendFile(res, 'home/scripts/main.js', 'text/javascript')
        break
      case '/resume-index.html':
        sendHTML(res, 'resume/index.html')
        break
      case '/resume/resume.pdf':
        sendFile(res, 'resume/resume.pdf')
        break
      case '/resume/styles/style.css':
        sendFile(res, 'resume/styles/style.css', 'text/css')
        break
      case '/resume/scripts/main.js':
        sendFile(res, 'resume/scripts/main.js', 'text/javascript')
        break
      case '/path-index.html':
        sendHTML(res, 'path/index.html')
        break
      case '/path/styles/style.css':
        sendFile(res, 'path/styles/style.css', 'text/css')
        break
      case '/path/scripts/main.js':
        sendFile(res, 'path/scripts/main.js', 'text/javascript')
        break
      case '/tab/styles/style.css':
        sendFile(res, 'tab/styles/style.css', 'text/css')
        break
      case '/snake-index.html':
        sendHTML(res, 'snake/index.html')
        break
      case '/snake/styles/style.css':
        sendFile(res, 'snake/styles/style.css', 'text/css')
        break
      case '/snake/scripts/main.js':
        sendFile(res, 'snake/scripts/main.js', 'text/javascript')
        break
      case '/420X-index.html':
        sendHTML(res, '420X/index.html')
        break
      case '/420X':
        sendHTML(res, '420X/index.html')
        break
      case '/420X/styles/style.css':
        sendFile(res, '420X/styles/style.css', 'text/css')
        break
      case '/420X/scripts/main.js':
        sendFile(res, '420X/scripts/main.js', 'text/javascript')
        break
      case '/420X-mini1':
        sendHTML(res, '420X/mini1/index.html')
        break
      case '/420X-mini1/styles/style.css':
        sendFile(res, '420X/mini1/styles/style.css', 'text/css')
        break
      case '/420X-mini1/scripts/main.js':
        sendFile(res, '420X/mini1/scripts/main.js', 'text/javascript')
        break
      case '/420X-mini2':
        sendHTML(res, '420X/mini2/index.html')
        break
      case '/420X-mini2/styles/style.css':
        sendFile(res, '420X/mini2/styles/style.css', 'text/css')
        break
      case '/420X-mini2/scripts/main.js':
        sendFile(res, '420X/mini2/scripts/main.js', 'text/javascript')
        break
      case '/420X-mini2/scripts/dat.gui.js':
        sendFile(res, '420X/mini2/scripts/dat.gui.js', 'text/javascript')
      case '/420X-mini3':
        sendHTML(res, '420X/mini3/index.html')
        break
      case '/420X-mini3/styles/style.css':
        sendFile(res, '420X/mini3/styles/style.css', 'text/css')
        break
      case '/420X-mini3/scripts/main.js':
        sendFile(res, '420X/mini3/scripts/main.js', 'text/javascript')
        break
      case '/420X-mini3/scripts/dat.gui.js':
        sendFile(res, '420X/mini3/scripts/dat.gui.js', 'text/javascript')
      case '/420X-assignment4':
        sendHTML(res, '420X/assignment4/index.html')
        break
      case '/420X-assignment4/styles/style.css':
        sendFile(res, '420X/assignment4/styles/style.css', 'text/css')
        break
      case '/420X-assignment4/scripts/main.js':
        sendFile(res, '420X/assignment4/scripts/main.js', 'text/javascript')
        break
      case '/420X-assignment4/dat.gui.js':
        sendFile(res, '420X/assignment4/dat.gui.js', 'text/javascript')
        break;
      case '/420X-assignment4/dat.gui.js.map':
        sendFile(res, '420X/assignment4/dat.gui.js.map', 'text/javascript')
        break;
      case '/420X-assignment4/bundle.js':
        sendFile(res, '420X/assignment4/bundle.js', 'text/javascript')
        break;
      default:
        console.log(uri.pathname, '404')
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

function sendHTML(res, filename, contentType) {
  contentType = contentType || 'text/html';

  fs.readFile(filename, 'utf8', function (error, content) {
    fs.readFile('tab/index.html', 'utf8', function (error, tabContent) {
      let withHeader = content.replace("<body>", tabContent)
      res.writeHead(200, { 'Content-type': contentType })
      res.end(withHeader)
    })
  })
}

//Finds the smallest number not currently used as an id in the database "db" 
function findMapKey(callback, username) {
  db.all("SELECT id FROM grids WHERE username = '" + username + "'", function (err, rows) {
    if (rows === undefined) {
      callback(0);
    } else {
      let existsFlags = [];
      for (i = 0; i < rows.length; i++) {
        existsFlags[rows[i].id] = 1;
      }
      let newKey = 0;
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
          let sendStruct = {
            "valid": false,
            "names": []
          };
          res.writeHead(200, { 'Content-type': 'application/json' });
          res.end(JSON.stringify(sendStruct));
          return;
        }
        let sqlGrid = JSON.stringify(newData.grid);
        let gridName = newData.gridName;
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
    let sendStruct = {
      "valid": true,
      "names": rows
    };
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(JSON.stringify(sendStruct));
  });
}