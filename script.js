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

  msg = msg.trim();

  saveMemory(msg);

  // Fast local commands
  if(msg.toLowerCase().includes("open google")){
    window.open("https://google.com","_blank");
    return "Opening Google.";
  }

  if(msg.toLowerCase().includes("youtube")){
    window.open("https://youtube.com","_blank");
    return "Opening YouTube.";
  }

  if(msg.toLowerCase().includes("time")){
    return "Current time is " + new Date().toLocaleTimeString();
  }

  try{
    return await askAI(msg);
  }catch(error){
    console.error(error);
    return "Gemini connection failed.";
  }
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

  const API_KEY = "AQ.Ab8RN6LyB8uMuBpyIIKt6gMZS6pL_GOuPwC9lcIDOmpOxvnsLg";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are AMIRMA Prime, a futuristic AI Operating System assistant. User: ${question}`
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  return data.candidates[0].content.parts[0].text;
}
