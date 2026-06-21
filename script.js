function updateClock(){

let now = new Date();

document.getElementById("clock").innerHTML =
now.toLocaleTimeString();

}

setInterval(updateClock,1000);

updateClock();
