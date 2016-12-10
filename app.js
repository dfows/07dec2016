var port = process.env.PORT || 8888;

var formidable = require('formidable');

var aws = require('aws-sdk');
var S3_BUCKET = process.env.S3_BUCKET || 'heroku-06dec2016';

var express = require('express');
var app = express();
app.use(express.static('public'));

var http = require('http');
var server = http.createServer(app);
server.listen(port);

var io = require('socket.io')(server);

app.post('/sound', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) { console.log(err); }
    if (files.upload.size == 0) {
      console.log("no files");
      io.emit('event', {sound: 'sound.mp3'});
      res.redirect('/admin');
    } else {
      // so much grief over directories. I STILL DON'T UNDERSTAND HOW THAT SHIT WORKS
      // and also i have to move this to S3 because im not allowed to upload shit
      var fileName = files.upload.name;
      var fileType = files.upload.type;

      var s3 = new aws.S3();
      var s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
      };
      s3.getSignedUrl('putObject', s3Params, function(err, data) {
        if (err) { console.log(err); return res.end(); }
        var returnData = {
          signedRequest: data
        };
        var url = 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + fileName;
        io.emit('event', {sound: url});
        res.redirect('/admin');
      });
    }
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
