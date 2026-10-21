# 🏢 Avijit AI Labs — The Office RPG Portfolio 🎮

An interactive 2D top-down / isometric **Office RPG Portfolio** where visitors arrive as animated avatars, check in at the front reception desk, and freely explore Avijit Pakhira's research labs, engineering bays, achievement boardroom, and private executive office.

---

## 🌟 Game & Portfolio Highlights

- **👥 Real-Time Multiplayer (Live Visitors in Office)**:
  - When multiple people view your portfolio at the same time, they see each other's characters walking, turning, and exploring in real time!
  - Each character displays their **registered Name floating above their head** (e.g. `AVIJIT`, `SARAH`) with an active status beacon.
  - Supports instant local multi-tab sync (`BroadcastChannel`) and cross-device online sync (`/api/visitors` presence heartbeat).
  - Live HUD pill tracks the active visitor count (e.g. `🟢 2 Online`).
- **🛡️ 1-Email = 1-User Validation & Identity Guard**:
  - Each email is strictly bound to exactly one visitor name.
  - **New Members**: Enter a unique email + name + location and enter directly.
  - **Existing Members**: Re-entering a registered email requires entering the exact matching name to verify identity; entering a mismatching name is blocked.
- **🔐 Privacy & Admin-Only Database Access**:
  - Regular visitors **cannot** see any other visitors' details, names, or emails.
  - The visitor database is locked behind an **Owner Admin PIN: `9410`** (honoring Avijit's 9.41 CGPA).
  - Avijit can access the database via:
    1. Clicking the **AP Logo** in the top-left HUD 3 times.
    2. Pressing <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>.
    3. Talking to Avijit's NPC in his Corner Office and choosing **"Owner Portal"**.
    4. Clicking the lock icon in the Security Pass modal.
  - Includes full lead management and **"Export Leads to CSV"** spreadsheet download.
- **🚪 Animated Entrance & Reception Welcome**:
  - The visitor enters through automatic sliding doors into the modern tech lobby.
  - Receptionist **EVA** triggers an interactive typewriter dialogue balloon with choice-driven exploration paths.
- **🎮 Fully Playable Game World (HTML5 Canvas 2D @ 60 FPS)**:
  - **Reception Lobby**: Digital guestbook, visitor security pass badge, interactive office directory.
  - **AI & Computer Vision Lab**: GPU server racks, Springer research paper stations (*Vedic Math CNN* & *icSoftComp2024 AgriTech*), workstations for *YOLOv3*, *FaceNet*, *Clinical AI*, and *AirVerde*.
  - **Software Engineering Bay**: 4 coder workstations for *WorkFlow*, *Algorithmic Trading Bot*, *Netflix ML*, *Festiva*, *JarvisAI*, and architecture whiteboard.
  - **Boardroom & Hall of Fame**: 9.41 CGPA Golden Cup trophy, JIS University academic records, and Oracle GenAI certification wall.
  - **Break Room & Tech Lounge**: Interactive espresso machine with a **+55% supersonic speed boost**, water cooler, and retro arcade cabinet running the playable **"AI Bug Buster"** mini-game!
  - **Avijit's Corner Office**: Talk directly to Avijit's avatar, print & download the official PDF Resume, or send a direct contact message.
- **🧭 Guided VIP Tour Mode (Autopilot)**:
  - Visitors can sit back while the character walks autonomously through all 6 sectors with live tour guide narration.
- **⚡ Fast Travel Teleporter**:
  - Instant one-click teleportation between all departments from anywhere in the office or from the HUD.
- **📄 Executive Dossier View**:
  - Switch instantly between **Game Mode** and a sleek, modern, full-length **Executive Dossier** portfolio view for recruiters who want quick traditional reading.
- **🔊 Built-in Web Audio API Synthesizer**:
  - Ambient lo-fi synth chord progression (BGM) + retro sound effects (footsteps, dings, brewing sounds, victory fanfare). Zero external audio dependencies!
- **📱 Fully Responsive with Mobile Joystick**:
  - Automatic on-screen touch joystick and action button for phones and tablets.

---

## 🕹️ Controls

| Action | Keyboard / Mouse | Mobile / Tablet |
|---|---|---|
| **Move Character** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual Joystick (Bottom-Left) |
| **Walk to Point** | Click anywhere on the office floor | Tap anywhere on screen |
| **Interact with Object / NPC** | `E` or `Spacebar` or Click Object | `INTERACT` button (Bottom-Right) |
| **Close Modal / Dialogue** | `Escape` key | `X` button |
| **Teleport / Quick Travel** | Click **Fast Travel** in the top HUD | Tap **Fast Travel** in top HUD |

---

## 💻 How to Run Locally

To test locally with real-time multiplayer and database support across multiple tabs, incognito windows, or devices on your network:

```bash
cd "D:\All\python code\avijit_portfolio"
python server.py 8080
```

Open your browser at: `http://localhost:8080`

> **Multiplayer Testing Tip:**  
> - Open **Tab 1** (Normal window): Enter name `Avijit`, location `Kolkata`, email `avijit@example.com`.  
> - Open **Tab 2** (Incognito window or separate browser): Enter name `Rahul`, location `Delhi`, email `rahul@example.com`.  
> - Both tabs will immediately show **`🟢 2 Online`** in the top HUD!  
> - In Tab 1 you will see **RAHUL** walking with a glowing nametag; in Tab 2 you will see **AVIJIT**!  
> - If Tab 2 tries to enter `avijit@example.com` with a different name, the system will strictly block it with an identity alert!

---

## 🚀 How to Deploy on Vercel

This project is built with pure, lightning-fast vanilla web technologies (`HTML5`, `CSS3`, `JavaScript ES6`). It has **zero build step**, zero dependencies to fail, and deploys **instantly** to Vercel with 100% lighthouse performance.

### Option 1: Deploy with Vercel CLI
```bash
# Navigate to the portfolio folder
cd "D:\All\python code\avijit_portfolio"

# Deploy directly
npx vercel
```

### Option 2: Deploy via GitHub (Recommended)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: Avijit AI Labs Office RPG Portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/avijit_portfolio.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `avijit_portfolio` repository.
4. Framework Preset: **Other** (Static).
5. Click **Deploy**! Your portfolio game will be live globally in under 15 seconds!

---

## 👤 Author

**Avijit Pakhira**  
*AI/ML Engineer & Researcher*  
- **Email**: [avijitpakhira2807@gmail.com](mailto:avijitpakhira2807@gmail.com)  
- **Phone**: [+91 70444 19685](tel:+917044419685)  
- **LinkedIn**: [linkedin.com/in/avijit-pakhira-8541841ba](https://www.linkedin.com/in/avijit-pakhira-8541841ba)  
- **GitHub**: [github.com/avijit-28](https://github.com/avijit-28)  
- **Academic Standing**: JIS University, B.Tech CSE (AI & ML) — **CGPA: 9.41 / 10.0**
