// ========================================================
// AVIJIT AI LABS — ADVANCED USER INTERFACE & PRELOADER
// Cinematic Boot Sequence, Dialogue Engine & Executive View
// ========================================================

class OfficeUI {
  constructor() {
    this.modalOverlay = document.getElementById('modalOverlay');
    this.modalContent = document.getElementById('modalContent');
    this.dialogueBox = document.getElementById('dialogueBox');
    this.dialogueSpeaker = document.getElementById('dialogueSpeaker');
    this.dialogueText = document.getElementById('dialogueText');
    this.dialogueOptions = document.getElementById('dialogueOptions');
    this.toastEl = document.getElementById('gameToast');
    this.toastTimer = null;
    this.currentFilter = 'all';
    this.currentSearchQuery = '';

    // Initialize Preloader
    this.initPreloader();

    this.setupGlobalControls();
    this.updateQuestTracker();
  }

  // ----------------------------------------------------
  // CINEMATIC PRELOADER CONTROLLER
  // ----------------------------------------------------
  initPreloader() {
    const preloader = document.getElementById('officePreloader');
    const barFill = document.getElementById('preloaderBarFill');
    const percentText = document.getElementById('preloaderPercent');
    const statusText = document.getElementById('preloaderStatusText');
    const consoleLine = document.getElementById('preloaderConsoleLine');
    const enterBtn = document.getElementById('preloaderEnterBtn');

    if (!preloader) {
      this.bootGame();
      return;
    }

    const bootSteps = [
      { pct: 18, msg: "Connecting to secure neural gateway...", log: "Allocating PyTorch Tensor cores & memory buffers..." },
      { pct: 40, msg: "Loading realistic 3D floor plans & textures...", log: "Loaded Italian marble, warm oak & living moss wall." },
      { pct: 65, msg: "Synchronizing 16 AI/ML production systems...", log: "WorkFlow, YOLOv3, FaceNet & Quant Bot verified." },
      { pct: 88, msg: "Indexing Springer research archives...", log: "Vedic Math CNN & icSoftComp2024 papers synchronized." },
      { pct: 100, msg: "Environment ready. Access Granted.", log: "Host EVA standing by at Reception Desk." }
    ];

    let currentStep = 0;
    let progress = 0;
    let preloaderCompleted = false;

    const preloaderInterval = setInterval(() => {
      if (currentStep < bootSteps.length) {
        const step = bootSteps[currentStep];
        progress = Math.min(step.pct, progress + 3);

        if (barFill) barFill.style.width = `${progress}%`;
        if (percentText) percentText.textContent = `${progress}%`;
        if (statusText) statusText.textContent = step.msg;
        if (consoleLine) consoleLine.textContent = step.log;

        if (progress >= step.pct) {
          currentStep++;
        }
      } else {
        clearInterval(preloaderInterval);
        onComplete();
      }
    }, 40);

    const onComplete = () => {
      if (preloaderCompleted) return;
      preloaderCompleted = true;
      if (barFill) barFill.style.width = '100%';
      if (percentText) percentText.textContent = '100%';
      if (statusText) statusText.textContent = 'System Ready.';
      if (consoleLine) consoleLine.textContent = 'Click below to enter Avijit AI Labs.';

      if (enterBtn) {
        enterBtn.classList.add('ready');
        enterBtn.addEventListener('click', () => {
          this.dismissPreloader(preloader);
        });
      }

      // Auto-enter after 1.5 seconds if user doesn't click
      setTimeout(() => {
        if (!this.gameStarted) {
          this.dismissPreloader(preloader);
        }
      }, 1600);
    };
  }

  dismissPreloader(preloader) {
    if (this.gameStarted) return;
    this.gameStarted = true;
    preloader.classList.add('fade-out');

    setTimeout(() => {
      preloader.style.display = 'none';
      this.bootGame();
    }, 600);
  }

  bootGame() {
    if (!window.game) {
      window.game = new OfficeGame('gameCanvas');
      window.game.playSound('achievement');
    }

    this.updateVisitorHudPill();

    const visitor = this.getVisitorPass();
    if (!visitor) {
      // New visitor: Lock game and open mandatory registration modal
      if (window.game) window.game.locked = true;
      setTimeout(() => {
        this.openVisitorRegistrationModal(true);
      }, 400);
    } else {
      this.showToast(`🏢 Welcome back to Avijit AI Labs, ${visitor.name}!`);
    }

    // Cross-tab database synchronization via BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.visitorsBc = new BroadcastChannel('avijit_visitors_sync');
        this.visitorsBc.onmessage = (e) => {
          const msg = e.data;
          if (msg && msg.type === 'NEW_VISITOR' && msg.visitor) {
            let db = this.getLocalVisitorsDb();
            db = db.filter(v => v.email.toLowerCase() !== msg.visitor.email.toLowerCase());
            db.unshift(msg.visitor);
            try {
              localStorage.setItem('office_visitors_db', JSON.stringify(db));
            } catch (err) {}
          }
        };
      } catch (err) {}
    }
  }

  // ----------------------------------------------------
  // GLOBAL HUD INTERACTION CONTROLS
  // ----------------------------------------------------
  setupGlobalControls() {
    const soundBtn = document.getElementById('hudSoundToggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (!window.game) return;
        window.game.audioEnabled = !window.game.audioEnabled;
        soundBtn.innerHTML = window.game.audioEnabled
          ? '<i class="fas fa-volume-high"></i> SFX: ON'
          : '<i class="fas fa-volume-xmark"></i> SFX: OFF';
        soundBtn.classList.toggle('active', window.game.audioEnabled);
        this.showToast(window.game.audioEnabled ? '🔊 Sound Effects Enabled' : '🔇 Sound Effects Muted');
      });
    }

    const bgmBtn = document.getElementById('hudBgmToggle');
    if (bgmBtn) {
      bgmBtn.addEventListener('click', () => {
        if (!window.game) return;
        const isPlaying = window.game.toggleBgm();
        bgmBtn.innerHTML = isPlaying
          ? '<i class="fas fa-music"></i> Synth BGM: ON'
          : '<i class="fas fa-play"></i> Synth BGM: OFF';
        bgmBtn.classList.toggle('active', isPlaying);
        this.showToast(isPlaying ? '🎶 Ambient Cyber BGM Playing' : '⏸️ BGM Paused');
      });
    }

    const tourBtn = document.getElementById('hudTourBtn');
    if (tourBtn) {
      tourBtn.addEventListener('click', () => {
        if (!window.game) return;
        this.closeDialogue();
        this.closeModal();
        window.game.startGuidedTour();
      });
    }

    const stopTourBtn = document.getElementById('stopTourBtn');
    if (stopTourBtn) {
      stopTourBtn.addEventListener('click', () => {
        if (window.game) window.game.stopGuidedTour(false);
      });
    }

    const mapBtn = document.getElementById('hudMapBtn');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => {
        this.openQuickTravelModal();
      });
    }

    const badgePill = document.getElementById('visitorBadgePill');
    if (badgePill) {
      badgePill.addEventListener('click', () => {
        this.openVisitorPassModal();
      });
    }

    const dossierBtn = document.getElementById('hudDossierBtn');
    const exitDossierBtn = document.getElementById('exitDossierBtn');
    const dossierView = document.getElementById('executiveDossierView');

    if (dossierBtn && dossierView) {
      dossierBtn.addEventListener('click', () => {
        dossierView.classList.add('open');
        this.populateDossierContent();
        if (window.game) window.game.playSound('interact');
      });
    }

    if (exitDossierBtn && dossierView) {
      exitDossierBtn.addEventListener('click', () => {
        dossierView.classList.remove('open');
        if (window.game) window.game.playSound('blip');
      });
    }

    // Mobile Drawer Setup
    const mobileMenuBtn = document.getElementById('hudMobileMenuBtn');
    const drawerOverlay = document.getElementById('mobileDrawerOverlay');
    const closeDrawerBtn = document.getElementById('closeMobileDrawerBtn');

    const openDrawer = () => {
      if (drawerOverlay) {
        drawerOverlay.classList.add('active');
        document.body.classList.add('drawer-open');
        if (window.game) window.game.playSound('interact');
      }
    };

    const closeDrawer = () => {
      if (drawerOverlay) {
        drawerOverlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
      }
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) {
      const backdrop = drawerOverlay.querySelector('.mobile-drawer-backdrop');
      if (backdrop) backdrop.addEventListener('click', closeDrawer);
    }

    const drawerFastTravel = document.getElementById('mobileDrawerFastTravel');
    if (drawerFastTravel) {
      drawerFastTravel.addEventListener('click', () => {
        closeDrawer();
        this.openQuickTravelModal();
      });
    }

    const drawerDossier = document.getElementById('mobileDrawerDossier');
    if (drawerDossier && dossierView) {
      drawerDossier.addEventListener('click', () => {
        closeDrawer();
        dossierView.classList.add('open');
        this.populateDossierContent();
      });
    }

    const drawerTour = document.getElementById('mobileDrawerTour');
    if (drawerTour) {
      drawerTour.addEventListener('click', () => {
        closeDrawer();
        if (window.game) window.game.startGuidedTour();
      });
    }

    const drawerPass = document.getElementById('mobileDrawerPass');
    if (drawerPass) {
      drawerPass.addEventListener('click', () => {
        closeDrawer();
        this.openVisitorPassModal();
      });
    }

    const drawerAudio = document.getElementById('mobileDrawerAudio');
    const drawerAudioText = document.getElementById('mobileDrawerAudioText');
    if (drawerAudio) {
      drawerAudio.addEventListener('click', () => {
        if (!window.game) return;
        window.game.audioEnabled = !window.game.audioEnabled;
        if (drawerAudioText) drawerAudioText.textContent = window.game.audioEnabled ? 'Sound FX: ON' : 'Sound FX: OFF';
        this.showToast(window.game.audioEnabled ? '🔊 Sound Effects Enabled' : '🔇 Sound Effects Muted');
      });
    }

    const drawerBgm = document.getElementById('mobileDrawerBgm');
    const drawerBgmText = document.getElementById('mobileDrawerBgmText');
    if (drawerBgm) {
      drawerBgm.addEventListener('click', () => {
        if (!window.game) return;
        const isPlaying = window.game.toggleBgm();
        if (drawerBgmText) drawerBgmText.textContent = isPlaying ? 'Music: ON' : 'Music: OFF';
        this.showToast(isPlaying ? '🎶 Ambient Cyber BGM Playing' : '⏸️ BGM Paused');
      });
    }

    const drawerAdmin = document.getElementById('mobileDrawerAdmin');
    if (drawerAdmin) {
      drawerAdmin.addEventListener('click', () => {
        closeDrawer();
        this.openAdminPinModal();
      });
    }

    // Owner Admin Secret Trigger: Click AP logo in HUD 3 times
    const logoBadge = document.getElementById('hudLogoBadge');
    if (logoBadge) {
      let clickCount = 0;
      let clickTimer = null;
      logoBadge.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 3) {
          clickCount = 0;
          clearTimeout(clickTimer);
          this.openAdminPinModal();
        } else {
          clearTimeout(clickTimer);
          clickTimer = setTimeout(() => { clickCount = 0; }, 800);
        }
      });
    }

    // Live Visitors Pill click
    const livePill = document.getElementById('liveVisitorsPill');
    if (livePill) {
      livePill.addEventListener('click', () => {
        if (!window.game) return;
        const total = 1 + window.game.remotePlayers.size;
        const visitor = this.getVisitorPass();
        const myName = visitor && visitor.name ? visitor.name : 'You';
        const myRoom = window.game.roomConfigs[window.game.currentRoom]?.shortName || 'Office';
        let detail = `👥 <strong>${total} Visitor${total > 1 ? 's' : ''} Online:</strong><br/>• <strong>${myName}</strong> (You, in ${myRoom})`;
        window.game.remotePlayers.forEach(rp => {
          const rName = window.game.roomConfigs[rp.room]?.shortName || rp.room || 'Exploring';
          detail += `<br/>• <strong>${rp.name || 'Visitor'}</strong> (in ${rName})`;
        });
        this.showToast(detail, 4000);
      });
    }

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          if (!this.isMandatoryModal) {
            this.closeModal();
          }
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      // Secret Admin Hotkey: Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        this.openAdminPinModal();
        return;
      }

      if (e.key === 'Escape') {
        if (!this.isMandatoryModal) {
          this.closeModal();
        }
        this.closeDialogue();
        const dossierView = document.getElementById('executiveDossierView');
        if (dossierView && dossierView.classList.contains('open')) {
          dossierView.classList.remove('open');
        }
      }
    });
  }

  showTourBanner(visible = true) {
    const banner = document.getElementById('tourBanner');
    if (banner) {
      banner.classList.toggle('visible', visible);
    }
  }

  updateTourBannerText(text) {
    const textEl = document.getElementById('tourBannerText');
    if (textEl) {
      textEl.textContent = text;
    }
  }

  updateVisitorHudPill() {
    const badgeName = document.getElementById('visitorBadgeName');
    const visitor = this.getVisitorPass();
    if (badgeName) {
      if (visitor && visitor.name) {
        badgeName.textContent = `${visitor.name}`;
        badgeName.title = `Visitor Pass: ${visitor.name} (${visitor.badgeId})`;
      } else {
        badgeName.textContent = "Check-In Pass";
      }
    }
  }

  // ----------------------------------------------------
  // TYPEWRITER DIALOGUE SYSTEM
  // ----------------------------------------------------
  showDialogue(speaker, message, options = [], avatarType = 'eva') {
    if (!this.dialogueBox) return;
    this.dialogueSpeaker.textContent = speaker;
    this.dialogueText.textContent = '';
    this.dialogueOptions.innerHTML = '';

    const avatarImg = document.getElementById('dialogueSpeakerImg');
    if (avatarImg) {
      if (avatarType === 'avijit') {
        avatarImg.src = window.PORTFOLIO_DATA.profile.avatarImg;
        avatarImg.style.borderColor = 'var(--violet)';
      } else {
        avatarImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%2300f0ff"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5Z"/></svg>';
        avatarImg.style.borderColor = 'var(--cyan)';
      }
    }

    this.dialogueBox.classList.add('visible');
    document.body.classList.add('dialogue-open');

    let i = 0;
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);

    this.typewriterTimer = setInterval(() => {
      if (i < message.length) {
        this.dialogueText.textContent += message.charAt(i);
        i++;
        if (i % 3 === 0 && window.game) window.game.playSound('step');
      } else {
        clearInterval(this.typewriterTimer);
        this.renderDialogueOptions(options);
      }
    }, 18);
  }

  renderDialogueOptions(options) {
    this.dialogueOptions.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-opt-btn';
      btn.innerHTML = `<span class="opt-tag">${opt.tag || 'OPTION'}</span> <i class="${opt.icon || 'fas fa-arrow-right'}"></i> <span>${opt.text}</span>`;
      btn.addEventListener('click', () => {
        if (window.game) window.game.playSound('interact');
        opt.action();
      });
      this.dialogueOptions.appendChild(btn);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'dialogue-opt-btn opt-close';
    closeBtn.innerHTML = '<span class="opt-tag">ESC</span> <i class="fas fa-xmark"></i> <span>Close Dialogue</span>';
    closeBtn.addEventListener('click', () => {
      if (window.game) window.game.playSound('blip');
      this.closeDialogue();
    });
    this.dialogueOptions.appendChild(closeBtn);
  }

  closeDialogue() {
    if (this.dialogueBox) this.dialogueBox.classList.remove('visible');
    document.body.classList.remove('dialogue-open');
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
  }

  // ----------------------------------------------------
  // RECEPTIONIST EVA DIALOGUE TREE
  // ----------------------------------------------------
  openReceptionDialogue() {
    const visitor = this.getVisitorPass();
    const visitorName = visitor ? visitor.name : "esteemed guest";
    const locSnippet = visitor && visitor.location ? ` visiting us from ${visitor.location}` : "";
    const badgeSnippet = visitor && visitor.badgeId ? ` (Pass #${visitor.badgeId})` : "";

    this.showDialogue(
      "EVA // AI Host & Security",
      `Welcome to Avijit AI Labs Headquarters, ${visitorName}! 🏢 Glad to have you${locSnippet}${badgeSnippet}. Avijit is currently in his Corner Office researching deep learning acceleration kernels. All 6 wings of our lab are accessible. How would you like to explore?`,
      [
        {
          tag: "FREE-ROAM",
          text: "Explore the Office freely (WASD / Click to move)",
          icon: "fas fa-gamepad",
          action: () => {
            this.closeDialogue();
            this.showToast("🎮 Free-roam active! Use WASD / Arrow Keys or Click anywhere to walk.");
          }
        },
        {
          tag: "AUTOPILOT",
          text: "Start the Automated Guided VIP Tour",
          icon: "fas fa-route",
          action: () => {
            this.closeDialogue();
            if (window.game) window.game.startGuidedTour();
          }
        },
        {
          tag: "PASS",
          text: "Inspect / Manage My Security Visitor Pass",
          icon: "fas fa-id-badge",
          action: () => {
            this.closeDialogue();
            this.openVisitorPassModal();
          }
        },
        {
          tag: "DOSSIER",
          text: "Open Avijit's Executive Dossier (Classic Portfolio)",
          icon: "fas fa-folder-open",
          action: () => {
            this.closeDialogue();
            document.getElementById('executiveDossierView').classList.add('open');
            this.populateDossierContent();
          }
        },
        {
          tag: "OFFICE",
          text: "Take me directly to Avijit's Corner Office",
          icon: "fas fa-user-astronaut",
          action: () => {
            this.closeDialogue();
            if (window.game) window.game.teleportToRoom("executive_office");
          }
        },
        {
          tag: "TELEPORT",
          text: "Fast Travel to a specific department",
          icon: "fas fa-map-location-dot",
          action: () => {
            this.closeDialogue();
            this.openQuickTravelModal();
          }
        }
      ],
      'eva'
    );
  }

  // ----------------------------------------------------
  // AVIJIT PAKHIRA DIALOGUE TREE
  // ----------------------------------------------------
  openAvijitDialogue() {
    const p = window.PORTFOLIO_DATA.profile;
    this.showDialogue(
      "Avijit Pakhira // Lead AI Architect",
      `Welcome to my corner office! I'm ${p.name}, AI/ML Engineer and author of 2 Springer publications. Maintaining a ${p.cgpa} at JIS University while productionizing deep vision pipelines. What would you like to discuss?`,
      [
        {
          tag: "HIRE",
          text: "I want to discuss hiring / an open AI/ML role",
          icon: "fas fa-briefcase",
          action: () => {
            this.closeDialogue();
            this.openContactModal();
          }
        },
        {
          tag: "RESUME",
          text: "Fast-print your official PDF Resume",
          icon: "fas fa-file-pdf",
          action: () => {
            this.closeDialogue();
            this.openResumeModal();
          }
        },
        {
          tag: "RESEARCH",
          text: "Tell me about your Springer publications",
          icon: "fas fa-flask",
          action: () => {
            this.closeDialogue();
            this.openResearchModal("vedic_math");
          }
        },
        {
          tag: "PROJECTS",
          text: "Inspect all 16 engineered software systems",
          icon: "fas fa-laptop-code",
          action: () => {
            this.closeDialogue();
            this.openProjectsListModal();
          }
        },
        {
          tag: "ADMIN",
          text: "Owner Portal: View Registered Visitors & Leads",
          icon: "fas fa-shield-halved",
          action: () => {
            this.closeDialogue();
            this.openAdminPinModal();
          }
        }
      ],
      'avijit'
    );
  }

  // ----------------------------------------------------
  // MODAL BUILDER & HELPERS
  // ----------------------------------------------------
  openModal(html, isMandatory = false) {
    if (!this.modalOverlay || !this.modalContent) return;
    this.isMandatoryModal = isMandatory;
    this.modalContent.innerHTML = html;
    this.modalOverlay.classList.add('visible');
    document.body.classList.add('modal-open');
    if (window.game) {
      window.game.playSound('interact');
      if (isMandatory) window.game.locked = true;
    }

    const closeBtn = this.modalContent.querySelector('.modal-close-btn');
    if (closeBtn) {
      if (isMandatory) {
        closeBtn.style.display = 'none';
      } else {
        closeBtn.addEventListener('click', () => this.closeModal());
      }
    }
  }

  closeModal() {
    if (this.isMandatoryModal) return;
    if (!this.modalOverlay) return;
    this.modalOverlay.classList.remove('visible');
    document.body.classList.remove('modal-open');
    if (window.game) {
      window.game.playSound('blip');
      window.game.locked = false;
    }
  }

  forceCloseModal() {
    this.isMandatoryModal = false;
    if (!this.modalOverlay) return;
    this.modalOverlay.classList.remove('visible');
    document.body.classList.remove('modal-open');
    if (window.game) {
      window.game.playSound('blip');
      window.game.locked = false;
    }
  }

  // ----------------------------------------------------
  // SPECIFIC MODALS
  // ----------------------------------------------------
  openProjectModal(projectId) {
    const proj = window.PORTFOLIO_DATA.projects.find(p => p.id === projectId);
    if (!proj) return;

    if (window.game) {
      window.game.stats.itemsInteracted.add(proj.id);
      this.updateQuestTracker();
    }

    const techTags = proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn" title="Close"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat" style="color:${proj.color}; border-color:${proj.color};"><i class="fas fa-cubes"></i> ${proj.category}</span>
          <span class="badge-num">SYSTEM // ${proj.num}</span>
        </div>
        <h2 class="modal-title">${proj.title}</h2>
        <p class="modal-desc">${proj.fullDesc}</p>
        
        <div class="code-terminal-box">
          <div class="code-term-top">
            <span class="term-dot red"></span>
            <span class="term-dot yellow"></span>
            <span class="term-dot green"></span>
            <span class="term-title">${proj.id}.py // Architecture Spec</span>
          </div>
          <pre><code># Model Registry: ${proj.badge}
from avijit_core import NeuralPipeline, ProductionEngine

engine = ProductionEngine(model="${proj.title}", status="DEPLOYED")
print(f"Latency: Optimized | Tech: ${proj.tech.slice(0, 3).join(', ')}")</code></pre>
        </div>

        <div class="modal-section-label mt-4"><i class="fas fa-code"></i> Production Frameworks</div>
        <div class="modal-tech-row">${techTags}</div>

        <div class="modal-actions-row">
          <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="btn-game-primary">
            <i class="fab fa-github"></i> Open GitHub Source Code
          </a>
          <button class="btn-game-secondary modal-close-btn">
            <i class="fas fa-check"></i> Continue Exploring
          </button>
        </div>
      </div>
    `);
  }

  openResearchModal(researchId) {
    const res = window.PORTFOLIO_DATA.research.find(r => r.id === researchId);
    if (!res) return;

    if (window.game) {
      window.game.stats.itemsInteracted.add(res.id);
      this.updateQuestTracker();
    }

    const tagSpans = res.tags.map(t => `<span class="tech-tag">${t}</span>`).join('');

    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat text-amber"><i class="fas fa-scroll"></i> ${res.type}</span>
          <span class="badge-num">${res.year}</span>
        </div>
        <h2 class="modal-title">${res.title}</h2>
        <div class="modal-venue"><i class="fas fa-book-bookmark text-cyan"></i> ${res.venue}</div>
        
        <div class="modal-section-label"><i class="fas fa-file-lines"></i> Abstract & Empirical Contribution</div>
        <p class="modal-desc">${res.abstract}</p>

        <div class="modal-section-label"><i class="fas fa-tags"></i> Academic Taxonomy</div>
        <div class="modal-tech-row">${tagSpans}</div>

        <div class="modal-actions-row">
          <a href="mailto:avijitpakhira2807@gmail.com?subject=Springer Paper Inquiry: ${encodeURIComponent(res.title)}" class="btn-game-primary">
            <i class="fas fa-envelope"></i> Request Full-Text Preprint
          </a>
          <button class="btn-game-secondary modal-close-btn">
            <i class="fas fa-check"></i> Close
          </button>
        </div>
      </div>
    `);
  }

  openEducationModal() {
    const eduList = window.PORTFOLIO_DATA.education.map(e => `
      <div class="edu-card-item">
        <div class="edu-card-top">
          <h4>${e.degree}</h4>
          <span class="edu-period">${e.period}</span>
        </div>
        <div class="edu-inst"><i class="fas fa-building-columns text-cyan"></i> ${e.institution}</div>
        <div class="edu-score-pill"><i class="fas fa-trophy text-amber"></i> ${e.score} · <strong>${e.status}</strong></div>
        ${e.coursework ? `<div class="edu-coursework">${e.coursework}</div>` : ''}
      </div>
    `).join('');

    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        
        <div class="trophy-showcase-box">
          <div class="trophy-cup-glow">
            <i class="fas fa-trophy"></i>
          </div>
          <div>
            <h3>The 9.41 CGPA Golden Cup</h3>
            <p>JIS University · Top Rank Honors in CSE (Artificial Intelligence & Machine Learning)</p>
          </div>
        </div>

        <h3 class="modal-subtitle mt-4"><i class="fas fa-graduation-cap text-cyan"></i> Academic Milestones</h3>
        <div class="edu-grid-modal">${eduList}</div>
        <div class="modal-actions-row">
          <button class="btn-game-primary modal-close-btn"><i class="fas fa-check"></i> Continue Tour</button>
        </div>
      </div>
    `);
  }

  openCertificationsModal() {
    const certItems = window.PORTFOLIO_DATA.certifications.map(c => `
      <div class="cert-modal-card">
        <div class="cert-icon-circle" style="color:${c.color}; border-color:${c.color};">
          <i class="fas fa-${c.icon}"></i>
        </div>
        <div class="cert-modal-info">
          <h4>${c.title}</h4>
          <span>${c.issuer} · ID: <strong>${c.id}</strong></span>
        </div>
      </div>
    `).join('');

    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-award"></i> PROFESSIONAL CREDENTIALS</span>
          <span class="badge-num">6 VERIFIED LICENSES</span>
        </div>
        <h2 class="modal-title">Industry Certifications & Professional Licenses</h2>
        <div class="certs-grid-modal">${certItems}</div>
        <div class="modal-actions-row">
          <button class="btn-game-primary modal-close-btn"><i class="fas fa-check"></i> Close</button>
        </div>
      </div>
    `);
  }

  openExperienceModal() {
    const expItems = window.PORTFOLIO_DATA.experience.map(exp => `
      <div class="exp-modal-card">
        <div class="exp-card-header">
          <div>
            <h4>${exp.role}</h4>
            <div class="exp-company"><i class="fas fa-building text-cyan"></i> ${exp.company} <span class="exp-badge-pill">${exp.badge}</span></div>
          </div>
          <span class="exp-year">${exp.year}</span>
        </div>
        <p class="exp-desc">${exp.description}</p>
        <div class="exp-tags">${exp.skills.map(s => `<span class="tech-tag">${s}</span>`).join('')}</div>
      </div>
    `).join('');

    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-briefcase"></i> CAREER TRAJECTORY</span>
          <span class="badge-num">3 INDUSTRY INTERNSHIPS</span>
        </div>
        <h2 class="modal-title">Industrial Experience & Engineering Internships</h2>
        <div class="exp-grid-modal">${expItems}</div>
        <div class="modal-actions-row">
          <button class="btn-game-primary modal-close-btn"><i class="fas fa-check"></i> Close</button>
        </div>
      </div>
    `);
  }

  openProjectsListModal() {
    const projs = window.PORTFOLIO_DATA.projects.map(p => `
      <div class="proj-compact-row" onclick="window.OFFICE_UI.openProjectModal('${p.id}')">
        <span class="p-num" style="color:${p.color}">${p.num}</span>
        <div class="p-info">
          <h5>${p.title}</h5>
          <p>${p.shortDesc}</p>
        </div>
        <i class="fas fa-arrow-right p-arrow"></i>
      </div>
    `).join('');

    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-chalkboard"></i> ENGINEERING REPOSITORY</span>
          <span class="badge-num">16 PRODUCTION SYSTEMS</span>
        </div>
        <h2 class="modal-title">All Workstations & Engineered Repositories</h2>
        <div class="proj-compact-list">${projs}</div>
      </div>
    `);
  }

  // ----------------------------------------------------
  // VISITOR REGISTRATION & DATABASE PERSISTENCE ENGINE
  // ----------------------------------------------------
  getVisitorPass() {
    try {
      const stored = localStorage.getItem('office_visitor_pass');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }

  saveVisitorPassLocally(visitor) {
    try {
      localStorage.setItem('office_visitor_pass', JSON.stringify(visitor));
      let db = this.getLocalVisitorsDb();
      db = db.filter(v => v.email.toLowerCase() !== visitor.email.toLowerCase());
      db.unshift(visitor);
      localStorage.setItem('office_visitors_db', JSON.stringify(db));
      if (this.visitorsBc) {
        this.visitorsBc.postMessage({ type: 'NEW_VISITOR', visitor });
      }
    } catch (e) {}
  }

  getLocalVisitorsDb() {
    try {
      const rawDb = localStorage.getItem('office_visitors_db');
      if (rawDb) return JSON.parse(rawDb);
    } catch (e) {}
    return [];
  }

  async persistVisitorToDatabase(visitor) {
    try {
      const res = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitor)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn("Serverless DB offline or network error:", err);
      const localDb = this.getLocalVisitorsDb();
      const existingEmail = localDb.find(v => v.email.toLowerCase() === visitor.email.toLowerCase());
      if (existingEmail && existingEmail.name.toLowerCase() !== visitor.name.toLowerCase()) {
        return {
          success: false,
          code: 'EMAIL_NAME_MISMATCH',
          error: `⚠️ Yeh email pehle se '${existingEmail.name}' ke naam par registered hai! Ek email se sirf wahi user enter kar sakta hai.`
        };
      }
      return { success: true, visitor };
    }
  }

  openVisitorRegistrationModal(isMandatory = false) {
    const existing = this.getVisitorPass();
    const defaultName = existing ? existing.name : '';
    const defaultLoc = existing ? existing.location : '';
    const defaultEmail = existing ? existing.email : '';

    this.openModal(`
      <div class="modal-card text-center visitor-form-container">
        ${!isMandatory ? '<button class="modal-close-btn" title="Close"><i class="fas fa-xmark"></i></button>' : ''}
        
        <div class="resume-icon-ring"><i class="fas fa-id-card-clip"></i></div>
        <h2 class="modal-title">Security Check-In & Visitor Access Pass</h2>
        <p class="modal-desc">Please register your visitor credentials to gain Level-05 clearance and explore all 6 research sectors of Avijit AI Labs.</p>

        <div class="visitor-security-notice">
          <i class="fas fa-shield-halved text-cyan"></i>
          <span>Database Protected: Each email is strictly bound to 1 visitor identity. Your credentials are securely registered.</span>
        </div>

        <form id="visitorCheckinForm" onsubmit="return false;" novalidate>
          <div class="visitor-form-group">
            <label class="visitor-form-label" for="vName"><i class="fas fa-user"></i> Full Name *</label>
            <input type="text" id="vName" class="visitor-form-input" placeholder="e.g. John Doe / Sarah Connor" value="${defaultName}" required autocomplete="name" />
            <div id="vNameError" class="form-field-error"><i class="fas fa-circle-exclamation"></i> Please enter your name (at least 2 letters).</div>
          </div>

          <div class="visitor-form-group">
            <label class="visitor-form-label" for="vLocation"><i class="fas fa-map-location-dot"></i> Your Location (City, Country) *</label>
            <input type="text" id="vLocation" class="visitor-form-input" placeholder="e.g. Kolkata, India / London, UK" value="${defaultLoc}" required autocomplete="address-level2" />
            <div id="vLocationError" class="form-field-error"><i class="fas fa-circle-exclamation"></i> Please enter your city or location (at least 2 characters).</div>
          </div>

          <div class="visitor-form-group">
            <label class="visitor-form-label" for="vEmail"><i class="fas fa-envelope"></i> Email Address *</label>
            <input type="email" id="vEmail" class="visitor-form-input" placeholder="e.g. visitor@company.com" value="${defaultEmail}" required autocomplete="email" />
            <div id="vEmailError" class="form-field-error"><i class="fas fa-circle-exclamation"></i> Please enter a valid email address.</div>
          </div>

          <button type="submit" id="vSubmitBtn" class="btn-visitor-submit mt-4">
            <i class="fas fa-id-badge"></i> Issue Security Pass & Enter Office
          </button>
        </form>
      </div>
    `, isMandatory);

    const form = document.getElementById('visitorCheckinForm');
    const nameInput = document.getElementById('vName');
    const locInput = document.getElementById('vLocation');
    const emailInput = document.getElementById('vEmail');
    const submitBtn = document.getElementById('vSubmitBtn');

    const nameError = document.getElementById('vNameError');
    const locError = document.getElementById('vLocationError');
    const emailError = document.getElementById('vEmailError');

    const validateInputs = () => {
      let valid = true;
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const locVal = locInput ? locInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (nameVal.length < 2) {
        if (nameError) {
          nameError.innerHTML = '<i class="fas fa-circle-exclamation"></i> Please enter your name (at least 2 letters).';
          nameError.classList.add('visible');
        }
        if (nameInput) nameInput.classList.add('input-error');
        valid = false;
      } else {
        if (nameError) nameError.classList.remove('visible');
        if (nameInput) nameInput.classList.remove('input-error');
      }

      if (locVal.length < 2) {
        if (locError) {
          locError.innerHTML = '<i class="fas fa-circle-exclamation"></i> Please enter your city or location (at least 2 characters).';
          locError.classList.add('visible');
        }
        if (locInput) locInput.classList.add('input-error');
        valid = false;
      } else {
        if (locError) locError.classList.remove('visible');
        if (locInput) locInput.classList.remove('input-error');
      }

      if (!emailRegex.test(emailVal)) {
        if (emailError) {
          emailError.innerHTML = '<i class="fas fa-circle-exclamation"></i> Please enter a valid email address.';
          emailError.classList.add('visible');
        }
        if (emailInput) emailInput.classList.add('input-error');
        valid = false;
      } else {
        if (emailError) emailError.classList.remove('visible');
        if (emailInput) emailInput.classList.remove('input-error');
      }

      return valid ? { name: nameVal, location: locVal, email: emailVal } : null;
    };

    [nameInput, locInput, emailInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          inp.classList.remove('input-error');
          const errEl = document.getElementById(inp.id + 'Error');
          if (errEl) errEl.classList.remove('visible');
        });
      }
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = validateInputs();
        if (!data) {
          if (window.game) window.game.playSound('blip');
          return;
        }

        // Strict 1-Email = 1-User Validation Rules
        const localDb = this.getLocalVisitorsDb();
        const existingEmail = localDb.find(v => v.email.toLowerCase() === data.email.toLowerCase());

        // Rule 1: Existing Email must match existing Name
        if (existingEmail && existingEmail.name.toLowerCase() !== data.name.toLowerCase()) {
          if (emailError) {
            emailError.innerHTML = `<i class="fas fa-triangle-exclamation"></i> This email is already registered to <strong>"${existingEmail.name}"</strong>. The name must match to sign in, or please use your own unique email.`;
            emailError.classList.add('visible');
          }
          if (emailInput) emailInput.classList.add('input-error');
          if (window.game) window.game.playSound('blip');
          return;
        }

        // Rule 2: Existing Name cannot be used with a different email
        const existingName = localDb.find(v => v.name.toLowerCase() === data.name.toLowerCase());
        if (existingName && existingName.email.toLowerCase() !== data.email.toLowerCase()) {
          if (nameError) {
            nameError.innerHTML = `<i class="fas fa-triangle-exclamation"></i> A visitor named <strong>"${existingName.name}"</strong> is already registered under another email. Please use your registered email, or enter your full distinct name.`;
            nameError.classList.add('visible');
          }
          if (nameInput) nameInput.classList.add('input-error');
          if (window.game) window.game.playSound('blip');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Registering in Database...';
        }

        const badgeId = existingEmail ? existingEmail.badgeId : `AP-VIS-${Math.floor(1000 + Math.random() * 9000)}`;
        const visitorRecord = {
          ...data,
          badgeId: badgeId,
          registeredAt: new Date().toISOString()
        };

        // Submit to database API
        const serverRes = await this.persistVisitorToDatabase(visitorRecord);

        // Check if server rejected duplicate email/name
        if (serverRes && serverRes.success === false) {
          if (serverRes.code === 'EMAIL_NAME_MISMATCH' && emailError) {
            emailError.innerHTML = `<i class="fas fa-triangle-exclamation"></i> ${serverRes.error}`;
            emailError.classList.add('visible');
            if (emailInput) emailInput.classList.add('input-error');
          } else if (nameError) {
            nameError.innerHTML = `<i class="fas fa-triangle-exclamation"></i> ${serverRes.error || 'Registration rejected by database.'}`;
            nameError.classList.add('visible');
            if (nameInput) nameInput.classList.add('input-error');
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-id-badge"></i> Issue Security Pass & Enter Office';
          }
          if (window.game) window.game.playSound('blip');
          return;
        }

        const finalRecord = serverRes && serverRes.visitor ? serverRes.visitor : visitorRecord;
        this.saveVisitorPassLocally(finalRecord);

        if (window.game) {
          window.game.playSound('achievement');
          window.game.broadcastMyPosition(true);
        }

        this.updateVisitorHudPill();
        this.showIssuedBadgeCard(finalRecord);
      });
    }
  }

  showIssuedBadgeCard(visitor) {
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    this.openModal(`
      <div class="modal-card text-center">
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-shield-check text-emerald"></i> CREDENTIALS VERIFIED</span>
          <span class="badge-num">${visitor.badgeId}</span>
        </div>

        <h2 class="modal-title">Access Granted · Welcome, ${visitor.name}!</h2>
        <p class="modal-desc">Your credentials have been securely stored in the visitor database. Full Level-05 clearance is granted.</p>

        <div class="visitor-badge-card">
          <div class="badge-top-row">
            <span class="badge-co-name">AVIJIT AI LABS // HQ</span>
            <span class="badge-clearance"><i class="fas fa-unlock"></i> LEVEL 05 CLEARANCE</span>
          </div>

          <div class="badge-user-name">${visitor.name}</div>
          <div class="badge-user-loc"><i class="fas fa-location-dot text-cyan"></i> ${visitor.location}</div>

          <div class="badge-meta-grid">
            <div class="badge-meta-item">
              <label>VISITOR ID</label>
              <span>${visitor.badgeId}</span>
            </div>
            <div class="badge-meta-item">
              <label>ISSUED DATE</label>
              <span>${dateFormatted}</span>
            </div>
            <div class="badge-meta-item">
              <label>REGISTERED EMAIL</label>
              <span>${visitor.email}</span>
            </div>
            <div class="badge-meta-item">
              <label>HOST ARCHITECT</label>
              <span class="text-violet">AVIJIT PAKHIRA</span>
            </div>
          </div>

          <div class="badge-barcode">
            <div class="bars"></div>
            <span>AUTHENTICATED // DATABASE SYNCED</span>
          </div>
        </div>

        <div class="modal-actions-row justify-center mt-4">
          <button id="enterOfficeWithBadgeBtn" class="btn-game-primary"><i class="fas fa-door-open"></i> Enter & Explore The Office</button>
        </div>
      </div>
    `, true);

    const enterBtn = document.getElementById('enterOfficeWithBadgeBtn');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        this.forceCloseModal();
        if (window.game) {
          window.game.locked = false;
          window.game.playSound('achievement');
          window.game.broadcastMyPosition(true);
        }
        this.showToast(`🏢 Level-05 Access Active! Welcome to the lab, ${visitor.name}!`);
      });
    }
  }

  // ----------------------------------------------------
  // VISITOR SECURITY PASS (PRIVACY PROTECTED - NO PUBLIC LIST)
  // ----------------------------------------------------
  openVisitorPassModal() {
    const visitor = this.getVisitorPass();
    if (!visitor) {
      this.openVisitorRegistrationModal(false);
      return;
    }

    const dateFormatted = new Date(visitor.registeredAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    this.openModal(`
      <div class="modal-card text-center">
        <button class="modal-close-btn" title="Close"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-id-badge text-cyan"></i> ACTIVE SECURITY PASS</span>
          <span class="badge-num">${visitor.badgeId}</span>
        </div>

        <h2 class="modal-title">Visitor Pass Credentials</h2>
        <p class="modal-desc">This digital NFC pass grants you unlimited access to explore all 6 sectors of Avijit AI Labs.</p>

        <div class="visitor-badge-card">
          <div class="badge-top-row">
            <span class="badge-co-name">AVIJIT AI LABS // HQ</span>
            <span class="badge-clearance"><i class="fas fa-unlock"></i> LEVEL 05 CLEARANCE</span>
          </div>

          <div class="badge-user-name">${visitor.name}</div>
          <div class="badge-user-loc"><i class="fas fa-location-dot text-cyan"></i> ${visitor.location}</div>

          <div class="badge-meta-grid">
            <div class="badge-meta-item">
              <label>VISITOR ID</label>
              <span>${visitor.badgeId}</span>
            </div>
            <div class="badge-meta-item">
              <label>ISSUED DATE</label>
              <span>${dateFormatted}</span>
            </div>
            <div class="badge-meta-item">
              <label>EMAIL</label>
              <span>${visitor.email}</span>
            </div>
            <div class="badge-meta-item">
              <label>HOST ARCHITECT</label>
              <span class="text-violet">AVIJIT PAKHIRA</span>
            </div>
          </div>

          <div class="badge-barcode">
            <div class="bars"></div>
            <span>SEC-ID: ${visitor.badgeId}-VERIFIED</span>
          </div>
        </div>

        <!-- Strict Privacy: Regular visitors only see their own pass. Admin link is password locked -->
        <div class="modal-actions-row justify-center mt-3" style="gap: 0.8rem; display: flex; flex-wrap: wrap; align-items: center;">
          <button id="editVisitorPassBtn" class="hud-btn"><i class="fas fa-pen-to-square"></i> Update Pass</button>
          <button class="btn-game-primary modal-close-btn"><i class="fas fa-gamepad"></i> Continue Exploring</button>
          <button id="adminLoginLink" class="hud-btn" style="opacity: 0.55;" title="Owner Admin Access"><i class="fas fa-lock"></i> Admin</button>
        </div>
      </div>
    `);

    const editBtn = document.getElementById('editVisitorPassBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.openVisitorRegistrationModal(false);
      });
    }

    const adminBtn = document.getElementById('adminLoginLink');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => {
        this.openAdminPinModal();
      });
    }
  }

  // ----------------------------------------------------
  // ADMIN AUTHENTICATION (PIN 9410 - OWNER ONLY)
  // ----------------------------------------------------
  openAdminPinModal() {
    this.openModal(`
      <div class="modal-card text-center" style="max-width: 420px;">
        <button class="modal-close-btn" title="Close"><i class="fas fa-xmark"></i></button>
        <div class="resume-icon-ring"><i class="fas fa-shield-halved text-amber"></i></div>
        <h2 class="modal-title">Avijit AI Labs // Admin Access</h2>
        <p class="modal-desc">Enter your 4-digit security PIN to access the full visitor database and export registered leads.</p>

        <form id="adminPinForm" onsubmit="return false;" style="margin-top: 1.25rem;">
          <div class="visitor-form-group" style="text-align: center; margin-bottom: 1.5rem;">
            <input type="password" id="adminPinInput" class="visitor-form-input admin-pin-input" placeholder="••••" maxlength="6" autofocus required />
            <div id="adminPinError" class="form-field-error justify-center"><i class="fas fa-triangle-exclamation"></i> Incorrect PIN. Access Denied.</div>
          </div>

          <button type="submit" id="adminPinSubmitBtn" class="btn-game-primary" style="width: 100%;">
            <i class="fas fa-unlock"></i> Authenticate & View Leads
          </button>
        </form>
      </div>
    `);

    const pinInput = document.getElementById('adminPinInput');
    const pinForm = document.getElementById('adminPinForm');
    const pinError = document.getElementById('adminPinError');
    const submitBtn = document.getElementById('adminPinSubmitBtn');

    if (pinForm) {
      pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = pinInput ? pinInput.value.trim() : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Verifying...';
        }

        // Verify PIN (default 9410 - Avijit's 9.41 CGPA)
        if (pin === '9410') {
          let visitors = [];
          try {
            const res = await fetch('/api/visitors?adminKey=9410');
            if (res.ok) {
              const json = await res.json();
              if (json.visitors) visitors = json.visitors;
            }
          } catch (err) {}

          const localList = this.getLocalVisitorsDb();
          localList.forEach(lv => {
            if (!visitors.some(v => v.email === lv.email)) {
              visitors.push(lv);
            }
          });

          if (window.game) window.game.playSound('achievement');
          this.showToast("🔓 Admin Authenticated! Loading visitor records...");
          this.openVisitorsDirectoryModal(visitors, true);
        } else {
          if (pinError) pinError.classList.add('visible');
          if (pinInput) pinInput.classList.add('input-error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-unlock"></i> Authenticate & View Leads';
          }
          if (window.game) window.game.playSound('blip');
        }
      });
    }
  }

  // ----------------------------------------------------
  // VISITOR DATABASE LEADS DIRECTORY (ADMIN ONLY)
  // ----------------------------------------------------
  openVisitorsDirectoryModal(visitors = [], isAdmin = false) {
    if (!isAdmin) {
      this.openAdminPinModal();
      return;
    }

    const renderRows = (list) => {
      if (!list || list.length === 0) {
        return `<tr><td colspan="5" class="text-center text-dim" style="padding: 2rem;">No visitors match your search.</td></tr>`;
      }
      return list.map((v, i) => {
        const d = v.registeredAt ? new Date(v.registeredAt) : new Date();
        const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        return `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 0.65rem 0.5rem;"><span class="badge-clearance">#${v.badgeId || (i+1)}</span></td>
            <td style="padding: 0.65rem 0.5rem;"><strong class="text-white">${v.name}</strong></td>
            <td style="padding: 0.65rem 0.5rem; color: var(--text-dim);"><i class="fas fa-location-dot text-cyan" style="font-size: 0.75rem;"></i> ${v.location}</td>
            <td style="padding: 0.65rem 0.5rem;"><a href="mailto:${v.email}" class="text-cyan">${v.email}</a></td>
            <td style="padding: 0.65rem 0.5rem; color: var(--text-dim); font-size: 0.75rem;">${dateStr} <span style="opacity: 0.6;">${timeStr}</span></td>
          </tr>
        `;
      }).join('');
    };

    this.openModal(`
      <div class="modal-card" style="max-width: 760px; width: 95%;">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-database text-cyan"></i> OWNER ADMIN PORTAL</span>
          <span class="badge-num" id="visitorCountBadge">${visitors.length} PAST REGISTERED VISITORS</span>
        </div>
        <h2 class="modal-title">Avijit AI Labs — Visitor Master Registry</h2>
        <p class="modal-desc">Confidential database records of all visitors who have registered since inception.</p>

        <div style="margin: 1rem 0 0.5rem 0; display: flex; gap: 0.5rem;">
          <input type="text" id="visitorSearchInput" class="visitor-form-input" placeholder="🔍 Search past records by name, email, or city..." style="width: 100%; font-size: 0.85rem;" />
        </div>

        <div style="overflow-x: auto; margin: 0.75rem 0 1.25rem 0; max-height: 340px; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; background: rgba(10,15,30,0.6);">
          <table style="width: 100%; border-collapse: collapse; font-family: var(--font-body); font-size: 0.85rem; text-align: left;">
            <thead>
              <tr style="background: rgba(15,23,42,0.95); border-bottom: 1px solid rgba(255,255,255,0.15); color: var(--cyan); font-family: var(--font-mono); font-size: 0.75rem; position: sticky; top: 0; z-index: 2;">
                <th style="padding: 0.7rem 0.5rem;">BADGE</th>
                <th style="padding: 0.7rem 0.5rem;">NAME</th>
                <th style="padding: 0.7rem 0.5rem;">LOCATION</th>
                <th style="padding: 0.7rem 0.5rem;">EMAIL</th>
                <th style="padding: 0.7rem 0.5rem;">REGISTERED DATE & TIME</th>
              </tr>
            </thead>
            <tbody id="visitorTableBody">${renderRows(visitors)}</tbody>
          </table>
        </div>

        <div class="modal-actions-row justify-center mt-3" style="gap: 0.8rem; display: flex; flex-wrap: wrap;">
          <button id="exportCsvBtn" class="btn-game-primary"><i class="fas fa-file-csv"></i> Export All Leads to CSV</button>
          <a href="/api/visitors?adminKey=9410" target="_blank" class="hud-btn" style="text-decoration: none;"><i class="fas fa-code"></i> View Raw JSON</a>
          <button class="hud-btn modal-close-btn"><i class="fas fa-xmark"></i> Close Registry</button>
        </div>
      </div>
    `);

    // Live Instant Search Filter
    const searchInput = document.getElementById('visitorSearchInput');
    const tableBody = document.getElementById('visitorTableBody');
    const countBadge = document.getElementById('visitorCountBadge');
    if (searchInput && tableBody) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = query
          ? visitors.filter(v =>
              (v.name && v.name.toLowerCase().includes(query)) ||
              (v.email && v.email.toLowerCase().includes(query)) ||
              (v.location && v.location.toLowerCase().includes(query)) ||
              (v.badgeId && v.badgeId.toLowerCase().includes(query))
            )
          : visitors;
        tableBody.innerHTML = renderRows(filtered);
        if (countBadge) {
          countBadge.textContent = query ? `${filtered.length} of ${visitors.length} RECORDS MATCHED` : `${visitors.length} PAST REGISTERED VISITORS`;
        }
      });
    }

    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn && visitors.length > 0) {
      exportBtn.addEventListener('click', () => {
        const headers = ["Badge ID", "Full Name", "Location", "Email Address", "Registration Timestamp"];
        const rows = visitors.map(v => [
          `"${v.badgeId || ''}"`,
          `"${v.name || ''}"`,
          `"${v.location || ''}"`,
          `"${v.email || ''}"`,
          `"${v.registeredAt || ''}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `avijit_ai_labs_registered_leads_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast("📊 Complete visitor leads exported to CSV!");
      });
    }
  }

  // ----------------------------------------------------
  // FAST TRAVEL TELEPORTER
  // ----------------------------------------------------
  openQuickTravelModal() {
    if (!window.game) return;
    const roomsList = window.game.rooms || [];
    const roomButtons = roomsList.map(r => `
      <button class="quick-room-btn" onclick="window.game.teleportToRoom('${r.id}'); window.OFFICE_UI.closeModal();">
        <div class="qr-header">
          <span class="qr-title" style="color:${r.accent}">${r.name}</span>
        </div>
        <p class="qr-desc">${r.description}</p>
        <span class="qr-action"><i class="fas fa-bolt"></i> Teleport to ${r.shortName}</span>
      </button>
    `).join('');

    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-map-location-dot"></i> FAST TRAVEL TELEPORTER</span>
          <span class="badge-num">${roomsList.length} SECTORS</span>
        </div>
        <h2 class="modal-title">Office Directory & Instant Room Teleporter</h2>
        <div class="quick-rooms-grid">${roomButtons}</div>
      </div>
    `);
  }

  openResumeModal() {
    const p = window.PORTFOLIO_DATA.profile;
    this.openModal(`
      <div class="modal-card text-center">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="resume-icon-ring"><i class="fas fa-file-pdf"></i></div>
        <h2 class="modal-title">Official Resume // Avijit Pakhira</h2>
        <p class="modal-desc">AI/ML Engineer & Researcher · 9.41 CGPA · Springer Author · 16 Projects</p>
        
        <div class="resume-preview-box">
          <div class="r-row"><i class="fas fa-user text-cyan"></i> <strong>Candidate:</strong> Avijit Pakhira (B.Tech AI & ML, JIS University)</div>
          <div class="r-row"><i class="fas fa-award text-amber"></i> <strong>Scholastic Standing:</strong> 9.41 / 10.0 CGPA (Top Rank)</div>
          <div class="r-row"><i class="fas fa-scroll text-violet"></i> <strong>Publications:</strong> 2 Springer Conference Papers</div>
          <div class="r-row"><i class="fas fa-code text-emerald"></i> <strong>Core Tech:</strong> PyTorch, OpenCV, YOLO, Python, Django, GenAI, Rest APIs</div>
        </div>

        <div class="modal-actions-row justify-center mt-4">
          <a href="${p.resumeUrl}" target="_blank" class="btn-game-primary">
            <i class="fas fa-download"></i> Instant Download PDF
          </a>
          <a href="${p.resumeViewUrl}" target="_blank" class="btn-game-secondary">
            <i class="fas fa-arrow-up-right-from-square"></i> Open Google Drive Link
          </a>
        </div>
      </div>
    `);
  }

  openContactModal() {
    const p = window.PORTFOLIO_DATA.profile;
    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-satellite-dish"></i> DIRECT COMMUNICATIONS</span>
          <span class="badge-num">OPEN FOR ROLES</span>
        </div>
        <h2 class="modal-title">Connect with Avijit Pakhira</h2>
        <p class="modal-desc">Available for full-time AI/ML roles, research collaborations, or high-scale engineering challenges.</p>

        <div class="contact-links-grid">
          <a href="mailto:${p.email}" class="contact-btn-tile">
            <i class="fas fa-envelope text-cyan"></i>
            <div>
              <span class="label">EMAIL</span>
              <span class="val">${p.email}</span>
            </div>
          </a>

          <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-btn-tile">
            <i class="fab fa-linkedin text-violet"></i>
            <div>
              <span class="label">LINKEDIN PROFILE</span>
              <span class="val">avijit-pakhira-8541841ba</span>
            </div>
          </a>

          <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="contact-btn-tile">
            <i class="fab fa-github text-emerald"></i>
            <div>
              <span class="label">GITHUB REPOSITORIES</span>
              <span class="val">github.com/avijit-28</span>
            </div>
          </a>

          <a href="tel:${p.phone}" class="contact-btn-tile">
            <i class="fas fa-phone text-amber"></i>
            <div>
              <span class="label">PHONE / WHATSAPP</span>
              <span class="val">${p.phone}</span>
            </div>
          </a>
        </div>

        <div class="copy-email-box">
          <button class="btn-game-primary w-full" onclick="navigator.clipboard.writeText('${p.email}'); window.OFFICE_UI.showToast('Copied email to clipboard!');">
            <i class="fas fa-copy"></i> Copy Email Address (${p.email})
          </button>
        </div>
      </div>
    `);
  }

  openTerminalModal(output) {
    this.openModal(`
      <div class="modal-card">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row">
          <span class="badge-cat"><i class="fas fa-terminal"></i> GPU SERVER TELEMETRY</span>
        </div>
        <h2 class="modal-title">Neural Compute Node 01</h2>
        <pre class="terminal-pre"><code>${output}</code></pre>
      </div>
    `);
  }

  // ----------------------------------------------------
  // BREAK ROOM ARCADE: "AI BUG BUSTER 3000"
  // ----------------------------------------------------
  openArcadeModal() {
    this.openModal(`
      <div class="modal-card text-center">
        <button class="modal-close-btn"><i class="fas fa-xmark"></i></button>
        <div class="modal-badge-row justify-center">
          <span class="badge-cat text-amber"><i class="fas fa-gamepad"></i> RETRO ARCADE 3000</span>
        </div>
        <h2 class="modal-title">AI Bug Buster 3000 👾</h2>
        <p class="modal-desc">Click/tap neural bugs before they disrupt the loss gradients! 20s speed run.</p>
        
        <div id="arcadeGameWrap" class="arcade-wrap">
          <div class="arcade-hud">
            <span>SCORE: <strong id="arcadeScore">0</strong></span>
            <span>HIGH SCORE: <strong>240</strong></span>
            <span>TIME: <strong id="arcadeTimer">20s</strong></span>
          </div>
          <div id="arcadePlayArea" class="arcade-play-area">
            <div id="arcadeStartOverlay" class="arcade-start-overlay">
              <button id="startArcadeBtn" class="btn-game-primary"><i class="fas fa-play"></i> START ARCADE GAME</button>
            </div>
          </div>
        </div>
      </div>
    `);

    const startBtn = document.getElementById('startArcadeBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.runArcadeGame());
    }
  }

  runArcadeGame() {
    const playArea = document.getElementById('arcadePlayArea');
    const startOverlay = document.getElementById('arcadeStartOverlay');
    const scoreEl = document.getElementById('arcadeScore');
    const timerEl = document.getElementById('arcadeTimer');

    if (!playArea || !startOverlay) return;
    startOverlay.style.display = 'none';

    let score = 0;
    let timeLeft = 20;
    scoreEl.textContent = '0';
    timerEl.textContent = '20s';

    const gameTimer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(gameTimer);
        clearInterval(bugSpawner);
        playArea.innerHTML = `
          <div class="arcade-start-overlay">
            <h3>SESSION COMPLETE! 🏆</h3>
            <p>You eliminated <strong>${score / 10}</strong> gradient bugs for a total of <strong>${score}</strong> points!</p>
            <button class="btn-game-primary" onclick="window.OFFICE_UI.openArcadeModal();"><i class="fas fa-rotate-right"></i> Play Again</button>
          </div>
        `;
        if (window.game) window.game.playSound('achievement');
      }
    }, 1000);

    const spawnBug = () => {
      if (timeLeft <= 0) return;
      const bug = document.createElement('div');
      bug.className = 'arcade-bug';
      bug.innerHTML = Math.random() > 0.5 ? '👾' : '🐛';
      
      const maxX = playArea.clientWidth - 50;
      const maxY = playArea.clientHeight - 50;
      bug.style.left = `${Math.random() * maxX}px`;
      bug.style.top = `${Math.random() * maxY}px`;

      bug.addEventListener('click', () => {
        score += 10;
        scoreEl.textContent = score;
        if (window.game) window.game.playSound('blip');
        bug.remove();
      });

      playArea.appendChild(bug);
      setTimeout(() => { if (bug.parentNode) bug.remove(); }, 1400);
    };

    const bugSpawner = setInterval(spawnBug, 450);
  }

  // ----------------------------------------------------
  // QUEST TRACKER & TOAST NOTIFICATION
  // ----------------------------------------------------
  updateQuestTracker() {
    const questEl = document.getElementById('questProgressText');
    if (questEl && window.game) {
      const visited = window.game.stats.roomsVisited.size;
      const eggs = window.game.stats.easterEggsFound.size;
      questEl.innerHTML = `<i class="fas fa-compass text-cyan"></i> Rooms: <strong>${visited}/6</strong> · Secrets: <strong>${eggs}/4</strong>`;
    }
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.innerHTML = `<i class="fas fa-circle-check text-cyan"></i> ${message}`;
    this.toastEl.classList.add('show');
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 3000);
  }

  // ----------------------------------------------------
  // EXECUTIVE DOSSIER VIEW (LIVE SEARCH & FILTERING)
  // ----------------------------------------------------
  populateDossierContent() {
    const data = window.PORTFOLIO_DATA;
    const body = document.getElementById('dossierScrollBody');
    if (!body) return;

    body.innerHTML = `
      <div class="dossier-container">
        
        <!-- Header Profile Hero -->
        <section class="dossier-hero">
          <div class="dossier-avatar-wrap">
            <img src="${data.profile.avatarImg}" alt="${data.profile.name}" class="dossier-avatar" onerror="this.src='avi.jpeg'">
          </div>
          <div class="dossier-intro">
            <div class="d-pill-row">
              <span class="d-pill"><i class="fas fa-award text-amber"></i> CGPA 9.41 / 10.0</span>
              <span class="d-pill"><i class="fas fa-scroll text-cyan"></i> 2 Springer Papers</span>
              <span class="d-pill"><i class="fas fa-briefcase text-violet"></i> 3 Internships</span>
            </div>
            <h1>${data.profile.name}</h1>
            <h2>${data.profile.headline}</h2>
            <p>${data.profile.bio}</p>
            <div class="dossier-cta-row">
              <a href="${data.profile.resumeUrl}" target="_blank" class="btn-game-primary"><i class="fas fa-download"></i> Download Resume (PDF)</a>
              <a href="mailto:${data.profile.email}" class="btn-game-secondary"><i class="fas fa-envelope"></i> Email Avijit</a>
              <a href="${data.profile.github}" target="_blank" class="btn-game-outline"><i class="fab fa-github"></i> GitHub</a>
              <a href="${data.profile.linkedin}" target="_blank" class="btn-game-outline"><i class="fab fa-linkedin"></i> LinkedIn</a>
            </div>
          </div>
        </section>

        <!-- Technical Capabilities Matrix -->
        <section class="dossier-sec">
          <h2 class="sec-heading"><i class="fas fa-layer-group text-cyan"></i> Technical Arsenal</h2>
          <div class="dossier-skills-grid">
            <div class="d-skill-col">
              <h4><i class="fas fa-brain text-cyan"></i> AI, ML & Deep Learning</h4>
              <div class="tech-cloud">${data.skills.ai_ml.map(s => `<span>${s}</span>`).join('')}</div>
            </div>
            <div class="d-skill-col">
              <h4><i class="fas fa-code text-violet"></i> Languages & Frameworks</h4>
              <div class="tech-cloud">${[...data.skills.languages, ...data.skills.frameworks].map(s => `<span>${s}</span>`).join('')}</div>
            </div>
            <div class="d-skill-col">
              <h4><i class="fas fa-database text-amber"></i> Cloud, Databases & IoT</h4>
              <div class="tech-cloud">${[...data.skills.databases_cloud, ...data.skills.devops_iot].map(s => `<span>${s}</span>`).join('')}</div>
            </div>
          </div>
        </section>

        <!-- Projects Section with Live Search & Tabs -->
        <section class="dossier-sec">
          <div class="projects-sec-header">
            <div>
              <h2 class="sec-heading"><i class="fas fa-laptop-code text-cyan"></i> Featured Projects (16)</h2>
              <p class="sec-sub">Search by keyword or filter by technology domain.</p>
            </div>
            <!-- Search Input -->
            <div class="dossier-search-box">
              <i class="fas fa-search"></i>
              <input type="text" id="dossierSearchInput" placeholder="Search projects (e.g. YOLO, Trading, Django)...">
            </div>
          </div>

          <!-- Filter Pills -->
          <div class="dossier-filter-tabs" id="dossierFilterTabs">
            <button class="d-filter-btn active" data-filter="all">All (16)</button>
            <button class="d-filter-btn" data-filter="ai">AI / ML</button>
            <button class="d-filter-btn" data-filter="vision">Computer Vision</button>
            <button class="d-filter-btn" data-filter="web">Full-Stack</button>
            <button class="d-filter-btn" data-filter="quant">Quant & Automation</button>
            <button class="d-filter-btn" data-filter="iot">IoT</button>
          </div>

          <!-- Projects Grid Container -->
          <div id="dossierProjectsContainer" class="dossier-projects-grid"></div>
        </section>

        <!-- Research Publications -->
        <section class="dossier-sec">
          <h2 class="sec-heading"><i class="fas fa-flask text-violet"></i> Academic Research & Springer Papers</h2>
          <div class="dossier-research-grid">
            ${data.research.map(r => `
              <div class="dossier-res-card">
                <span class="dr-type">${r.type} (${r.year})</span>
                <h3 class="dr-title">${r.title}</h3>
                <div class="dr-venue"><i class="fas fa-book-bookmark text-cyan"></i> ${r.venue}</div>
                <p class="dr-abs">${r.abstract}</p>
                <div class="dr-tags">${r.tags.map(t => `<span>${t}</span>`).join('')}</div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Work Experience Timeline -->
        <section class="dossier-sec">
          <h2 class="sec-heading"><i class="fas fa-briefcase text-amber"></i> Industry Experience</h2>
          <div class="dossier-exp-grid">
            ${data.experience.map(e => `
              <div class="dossier-exp-card">
                <div class="de-top">
                  <h4>${e.role}</h4>
                  <span class="de-year">${e.year}</span>
                </div>
                <div class="de-company">${e.company}</div>
                <p class="de-desc">${e.description}</p>
                <div class="de-tags">${e.skills.map(s => `<span>${s}</span>`).join('')}</div>
              </div>
            `).join('')}
          </div>
        </section>

      </div>
    `;

    this.renderDossierProjects();
    this.setupDossierSearchAndFilter();
  }

  renderDossierProjects() {
    const container = document.getElementById('dossierProjectsContainer');
    if (!container) return;

    const query = this.currentSearchQuery.toLowerCase().trim();
    const filter = this.currentFilter;

    const filtered = window.PORTFOLIO_DATA.projects.filter(p => {
      const matchSearch = !query || 
        p.title.toLowerCase().includes(query) || 
        p.shortDesc.toLowerCase().includes(query) || 
        p.tech.some(t => t.toLowerCase().includes(query));

      let matchFilter = true;
      if (filter === 'vision') matchFilter = p.category.toLowerCase().includes('vision') || p.id.includes('yolo') || p.id.includes('attendance');
      else if (filter === 'ai') matchFilter = p.category.toLowerCase().includes('ml') || p.category.toLowerCase().includes('ai');
      else if (filter === 'web') matchFilter = p.category.toLowerCase().includes('web') || p.tech.includes('Django');
      else if (filter === 'quant') matchFilter = p.category.toLowerCase().includes('quant') || p.category.toLowerCase().includes('automation');
      else if (filter === 'iot') matchFilter = p.category.toLowerCase().includes('iot');

      return matchSearch && matchFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="no-projects-dossier"><i class="fas fa-search"></i> No matching projects found for "${query}"</div>`;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="dossier-proj-card">
        <div class="dp-header">
          <span class="dp-num" style="color:${p.color}">${p.num} // ${p.category}</span>
          <a href="${p.github}" target="_blank" class="dp-code"><i class="fab fa-github"></i> Source</a>
        </div>
        <h3 class="dp-title">${p.title}</h3>
        <p class="dp-desc">${p.shortDesc}</p>
        <div class="dp-tags">${p.tech.map(t => `<span>${t}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  setupDossierSearchAndFilter() {
    const searchInput = document.getElementById('dossierSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchQuery = e.target.value;
        this.renderDossierProjects();
      });
    }

    const filterBtns = document.querySelectorAll('.d-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-filter') || 'all';
        this.renderDossierProjects();
      });
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.OFFICE_UI = new OfficeUI();
});
