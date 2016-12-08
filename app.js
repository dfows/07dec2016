var port = process.env.PORT || 8888;

var eventEmitter = require('events');
var emitter = new eventEmitter();

var fs = require('fs');
var formidable = require('formidable');

var express = require('express');
var app = express();

app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/sound', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) { console.log(err); }
    // so much grief over directories. I STILL DON'T UNDERSTAND HOW THAT SHIT WORKS
    fs.rename(files.upload.path, 'public/sound.mp3', function() {
      emitter.emit('event');
      res.redirect('/admin');
    });
  });
});

app.get('/punkd', function(req, res) {
  emitter.on('event', function() {
    res.send('sound.mp3'); //FU FOREVER
  });
});

app.get('/admin', function(req, res) {
  var fuckery = '<html>' +
    '<head>' +
      '<meta charset=UTF-8 http-equiv="Content-Type" content="text/html" />' +
      '<title>ur the admin</title>' +
    '</head>' +
    '<body>' +
      '<form action="/sound" method="post" enctype="multipart/form-data">' +
        '<input type="file" name="upload" />' +
        '<input type="submit" value="emit sound" />' +
      '</form>' +
    '</body>' +
  '</html>';
  res.send(fuckery);
});

app.get('/', function(req, res) {
  res.send("yo");
});

app.listen(port);
