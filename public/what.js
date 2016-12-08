function what(url, cb) {
  var xmlHttp = new XMLHttpRequest(); // what
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      cb(xmlHttp.responseText);
    }
  }
  xmlHttp.open('GET', url, true);
  xmlHttp.send(null);
}

window.onload = function() {
  what('/punkd', function(audioFileName) {
    document.write('i was punk\'d');
    var audio = new Audio(audioFileName);
    audio.play();
  });
};
