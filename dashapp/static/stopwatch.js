//holds incrementing value
var milisec = 0;
var sec = 0;
var min = 0;
var hour = 0;

//holds output value
var miliSecOut = 0;
var secOut = 0;
var minOut = 0;
var hourOut = 0;

var stopwatch;

function startStopwatch() {
    stopwatch = setInterval(timer, 10);
}

function resetStopwatch() {
  clearInterval(stopwatch);
  milisec = 0;
  sec = 0;
  min = 0
  hour = 0;

  document.getElementById("elapsed-ms").innerHTML = "00";
  document.getElementById("elapsed-s").innerHTML = "00";
  document.getElementById("elapsed-m").innerHTML = "00";
  document.getElementById("elapsed-h").innerHTML = "00";
}

function timer() {
    miliSecOut = checkTime(milisec);
    secOut = checkTime(sec);
    minOut = checkTime(min);
    hourOut = checkTime(hour);

    milisec = ++milisec;

    if (milisec === 100) {
      milisec = 0;
      sec = ++sec;
    }

    if (sec == 60) {
      min = ++min;
      sec = 0;
    }

    if (min == 60) {
      min = 0;
      hour = ++hour;
    }

    document.getElementById("elapsed-ms").innerHTML = miliSecOut;
    document.getElementById("elapsed-s").innerHTML = secOut;
    document.getElementById("elapsed-m").innerHTML = minOut;
    document.getElementById("elapsed-h").innerHTML = hourOut;
}

// Adds 0 when value is < 10
function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
}