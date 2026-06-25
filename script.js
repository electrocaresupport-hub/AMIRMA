document.addEventListener("DOMContentLoaded", () => {
    
    // --- DOM System Mappings ---
    const chatInputField = document.getElementById("chat-input-field");
    const sendCommandBtn = document.getElementById("send-command-btn");
    const chatMessagesBox = document.getElementById("chat-messages-box");
    const newChatBtn = document.getElementById("new-chat-btn");
    const chatHistoryContainer = document.getElementById("chat-history-container");
    
    // View Panel Mappings
    const chatView = document.getElementById("chat-view");
    const settingsView = document.getElementById("settings-view");
    const settingsTrigger = document.getElementById("settings-trigger");
    const closeSettings = document.getElementById("close-settings");

    // Responsive Mobile Selectors
    const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
    const mobileSettingsToggle = document.getElementById("mobile-settings-toggle");
    const appSidebar = document.getElementById("app-sidebar");

    // --- State Vectors ---
    let conversationHistory = [];
    let currentSessionId = null;

    // --- Core System Prompts Mapping AMIRMA Engine Rules ---
    const amirmaMockResponses = [
        `## GOAL\nOptimize and break down workflow efficiency.\n\n## ANALYSIS\nYour operational query targets layer-1 system generation protocols. System requires zero-cost high impact structuring.\n\n## PLAN\n* Step 1: Isolate current bottlenecks.\n* Step 2: Implement modern decoupled architectural nodes.\n\n## ACTION STEPS\n1. Run modular code optimization scripts.\n2. Isolate memory leaks across execution blocks.\n\n## TOOLS\n* Visual Studio Code\n* Chrome DevTools Network Tab\n\n## NEXT STEP\nProvide the code blocks or specific files requiring strategic analysis.`,
        `## GOAL\nContent creation maximization & growth mechanics.\n\n## ANALYSIS\nAudience holding structures demand strong thematic hooks within the first 2.4 seconds of execution.\n\n## PLAN\n* Step 1: Draft striking contextual titles.\n* Step 2: Scale metadata visibility metrics.\n\n## ACTION STEPS\n1. Write highly retention-focused script hooks.\n2. Structure automated social platform schedules.\n\n## TOOLS\n* YouTube Studio Analytics\n* CapCut Free Tier\n\n## NEXT STEP\nShould we target YouTube Shorts monetization structure or long-form deep dive logic first?`
    ];

    // --- Structural Engine Rules (Self-Contained Simple Parser) ---
    function parseAMIRMAStyleText(text) {
        let lines = text.split("\n");
        let htmlOutput = "";
        let inList = false;
        let inCodeBlock = false;
        let codeContent = [];

        for (let line of lines) {
            // Manage Code Blocks
            if (line.trim().startsWith("```")) {
                if (inCodeBlock) {
                    inCodeBlock = false;
                    htmlOutput += `<div class="code-block-container">
                        <div class="code-header"><span>CODE CORE</span><button class="copy-btn" onclick="copyCodeSnippet(this)"><i class="fa-solid fa-copy"></i> Copy</button></div>
                        <pre><code>${escapeHTML(codeContent.join("\n"))}</code></pre>
                    </div>`;
                    codeContent = [];
                } else {
                    inCodeBlock = true;
                }
                continue;
            }

            if (inCodeBlock) {
                codeContent.push(line);
                continue;
            }

            // Manage Structural Elements
            if (line.startsWith("## ")) {
                if (inList) { htmlOutput += "</ul>"; inList = false; }
                htmlOutput += `<h2>${line.replace("## ", "")}</h2>`;
            } else if (line.startsWith("### ")) {
                if (inList) { htmlOutput += "</ul>"; inList = false; }
                htmlOutput += `<h3>${line.replace("### ", "")}</h3>`;
            } else if (line.startsWith("* ") || line.startsWith("- ")) {
                if (!inList) { htmlOutput += "<ul>"; inList = true; }
                htmlOutput += `<li>${line.substring(2)}</li>`;
            } else if (line.match(/^\d+\.\s/)) {
                if (inList) { htmlOutput += "</ul>"; inList = false; }
                htmlOutput += `<p class="font-mono">${line}</p>`;
            } else if (line.trim() === "") {
                if (inList) { htmlOutput += "</ul>"; inList = false; }
                htmlOutput += "<br>";
            } else {
                if (inList) { htmlOutput += "</ul>"; inList = false; }
                htmlOutput += `<p>${line}</p>`;
            }
        }
        if (inList) htmlOutput += "</ul>";
        return htmlOutput;
    }

    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // --- View Controller Interactions ---
    function switchActiveWorkspaceView(viewTarget) {
        chatView.classList.remove("active");
        settingsView.classList.remove("active");
        
        if (viewTarget === "chat") chatView.classList.add("active");
        if (viewTarget === "settings") settingsView.classList.add("active");
        
        // Soft close mobile side overlays on select actions
        appSidebar.classList.remove("mobile-open");
    }

    settingsTrigger.addEventListener("click", () => switchActiveWorkspaceView("settings"));
    closeSettings.addEventListener("click", () => switchActiveWorkspaceView("chat"));
    mobileSettingsToggle.addEventListener("click", () => switchActiveWorkspaceView("settings"));

    // Responsive Handlers
    mobileSidebarToggle.addEventListener("click", () => {
        appSidebar.classList.toggle("mobile-open");
    });

    // --- Dynamic Chat Log Handlers ---
    function appendMessageNode(sender, textRaw) {
        const messageNode = document.createElement("div");
        messageNode.classList.add("message", sender === "user" ? "user-msg" : "system-msg");
        
        const avatarIcon = sender === "user" ? "fa-user" : "fa-robot";
        const bodyContent = sender === "user" ? `<p>${escapeHTML(textRaw)}</p>` : parseAMIRMAStyleText(textRaw);

        messageNode.innerHTML = `
            <div class="message-wrapper">
                <div class="message-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
                <div class="message-body">${bodyContent}</div>
            </div>
        `;
        
        chatMessagesBox.appendChild(messageNode);
        chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
    }

    function instantiateNewLogSession(initialTitle = "Strategic Run Logs") {
        currentSessionId = Date.now();
        const shortTitle = initialTitle.length > 22 ? initialTitle.substring(0, 22) + "..." : initialTitle;
        
        const logItem = document.createElement("div");
        logItem.classList.add("history-item", "active");
        logItem.setAttribute("data-session-id", currentSessionId);
        logItem.innerHTML = `<i class="fa-solid fa-terminal"></i> <span>${shortTitle}</span>`;
        
        // Wipe old active metrics
        document.querySelectorAll(".history-item").forEach(el => el.classList.remove("active"));
        chatHistoryContainer.prepend(logItem);
        
        conversationHistory.push({
            id: currentSessionId,
            title: initialTitle,
            messages: []
        });

        logItem.addEventListener("click", () => {
            document.querySelectorAll(".history-item").forEach(el => el.classList.remove("active"));
            logItem.classList.add("active");
            switchActiveWorkspaceView("chat");
        });
    }

    // --- Form Textarea Resizing Controls ---
    chatInputField.addEventListener("input", () => {
        chatInputField.style.height = "auto";
        chatInputField.style.height = chatInputField.scrollHeight + "px";
        sendCommandBtn.disabled = chatInputField.value.trim() === "";
    });

    // --- Trigger Message Generation Pipelines ---
    function processUserCommand() {
        const query = chatInputField.value.trim();
        if (!query) return;

        // Start session if currently blank canvas
        if (!currentSessionId || document.querySelectorAll(".history-item").length === 0) {
            instantiateNewLogSession(query);
        }

        appendMessageNode("user", query);
        chatInputField.value = "";
        chatInputField.style.height = "auto";
        sendCommandBtn.disabled = true;

        // Simulated Streaming Response Loop
        setTimeout(() => {
            const randomPick = amirmaMockResponses[Math.floor(Math.random() * amirmaMockResponses.length)];
            appendMessageNode("system", randomPick);
        }, 750);
    }

    sendCommandBtn.addEventListener("click", processUserCommand);
    chatInputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
            e.preventDefault();
            processUserCommand();
        }
    });

    newChatBtn.addEventListener("click", () => {
        chatMessagesBox.innerHTML = `
            <div class="message system-msg">
                <div class="message-wrapper">
                    <div class="message-avatar"><i class="fa-solid fa-shield-halved"></i></div>
                    <div class="message-body">
                        <p class="glow-text font-mono">AMIRMA operational framework reloaded. Provide objective execution request parameters.</p>
                    </div>
                </div>
            </div>
        `;
        instantiateNewLogSession("New Workspace Run");
        switchActiveWorkspaceView("chat");
    });
});

// --- Clipboard Copy Engine Function ---
window.copyCodeSnippet = function(buttonElement) {
    const preContainer = buttonElement.closest(".code-block-container").querySelector("pre code");
    navigator.clipboard.writeText(preContainer.innerText).then(() => {
        const innerIconHtml = buttonElement.innerHTML;
        buttonElement.innerHTML = `<i class="fa-solid fa-check" style="color: #10b981;"></i> Copied!`;
        setTimeout(() => {
            buttonElement.innerHTML = innerIconHtml;
        }, 2000);
    }).catch(err => {
        console.error("Failed structural context copy action: ", err);
    });
};
