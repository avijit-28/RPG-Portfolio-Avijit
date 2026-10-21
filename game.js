// ========================================================
// AVIJIT AI LABS — ROOM-BY-ROOM 3D DIORAMA RPG ENGINE
// Sliding Glass Entrance, Isolated 3D Room Views, 
// Dedicated NPCs, Real Textures & 60FPS Physics
// ========================================================

class OfficeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Canvas dimensions & scale
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera = { x: 0, y: 0, scale: 1 };
    
    // Current Active Room State Machine
    // 'exterior_entrance', 'reception', 'ai_lab', 'dev_bay', 'boardroom', 'lounge', 'executive_office'
    this.currentRoom = 'exterior_entrance';
    this.transitioning = false;
    this.transitionAlpha = 0;
    this.transitionText = "";
    this.locked = false;
    this.tourActive = false;
    this.tourTimer = null;
    
    // Sliding Glass Entrance Door Animation State
    this.doorOpenAmount = 0; // 0 = closed, 1 = fully open
    this.doorSensorTriggered = false;
    
    // Player Character
    this.player = {
      x: 480,
      y: 560, // Starts on pavement in front of exterior entrance
      radius: 18,
      speed: 240,
      baseSpeed: 240,
      boostTimer: 0,
      vx: 0,
      vy: 0,
      facing: 'up',
      moving: false,
      walkCycle: 0,
      frameTimer: 0,
      targetX: null,
      targetY: null,
      pendingInteraction: null,
      hairColor: '#1c1917',
      jacketColor: '#0284c7',
      pantsColor: '#1e293b'
    };

    // Sunset Skyline elements (in Avijit's Office)
    this.skylineVehicles = [
      { x: 100, y: 130, speed: 65, color: '#f59e0b', size: 18 },
      { x: 500, y: 155, speed: -45, color: '#00f0ff', size: 15 },
      { x: 800, y: 120, speed: 80, color: '#ec4899', size: 22 }
    ];

    // FX & Visual state
    this.holoAngle = 0;
    this.ledTimer = 0;
    this.clickRipples = [];
    this.particles = [];
    this.floatingTexts = [];
    this.trails = [];
    
    // Web Audio Synthesizer
    this.audioEnabled = true;
    this.bgmPlaying = false;
    this.audioCtx = null;
    this.bgmTimer = null;
    
    // Controls State
    this.keys = {};
    this.touchJoystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
    
    // Registry of Rooms & Door Connections
    this.roomConfigs = {};
    this.interactiveObjects = [];
    this.nearbyObject = null;
    this.stats = {
      roomsVisited: new Set(),
      itemsInteracted: new Set(),
      easterEggsFound: new Set()
    };
    
    // Real-Time Multiplayer & Live Presence Engine
    this.myPlayerId = 'usr_' + Math.random().toString(36).substring(2, 9);
    this.remotePlayers = new Map();
    this.multiplayerLastBroadcast = 0;

    this.lastTime = performance.now();
    this.running = true;

    this.initRooms();
    this.setupEventListeners();
    this.initMultiplayer();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Auto-walk player towards the entrance doors to show off the opening animation
    this.triggerEntranceSequence();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // ----------------------------------------------------
  // AUDIO SYNTHESIZER
  // ----------------------------------------------------
  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSound(type = 'blip') {
    if (!this.audioEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      if (type === 'door') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.35);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'blip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'interact') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.06);
        osc.frequency.setValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'coffee') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(360, now + 0.3);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'achievement') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.08);
          g.gain.setValueAtTime(0.07, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.16);
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.start(now + i * 0.08);
          o.stop(now + i * 0.08 + 0.17);
        });
      } else if (type === 'step') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160 + Math.random() * 35, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch (e) {}
  }

  toggleBgm() {
    this.initAudio();
    this.bgmPlaying = !this.bgmPlaying;
    if (this.bgmPlaying) {
      this.startAmbientBgm();
    } else {
      if (this.bgmTimer) clearInterval(this.bgmTimer);
    }
    return this.bgmPlaying;
  }

  startAmbientBgm() {
    if (!this.audioCtx) return;
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G7
    ];
    let step = 0;
    const playChord = () => {
      if (!this.bgmPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const chord = chords[step % chords.length];
      chord.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.015, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + 2.9);
      });
      step++;
    };
    playChord();
    this.bgmTimer = setInterval(playChord, 3000);
  }

  // ----------------------------------------------------
  // ROOM DIRECTORY GETTER FOR FAST TRAVEL & UI
  // ----------------------------------------------------
  get rooms() {
    return [
      {
        id: "reception",
        name: "🏢 Reception Lobby & Welcome Lounge",
        shortName: "Reception",
        accent: "#00f0ff",
        description: "Front desk with AI Host EVA, visitor security check-in, and guest badge station."
      },
      {
        id: "ai_lab",
        name: "🔬 AI & Computer Vision Lab",
        shortName: "AI Lab",
        accent: "#38bdf8",
        description: "YOLOv3, FaceNet, Clinical AI, AirVerde, and Springer research paper archives."
      },
      {
        id: "dev_bay",
        name: "💻 Software Engineering Bay",
        shortName: "Dev Bay",
        accent: "#8b5cf6",
        description: "WorkFlow pipeline, Quant Trading Bot, Netflix RecSys, and Festiva platform."
      },
      {
        id: "boardroom",
        name: "🏆 Executive Boardroom & Hall of Fame",
        shortName: "Boardroom",
        accent: "#f59e0b",
        description: "The 9.41 CGPA Golden Trophy, JIS University rank records, and Oracle GenAI wall."
      },
      {
        id: "lounge",
        name: "☕ Code Café & Break Lounge",
        shortName: "Code Café",
        accent: "#10b981",
        description: "High-octane espresso speed booster and playable AI Bug Buster arcade cabinet."
      },
      {
        id: "executive_office",
        name: "💼 Avijit's Private Corner Office",
        shortName: "Avijit Office",
        accent: "#c084fc",
        description: "Panoramic sunset skyline, direct chat with Avijit, and official resume download."
      },
      {
        id: "exterior_entrance",
        name: "🌆 Building Exterior & Street Entrance",
        shortName: "Entrance",
        accent: "#00f0ff",
        description: "Sidewalk entrance with automatic motion-sensor sliding glass doors."
      }
    ];
  }

  // ----------------------------------------------------
  // ROOM DEFINITIONS & BOUNDARIES
  // ----------------------------------------------------
  initRooms() {
    // Room dimensions in local room coordinates (0, 0 to 960, 640)
    this.roomConfigs = {
      // 0. EXTERIOR STREET & SLIDING ENTRANCE
      exterior_entrance: {
        name: "🌆 Building Exterior & Entrance",
        shortName: "Entrance",
        accent: "#00f0ff",
        bounds: { minX: 80, maxX: 880, minY: 180, maxY: 600 },
        doors: [
          {
            targetRoom: "reception",
            label: "Enter Reception Lobby",
            x: 480, y: 220, w: 120, h: 40,
            spawnX: 480, spawnY: 470
          }
        ]
      },

      // 1. RECEPTION LOBBY (ONLY EVA & RECEPTION DESK)
      reception: {
        name: "🏢 Reception Lobby & Welcome Lounge",
        shortName: "Reception",
        accent: "#00f0ff",
        bounds: { minX: 100, maxX: 860, minY: 150, maxY: 560 },
        doors: [
          { targetRoom: "ai_lab", label: "Door: AI & Vision Lab", x: 120, y: 350, w: 40, h: 80, spawnX: 780, spawnY: 350 },
          { targetRoom: "dev_bay", label: "Door: Software Bay", x: 840, y: 350, w: 40, h: 80, spawnX: 180, spawnY: 350 },
          { targetRoom: "executive_office", label: "Door: Avijit's Office", x: 480, y: 160, w: 100, h: 40, spawnX: 480, spawnY: 470 },
          { targetRoom: "boardroom", label: "Door: Boardroom", x: 260, y: 160, w: 90, h: 40, spawnX: 480, spawnY: 470 },
          { targetRoom: "lounge", label: "Door: Code Café", x: 700, y: 160, w: 90, h: 40, spawnX: 480, spawnY: 470 },
          { targetRoom: "exterior_entrance", label: "Exit to Street", x: 480, y: 550, w: 120, h: 40, spawnX: 480, spawnY: 300 }
        ]
      },

      // 2. AI & VISION LAB
      ai_lab: {
        name: "🔬 AI & Computer Vision Lab",
        shortName: "AI Lab",
        accent: "#38bdf8",
        bounds: { minX: 100, maxX: 860, minY: 160, maxY: 560 },
        doors: [
          { targetRoom: "reception", label: "Back to Reception", x: 840, y: 350, w: 40, h: 80, spawnX: 160, spawnY: 350 },
          { targetRoom: "boardroom", label: "Door: Boardroom", x: 480, y: 165, w: 100, h: 40, spawnX: 160, spawnY: 350 }
        ]
      },

      // 3. SOFTWARE ENGINEERING BAY
      dev_bay: {
        name: "💻 Software Engineering Bay",
        shortName: "Dev Bay",
        accent: "#8b5cf6",
        bounds: { minX: 100, maxX: 860, minY: 160, maxY: 560 },
        doors: [
          { targetRoom: "reception", label: "Back to Reception", x: 120, y: 350, w: 40, h: 80, spawnX: 800, spawnY: 350 },
          { targetRoom: "lounge", label: "Door: Code Café", x: 480, y: 165, w: 100, h: 40, spawnX: 160, spawnY: 350 }
        ]
      },

      // 4. BOARDROOM & HALL OF FAME
      boardroom: {
        name: "🏆 Boardroom & Hall of Fame",
        shortName: "Boardroom",
        accent: "#f59e0b",
        bounds: { minX: 100, maxX: 860, minY: 160, maxY: 540 },
        doors: [
          { targetRoom: "reception", label: "Back to Reception", x: 480, y: 530, w: 100, h: 40, spawnX: 260, spawnY: 220 },
          { targetRoom: "ai_lab", label: "Door: AI Lab", x: 120, y: 350, w: 40, h: 80, spawnX: 480, spawnY: 220 }
        ]
      },

      // 5. BREAK ROOM & CODE CAFÉ
      lounge: {
        name: "☕ Code Café & Break Lounge",
        shortName: "Code Café",
        accent: "#10b981",
        bounds: { minX: 100, maxX: 860, minY: 160, maxY: 540 },
        doors: [
          { targetRoom: "reception", label: "Back to Reception", x: 480, y: 530, w: 100, h: 40, spawnX: 700, spawnY: 220 },
          { targetRoom: "dev_bay", label: "Door: Software Bay", x: 840, y: 350, w: 40, h: 80, spawnX: 480, spawnY: 220 }
        ]
      },

      // 6. AVIJIT'S CORNER OFFICE
      executive_office: {
        name: "💼 Avijit's Private Corner Office",
        shortName: "Avijit Office",
        accent: "#c084fc",
        bounds: { minX: 100, maxX: 860, minY: 180, maxY: 540 },
        doors: [
          { targetRoom: "reception", label: "Back to Reception", x: 480, y: 530, w: 100, h: 40, spawnX: 480, spawnY: 220 }
        ]
      }
    };

    this.refreshInteractiveObjectsForRoom();
  }

  // ----------------------------------------------------
  // OBJECTS PER SPECIFIC ACTIVE ROOM
  // ----------------------------------------------------
  refreshInteractiveObjectsForRoom() {
    this.interactiveObjects = [];

    if (this.currentRoom === 'exterior_entrance') {
      // Exterior sign / building info
      this.interactiveObjects.push({
        id: "building_directory",
        name: "Headquarters Directory Plaque",
        x: 320, y: 230, w: 50, h: 45,
        type: "board",
        label: "Read Headquarters Plaque",
        action: () => window.OFFICE_UI.openTerminalModal("AVIJIT AI LABS & HEADQUARTERS\n----------------------------------\nSector 01: Reception Lobby (Floor 1)\nSector 02: AI & Computer Vision Lab\nSector 03: Software Engineering Bay\nSector 04: Executive Boardroom & Hall of Fame\nSector 05: Code Café & Lounge\nSector 06: Avijit Pakhira's Corner Office\n\nWalk forward to open the automatic doors.")
      });

    } else if (this.currentRoom === 'reception') {
      // ONLY EVA receptionist and guest pass kiosk
      this.interactiveObjects.push(
        {
          id: "receptionist",
          name: "AI Receptionist 'EVA'",
          x: 480, y: 290, w: 65, h: 50,
          type: "npc",
          label: "Talk with EVA",
          action: () => window.OFFICE_UI.openReceptionDialogue()
        },
        {
          id: "visitor_kiosk",
          name: "Digital Guestbook & Visitor Pass",
          x: 300, y: 280, w: 50, h: 45,
          type: "terminal",
          label: "Inspect Visitor Pass",
          action: () => window.OFFICE_UI.openVisitorPassModal()
        },
        {
          id: "office_directory",
          name: "Sector Fast-Travel Directory",
          x: 660, y: 280, w: 50, h: 45,
          type: "board",
          label: "Open Fast Travel",
          action: () => window.OFFICE_UI.openQuickTravelModal()
        },
        {
          id: "reception_couch",
          name: "Teal Velvet Lounge Sofa",
          x: 320, y: 440, w: 90, h: 45,
          type: "furniture",
          label: "Sit & Relax",
          action: () => {
            this.addFloatingText(this.player.x, this.player.y - 30, "Lounge vibe: 100% cozy ✨", "#38bdf8");
            this.playSound('blip');
          }
        }
      );

    } else if (this.currentRoom === 'ai_lab') {
      // AI & Computer Vision Lab Hotspots
      this.interactiveObjects.push(
        {
          id: "holo_neural_core",
          name: "3D Neural Matrix Core",
          x: 480, y: 350, w: 75, h: 75,
          type: "holo_core",
          label: "Inspect Neural Core",
          action: () => {
            this.spawnSparkleParticles(480, 350, 30, '#00f0ff');
            this.playSound('achievement');
            window.OFFICE_UI.openTerminalModal("NEURAL CORE TELEMETRY:\n----------------------------------------\n[✓] Vedic Karatsuba Conv2D: 1.84x Speedup\n[✓] Custom YOLOv3 Darknet: 32 FPS on Edge\n[✓] FaceNet Embeddings: 99.2% Accuracy\n[✓] LSTM Soil Forecaster: 93.4% Accuracy (icSoftComp2024)\nStatus: All model weights synchronized.");
          }
        },
        {
          id: "server_rack_ai",
          name: "GPU Server Array",
          x: 180, y: 240, w: 70, h: 90,
          type: "server",
          label: "Inspect Server Clusters",
          action: () => window.OFFICE_UI.openTerminalModal("CLUSTER STATUS: 4x NVIDIA RTX GPU Array\nVRAM Allocation: 96 GB Total\nActive Worker Pools: 16 PyTorch workers active\nJob: Real-time biometric verification stream.")
        },
        {
          id: "research_vedic",
          name: "Springer Paper: Vedic Math CNN",
          x: 360, y: 220, w: 60, h: 50,
          type: "research",
          label: "Read Vedic Math Paper",
          action: () => window.OFFICE_UI.openResearchModal("vedic_math")
        },
        {
          id: "research_agri",
          name: "Springer Paper: Precision AgriTech",
          x: 600, y: 220, w: 60, h: 50,
          type: "research",
          label: "Read AgriTech Paper",
          action: () => window.OFFICE_UI.openResearchModal("precision_agri")
        },
        {
          id: "pod_yolo",
          name: "Workstation: YOLOv3 Tracking",
          x: 250, y: 440, w: 75, h: 50,
          type: "project",
          label: "Inspect YOLOv3 Project",
          action: () => window.OFFICE_UI.openProjectModal("object_detection")
        },
        {
          id: "pod_attendance",
          name: "Workstation: FaceNet Attendance",
          x: 410, y: 440, w: 75, h: 50,
          type: "project",
          label: "Inspect Attendance System",
          action: () => window.OFFICE_UI.openProjectModal("attendance")
        },
        {
          id: "pod_clinical_ai",
          name: "Workstation: Clinical AI",
          x: 570, y: 440, w: 75, h: 50,
          type: "project",
          label: "Inspect Clinical AI Portal",
          action: () => window.OFFICE_UI.openProjectModal("clinical_ai")
        },
        {
          id: "pod_airverde",
          name: "Workstation: AirVerde AQI",
          x: 730, y: 440, w: 75, h: 50,
          type: "project",
          label: "Inspect AirVerde Project",
          action: () => window.OFFICE_UI.openProjectModal("airverde")
        }
      );

    } else if (this.currentRoom === 'dev_bay') {
      // Dev Bay Coder Pods
      this.interactiveObjects.push(
        {
          id: "pod_workflow",
          name: "Workstation: WorkFlow Pipeline",
          x: 260, y: 260, w: 75, h: 50,
          type: "project",
          label: "Inspect WorkFlow Pipeline",
          action: () => window.OFFICE_UI.openProjectModal("workflow")
        },
        {
          id: "pod_trading_bot",
          name: "Workstation: Quant Trading Bot",
          x: 440, y: 260, w: 75, h: 50,
          type: "project",
          label: "Inspect Quant Trading Bot",
          action: () => window.OFFICE_UI.openProjectModal("trading_bot")
        },
        {
          id: "pod_netflix",
          name: "Workstation: Netflix ML RecSys",
          x: 620, y: 260, w: 75, h: 50,
          type: "project",
          label: "Inspect Netflix RecSys",
          action: () => window.OFFICE_UI.openProjectModal("netflix_ml")
        },
        {
          id: "pod_festiva",
          name: "Workstation: Festiva Platform",
          x: 350, y: 430, w: 75, h: 50,
          type: "project",
          label: "Inspect Festiva Events",
          action: () => window.OFFICE_UI.openProjectModal("festiva")
        },
        {
          id: "pod_jarvis",
          name: "Workstation: JarvisAI Voice Agent",
          x: 530, y: 430, w: 75, h: 50,
          type: "project",
          label: "Inspect JarvisAI Companion",
          action: () => window.OFFICE_UI.openProjectModal("jarvis_ai")
        },
        {
          id: "dev_whiteboard",
          name: "Architecture Kanban Board",
          x: 750, y: 430, w: 85, h: 55,
          type: "board",
          label: "Inspect Architecture Board",
          action: () => window.OFFICE_UI.openProjectsListModal()
        }
      );

    } else if (this.currentRoom === 'boardroom') {
      // Boardroom Trophy & Credentials
      this.interactiveObjects.push(
        {
          id: "trophy_case",
          name: "The 9.41 CGPA Golden Trophy",
          x: 480, y: 220, w: 70, h: 70,
          type: "trophy",
          label: "Examine 9.41 CGPA Trophy",
          action: () => {
            this.stats.easterEggsFound.add("trophy");
            this.spawnSparkleParticles(480, 220, 35, '#fbbf24');
            this.playSound('achievement');
            window.OFFICE_UI.openEducationModal();
          }
        },
        {
          id: "cert_wall",
          name: "Oracle GenAI & NPTEL Wall",
          x: 260, y: 220, w: 80, h: 50,
          type: "cert",
          label: "Inspect Verified Certifications",
          action: () => window.OFFICE_UI.openCertificationsModal()
        },
        {
          id: "board_table",
          name: "Executive Mahogany Table",
          x: 480, y: 360, w: 180, h: 80,
          type: "furniture",
          label: "Review Internship Records",
          action: () => window.OFFICE_UI.openExperienceModal()
        }
      );

    } else if (this.currentRoom === 'lounge') {
      // Café & Break Room
      this.interactiveObjects.push(
        {
          id: "coffee_machine",
          name: "La Marzocco Espresso Machine",
          x: 320, y: 240, w: 60, h: 50,
          type: "coffee",
          label: "Drink Espresso (+Speed Boost!)",
          action: () => this.drinkCoffee()
        },
        {
          id: "arcade_cabinet",
          name: "Arcade: AI Bug Buster 3000",
          x: 640, y: 240, w: 60, h: 70,
          type: "arcade",
          label: "Play Bug Buster Mini-Game",
          action: () => {
            this.stats.easterEggsFound.add("arcade");
            window.OFFICE_UI.openArcadeModal();
          }
        },
        {
          id: "water_cooler",
          name: "Smart Water Dispenser",
          x: 760, y: 240, w: 40, h: 48,
          type: "furniture",
          label: "Hydrate & Drink",
          action: () => {
            this.addFloatingText(this.player.x, this.player.y - 30, "Optimal Hydration! 💧", "#00f0ff");
            this.playSound('blip');
          }
        }
      );

    } else if (this.currentRoom === 'executive_office') {
      // Avijit's Private Office
      this.interactiveObjects.push(
        {
          id: "avijit_npc",
          name: "Avijit Pakhira (Lead Architect)",
          x: 480, y: 290, w: 70, h: 60,
          type: "npc",
          label: "Talk with Avijit",
          action: () => window.OFFICE_UI.openAvijitDialogue()
        },
        {
          id: "resume_dispenser",
          name: "Resume Fast-Print Terminal",
          x: 310, y: 280, w: 55, h: 50,
          type: "terminal",
          label: "Print Resume PDF",
          action: () => window.OFFICE_UI.openResumeModal()
        },
        {
          id: "contact_hotline",
          name: "Communications Hotline",
          x: 650, y: 280, w: 55, h: 50,
          type: "terminal",
          label: "Direct Message / Hire",
          action: () => window.OFFICE_UI.openContactModal()
        }
      );
    }
  }

  // ----------------------------------------------------
  // CINEMATIC ENTRANCE ANIMATION (DOORS PHYSICALLY SLIDE OPEN)
  // ----------------------------------------------------
  triggerEntranceSequence() {
    this.currentRoom = 'exterior_entrance';
    this.refreshInteractiveObjectsForRoom();

    this.player.x = 480;
    this.player.y = 540;
    this.player.targetX = 480;
    this.player.targetY = 240; // Walk towards the doors
  }

  // ----------------------------------------------------
  // ROOM TRANSITION MECHANIC
  // ----------------------------------------------------
  changeRoom(targetRoomId, spawnX, spawnY) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.transitionAlpha = 0;

    const targetConfig = this.roomConfigs[targetRoomId];
    this.transitionText = targetConfig ? targetConfig.name : "Entering Department...";
    this.playSound('door');

    // Fade to black / portal sweep
    const fadeOutInterval = setInterval(() => {
      this.transitionAlpha += 0.08;
      if (this.transitionAlpha >= 1) {
        clearInterval(fadeOutInterval);
        
        // Switch Room
        this.currentRoom = targetRoomId;
        this.refreshInteractiveObjectsForRoom();
        
        // Spawn player at target doorway position
        this.player.x = spawnX || 480;
        this.player.y = spawnY || 350;
        this.player.targetX = null;
        this.player.targetY = null;

        // Track stats
        this.stats.roomsVisited.add(targetRoomId);
        window.OFFICE_UI.updateQuestTracker();
        window.OFFICE_UI.showToast(`Entered: ${targetConfig ? targetConfig.shortName : targetRoomId}`);

        // Fade in
        const fadeInInterval = setInterval(() => {
          this.transitionAlpha -= 0.08;
          if (this.transitionAlpha <= 0) {
            clearInterval(fadeInInterval);
            this.transitionAlpha = 0;
            this.transitioning = false;
            this.broadcastMyPosition(true);

            // If entering reception for the first time, EVA greets you!
            if (targetRoomId === 'reception' && !this.evaGreeted) {
              this.evaGreeted = true;
              setTimeout(() => {
                window.OFFICE_UI.openReceptionDialogue();
              }, 400);
            }
          }
        }, 25);
      }
    }, 25);
  }

  teleportToRoom(roomId) {
    if (!this.roomConfigs[roomId]) return;
    this.spawnSparkleParticles(this.player.x, this.player.y, 25, '#00f0ff');
    this.playSound('achievement');
    this.changeRoom(roomId, 480, 380);
    const room = this.roomConfigs[roomId];
    if (window.OFFICE_UI) {
      window.OFFICE_UI.showToast(`⚡ Teleported to ${room ? room.shortName : roomId}!`);
    }
  }

  // ----------------------------------------------------
  // AUTOMATED GUIDED VIP TOUR ENGINE
  // ----------------------------------------------------
  startGuidedTour() {
    if (this.tourActive) return;
    this.tourActive = true;
    this.playSound('achievement');

    if (window.OFFICE_UI) {
      window.OFFICE_UI.showTourBanner(true);
      window.OFFICE_UI.showToast("🚀 Starting Automated VIP Guided Tour...");
    }

    const stops = [
      {
        room: 'exterior_entrance',
        x: 480, y: 520,
        targetX: 480, targetY: 230,
        duration: 3800,
        text: "🌆 Stop 1/6: Building Exterior — Approaching the front entrance. Notice the automatic sliding glass doors open as we arrive!"
      },
      {
        room: 'reception',
        x: 480, y: 460,
        targetX: 480, targetY: 360,
        duration: 4800,
        text: "🏢 Stop 2/6: Reception Lobby — EVA welcomes you! All research sectors, the guestbook, and teleporters originate here."
      },
      {
        room: 'ai_lab',
        x: 780, y: 350,
        targetX: 480, targetY: 350,
        duration: 5400,
        text: "🔬 Stop 3/6: AI & Computer Vision Lab — Where Avijit authors Springer papers and trains YOLOv3, FaceNet, and Clinical AI architectures."
      },
      {
        room: 'dev_bay',
        x: 180, y: 350,
        targetX: 460, targetY: 350,
        duration: 5000,
        text: "💻 Stop 4/6: Software Engineering Bay — Full-stack platforms, WorkFlow data pipelines, and quantitative algorithmic trading systems."
      },
      {
        room: 'boardroom',
        x: 480, y: 470,
        targetX: 480, targetY: 300,
        duration: 5200,
        text: "🏆 Stop 5/6: Executive Boardroom — Showcasing the 9.41 CGPA Golden Trophy, JIS University rank-1 records, and Oracle GenAI certifications."
      },
      {
        room: 'lounge',
        x: 480, y: 470,
        targetX: 330, targetY: 280,
        duration: 4800,
        text: "☕ Stop 6/6: Code Café & Lounge — Visitors can brew high-octane espresso for a +55% speed boost or play the AI Bug Buster arcade cabinet!"
      },
      {
        room: 'executive_office',
        x: 480, y: 470,
        targetX: 480, targetY: 330,
        duration: 5600,
        text: "💼 Grand Finale: Avijit's Private Corner Office — Tour complete! Chat directly with Avijit, review project portfolios, or download his resume."
      }
    ];

    let currentStopIndex = 0;

    const executeStop = () => {
      if (!this.tourActive) return;
      if (currentStopIndex >= stops.length) {
        this.stopGuidedTour(true);
        return;
      }

      const stop = stops[currentStopIndex];
      this.currentRoom = stop.room;
      this.refreshInteractiveObjectsForRoom();
      this.player.x = stop.x;
      this.player.y = stop.y;
      this.player.targetX = stop.targetX;
      this.player.targetY = stop.targetY;
      this.player.facing = 'up';

      this.spawnSparkleParticles(this.player.x, this.player.y, 20, '#00f0ff');
      this.playSound('blip');

      if (window.OFFICE_UI) {
        window.OFFICE_UI.updateTourBannerText(stop.text);
      }

      currentStopIndex++;
      this.tourTimer = setTimeout(executeStop, stop.duration);
    };

    executeStop();
  }

  stopGuidedTour(completed = false) {
    if (this.tourTimer) clearTimeout(this.tourTimer);
    this.tourActive = false;
    this.player.targetX = null;
    this.player.targetY = null;

    if (window.OFFICE_UI) {
      window.OFFICE_UI.showTourBanner(false);
      if (completed) {
        this.playSound('achievement');
        this.spawnSparkleParticles(this.player.x, this.player.y, 40, '#fbbf24');
        window.OFFICE_UI.showToast("🎉 VIP Guided Tour Completed! You now have full free-roam access.");
      } else {
        window.OFFICE_UI.showToast("🛑 Tour stopped. You are now in Free-Roam mode.");
      }
    }
  }

  drinkCoffee() {
    this.playSound('coffee');
    this.player.boostTimer = 14;
    this.player.speed = this.player.baseSpeed * 1.55;
    this.stats.easterEggsFound.add("coffee");
    this.spawnSteamParticles(this.player.x, this.player.y, 25);
    this.addFloatingText(this.player.x, this.player.y - 40, "⚡ HIGH-OCTANE SPEED BUFF! (+55% Speed)", "#f59e0b");
    window.OFFICE_UI.showToast("☕ Fresh Espresso brewed! Speed Boost active for 14s!");
  }

  // ----------------------------------------------------
  // FX & PARTICLES
  // ----------------------------------------------------
  spawnSparkleParticles(x, y, count = 15, color = '#00f0ff') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150,
        life: 1, color: color,
        size: Math.random() * 4 + 2
      });
    }
  }

  spawnSteamParticles(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 55 - 25,
        life: 0.95,
        color: 'rgba(255, 255, 255, 0.75)',
        size: Math.random() * 7 + 3
      });
    }
  }

  addFloatingText(x, y, text, color = '#00f0ff') {
    this.floatingTexts.push({ x, y, text, color, life: 1.8, opacity: 1 });
  }

  addClickRipple(x, y) {
    this.clickRipples.push({ x, y, radius: 4, maxRadius: 36, opacity: 1 });
  }

  // ----------------------------------------------------
  // INPUT HANDLING
  // ----------------------------------------------------
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (this.locked) return;
      if (e.key === 'Escape' && this.tourActive) {
        this.stopGuidedTour(false);
        return;
      }
      this.keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && this.nearbyObject) {
        this.nearbyObject.action();
        this.playSound('interact');
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.transitioning || this.locked) return;
      if (this.tourActive) {
        this.stopGuidedTour(false);
      }
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / this.camera.scale + this.camera.x;
      const clickY = (e.clientY - rect.top) / this.camera.scale + this.camera.y;

      this.addClickRipple(clickX, clickY);

      // Check if clicked directly on an interactive object
      let clickedObject = null;
      for (const obj of this.interactiveObjects) {
        if (
          clickX >= obj.x - obj.w/2 - 25 &&
          clickX <= obj.x + obj.w/2 + 25 &&
          clickY >= obj.y - obj.h/2 - 25 &&
          clickY <= obj.y + obj.h/2 + 25
        ) {
          clickedObject = obj;
          break;
        }
      }

      if (clickedObject) {
        this.player.targetX = clickedObject.x;
        this.player.targetY = clickedObject.y + 35;
        this.player.pendingInteraction = clickedObject;
      } else {
        const bounds = this.roomConfigs[this.currentRoom].bounds;
        this.player.targetX = Math.max(bounds.minX, Math.min(bounds.maxX, clickX));
        this.player.targetY = Math.max(bounds.minY, Math.min(bounds.maxY, clickY));
        this.player.pendingInteraction = null;
      }
    });

    // Touch Joystick for mobile
    const joystickArea = document.getElementById('touchJoystickArea');
    const joystickThumb = document.getElementById('touchJoystickThumb');
    const actionBtn = document.getElementById('mobileActionBtn');

    if (joystickArea && joystickThumb) {
      const handleTouch = (e) => {
        const touch = e.touches[0];
        const rect = joystickArea.getBoundingClientRect();
        this.touchJoystick.active = true;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = touch.clientX - cx;
        const dy = touch.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const maxDist = 42;
        const angle = Math.atan2(dy, dx);
        const clampedDist = Math.min(dist, maxDist);

        const thumbX = Math.cos(angle) * clampedDist;
        const thumbY = Math.sin(angle) * clampedDist;
        joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

        this.touchJoystick.dx = thumbX / maxDist;
        this.touchJoystick.dy = thumbY / maxDist;
      };

      joystickArea.addEventListener('touchstart', (e) => { handleTouch(e); }, { passive: false });
      joystickArea.addEventListener('touchmove', (e) => { handleTouch(e); }, { passive: false });
      joystickArea.addEventListener('touchend', () => {
        this.touchJoystick.active = false;
        this.touchJoystick.dx = 0;
        this.touchJoystick.dy = 0;
        joystickThumb.style.transform = 'translate(0px, 0px)';
      });
    }

    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        if (this.nearbyObject) {
          this.nearbyObject.action();
          this.playSound('interact');
        } else {
          this.playSound('blip');
        }
      });
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Scale room so the 960x640 diorama fits perfectly in viewport
    const scaleX = this.canvas.width / 960;
    const scaleY = (this.canvas.height - 64) / 640;
    this.camera.scale = Math.min(scaleX, scaleY) * 0.96;
    
    // Center camera on room
    this.camera.x = 480 - (this.canvas.width / this.camera.scale) / 2;
    this.camera.y = 320 - (this.canvas.height / this.camera.scale) / 2 + 32 / this.camera.scale;
  }

  // ----------------------------------------------------
  // UPDATE TICK & DOORWAY COLLISION
  // ----------------------------------------------------
  update(dt) {
    if (this.transitioning || this.locked) return;

    this.holoAngle += dt * 1.5;
    this.ledTimer += dt * 8;

    // Exterior Entrance Sliding Glass Door Motion Sensor logic
    if (this.currentRoom === 'exterior_entrance') {
      const distToDoor = Math.hypot(this.player.x - 480, this.player.y - 250);
      if (distToDoor < 180) {
        if (!this.doorSensorTriggered) {
          this.doorSensorTriggered = true;
          this.playSound('door');
          this.addFloatingText(480, 200, "Doors Opening... 🚪", "#00f0ff");
        }
        this.doorOpenAmount = Math.min(1, this.doorOpenAmount + dt * 2.5);
      } else {
        this.doorOpenAmount = Math.max(0, this.doorOpenAmount - dt * 2);
      }
    }

    // Skyline vehicles (in Avijit Office)
    if (this.currentRoom === 'executive_office') {
      this.skylineVehicles.forEach(v => {
        v.x += v.speed * dt;
        if (v.speed > 0 && v.x > 960) v.x = 0;
        if (v.speed < 0 && v.x < 0) v.x = 960;
      });
    }

    // Speed Buff Timer
    if (this.player.boostTimer > 0) {
      this.player.boostTimer -= dt;
      this.trails.push({ x: this.player.x, y: this.player.y, life: 0.35 });
      if (this.player.boostTimer <= 0) {
        this.player.speed = this.player.baseSpeed;
        this.addFloatingText(this.player.x, this.player.y - 30, "Speed buff ended", "#94a3b8");
      }
    }

    // Input Movement
    let dx = 0;
    let dy = 0;

    if (!this.tourActive) {
      if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
      if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
      if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
      if (this.keys['d'] || this.keys['arrowright']) dx += 1;

      if (this.touchJoystick.active) {
        dx = this.touchJoystick.dx;
        dy = this.touchJoystick.dy;
      }
    }

    if (this.player.targetX !== null && this.player.targetY !== null) {
      const tdx = this.player.targetX - this.player.x;
      const tdy = this.player.targetY - this.player.y;
      const dist = Math.hypot(tdx, tdy);

      if (dist > 8) {
        dx = tdx / dist;
        dy = tdy / dist;
      } else {
        this.player.targetX = null;
        this.player.targetY = null;
        if (this.player.pendingInteraction) {
          this.player.pendingInteraction.action();
          this.player.pendingInteraction = null;
          this.playSound('interact');
        }
      }
    }

    const mag = Math.hypot(dx, dy);
    if (mag > 0.05) {
      const normX = (dx / mag) * this.player.speed;
      const normY = (dy / mag) * this.player.speed;

      this.player.x += normX * dt;
      this.player.y += normY * dt;
      this.player.moving = true;

      if (Math.abs(normX) > Math.abs(normY)) {
        this.player.facing = normX > 0 ? 'right' : 'left';
      } else {
        this.player.facing = normY > 0 ? 'down' : 'up';
      }

      this.player.frameTimer += dt * 12;
      if (this.player.frameTimer > 1.8) {
        this.player.walkCycle = (this.player.walkCycle + 1) % 4;
        this.player.frameTimer = 0;
        this.playSound('step');
      }
    } else {
      this.player.moving = false;
      this.player.walkCycle = 0;
    }

    // Active Room Boundary Constraint
    const bounds = this.roomConfigs[this.currentRoom].bounds;
    this.player.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.player.x));
    this.player.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.player.y));

    // Doorway Collision Check -> Room Transition Trigger!
    const doors = this.roomConfigs[this.currentRoom].doors;
    for (const door of doors) {
      if (
        this.player.x >= door.x - door.w/2 &&
        this.player.x <= door.x + door.w/2 &&
        this.player.y >= door.y - door.h/2 &&
        this.player.y <= door.y + door.h/2
      ) {
        this.changeRoom(door.targetRoom, door.spawnX, door.spawnY);
        break;
      }
    }

    // Proximity to Interactive Objects
    let closestObj = null;
    let minDist = 75;

    for (const obj of this.interactiveObjects) {
      const d = Math.hypot(this.player.x - obj.x, this.player.y - obj.y);
      if (d < minDist) {
        minDist = d;
        closestObj = obj;
      }
    }

    if (closestObj !== this.nearbyObject) {
      this.nearbyObject = closestObj;
      const promptEl = document.getElementById('interactionPrompt');
      if (promptEl) {
        if (this.nearbyObject) {
          promptEl.innerHTML = `<span class="kbd-badge">E</span> or <span class="click-badge">Click</span> ${this.nearbyObject.label}`;
          promptEl.classList.add('visible');
        } else {
          promptEl.classList.remove('visible');
        }
      }
    }

    // Update Particles & FX
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.clickRipples.length - 1; i >= 0; i--) {
      const r = this.clickRipples[i];
      r.radius += dt * 80;
      r.opacity = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.opacity <= 0) this.clickRipples.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 26;
      ft.life -= dt;
      ft.opacity = Math.max(0, ft.life / 1.8);
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.trails.length - 1; i >= 0; i--) {
      const tr = this.trails[i];
      tr.life -= dt;
      if (tr.life <= 0) this.trails.splice(i, 1);
    }

    // Remote Players Position Interpolation & Pruning
    const nowMs = Date.now();
    this.remotePlayers.forEach((rp, id) => {
      if (nowMs - rp.lastSeen > 10000) {
        this.remotePlayers.delete(id);
        this.updateMultiplayerHud();
        return;
      }
      if (rp.targetX !== undefined && rp.targetY !== undefined) {
        rp.x += (rp.targetX - rp.x) * dt * 9;
        rp.y += (rp.targetY - rp.y) * dt * 9;
      }
    });

    // Broadcast local player movement
    if (this.player.moving) {
      this.broadcastMyPosition(false);
    }
  }

  // ----------------------------------------------------
  // DEDICATED ROOM-BY-ROOM 3D VIEW RENDERER
  // ----------------------------------------------------
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.scale(this.camera.scale, this.camera.scale);
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Draw Active Isolated Room 3D Diorama
    if (this.currentRoom === 'exterior_entrance') {
      this.drawExteriorEntranceRoom();
    } else if (this.currentRoom === 'reception') {
      this.drawReceptionRoom();
    } else if (this.currentRoom === 'ai_lab') {
      this.drawAILabRoom();
    } else if (this.currentRoom === 'dev_bay') {
      this.drawDevBayRoom();
    } else if (this.currentRoom === 'boardroom') {
      this.drawBoardroomRoom();
    } else if (this.currentRoom === 'lounge') {
      this.drawLoungeRoom();
    } else if (this.currentRoom === 'executive_office') {
      this.drawExecutiveOfficeRoom();
    }

    // 2. Draw Interactive Hotspots in Current Room
    this.drawCurrentRoomObjects();

    // 3. Draw Remote Players (Multiplayer) & Local Player
    this.drawRemotePlayers();
    this.drawPlayer();

    // 4. Draw Particles & FX
    this.drawFX();

    this.ctx.restore();

    // 5. Screen Space Transition Curtain
    if (this.transitionAlpha > 0) {
      this.ctx.fillStyle = `rgba(3, 7, 20, ${this.transitionAlpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.transitionAlpha > 0.5) {
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.font = 'bold 22px "Syne", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.transitionText, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'left';
      }
    }
  }

  // ----------------------------------------------------
  // ROOM 0: EXTERIOR ENTRANCE SCENE & SLIDING GLASS DOORS
  // ----------------------------------------------------
  drawExteriorEntranceRoom() {
    // Cyber city night street background
    this.ctx.fillStyle = '#050a18';
    this.ctx.fillRect(60, 60, 840, 520);

    // Street Pavement / Walkway
    const pGrad = this.ctx.createLinearGradient(480, 260, 480, 580);
    pGrad.addColorStop(0, '#1e293b');
    pGrad.addColorStop(1, '#0f172a');
    this.ctx.fillStyle = pGrad;
    this.ctx.fillRect(280, 260, 400, 320);

    // Modern Building Architectural Facade
    this.ctx.fillStyle = '#0b1329';
    this.ctx.fillRect(100, 80, 760, 180);
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(100, 80, 760, 180);

    // Glowing Building Plaque
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 15;
    this.ctx.font = '900 24px "Syne", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AVIJIT AI LABS // HEADQUARTERS', 480, 140);
    this.ctx.shadowBlur = 0;

    this.ctx.font = 'bold 12px "JetBrains Mono"';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText('RESEARCH & INNOVATION COMPLEX · JIS UNIVERSITY', 480, 168);

    // Entrance Portal Arch
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(400, 190, 160, 80);
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(400, 190, 160, 80);

    // SLIDING GLASS DOORS (ACTUAL ANIMATION!)
    // Left Door slides to the left, Right Door slides to the right
    const slideOffset = this.doorOpenAmount * 65; // Moves apart up to 65px!

    // Left Glass Door
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    this.ctx.fillRect(405 - slideOffset, 195, 75, 70);
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(405 - slideOffset, 195, 75, 70);

    // Right Glass Door
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    this.ctx.fillRect(480 + slideOffset, 195, 75, 70);
    this.ctx.strokeRect(480 + slideOffset, 195, 75, 70);

    // Interior Warm Glow visible when doors open!
    if (this.doorOpenAmount > 0.1) {
      this.ctx.fillStyle = `rgba(254, 243, 199, ${this.doorOpenAmount * 0.45})`;
      this.ctx.fillRect(410, 195, 140, 70);
    }

    // Doorway Guide
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = 'bold 11px "JetBrains Mono"';
    this.ctx.fillText(this.doorOpenAmount > 0.5 ? '◄ WALK IN TO ENTER ►' : '◄ MOTION SENSOR DOORS ►', 480, 285);
    this.ctx.textAlign = 'left';

    // Decorative Street Lights & Planters
    this.drawLushPlant(240, 320);
    this.drawLushPlant(720, 320);
    this.drawLushPlant(240, 480);
    this.drawLushPlant(720, 480);
  }

  // ----------------------------------------------------
  // ROOM 1: RECEPTION LOBBY (ONLY EVA & RECEPTION DESK)
  // ----------------------------------------------------
  drawReceptionRoom() {
    const rx = 100, ry = 140, rw = 760, rh = 430;

    // Room Drop Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(rx + 15, ry + 15, rw, rh);

    // White & Gold Polished Italian Marble Floor
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(rx, ry, rw, rh);

    // Marble tile grid
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1;
    for (let x = rx; x < rx + rw; x += 55) {
      for (let y = ry; y < ry + rh; y += 55) {
        this.ctx.strokeRect(x, y, 55, 55);
      }
    }

    // Large Circular Teal Carpet
    this.ctx.fillStyle = '#0f766e';
    this.ctx.beginPath();
    this.ctx.ellipse(rx + rw/2, ry + rh/2 + 20, 180, 100, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#2dd4bf';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // 3D Back Walls & Living Vertical Moss Feature Wall
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(rx, ry, rw, 55);

    // Lush Green Moss Wall behind EVA
    const mwX = 320, mwY = ry + 8, mwW = 320, mwH = 40;
    this.ctx.fillStyle = '#16a34a';
    this.ctx.fillRect(mwX, mwY, mwW, mwH);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 15px "Syne"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AVIJIT AI LABS // RECEPTION', mwX + mwW/2, mwY + 26);
    this.ctx.textAlign = 'left';

    // Italian Marble & Walnut Reception Desk
    this.ctx.fillStyle = '#451a03'; // Walnut base
    this.ctx.fillRect(390, 280, 180, 50);
    this.ctx.fillStyle = '#ffffff'; // White quartz counter
    this.ctx.fillRect(384, 276, 192, 16);

    // Waiting Velvet Couch
    this.ctx.fillStyle = '#0d9488';
    this.ctx.beginPath();
    this.ctx.roundRect(280, 430, 100, 45, 8);
    this.ctx.fill();
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(286, 434, 16, 16);
    this.ctx.fillRect(358, 434, 16, 16);

    // Decorative Plants
    this.drawLushPlant(160, 220);
    this.drawLushPlant(800, 220);

    // Draw Labeled 3D Exit Doors on walls
    this.drawRoomDoors('reception');

    // Draw ONLY Receptionist EVA NPC
    this.drawRealisticCharacter(480, 260, '#ec4899', 'EVA', 'AI Receptionist', false);
  }

  // ----------------------------------------------------
  // ROOM 2: AI & COMPUTER VISION RESEARCH LAB
  // ----------------------------------------------------
  drawAILabRoom() {
    const rx = 100, ry = 140, rw = 760, rh = 430;

    this.ctx.fillStyle = '#0f172a'; // Concrete lab floor
    this.ctx.fillRect(rx, ry, rw, rh);

    // Cyan circuit floor traces
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(rx + 25, ry + 25, rw - 50, rh - 50);

    // Back lab wall
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(rx, ry, rw, 55);

    this.ctx.fillStyle = '#38bdf8';
    this.ctx.font = 'bold 15px "Syne"';
    this.ctx.fillText('🔬 SECTOR 02: AI & COMPUTER VISION LAB', rx + 30, ry + 36);

    // Rotating 3D Neural Matrix Core in Center
    this.drawHolographicNeuralCore(480, 350);

    // 4 Workstation Desks
    const pods = [
      { x: 250, y: 440, label: 'YOLOv3 Vision' },
      { x: 410, y: 440, label: 'FaceNet Bio' },
      { x: 570, y: 440, label: 'Clinical AI' },
      { x: 730, y: 440, label: 'AirVerde AQI' }
    ];
    pods.forEach(p => {
      this.ctx.fillStyle = '#334155';
      this.ctx.fillRect(p.x - 36, p.y - 20, 72, 40);
      this.ctx.fillStyle = '#0284c7';
      this.ctx.fillRect(p.x - 30, p.y - 15, 26, 16);
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillRect(p.x + 4, p.y - 15, 26, 16);
    });

    // Draw Labeled Doors
    this.drawRoomDoors('ai_lab');
  }

  // ----------------------------------------------------
  // ROOM 3: SOFTWARE ENGINEERING BAY
  // ----------------------------------------------------
  drawDevBayRoom() {
    const rx = 100, ry = 140, rw = 760, rh = 430;

    // Honey Oak Parquet Planks
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(rx, ry, rw, rh);
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 1;
    for (let y = ry; y < ry + rh; y += 24) {
      this.ctx.strokeRect(rx, y, rw, 24);
    }

    // Moroccan Geometric Rug
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(rx + 60, ry + 160, rw - 120, 220);

    // Wall Header
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(rx, ry, rw, 55);
    this.ctx.fillStyle = '#8b5cf6';
    this.ctx.font = 'bold 15px "Syne"';
    this.ctx.fillText('💻 SECTOR 03: SOFTWARE ENGINEERING BAY', rx + 30, ry + 36);

    // Coder Workstation Desks
    const desks = [
      { x: 260, y: 260, label: 'WorkFlow' },
      { x: 440, y: 260, label: 'Quant Bot' },
      { x: 620, y: 260, label: 'Netflix ML' },
      { x: 350, y: 430, label: 'Festiva' },
      { x: 530, y: 430, label: 'JarvisAI' }
    ];
    desks.forEach(d => {
      this.ctx.fillStyle = '#b45309';
      this.ctx.fillRect(d.x - 36, d.y - 20, 72, 40);
      this.ctx.fillStyle = '#8b5cf6';
      this.ctx.fillRect(d.x - 30, d.y - 15, 26, 16);
      this.ctx.fillStyle = '#06b6d4';
      this.ctx.fillRect(d.x + 4, d.y - 15, 26, 16);
    });

    // Agile Kanban Board
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(710, 405, 80, 50);
    this.ctx.strokeStyle = '#64748b';
    this.ctx.strokeRect(710, 405, 80, 50);

    // Sticky Notes
    this.ctx.fillStyle = '#f43f5e'; this.ctx.fillRect(716, 412, 12, 12);
    this.ctx.fillStyle = '#eab308'; this.ctx.fillRect(734, 412, 12, 12);
    this.ctx.fillStyle = '#22c55e'; this.ctx.fillRect(752, 412, 12, 12);

    this.drawRoomDoors('dev_bay');
  }

  // ----------------------------------------------------
  // ROOM 4: BOARDROOM & HALL OF FAME
  // ----------------------------------------------------
  drawBoardroomRoom() {
    const rx = 100, ry = 140, rw = 760, rh = 430;

    // Dark Executive Walnut Flooring
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(rx, ry, rw, rh);

    // Crimson Executive Velvet Rug
    this.ctx.fillStyle = '#881337';
    this.ctx.fillRect(rx + 80, ry + 220, rw - 160, 160);

    // Wall Header
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(rx, ry, rw, 55);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = 'bold 15px "Syne"';
    this.ctx.fillText('🏆 SECTOR 04: EXECUTIVE BOARDROOM & HALL OF FAME', rx + 30, ry + 36);

    // Glass Showcase Pedestal with 9.41 CGPA Golden Cup Trophy
    const tx = 480, ty = 220;
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(tx - 32, ty - 32, 64, 64);
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(tx - 32, ty - 32, 64, 64);

    // Golden Cup with glowing particles
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(tx, ty - 8, 16, 0, Math.PI, false);
    this.ctx.fill();
    this.ctx.fillRect(tx - 4, ty - 8, 8, 18);
    this.ctx.fillRect(tx - 14, ty + 10, 28, 8);

    // Boardroom Mahogany Table
    this.ctx.fillStyle = '#290e02';
    this.ctx.beginPath();
    this.ctx.roundRect(390, 340, 180, 80, 12);
    this.ctx.fill();
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.drawRoomDoors('boardroom');
  }

  // ----------------------------------------------------
  // ROOM 5: CODE CAFÉ & BREAK ROOM
  // ----------------------------------------------------
  drawLoungeRoom() {
    const rx = 100, ry = 140, rw = 760, rh = 430;

    // Terrazzo Flooring
    this.ctx.fillStyle = '#fef3c7';
    this.ctx.fillRect(rx, ry, rw, rh);

    // Wall Header with Neon Sign
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(rx, ry, rw, 55);
    this.ctx.fillStyle = '#f43f5e';
    this.ctx.shadowColor = '#f43f5e';
    this.ctx.shadowBlur = 10;
    this.ctx.font = 'bold 16px "JetBrains Mono"';
    this.ctx.fillText('☕ CODE CAFÉ & BREAK LOUNGE ⚡', rx + 30, ry + 36);
    this.ctx.shadowBlur = 0;

    // Mint-Green Espresso Machine Counter
    this.ctx.fillStyle = '#0d9488';
    this.ctx.fillRect(290, 215, 65, 50);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(302, 225, 30, 8);

    // Retro Arcade Cabinet "AI BUG BUSTER 3000"
    this.ctx.fillStyle = '#4c0519';
    this.ctx.fillRect(610, 205, 60, 75);
    this.ctx.strokeStyle = '#f43f5e';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(610, 205, 60, 75);
    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillRect(618, 216, 44, 28);

    this.drawRoomDoors('lounge');
  }

  // ----------------------------------------------------
  // ROOM 6: AVIJIT'S PRIVATE CORNER OFFICE
  // ----------------------------------------------------
  drawExecutiveOfficeRoom() {
    const rx = 100, ry = 140, rw = 760, rh = 430;

    // 1. Panoramic Sunset Skyline Window (Full Top Wall)
    this.drawSunsetSkylineWindow(rx + 40, ry + 8, rw - 80, 85);

    // Blonde Oak Parquet Floor
    this.ctx.fillStyle = '#e2c499';
    this.ctx.fillRect(rx, ry + 95, rw, rh - 95);

    // Executive Navy Geometric Rug
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(rx + 80, ry + 180, rw - 160, 220);
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(rx + 80, ry + 180, rw - 160, 220);

    // Avijit's L-Desk
    this.ctx.fillStyle = '#292524';
    this.ctx.fillRect(390, 280, 180, 65);
    this.ctx.strokeStyle = '#c084fc';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(390, 280, 180, 65);

    // Triple Curved Monitors
    this.ctx.fillStyle = '#0284c7'; this.ctx.fillRect(410, 266, 42, 16);
    this.ctx.fillStyle = '#8b5cf6'; this.ctx.fillRect(458, 262, 44, 20);
    this.ctx.fillStyle = '#10b981'; this.ctx.fillRect(508, 266, 42, 16);

    // Avijit sitting at his desk
    this.drawRealisticCharacter(480, 250, '#8b5cf6', 'Avijit Pakhira', 'Lead AI Engineer', true);

    this.drawRoomDoors('executive_office');
  }

  drawSunsetSkylineWindow(winX, winY, winW, winH) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(winX, winY, winW, winH);
    this.ctx.clip();

    // Sunset Sky Gradient
    const skyGrad = this.ctx.createLinearGradient(winX, winY, winX, winY + winH);
    skyGrad.addColorStop(0, '#1e1b4b');
    skyGrad.addColorStop(0.4, '#701a75');
    skyGrad.addColorStop(0.8, '#c026d3');
    skyGrad.addColorStop(1, '#f97316');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(winX, winY, winW, winH);

    // Golden Sun
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(winX + winW/2, winY + winH, 55, 0, Math.PI * 2);
    this.ctx.fill();

    // City Silhouette
    const towers = [
      { x: winX + 10, w: 45, h: 60, color: '#09081a' },
      { x: winX + 65, w: 60, h: 75, color: '#0f0a28' },
      { x: winX + 135, w: 50, h: 65, color: '#09081a' },
      { x: winX + 195, w: 80, h: 78, color: '#130d32' },
      { x: winX + 285, w: 50, h: 58, color: '#09081a' },
      { x: winX + 345, w: 75, h: 72, color: '#0f0a28' },
      { x: winX + 430, w: 70, h: 62, color: '#080616' }
    ];
    towers.forEach(t => {
      this.ctx.fillStyle = t.color;
      this.ctx.fillRect(t.x, winY + winH - t.h, t.w, t.h);
    });

    // Flying Vehicles with light streaks
    this.skylineVehicles.forEach(v => {
      this.ctx.fillStyle = v.color;
      this.ctx.fillRect(v.x, v.y, v.size, 3);
    });

    // Glass Window Frame
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(winX, winY, winW, winH);
    for (let x = winX + 120; x < winX + winW; x += 120) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, winY);
      this.ctx.lineTo(x, winY + winH);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  // ----------------------------------------------------
  // DRAW 3D LABELED DOORWAYS ON WALLS
  // ----------------------------------------------------
  drawRoomDoors(roomId) {
    const doors = this.roomConfigs[roomId].doors;
    doors.forEach(d => {
      this.ctx.save();
      // Doorway Frame
      this.ctx.fillStyle = '#020617';
      this.ctx.fillRect(d.x - d.w/2, d.y - d.h/2, d.w, d.h);
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(d.x - d.w/2, d.y - d.h/2, d.w, d.h);

      // Doorway Glowing Tag
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.font = 'bold 10px "JetBrains Mono"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(d.label, d.x, d.y - d.h/2 - 6);
      this.ctx.restore();
    });
  }

  // ----------------------------------------------------
  // 3D NEURAL MATRIX CORE (AI LAB ONLY)
  // ----------------------------------------------------
  drawHolographicNeuralCore(cx, cy) {
    this.ctx.save();
    this.ctx.fillStyle = '#0369a1';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, 32, 14, this.holoAngle, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, 32, 14, -this.holoAngle * 0.85, 0, Math.PI * 2);
    this.ctx.stroke();

    const coreGrad = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, 18);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, '#00f0ff');
    coreGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    this.ctx.fillStyle = coreGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = 'bold 11px "JetBrains Mono"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NEURAL MATRIX', cx, cy + 50);
    this.ctx.restore();
  }

  // ----------------------------------------------------
  // INTERACTIVE OBJECTS IN CURRENT ROOM
  // ----------------------------------------------------
  drawCurrentRoomObjects() {
    this.interactiveObjects.forEach(obj => {
      const isNearby = this.nearbyObject === obj;
      if (isNearby) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        this.ctx.fillRect(obj.x - 60, obj.y - 48, 120, 24);
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(obj.x - 60, obj.y - 48, 120, 24);

        this.ctx.fillStyle = '#00f0ff';
        this.ctx.font = 'bold 11px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('[E] INTERACT', obj.x, obj.y - 32);
        this.ctx.restore();
      }
    });
  }

  // ----------------------------------------------------
  // ANIMATED CHARACTER & NPC SPRITES
  // ----------------------------------------------------
  drawRealisticCharacter(x, y, accentColor, name, role, isAvijit = false) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 16, 16, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = isAvijit ? '#1e1b4b' : '#042f2e';
    this.ctx.beginPath();
    this.ctx.arc(x, y + 2, 13, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = accentColor;
    this.ctx.fillRect(x - 9, y + 2, 18, 14);

    this.ctx.fillStyle = '#fed7aa';
    this.ctx.beginPath();
    this.ctx.arc(x, y - 9, 10, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = isAvijit ? '#1c1917' : '#78350f';
    this.ctx.beginPath();
    this.ctx.arc(x, y - 13, 9, Math.PI, Math.PI * 2);
    this.ctx.fill();

    // Name Plate
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.ctx.fillRect(x - 60, y - 42, 120, 22);
    this.ctx.strokeStyle = accentColor;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - 60, y - 42, 120, 22);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 11px "Syne"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(name, x, y - 27);
    this.ctx.restore();
  }

  drawPlayer() {
    const p = this.player;
    this.ctx.save();

    this.trails.forEach(tr => {
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.16)';
      this.ctx.beginPath();
      this.ctx.arc(tr.x, tr.y, 14, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.beginPath();
    this.ctx.ellipse(p.x, p.y + 16, 17, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    if (p.boostTimer > 0) {
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    const bob = p.moving ? Math.sin(p.walkCycle * Math.PI) * 2.8 : 0;

    this.ctx.fillStyle = p.pantsColor;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y + bob, 14, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = p.jacketColor;
    this.ctx.fillRect(p.x - 9, p.y - 2 + bob, 18, 14);

    this.ctx.fillStyle = '#fed7aa';
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y - 10 + bob, 10, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = p.hairColor;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y - 14 + bob, 9, Math.PI, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#00f0ff';
    if (p.facing === 'down') {
      this.ctx.fillRect(p.x - 6, p.y - 12 + bob, 12, 4);
    } else if (p.facing === 'left') {
      this.ctx.fillRect(p.x - 9, p.y - 12 + bob, 8, 4);
    } else if (p.facing === 'right') {
      this.ctx.fillRect(p.x + 1, p.y - 12 + bob, 8, 4);
    }

    // Name tag above player character (shows user's registered name!)
    const visitor = window.OFFICE_UI ? window.OFFICE_UI.getVisitorPass() : null;
    const displayName = (visitor && visitor.name ? visitor.name : 'GUEST').toUpperCase();
    this.drawNameTag(p.x, p.y - 34 + bob, displayName, '#00f0ff', true);

    this.ctx.restore();
  }

  // ----------------------------------------------------
  // MULTIPLAYER & NAMETAG RENDERING
  // ----------------------------------------------------
  drawNameTag(x, y, name, color = '#00f0ff', isLocal = false) {
    this.ctx.save();
    this.ctx.font = 'bold 10px "JetBrains Mono", monospace';
    const textWidth = this.ctx.measureText(name).width;
    const tagWidth = Math.max(textWidth + 20, 52);
    const tagHeight = 18;
    const tagX = x - tagWidth / 2;
    const tagY = y - tagHeight / 2;

    // Background pill
    this.ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 9);
    } else {
      this.ctx.rect(tagX, tagY, tagWidth, tagHeight);
    }
    this.ctx.fill();

    // Border
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.3;
    this.ctx.stroke();

    // Online status dot
    this.ctx.fillStyle = isLocal ? '#00f0ff' : '#10b981';
    this.ctx.beginPath();
    this.ctx.arc(tagX + 7, y, 2.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Visitor Name
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(name, x + 3, y);

    this.ctx.restore();
  }

  drawRemotePlayers() {
    this.remotePlayers.forEach((rp, id) => {
      // Only draw remote players if they are in the exact same room
      if (rp.room !== this.currentRoom) return;

      const bob = rp.moving ? Math.sin((rp.walkCycle || 0) * Math.PI) * 2.8 : 0;

      this.ctx.save();
      // Drop Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.beginPath();
      this.ctx.ellipse(rp.x, rp.y + 16, 17, 7, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Pants
      this.ctx.fillStyle = rp.pantsColor || '#1e293b';
      this.ctx.beginPath();
      this.ctx.arc(rp.x, rp.y + bob, 14, 0, Math.PI * 2);
      this.ctx.fill();

      // Jacket (violet/emerald for other visitors)
      this.ctx.fillStyle = rp.jacketColor || '#8b5cf6';
      this.ctx.fillRect(rp.x - 9, rp.y - 2 + bob, 18, 14);

      // Head / Skin
      this.ctx.fillStyle = '#fed7aa';
      this.ctx.beginPath();
      this.ctx.arc(rp.x, rp.y - 10 + bob, 10, 0, Math.PI * 2);
      this.ctx.fill();

      // Hair
      this.ctx.fillStyle = rp.hairColor || '#312e81';
      this.ctx.beginPath();
      this.ctx.arc(rp.x, rp.y - 14 + bob, 9, Math.PI, Math.PI * 2);
      this.ctx.fill();

      // Visor / Facing
      this.ctx.fillStyle = '#c084fc';
      if (rp.facing === 'down') {
        this.ctx.fillRect(rp.x - 6, rp.y - 12 + bob, 12, 4);
      } else if (rp.facing === 'left') {
        this.ctx.fillRect(rp.x - 9, rp.y - 12 + bob, 8, 4);
      } else if (rp.facing === 'right') {
        this.ctx.fillRect(rp.x + 1, rp.y - 12 + bob, 8, 4);
      }

      // Remote player name tag
      const displayName = (rp.name || 'VISITOR').toUpperCase();
      this.drawNameTag(rp.x, rp.y - 34 + bob, displayName, '#c084fc', false);

      this.ctx.restore();
    });
  }

  // ----------------------------------------------------
  // MULTIPLAYER NETWORKING & PRESENCE ENGINE
  // ----------------------------------------------------
  initMultiplayer() {
    // 1. Instant Cross-Tab Sync via BroadcastChannel (zero latency, multi-tab testing)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.bc = new BroadcastChannel('avijit_ai_labs_multiplayer');
        this.bc.onmessage = (e) => {
          const msg = e.data;
          if (!msg || msg.id === this.myPlayerId) return;

          if (msg.type === 'leave') {
            this.remotePlayers.delete(msg.id);
            this.updateMultiplayerHud();
            return;
          }

          if (msg.type === 'hello') {
            const isNew = !this.remotePlayers.has(msg.id);
            this.recordRemotePlayer(msg.id, msg.player);
            // Immediately respond so the new arrival knows about us!
            this.broadcastPresence('welcome');
            if (isNew && window.OFFICE_UI && msg.player && msg.player.name) {
              window.OFFICE_UI.showToast(`👋 ${msg.player.name} joined the office!`);
            }
            return;
          }

          if (msg.type === 'welcome' || msg.type === 'update') {
            this.recordRemotePlayer(msg.id, msg.player);
            return;
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel not supported:", err);
      }
    }

    // 2. Announce presence immediately to all existing tabs
    setTimeout(() => {
      this.broadcastPresence('hello');
    }, 200);

    // 3. Continuous Heartbeat (every 800ms) across BroadcastChannel & Server
    this.pollPresenceFromServer();
    setInterval(() => {
      this.broadcastPresence('update');
      this.pollPresenceFromServer();
    }, 800);

    // 4. Broadcast departure on page unload
    window.addEventListener('beforeunload', () => {
      if (this.bc) {
        this.bc.postMessage({ type: 'leave', id: this.myPlayerId });
      }
    });
  }

  recordRemotePlayer(id, playerData) {
    if (!playerData) return;
    const existing = this.remotePlayers.get(id) || {};
    this.remotePlayers.set(id, {
      ...existing,
      ...playerData,
      targetX: playerData.x,
      targetY: playerData.y,
      x: existing.x !== undefined ? existing.x : playerData.x,
      y: existing.y !== undefined ? existing.y : playerData.y,
      lastSeen: Date.now()
    });
    this.updateMultiplayerHud();
  }

  getLivePlayerData() {
    const visitor = window.OFFICE_UI ? window.OFFICE_UI.getVisitorPass() : null;
    return {
      id: this.myPlayerId,
      name: visitor && visitor.name ? visitor.name : 'Guest',
      room: this.currentRoom,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      facing: this.player.facing,
      moving: this.player.moving,
      walkCycle: this.player.walkCycle,
      jacketColor: '#a855f7',
      pantsColor: '#1e293b',
      hairColor: '#312e81'
    };
  }

  broadcastPresence(type = 'update') {
    if (!this.bc) return;
    const myData = this.getLivePlayerData();
    try {
      this.bc.postMessage({ type, id: this.myPlayerId, player: myData });
    } catch (e) {}
  }

  async pollPresenceFromServer() {
    const myData = this.getLivePlayerData();

    try {
      const res = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'presence', player: myData })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.players && Array.isArray(json.players)) {
          const activeIds = new Set();
          json.players.forEach(p => {
            if (p.id !== this.myPlayerId) {
              activeIds.add(p.id);
              this.recordRemotePlayer(p.id, p);
            }
          });
          // Prune players that server no longer reports
          this.remotePlayers.forEach((rp, id) => {
            if (!activeIds.has(id) && Date.now() - rp.lastSeen > 8000) {
              this.remotePlayers.delete(id);
            }
          });
          this.updateMultiplayerHud(json.liveCount);
        }
      }
    } catch (e) {
      // Offline / local preview without backend
    }
  }

  broadcastMyPosition(force = false) {
    const now = performance.now();
    if (!force && now - this.multiplayerLastBroadcast < 50) return;
    this.multiplayerLastBroadcast = now;
    this.broadcastPresence('update');
  }

  updateMultiplayerHud(serverLiveCount) {
    const liveCountEl = document.getElementById('liveCountText');
    const livePill = document.getElementById('liveVisitorsPill');
    const calculatedTotal = 1 + this.remotePlayers.size;
    const total = Math.max(calculatedTotal, serverLiveCount || 1);

    if (liveCountEl) {
      liveCountEl.textContent = total === 1 ? '1 Online' : `${total} Online`;
    }

    if (livePill) {
      const visitor = window.OFFICE_UI ? window.OFFICE_UI.getVisitorPass() : null;
      const myName = visitor && visitor.name ? visitor.name : 'You';
      const myRoom = this.roomConfigs[this.currentRoom] ? this.roomConfigs[this.currentRoom].shortName : 'Office';
      let title = `Active Visitors (${total} Online):\n• ${myName} (You, in ${myRoom})`;
      this.remotePlayers.forEach(rp => {
        const rName = this.roomConfigs[rp.room] ? this.roomConfigs[rp.room].shortName : (rp.room || 'Building');
        title += `\n• ${rp.name || 'Visitor'} (in ${rName})`;
      });
      livePill.title = title;
    }
  }

  drawLushPlant(x, y) {
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 16, 0, Math.PI * 2);
    this.ctx.fill();

    const leaves = [
      { dx: -6, dy: -7, r: 11, color: '#15803d' },
      { dx: 7, dy: -6, r: 11, color: '#16a34a' },
      { dx: -8, dy: 5, r: 10, color: '#22c55e' },
      { dx: 5, dy: 6, r: 11, color: '#16a34a' }
    ];
    leaves.forEach(l => {
      this.ctx.fillStyle = l.color;
      this.ctx.beginPath();
      this.ctx.arc(x + l.dx, y + l.dy, l.r, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawFX() {
    this.clickRipples.forEach(r => {
      this.ctx.save();
      this.ctx.strokeStyle = `rgba(0, 240, 255, ${r.opacity})`;
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    });

    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.fillStyle = ft.color;
      this.ctx.globalAlpha = ft.opacity;
      this.ctx.font = 'bold 13px "Plus Jakarta Sans"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });
  }

  gameLoop(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

window.OfficeGame = OfficeGame;
