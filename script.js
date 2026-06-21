// =========================
// AMIRMA CHAT SYSTEM FIXED
// =========================

let memory = JSON.parse(localStorage.getItem("amirma_memory") || "[]");

function saveMemory(text){
  memory.push({
    text: text,
    time: Date.now()
  });

  localStorage.setItem("amirma_memory", JSON.stringify(memory));
}

function smartThink(msg){

  msg = msg.toLowerCase().trim();

  if(msg.includes("why")){
    return "This is an interesting question. I am analyzing possible reasons.";
  }

  if(msg.includes("how")){
    return "Please provide more details so I can help accurately.";
  }

  if(msg.includes("what")){
    return "I understand your question. Processing information.";
  }

  return "I understand your input. AMIRMA is learning from this conversation.";
}

async function aiReply(msg){

  msg = msg.toLowerCase().trim();

  saveMemory(msg);

  // Greetings
  if(/hello|hi|hey|namaste/.test(msg)){
    return "Hello Sir. AMIRMA Prime is online and ready.";
  }

  // Time
  if(msg.includes("time")){
    return "Current time is " + new Date().toLocaleTimeString();
  }

  // Date
  if(msg.includes("date")){
    return "Today is " + new Date().toDateString();
  }

  // Google
  if(msg.includes("google")){
    window.open("https://google.com","_blank");
    return "Opening Google.";
  }

  // YouTube
  if(msg.includes("youtube")){
    window.open("https://youtube.com","_blank");
    return "Opening YouTube.";
  }

  // GitHub
  if(msg.includes("github")){
    window.open("https://github.com","_blank");
    return "Opening GitHub.";
  }

  // ChatGPT
  if(msg.includes("chatgpt")){
    window.open("https://chatgpt.com","_blank");
    return "Opening ChatGPT.";
  }

  // Weather
  if(msg.includes("weather")){
    return document.getElementById("weather")?.innerText || "Weather module active.";
  }

  // Identity
  if(msg.includes("who are you")){
    return "I am AMIRMA Prime, your AI Operating System assistant.";
  }

  return smartThink(msg);
}

async function sendMessage(){

  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if(!input || !chatBox) return;

  const msg = input.value.trim();

  if(!msg) return;

  chatBox.innerHTML += `<div class="user-msg"><b>You:</b> ${msg}</div>`;

  input.value = "";

  const reply = await aiReply(msg);

  chatBox.innerHTML += `<div class="ai-msg"><b>AMIRMA:</b> ${reply}</div>`;

  chatBox.scrollTop = chatBox.scrollHeight;

  localStorage.setItem("chat", chatBox.innerHTML);
}

// Load previous chat
window.addEventListener("load", () => {

  const chatBox = document.getElementById("chatBox");

  if(chatBox){
    chatBox.innerHTML = localStorage.getItem("chat") || "";
  }

  const input = document.getElementById("userInput");

  if(input){
    input.addEventListener("keydown", function(e){
      if(e.key === "Enter"){
        sendMessage();
      }
    });
  }
});
async function askAI(question){

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "AQ.Ab8RN6LyB8uMuBpyIIKt6gMZS6pL_GOuPwC9lcIDOmpOxvnsLg"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are AMIRMA Prime, a futuristic AI operating system."
        },
        {
          role: "user",
          content: question
        }
      ]
    })
  });

  const data = await response.json();

  return data.choices[0].message.content;
}
