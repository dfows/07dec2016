var socket = io();

socket.on('event', function(data) {
  var sound = new Audio(data.sound);
  sound.play();
});
