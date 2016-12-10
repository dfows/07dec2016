var port = process.env.PORT || 8888;

var aws = require('aws-sdk');
var S3_BUCKET = process.env.S3_BUCKET || 'heroku-06dec2016';

var express = require('express');
var app = express();
app.use(express.static('public'));

var http = require('http');
var server = http.createServer(app);
server.listen(port);

var io = require('socket.io')(server);
io.on('connection', function(socket) {
  socket.on('playSound', function(data) {
    io.emit('annoy', data);
    //socket.emit('annoy', data); //this was the fatal flaw. i don't want to send this back to the same socket cuz that's not the one that's listening for this shit. ok (i think?)
  });
});

app.get('/signThis', function(req, res) {
  var fileName = req.query.name;
  var fileType = req.query.type;

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
      signedRequest: data,
      url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + fileName
    };
    res.send(returnData);
  });
});

app.get('/allSounds', function(req, res) {
  var s3 = new aws.S3();
  s3.listObjects({
    Bucket: S3_BUCKET
  }, function(err, data) {
    var objs = data.Contents.map(function(o) {
      return 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + o.Key;
    });
    res.send(objs);
  });
});

app.get('/admin', function(req, res) {
  res.sendFile(__dirname + '/public/admin.html');
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/uh.html');
});
