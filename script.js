document.addEventListener("DOMContentLoaded", () => {
    
    // --- System UI Elements Mapping ---
    const chatInputField = document.getElementById("chat-input-field");
    const sendCommandBtn = document.getElementById("send-command-btn");
    const chatMessagesBox = document.getElementById("chat-messages-box");
    const newChatBtn = document.getElementById("new-chat-btn");
    const chatHistoryContainer = document.getElementById("chat-history-container");
    const systemModeSelect = document.getElementById("system-mode-select");
    
    // Setup View Core Selectors
    const chatView = document.getElementById("chat-view");
    const settingsView = document.getElementById("settings-view");
    const settingsTrigger = document.getElementById("settings-trigger");
    const closeSettings = document.getElementById("close-settings");
    const systemPersonaTextarea = document.getElementById("system-persona");

    // File Payload Trackers
    const fileUploadTrigger = document.getElementById("file-upload-trigger");
    const hiddenFileInput = document.getElementById("hidden-file-input");
    const filePreviewStrip = document.getElementById("file-preview-strip");

    // Tracking Panel Mapping Selectors
    const newGoalInput = document.getElementById("new-goal-input");
    const addGoalBtn = document.getElementById("add-goal-btn");
    const goalsListContainer = document.getElementById("goals-list-container");
    const newProjectInput = document.getElementById("new-project-input");
    const addProjectBtn = document.getElementById("add-project-btn");
    const projectsMatrixContainer = document.getElementById("projects-matrix-container");

    // Interactive Action Triggers
    const apiKeyInput = document.getElementById("api-key-input");
    const saveApiKeyBtn = document.getElementById("save-api-key-btn");
    const exportHistoryBtn = document.getElementById("export-history-btn");
    const clearMemoryBtn = document.getElementById("clear-memory-btn");

    // Responsive Handlers
    const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
    const mobileTrackerToggle = document.getElementById("mobile-tracker-toggle");
    const appSidebar = document.getElementById("app-sidebar");
    const appMetricsPanel = document.getElementById("app-metrics-panel");

    // --- State Vectors Configuration ---
    let appState = {
        apiKey: localStorage.getItem("amirma_core_token") || "",
        activeMode: "GENERAL",
        currentSessionId: null,
        sessions: JSON.parse(localStorage.getItem("amirma_sessions")) || [],
        goals: JSON.parse(localStorage.getItem("amirma_goals")) || [],
        projects: JSON.parse(localStorage.getItem("amirma_projects")) || [],
        attachedFiles: []
    };

    // --- Operational Base Matrices ---
    const SYSTEM_PERSONA_MODES = {
        GENERAL: "You are AMIRMA (Advanced Multidisciplinary Intelligent Resource Management Assistant), my personal AI Operating System. Optimize for real-world results. Format using structural GOAL, ANALYSIS, PLAN, ACTION STEPS, TOOLS, NEXT STEP layouts.",
        CONTENT: "You are AMIRMA operating in CONTENT CREATION MODE. Prioritize audience retention, virality, CTR, and engagement architectures. Build scripts, hooks, calendars, and optimization directives directly.",
        AI_CREATOR: "You are AMIRMA operating in AI CREATOR MODE. Focus on workflow automation frameworks, advanced prompting, code integration, and stitching free tier AI models together seamlessly.",
        LEARNING: "You are AMIRMA operating in LEARNING MODE. Teach from absolute fundamentals up to elite engineering heights. Never assume prior knowledge. Use vivid context, analogies, and code structures.",
        RESEARCH: "You are AMIRMA operating in RESEARCH deep analyst mode. Gather verifiable concepts, map out technical trade-offs, weigh short-term vs long-term scalability, performance profiles, and ease of deployment."
    };

    // --- Initialization Sequences ---
    function initializeSystemCore() {
        apiKeyInput.value = appState.apiKey;
        updateSystemModeView();
        renderChatHistory();
        renderGoals();
        renderProjects();
        
        if (appState.sessions.length > 0) {
            loadChatSession(appState.sessions[0].id);
        } else {
            triggerNewSessionClear();
        }
    }

    function saveStateToLocalStorage() {
        localStorage.setItem("amirma_sessions", JSON.stringify(appState.sessions));
        localStorage.setItem("amirma_goals", JSON.stringify(appState.goals));
        localStorage.setItem("amirma_projects", JSON.stringify(appState.projects));
    }

    function updateSystemModeView() {
        appState.activeMode = systemModeSelect.value;
        systemPersonaTextarea.value = SYSTEM_PERSONA_MODES[appState.activeMode];
    }

    systemModeSelect.addEventListener("change", updateSystemModeView);

    // --- Markdown Token Engine Parser ---
    function parseMarkdown(text) {
        let lines = text.split("\n");
        let htmlOutput = "";
        let inList = false;
        let inCodeBlock = false;
        let codeContent = [];

        for (let line of lines) {
            if (line.trim().startsWith("```")) {
                if (inCodeBlock) {
                    inCodeBlock = false;
                    htmlOutput += `<div class="code-block-container">
                        <div class="code-header"><span>CODE PROFILE</span><button class="copy-btn" onclick="copyCodeSnippet(this)"><i class="fa-solid fa-copy"></i> Copy</button></div>
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
            if (line.startsWith("## ")) {
                if (inList) { htmlOutput += "</ul>"; inList = false; }
                htmlOutput += `<h2>${line.replace("## ", "")}</h2>`;
            } else if (line.startsWith("* ") || line.startsWith("- ")) {
                if (!inList) { htmlOutput += "<ul>"; inList = true; }
                htmlOutput += `<li>${line.substring(2)}</li>`;
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

    // --- Gemini Network API Layer Integration ---
    async function postQueryToGeminiAPI(promptContent, chatHistoryArray) {
        if (!appState.apiKey) {
            return "## ERROR\nGoogle Gemini Token missing. Please open the system settings panel and input an API Key token.";
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${appState.apiKey}`;
        
        // Map history to the strict API format expected by Gemini
        let APIContents = [];
        chatHistoryArray.forEach(msg => {
            APIContents.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.text }]
            });
        });

        // Append active system rules to direct prompt tracking
        const structuralPromptPrefix = `${SYSTEM_PERSONA_MODES[appState.activeMode]}\n\nUser Query Context:\n${promptContent}`;
        APIContents.push({
            role: "user",
            parts: [{ text: structuralPromptPrefix }]
        });

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: APIContents })
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "## SYSTEM ERROR\nUnexpected validation callback signature returned by model endpoint registry.";
            }
        } catch (err) {
            return `## EXCEPTION TRACE\nNetwork pipeline transaction fault: ${err.message}`;
        }
    }

    // --- Message View Rendering Pipeline ---
    function appendMessageUI(role, content) {
        const itemNode = document.createElement("div");
        itemNode.classList.add("message", role === "user" ? "user-msg" : "system-msg");
        
        const avatarIcon = role === "user" ? "fa-user-astronaut" : "fa-shield-halved";
        const generatedBody = role === "user" ? `<p>${escapeHTML(content)}</p>` : parseMarkdown(content);

        itemNode.innerHTML = `
            <div class="message-wrapper">
                <div class="message-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
                <div class="message-body">${generatedBody}</div>
            </div>
        `;
        chatMessagesBox.appendChild(itemNode);
        chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
    }

    // --- Session Control Actions ---
    function triggerNewSessionClear() {
        appState.currentSessionId = Date.now();
        chatMessagesBox.innerHTML = `
            <div class="message system-msg">
                <div class="message-wrapper">
                    <div class="message-avatar"><i class="fa-solid fa-shield-halved"></i></div>
                    <div class="message-body">
                        <p class="glow-text font-mono">AMIRMA OS v2.0 Online. Standby for initialization parameter commands...</p>
                    </div>
                </div>
            </div>
        `;
        document.querySelectorAll(".history-item").forEach(el => el.classList.remove("active"));
    }

    function loadChatSession(sessionId) {
        appState.currentSessionId = sessionId;
        chatMessagesBox.innerHTML = "";
        
        const session = appState.sessions.find(s => s.id === sessionId);
        if (!session) return;

        session.messages.forEach(msg => appendMessageUI(msg.role, msg.text));
        
        document.querySelectorAll(".history-item").forEach(el => {
            el.classList.toggle("active", parseInt(el.getAttribute("data-session-id")) === sessionId);
        });
    }

    function renderChatHistory() {
        chatHistoryContainer.innerHTML = "";
        appState.sessions.forEach(session => {
            const row = document.createElement("div");
            row.classList.add("history-item");
            if (session.id === appState.currentSessionId) row.classList.add("active");
            row.setAttribute("data-session-id", session.id);
            
            row.innerHTML = `
                <span class="chat-title-text"><i class="fa-solid fa-terminal"></i> ${escapeHTML(session.title)}</span>
                <button class="delete-chat-btn"><i class="fa-solid fa-xmark"></i></button>
            `;

            row.querySelector(".chat-title-text").addEventListener("click", () => loadChatSession(session.id));
            row.querySelector(".delete-chat-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                appState.sessions = appState.sessions.filter(s => s.id !== session.id);
                saveStateToLocalStorage();
                renderChatHistory();
                triggerNewSessionClear();
            });

            chatHistoryContainer.appendChild(row);
        });
    }

    // --- Data Transmission Pipeline Engine ---
    async function handleCommandSubmission() {
        let textInput = chatInputField.value.trim();
        if (!textInput && appState.attachedFiles.length === 0) return;

        let activeSession = appState.sessions.find(s => s.id === appState.currentSessionId);
        if (!activeSession) {
            activeSession = { id: appState.currentSessionId, title: textInput || "Injected Data Stream", messages: [] };
            appState.sessions.unshift(activeSession);
        }

        // Combine text input with file payloads if any exist
        if (appState.attachedFiles.length > 0) {
            let filePayloadContext = "\n\n[Injected Document Data Payload Context Blocks]:";
            appState.attachedFiles.forEach(f => {
                filePayloadContext += `\n* File: ${f.name} Content:\n"""\n${f.content}\n"""`;
            });
            textInput += filePayloadContext;
        }

        appendMessageUI("user", textInput);
        activeSession.messages.push({ role: "user", text: textInput });
        
        // Clear inputs immediately
        chatInputField.value = "";
        chatInputField.style.height = "auto";
        clearPayloadStrip();

        // Query API with historical context
        const responseData = await postQueryToGeminiAPI(textInput, activeSession.messages.slice(0, -1));
        
        appendMessageUI("system", responseData);
        activeSession.messages.push({ role: "system", text: responseData });
        
        saveStateToLocalStorage();
        renderChatHistory();
    }

    sendCommandBtn.addEventListener("click", handleCommandSubmission);
    chatInputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
            e.preventDefault();
            handleCommandSubmission();
        }
    });

    chatInputField.addEventListener("input", () => {
        chatInputField.style.height = "auto";
        chatInputField.style.height = chatInputField.scrollHeight + "px";
        sendCommandBtn.disabled = chatInputField.value.trim() === "" && appState.attachedFiles.length === 0;
    });

    newChatBtn.addEventListener("click", () => {
        triggerNewSessionClear();
        switchWorkspacePanel("chat");
    });

    // --- File System Operations Simulation ---
    fileUploadTrigger.addEventListener("click", () => hiddenFileInput.click());
    hiddenFileInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(evt) {
                appState.attachedFiles.push({
                    name: file.name,
                    content: evt.target.result
                });
                renderFilePreviewStrip();
            };
            // Read as text for code, csv, markdown parsing injections
            reader.readAsText(file);
        });
    });

    function renderFilePreviewStrip() {
        if (appState.attachedFiles.length === 0) {
            filePreviewStrip.classList.add("hidden");
            return;
        }
        filePreviewStrip.classList.remove("hidden");
        filePreviewStrip.innerHTML = "";
        appState.attachedFiles.forEach((file, index) => {
            const badge = document.createElement("div");
            badge.classList.add("file-badge");
            badge.innerHTML = `<i class="fa-solid fa-file-code"></i> <span>${file.name}</span> <i class="fa-solid fa-circle-xmark remove-file" data-index="${index}" style="cursor:pointer;"></i>`;
            filePreviewStrip.appendChild(badge);
        });

        document.querySelectorAll(".remove-file").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.target.getAttribute("data-index"));
                appState.attachedFiles.splice(idx, 1);
                renderFilePreviewStrip();
            });
        });
        sendCommandBtn.disabled = false;
    }

    function clearPayloadStrip() {
        appState.attachedFiles = [];
        filePreviewStrip.innerHTML = "";
        filePreviewStrip.classList.add("hidden");
    }

    // --- Goals Tracking Realtime Logic ---
    function renderGoals() {
        goalsListContainer.innerHTML = "";
        appState.goals.forEach((goal, idx) => {
            const li = document.createElement("li");
            if (goal.completed) li.classList.add("completed");
            li.innerHTML = `
                <span>${escapeHTML(goal.text)}</span>
                <input type="checkbox" ${goal.completed ? "checked" : ""} data-index="${idx}">
            `;
            li.querySelector("input").addEventListener("change", (e) => {
                const index = parseInt(e.target.getAttribute("data-index"));
                appState.goals[index].completed = e.target.checked;
                saveStateToLocalStorage();
                renderGoals();
            });
            goalsListContainer.appendChild(li);
        });
    }

    addGoalBtn.addEventListener("click", () => {
        const val = newGoalInput.value.trim();
        if (!val) return;
        appState.goals.push({ text: val, completed: false });
        newGoalInput.value = "";
        saveStateToLocalStorage();
        renderGoals();
    });

    // --- Project Matrix Tracking Module ---
    function renderProjects() {
        projectsMatrixContainer.innerHTML = "";
        appState.projects.forEach((proj, idx) => {
            const card = document.createElement("div");
            card.classList.add("project-card");
            card.innerHTML = `
                <h4><span>${escapeHTML(proj.name)}</span> <span class="cyan-glow">${proj.progress}%</span></h4>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${proj.progress}%"></div></div>
                <div class="project-actions">
                    <button class="prog-down-btn" data-index="${idx}"><i class="fa-solid fa-minus"></i> 10%</button>
                    <button class="prog-up-btn" data-index="${idx}"><i class="fa-solid fa-plus"></i> 10%</button>
                </div>
            `;
            
            card.querySelector(".prog-up-btn").addEventListener("click", () => updateProjectProgress(idx, 10));
            card.querySelector(".prog-down-btn").addEventListener("click", () => updateProjectProgress(idx, -10));
            
            projectsMatrixContainer.appendChild(card);
        });
    }

    function updateProjectProgress(idx, delta) {
        let current = appState.projects[idx].progress + delta;
        if (current > 100) current = 100;
        if (current < 0) current = 0;
        appState.projects[idx].progress = current;
        saveStateToLocalStorage();
        renderProjects();
    }

    addProjectBtn.addEventListener("click", () => {
        const name = newProjectInput.value.trim();
        if (!name) return;
        appState.projects.push({ name: name, progress: 0 });
        newProjectInput.value = "";
        saveStateToLocalStorage();
        renderProjects();
    });

    // --- System Control Parameters Panel Toggle ---
    function switchWorkspacePanel(target) {
        chatView.classList.remove("active");
        settingsView.classList.remove("active");
        if (target === "chat") chatView.classList.add("active");
        if (target === "settings") settingsView.classList.add("active");
    }

    settingsTrigger.addEventListener("click", () => switchWorkspacePanel("settings"));
    closeSettings.addEventListener("click", () => switchWorkspacePanel("chat"));

    saveApiKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        localStorage.setItem("amirma_core_token", key);
        appState.apiKey = key;
        alert("System Parameter Core Authentication Secret Injected Safely.");
        switchWorkspacePanel("chat");
    });

    exportHistoryBtn.addEventListener("click", () => {
        const dataBlob = new Blob([JSON.stringify(appState.sessions, null, 2)], { type: "application/json" });
        const temporaryLink = document.createElement("a");
        temporaryLink.href = URL.createObjectURL(dataBlob);
        temporaryLink.download = `AMIRMA_OS_DATA_MATRIX_${Date.now()}.json`;
        temporaryLink.click();
    });

    clearMemoryBtn.addEventListener("click", () => {
        if (confirm("Confirm core operational system diagnostics memory clear? This completely flushes all localized session storage records.")) {
            localStorage.clear();
            appState.sessions = [];
            appState.goals = [];
            appState.projects = [];
            appState.apiKey = "";
            initializeSystemCore();
            location.reload();
        }
    });

    // Mobile View Interactivity Layers
    mobileSidebarToggle.addEventListener("click", () => appSidebar.classList.toggle("mobile-open"));
    mobileTrackerToggle.addEventListener("click", () => appMetricsPanel.classList.toggle("mobile-open"));

    // --- Boot Engine ---
    initializeSystemCore();
});

// --- Clipboard Helper Link Injections ---
window.copyCodeSnippet = function(btn) {
    const code = btn.closest(".code-block-container").querySelector("pre code").innerText;
    navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = `<i class="fa-solid fa-check" style="color:#10b981;"></i> Copied`;
        setTimeout(() => { btn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`; }, 2000);
    });
};
