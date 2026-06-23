// System Configurations & Fallback Identity Engine
const CONFIG = {
    geminiApiKey: localStorage.getItem('AMIRMA_GEMINI_KEY') || '',
    ownerName: "Sir",
    defaultGreeting: "Good morning Sir. Executive systems are online. Daily objectives have been analyzed and recommendations are ready."
};

// Architecture Module Pattern
const AMIRMA = {
    init() {
        this.runBootSequence();
        this.initParticleEngine();
        this.initDateTimeTicker();
        this.initWindowEngine();
        this.initVoiceEngine();
        this.bindGlobalEvents();
    },

    runBootSequence() {
        const terminal = document.getElementById('boot-terminal');
        const fill = document.getElementById('progress-fill');
        const logs = [
            "Initializing Core Systems...",
            "Loading Modular Architecture Layer...",
            "Connecting to AI Workforce Models...",
            "Security Firewall Verification: SECURE",
            "Allocating LocalStorage Space...",
            "Loading HUD Layout Templates...",
            "Voice Synthesis Systems Activated.",
            "AMIRMA Complete AI Engine ready."
        ];

        let index = 0;
        let progress = 0;

        const interval = setInterval(() => {
            if (index < logs.length) {
                const line = document.createElement('p');
                line.textContent = `> ${logs[index]}`;
                terminal.appendChild(line);
                terminal.scrollTop = terminal.scrollHeight;
                index++;
            }
            progress += 12.5;
            fill.style.width = `${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    document.getElementById('boot-screen').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('boot-screen').classList.add('hidden');
                        document.getElementById('desktop-env').classList.remove('hidden');
                        this.speak(CONFIG.defaultGreeting);
                    }, 1000);
                }, 4000);
            }
        }, 350);
    },

    initParticleEngine() {
        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 238, 255, 0.3)';
                ctx.fill();
            }
        }

        for (let i = 0; i < 60; i++) particles.push(new Particle());

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    },

    initDateTimeTicker() {
        setInterval(() => {
            const now = new Date();
            document.getElementById('sys-time').textContent = now.toTimeString().split(' ')[0];
            document.getElementById('sys-date').textContent = now.toLocaleDateString();
        }, 1000);
    },

    initWindowEngine() {
        this.windowsContainer = document.getElementById('window-container');
        this.trayContainer = document.getElementById('taskbar-apps');
        this.zIndexCounter = 100;
        this.activeWindows = {};
    },

    createWindow(id, title, contentHTML) {
        if (this.activeWindows[id]) {
            this.focusWindow(id);
            return;
        }

        this.zIndexCounter++;
        const win = document.createElement('div');
        win.id = `win-${id}`;
        win.className = 'win-frame';
        win.style.top = `${80 + (this.zIndexCounter % 10) * 20}px`;
        win.style.left = `${150 + (this.zIndexCounter % 10) * 20}px`;
        win.style.zIndex = this.zIndexCounter;

        win.innerHTML = `
            <div class="win-header" id="win-hd-${id}">
                <span class="win-title">${title.toUpperCase()}</span>
                <div class="win-controls">
                    <button class="win-btn win-min" onclick="AMIRMA.minimizeWindow('${id}')"></button>
                    <button class="win-btn win-max" onclick="AMIRMA.maximizeWindow('${id}')"></button>
                    <button class="win-btn win-close" onclick="AMIRMA.closeWindow('${id}')"></button>
                </div>
            </div>
            <div class="win-body">${contentHTML}</div>
        `;

        this.windowsContainer.appendChild(win);
        this.activeWindows[id] = win;
        this.makeDraggable(win, document.getElementById(`win-hd-${id}`));
        this.addToTray(id, title);
        
        win.addEventListener('mousedown', () => this.focusWindow(id));
    },

    makeDraggable(elmnt, header) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    },

    focusWindow(id) {
        if (this.activeWindows[id]) {
            this.zIndexCounter++;
            this.activeWindows[id].style.zIndex = this.zIndexCounter;
            this.activeWindows[id].classList.remove('hidden');
        }
    },

    closeWindow(id) {
        if (this.activeWindows[id]) {
            this.windowsContainer.removeChild(this.activeWindows[id]);
            delete this.activeWindows[id];
            this.removeFromTray(id);
        }
    },

    minimizeWindow(id) {
        if (this.activeWindows[id]) {
            this.activeWindows[id].classList.add('hidden');
        }
    },

    maximizeWindow(id) {
        const win = this.activeWindows[id];
        if (win) {
            if (win.style.width === '100%') {
                win.style.width = '480px';
                win.style.height = '360px';
                win.style.top = '100px';
                win.style.left = '150px';
            } else {
                win.style.width = '100%';
                win.style.height = 'calc(100% - 77px)';
                win.style.top = '32px';
                win.style.left = '0px';
            }
        }
    },

    addToTray(id, title) {
        const item = document.createElement('div');
        item.id = `tray-${id}`;
        item.className = 'tray-item';
        item.textContent = title;
        item.onclick = () => {
            const win = this.activeWindows[id];
            if (win.classList.contains('hidden')) {
                this.focusWindow(id);
            } else {
                this.minimizeWindow(id);
            }
        };
        this.trayContainer.appendChild(item);
    },

    removeFromTray(id) {
        const item = document.getElementById(`tray-${id}`);
        if (item) this.trayContainer.removeChild(item);
    },

    bindGlobalEvents() {
        const startBtn = document.getElementById('start-btn');
        const startMenu = document.getElementById('start-menu');
        
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            startMenu.classList.add('hidden');
        });

        document.getElementById('ai-core-trigger').addEventListener('click', () => {
            openApp('chat-center');
        });

        // Initialize System Simulated Metrics Loop
        setInterval(() => {
            const cpuFill = document.getElementById('cpu-fill');
            const ramFill = document.getElementById('ram-fill');
            if (cpuFill) cpuFill.style.width = `${Math.floor(Math.random() * 30) + 15}%`;
            if (ramFill) ramFill.style.width = `${Math.floor(Math.random() * 10) + 45}%`;
        }, 2000);
    },

    initVoiceEngine() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';

        const voiceBtn = document.getElementById('voice-toggle-btn');
        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('active')) {
                this.recognition.stop();
            } else {
                voiceBtn.classList.add('active');
                this.recognition.start();
            }
        });

        this.recognition.onend = () => voiceBtn.classList.remove('active');
        this.recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.executeVoiceCommand(command);
        };
    },

    executeVoiceCommand(cmd) {
        if (cmd.includes('open youtube')) window.open('https://youtube.com');
        else if (cmd.includes('open google')) window.open('https://google.com');
        else if (cmd.includes('open notes')) openApp('mission-control');
        else if (cmd.includes('status')) openApp('sys-monitor');
        else {
            openApp('chat-center');
            const input = document.getElementById('chat-input-field');
            if (input) {
                input.value = cmd;
                this.sendChatMessage();
            }
        }
    },

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 0.95;
            window.speechSynthesis.speak(utterance);
        }
    },

    async queryGemini(prompt) {
        if (!CONFIG.geminiApiKey) {
            return "[SYSTEM ALERT] Gemini API key missing. Go to Settings panel inside Start Menu to configure and lock your secure key workspace.";
        }
        try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.geminiApiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await json = await resp.json();
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            return `[BRIDGE CONNECTION ERROR] Failed to connect to AI Layer. Details: ${e.message}`;
        }
    },

    async sendChatMessage() {
        const input = document.getElementById('chat-input-field');
        const logs = document.getElementById('chat-logs-area');
        const query = input.value.trim();
        if (!query) return;

        input.value = '';
        logs.innerHTML += `<div class="msg msg-user"><strong>${CONFIG.ownerName}:</strong> ${query}</div>`;
        logs.scrollTop = logs.scrollHeight;

        const systemWrapperPrompt = `You are AMIRMA Ultimate Edition, a professional, highly intelligent, strategic, and calm AI Assistant + OS Operating System Workspace Company acting for one master owner. Current Year: 2026. Keep answers sharp, analytical, and highly structured. User Question: ${query}`;
        
        logs.innerHTML += `<div class="msg msg-ai" id="loading-indicator"><strong>AMIRMA:</strong> Processing matrix...</div>`;
        
        const reply = await this.queryGemini(systemWrapperPrompt);
        const indicator = document.getElementById('loading-indicator');
        if (indicator) indicator.remove();

        logs.innerHTML += `<div class="msg msg-ai"><strong>AMIRMA:</strong> ${reply}</div>`;
        logs.scrollTop = logs.scrollHeight;
    },

    saveKey() {
        const val = document.getElementById('api-key-input').value.trim();
        localStorage.setItem('AMIRMA_GEMINI_KEY', val);
        CONFIG.geminiApiKey = val;
        alert("Secure credential buffer saved successfully.");
    }
};

function openApp(appId) {
    if (appId === 'mission-control') {
        AMIRMA.createWindow('mission-control', 'Executive Mission Control', `
            <div style="border-left: 2px solid var(--neon-cyan); padding-left:10px; margin-bottom:15px;">
                <h4 style="color:var(--neon-cyan)">ACTIVE OBJECTIVES</h4>
                <p style="font-size:0.8rem; color:var(--text-muted);">• Scale personal productivity parameters up by 40%</p>
                <p style="font-size:0.8rem; color:var(--text-muted);">• Structure future cloud-ready modular database models</p>
            </div>
            <div style="border-left: 2px solid var(--neon-blue); padding-left:10px;">
                <h4 style="color:var(--neon-blue)">WORKFORCE STATUS</h4>
                <p style="font-size:0.8rem;">Research Employee: <span style="color:var(--neon-cyan)">STANDBY</span></p>
                <p style="font-size:0.8rem;">Strategy Employee: <span style="color:var(--neon-cyan)">MONITORING</span></p>
            </div>
        `);
    } else if (appId === 'chat-center') {
        AMIRMA.createWindow('chat-center', 'AI Chat Center', `
            <div class="chat-container">
                <div class="chat-logs" id="chat-logs-area">
                    <div class="msg msg-ai"><strong>AMIRMA:</strong> Systems online, ready for core processing queries.</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input-field" class="chat-input" placeholder="Transmit direct execution parameters..." onkeydown="if(event.key === 'Enter') AMIRMA.sendChatMessage()">
                    <button class="chat-send-btn" onclick="AMIRMA.sendChatMessage()">SEND</button>
                </div>
            </div>
        `);
    } else if (appId === 'sys-monitor') {
        AMIRMA.createWindow('sys-monitor', 'System Monitor', `
            <div class="stat-row">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem;"><span>CORE QUANTUM CPU</span><span>SIMULATED</span></div>
                <div class="stat-bar"><div class="stat-fill" id="cpu-fill" style="width: 24%"></div></div>
            </div>
            <div class="stat-row">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem;"><span>ALLOCATED NEURAL RAM</span><span>SIMULATED</span></div>
                <div class="stat-bar"><div class="stat-fill" id="ram-fill" style="width: 52%"></div></div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:15px;">INITIAL MODE: Single Owner Node via LocalStorage Storage Grid.</div>
        `);
    } else if (appId === 'employee-center') {
        AMIRMA.createWindow('employee-center', 'AI Workforce Matrix', `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size:0.8rem;">
                <div style="background:rgba(255,255,255,0.03); padding:8px; border:1px solid var(--glass-border);">⚙️ Research Node</div>
                <div style="background:rgba(255,255,255,0.03); padding:8px; border:1px solid var(--glass-border);">🎨 Content Node</div>
                <div style="background:rgba(255,255,255,0.03); padding:8px; border:1px solid var(--glass-border);">📊 Strategy Node</div>
                <div style="background:rgba(255,255,255,0.03); padding:8px; border:1px solid var(--glass-border);">💼 Productivity Node</div>
            </div>
        `);
    } else if (appId === 'weather-hub') {
        AMIRMA.createWindow('weather-hub', 'Atmospheric Weather', `
            <div style="text-align:center; padding:10px;">
                <h3 style="color:var(--neon-cyan)">22°C</h3>
                <p style="font-size:0.8rem; color:var(--text-muted)">Atmosphere Condition: Nominal Clear Skies</p>
            </div>
        `);
    } else if (appId === 'settings-panel') {
        AMIRMA.createWindow('settings-panel', 'Identity Workspace Settings', `
            <div style="font-size:0.85rem;">
                <label style="display:block; margin-bottom:5px; color:var(--neon-cyan);">GOOGLE GEMINI API KEY</label>
                <input type="password" id="api-key-input" class="chat-input" style="width:100%; margin-bottom:10px;" value="${localStorage.getItem('AMIRMA_GEMINI_KEY') || ''}" placeholder="AIzaSy...">
                <button class="start-menu-btn" onclick="AMIRMA.saveKey()">COMMIT TO BUFFER</button>
            </div>
        `);
    }
}

// OS Bootstrap Activation
window.addEventListener('DOMContentLoaded', () => AMIRMA.init());
          
