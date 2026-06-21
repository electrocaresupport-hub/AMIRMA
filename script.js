let memory = JSON.parse(localStorage.getItem("amirma_memory")) || [];
function saveMemory(text){
  memory.push({
    text,
    time: Date.now()
  });

  localStorage.setItem("amirma_memory", JSON.stringify(memory));
}
// =====================
// AMIRMA PRIME CORE
// =====================

const boot = document.getElementById("bootScreen");

setTimeout(() => {
  boot.style.display = "none";
}, 4500);

// CLOCK
function updateClock(){
  const now = new Date();
  document.getElementById("time").innerText = now.toLocaleTimeString();
  document.getElementById("date").innerText = now.toDateString();
}
setInterval(updateClock,1000);
updateClock();

// SYSTEM SIMULATION
function systemMonitor(){
  document.getElementById("cpu").innerText = Math.floor(Math.random()*100)+"%";
  document.getElementById("ram").innerText = Math.floor(Math.random()*100)+"%";
  document.getElementById("storage").innerText = Math.floor(Math.random()*100)+"%";
  document.getElementById("network").innerText = Math.floor(Math.random()*100)+" Mbps";
}
setInterval(systemMonitor,2000);

// WEATHER (Open-Meteo)
async function loadWeather(){
  try{
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=23.83&longitude=91.28&current_weather=true");
    const data = await res.json();
    document.getElementById("weather").innerText =
      `Temp: ${data.current_weather.temperature}°C | Wind: ${data.current_weather.windspeed} km/h`;
  }catch(e){
    document.getElementById("weather").innerText="Weather offline";
  }
}
loadWeather();

// CHAT SYSTEM
function sendMessage(){
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  const msg = input.value;
  if(!msg) return;

  chatBox.innerHTML += `<div>You: ${msg}</div>`;

  let reply = aiReply(msg);

  chatBox.innerHTML += `<div>AMIRMA: ${reply}</div>`;
  input.value="";
  chatBox.scrollTop = chatBox.scrollHeight;

  localStorage.setItem("chat", chatBox.innerHTML);
}

function aiReply(msg){
  msg = msg.toLowerCase().trim();
  saveMemory(msg);

  // flexible intent matching
  const openGoogle = msg.includes("google") || msg.includes("open google");
  const openYoutube = msg.includes("youtube") || msg.includes("open youtube");
  const timeAsk = msg.includes("time");
  const hello = /hello|hi|hey|namaste/.test(msg);

  if(hello){
    return "Hello Sir, I am AMIRMA Prime AI.";
  }

  if(timeAsk){
    return "Current time is " + new Date().toLocaleTimeString();
  }

  if(openGoogle){
    window.open("https://google.com");
    return "Opening Google...";
  }

  if(openYoutube){
    window.open("https://youtube.com");
    return "Opening YouTube...";
  }

  if(msg.includes("who are you")){
    return "I am AMIRMA Prime AI Operating System with memory system.";
  }

  // SMART FALLBACK (IMPORTANT)
  return smartThink(msg);
}

  // weather
  if(msg.includes("weather")){
    return "Weather system active on dashboard.";
  }

  // identity
  if(msg.includes("who are you")){
    return "I am AMIRMA Prime AI Operating System.";
  }

  // fallback brain
  return smartThink(msg);
}
// LOAD CHAT
document.getElementById("chatBox").innerHTML = localStorage.getItem("chat") || "";

// VOICE SYSTEM
let recognition;

function startVoice(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.onstart = () => {
    document.getElementById("listening").innerText = "ON";
  };

  recognition.onend = () => {
    document.getElementById("listening").innerText = "OFF";
  };

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById("userInput").value = text;
    sendMessage();
  };

  recognition.start();
}

function stopVoice(){
  if(recognition) recognition.stop();
}

// SPEECH OUTPUT
function speak(text){
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  document.getElementById("speaking").innerText = "ON";
  utter.onend = () => {
    document.getElementById("speaking").innerText = "OFF";
  };
  synth.speak(utter);
}

// OPEN APPS
function openApp(url){
  window.open(url,"_blank");
}

// PARTICLE SYSTEM
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for(let i=0;i<80;i++){
  particles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    r:Math.random()*2,
    dx:(Math.random()-0.5),
    dy:(Math.random()-0.5)
  });
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#00f5ff";

  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if(p.x<0||p.x>canvas.width) p.dx*=-1;
    if(p.y<0||p.y>canvas.height) p.dy*=-1;
  });

  requestAnimationFrame(draw);
}

draw();

function smartThink(msg){

  if(msg.includes("why")){
    return "AMIRMA is analyzing reasons behind this question...";
  }

  if(msg.includes("how")){
    return "Please provide more detail so I can guide properly.";
  }

  if(msg.split(" ").length < 2){
    return "Ask a complete question for better answer.";
  }

  return "I understand your input. AMIRMA is learning continuously.";
}

function showMemory(){
  console.log(memory);
}

function smartThink(msg){

  msg = msg.toLowerCase().trim();

  // too short input
  if(msg.length < 3){
    return "Please ask a clear question.";
  }

  // WHY questions
  if(msg.includes("why")){
    return "This is a deep question. I am analyzing possible reasons...";
  }

  // HOW questions
  if(msg.includes("how")){
    return "I need more details to explain properly.";
  }

  // WHAT questions
  if(msg.includes("what")){
    return "I understand your question. Processing meaning...";
  }

  // general unknown input
  return "I understand your input. AMIRMA is learning from this conversation.";
}
