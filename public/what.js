var socket = io();

socket.on('annoy', function(data) {
  var sound = new Audio(data.url);
  sound.play();
});
