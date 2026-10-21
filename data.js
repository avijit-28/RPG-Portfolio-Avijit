// ========================================================
// AVIJIT PAKHIRA — PORTFOLIO DATABASE & OFFICE REGISTRY
// High-Fidelity Data for Avijit AI Labs Room-by-Room 3D RPG
// ========================================================

window.PORTFOLIO_DATA = {
  profile: {
    name: "Avijit Pakhira",
    role: "AI/ML Engineer & Researcher",
    badgeRole: "Lead AI Architect",
    headline: "Pioneering Deep Learning, Computer Vision & Mathematical Acceleration",
    subheadline: "Author of 2 Springer Conference Publications · JIS University CSE (AI/ML) · 9.41 CGPA",
    bio: "AI/ML Engineer with deep expertise in neural architectures, computer vision edge deployment, and empirical research. Currently pursuing B.Tech in CSE (AI & ML) at JIS University, maintaining an exceptional 9.41 CGPA. Co-authored Springer-indexed research publications on accelerating CNN computation via ancient Vedic Mathematics sutras and multi-sensor precision agriculture optimization. Built 16+ production systems ranging from low-latency YOLO tracking to algorithmic trading engines and clinical diagnostic portals.",
    cgpa: "9.41 / 10.0",
    rank: "Honors Top Tier · Rank 1",
    university: "JIS University, Kolkata",
    graduationYear: "2026",
    location: "West Bengal, India (Open to Relocate / Remote)",
    email: "avijitpakhira2807@gmail.com",
    phone: "+91 70444 19685",
    github: "https://github.com/avijit-28",
    linkedin: "https://www.linkedin.com/in/avijit-pakhira-8541841ba",
    instagram: "https://www.instagram.com/avijit_official_28",
    resumeUrl: "https://drive.google.com/uc?export=download&id=11c-2tHDlnOW8mPERKGlj8OP8Jjxf7sSf",
    resumeViewUrl: "https://drive.google.com/file/d/11c-2tHDlnOW8mPERKGlj8OP8Jjxf7sSf/view?usp=drive_link",
    avatarImg: "avi.jpeg",
    stats: {
      cgpa: 9.41,
      projects: 16,
      publications: 2,
      internships: 3,
      certifications: 6
    }
  },

  skills: {
    languages: ["Python", "C++", "C", "JavaScript", "SQL", "PHP", "HTML5", "CSS3", "LaTeX"],
    ai_ml: [
      "PyTorch", "TensorFlow", "Keras", "OpenCV", "YOLOv3 / YOLOv8",
      "Scikit-Learn", "Pandas", "NumPy", "Matplotlib", "Seaborn",
      "Transformers & NLP", "Generative AI & LLMs", "FaceNet", "CNN Acceleration"
    ],
    frameworks: ["Django", "Streamlit", "Gradio", "Node.js", "Bootstrap 5", "Tailwind CSS", "REST APIs", "Celery"],
    databases_cloud: ["MongoDB", "MySQL", "SQLite", "Firebase", "Google Cloud", "Oracle Cloud", "Vercel"],
    devops_iot: ["Git & GitHub", "VS Code", "Postman", "Power BI", "Jupyter & Colab", "NodeMCU & Arduino", "IoT Blynk"]
  },

  rooms: [
    {
      id: "exterior_entrance",
      name: "🌆 Building Exterior & Entrance",
      shortName: "Entrance",
      theme: "exterior",
      accent: "#00f0ff",
      description: "Walk toward the entrance doors to trigger the motion sensors and enter the building."
    },
    {
      id: "reception",
      name: "🏢 Reception Lobby & Welcome Lounge",
      shortName: "Reception",
      theme: "marble",
      accent: "#00f0ff",
      description: "Front desk with AI Host EVA, digital guestbook pass, and doorways leading to all research wings."
    },
    {
      id: "ai_lab",
      name: "🔬 AI & Computer Vision Research Lab",
      shortName: "AI Lab",
      theme: "concrete",
      accent: "#38bdf8",
      description: "Rotating 3D Neural Matrix, GPU server clusters, YOLO tracking, and Springer research exhibits."
    },
    {
      id: "dev_bay",
      name: "💻 Software Engineering Bay",
      shortName: "Dev Bay",
      theme: "wood_honey",
      accent: "#8b5cf6",
      description: "Open-plan agile coder stations, Kanban architecture whiteboard, and quant trading bot."
    },
    {
      id: "boardroom",
      name: "🏆 Boardroom & Hall of Fame",
      shortName: "Boardroom",
      theme: "wood_walnut",
      accent: "#f59e0b",
      description: "Backlit glass case with the 9.41 CGPA Golden Cup trophy, executive table, and certifications wall."
    },
    {
      id: "lounge",
      name: "☕ Code Café & Break Lounge",
      shortName: "Code Café",
      theme: "terrazzo",
      accent: "#10b981",
      description: "Mint-green espresso bar with +55% speed boost buff, retro Bug Buster arcade, and water bar."
    },
    {
      id: "executive_office",
      name: "💼 Avijit's Private Corner Office",
      shortName: "Avijit Office",
      theme: "wood_oak",
      accent: "#c084fc",
      description: "Panoramic sunset skyline window with flying vehicles, Avijit's executive desk, and Resume printer."
    }
  ],

  projects: [
    {
      id: "workflow",
      num: "01",
      title: "WorkFlow — Pipeline & Task Orchestrator",
      category: "Automation & Distributed Systems",
      shortDesc: "Intelligent automated workflow management with DAG dependency resolution, async task queues, and error recovery.",
      fullDesc: "Production-ready automated workflow execution engine. Coordinates complex multi-stage task dependency graphs (DAGs), background scheduling, resilient error recovery, and REST API telemetry to eliminate manual pipeline bottlenecks.",
      tech: ["Python", "Task Queues", "REST APIs", "Async Execution", "Workflow DAG"],
      github: "https://github.com/avijit-28/WorkFlow",
      badge: "Core Automation",
      room: "dev_bay",
      color: "#00f0ff"
    },
    {
      id: "attendance",
      num: "02",
      title: "AI Biometric Attendance System",
      category: "Computer Vision & Biometrics",
      shortDesc: "Real-time facial recognition attendance platform with 128D FaceNet embeddings and anti-spoofing detection.",
      fullDesc: "Automated biometric facial recognition attendance platform leveraging OpenCV and deep feature vector embeddings (FaceNet). Features anti-spoofing liveness verification, sub-second face identification, dynamic SQLite logging, and automated institutional attendance rollouts.",
      tech: ["OpenCV", "Deep Learning", "FaceNet", "Python", "Anti-Spoofing"],
      github: "https://github.com/avijit-28/Attendence-System",
      badge: "Vision AI",
      room: "ai_lab",
      color: "#38bdf8"
    },
    {
      id: "ticket_categorizer",
      num: "03",
      title: "Auto Ticket Categorizer & Triage",
      category: "Natural Language Processing",
      shortDesc: "NLP-driven support ticket triage system using TF-IDF tokenization and transformer classification.",
      fullDesc: "Enterprise customer inquiry classification engine. Cleans and processes raw text inquiries using TF-IDF tokenization, syntactic stemming, and transformer classification to predict severity priority, auto-route tickets to target engineering departments, and reduce MTTR by 40%.",
      tech: ["NLP", "Transformers", "Scikit-Learn", "TF-IDF", "Python"],
      github: "https://github.com/avijit-28/Auto-Ticket-Categorizer",
      badge: "NLP Engine",
      room: "dev_bay",
      color: "#8b5cf6"
    },
    {
      id: "netflix_ml",
      num: "04",
      title: "Netflix ML — Recommendation Engine",
      category: "Machine Learning & RecSys",
      shortDesc: "Item-based collaborative filtering architecture with cosine similarity matrices and latent clustering.",
      fullDesc: "Advanced movie and content recommendation architecture utilizing item-based collaborative filtering, cosine similarity matrices, and unsupervised clustering. Analyzes viewer behavior to generate hyper-personalized watchlists and taste clusters.",
      tech: ["Recommendation Systems", "Collaborative Filtering", "Scikit-Learn", "Pandas", "Clustering"],
      github: "https://github.com/avijit-28/Netflix-ML",
      badge: "RecSys",
      room: "dev_bay",
      color: "#f43f5e"
    },
    {
      id: "trading_bot",
      num: "05",
      title: "Algorithmic Quant Trading Bot",
      category: "Quantitative Finance & Trading",
      shortDesc: "Automated financial market trading bot executing multi-indicator rules (RSI, MACD, MA) with historical backtesting.",
      fullDesc: "Algorithmic market execution bot equipped with mathematical technical indicator strategies (RSI, EMA Crossovers, MACD histogram analysis). Enforces strict position sizing, risk mitigation rules, automated order triggers, and historical backtesting simulation on financial time series.",
      tech: ["Quantitative Finance", "Technical Indicators", "Backtesting", "NumPy", "Time Series"],
      github: "https://github.com/avijit-28/Trading-Bot",
      badge: "Quant AI",
      room: "dev_bay",
      color: "#10b981"
    },
    {
      id: "clinical_ai",
      num: "06",
      title: "Clinical AI — Medical Diagnostic Portal",
      category: "Healthcare AI & Web",
      shortDesc: "Full-stack Django healthcare portal forecasting multi-disease risks from patient biomarkers.",
      fullDesc: "Clinical diagnostic web application built on Django. Clinicians and patients submit physiological measurements and symptom matrices, triggering pre-trained predictive models that output probabilistic disease risk evaluations and triage recommendations.",
      tech: ["Django", "Python", "Predictive ML", "Bootstrap", "SQLite"],
      github: "https://github.com/avijit-28/clinical-ai-django",
      badge: "HealthTech",
      room: "ai_lab",
      color: "#06b6d4"
    },
    {
      id: "airverde",
      num: "07",
      title: "AirVerde — Environmental AQI Intelligence",
      category: "ClimateTech & IoT",
      shortDesc: "Atmospheric quality surveillance platform predicting PM2.5 and AQI spikes via time-series models.",
      fullDesc: "IoT-connected environmental intelligence system monitoring Air Quality Index (AQI), PM2.5, PM10, temperature, and atmospheric pressure. Employs time-series forecasting to predict dangerous pollution spikes and visualizes eco-health trends on a responsive portal.",
      tech: ["IoT Sensors", "Time-Series ML", "Python", "AQI Forecasting", "Interactive Dashboard"],
      github: "https://github.com/avijit-28/AirVerde",
      badge: "GreenTech",
      room: "ai_lab",
      color: "#22c55e"
    },
    {
      id: "festiva",
      num: "08",
      title: "Festiva — Enterprise Event Platform",
      category: "Full-Stack Web & Automation",
      shortDesc: "Multi-role Django event management system with integrated reservation workflows and interactive chatbot.",
      fullDesc: "Enterprise event management ecosystem developed with Django. Includes role-based authentication (Admin, Host, Attendee), event scheduling, payment workflows, media asset management, and an integrated assistant chatbot for attendee inquiries.",
      tech: ["Django", "Python", "HTML5/CSS3", "SQLite", "Chatbot"],
      github: "https://github.com/avijit-28/Festiva-Manage-Your-Events",
      badge: "Full-Stack",
      room: "dev_bay",
      color: "#eab308"
    },
    {
      id: "diabetes_pred",
      num: "09",
      title: "Diabetes Risk Prediction System",
      category: "Healthcare Analytics",
      shortDesc: "Clinical risk prediction application built on the PIMA Indians Diabetes dataset with Streamlit interface.",
      fullDesc: "Supervised clinical prediction system analyzing medical indicators (Glucose, BMI, Insulin, Age). Deployed as an interactive Streamlit application delivering immediate probability scores, ROC curve insights, and feature importance rankings.",
      tech: ["Scikit-Learn", "Streamlit", "Pandas", "Matplotlib", "Biomarker Analysis"],
      github: "https://github.com/avijit-28/prediction-of-diabetes",
      badge: "Clinical ML",
      room: "ai_lab",
      color: "#f59e0b"
    },
    {
      id: "soil_moisture",
      num: "10",
      title: "Smart Soil & Crop Recommender (LSTM)",
      category: "AgriTech & Deep Learning",
      shortDesc: "CNN-LSTM neural network predicting temporal soil moisture alongside Random Forest crop allocation.",
      fullDesc: "Hybrid deep learning agricultural architecture. Merges CNN-LSTM networks for temporal sensor-based soil moisture forecasting with Random Forest ensemble classifiers to recommend optimal crops based on NPK soil chemistry and local climatic conditions. Published at Springer.",
      tech: ["CNN-LSTM", "TensorFlow", "Random Forest", "IoT Analytics", "AgriTech"],
      github: "https://github.com/avijit-28/soil-checking-and-prediction",
      badge: "Springer Paper",
      room: "ai_lab",
      color: "#14b8a6"
    },
    {
      id: "jarvis_ai",
      num: "11",
      title: "JarvisAI — Voice-Driven Desktop Companion",
      category: "Voice AI & System Automation",
      shortDesc: "Voice-controlled virtual assistant powered by SpeechRecognition, pyttsx3, and OpenAI API.",
      fullDesc: "Voice-operated desktop agent that listens to ambient audio commands, resolves natural language queries via the OpenAI API, and controls system-level actions (launching apps, querying online knowledge graphs, playing media, and voice-assisted web browsing).",
      tech: ["Python", "SpeechRecognition", "OpenAI API", "pyttsx3", "System Automation"],
      github: "https://github.com/avijit-28/JarvisAI",
      badge: "Voice Agent",
      room: "dev_bay",
      color: "#a855f7"
    },
    {
      id: "object_detection",
      num: "12",
      title: "Real-Time Object Detection (YOLOv3)",
      category: "Computer Vision",
      shortDesc: "Ultra low-latency computer vision pipeline utilizing OpenCV DNN module and YOLOv3 darknet weights.",
      fullDesc: "High-throughput object detection pipeline engineered with OpenCV DNN and YOLOv3. Applies custom Non-Maximum Suppression (NMS) and confidence scoring to achieve smooth multi-class detection across live webcam streams and recorded footage at high FPS.",
      tech: ["YOLOv3", "OpenCV", "Python", "DNN Module", "Edge Optimization"],
      github: "https://github.com/avijit-28/Live-Object-Detection---OpenCV",
      badge: "Vision Core",
      room: "ai_lab",
      color: "#0284c7"
    },
    {
      id: "omr_checker",
      num: "13",
      title: "OMR Sheet Auto-Grading System",
      category: "Image Processing & Automation",
      shortDesc: "Document processing pipeline using contour sorting and perspective warping to grade bubble exams in <500ms.",
      fullDesc: "High-precision computer vision pipeline that isolates bubble matrices from scanned exam papers, performs four-point perspective rectification, normalizes skew, evaluates filled bubble thresholds against an answer key, and computes scores in under 500ms.",
      tech: ["OpenCV", "Perspective Warping", "Contour Detection", "Python", "NumPy"],
      github: "https://github.com/avijit-28/OMR-checking",
      badge: "CV Processing",
      room: "ai_lab",
      color: "#6366f1"
    },
    {
      id: "road_lane",
      num: "14",
      title: "Autonomous Road Lane Detection",
      category: "Autonomous Systems & AI",
      shortDesc: "Lane tracking model developed at Pinnacle utilizing Hough line transforms and region-of-interest masking.",
      fullDesc: "Vision-based vehicular lane boundary tracker developed for autonomous vehicle simulations. Combines Hough mathematical line transforms, canny edge detection, and region-of-interest filtering to preserve lane trajectories in challenging lighting and shadow transitions.",
      tech: ["OpenCV", "Hough Transforms", "Edge Detection", "Python", "Self-Driving"],
      github: "https://github.com/avijit-28/road_lane",
      badge: "AutoDrive",
      room: "ai_lab",
      color: "#ec4899"
    },
    {
      id: "eda_dashboard",
      num: "15",
      title: "EDA Dashboard — Automated CSV Explorer",
      category: "Data Analytics & Visualization",
      shortDesc: "Zero-code interactive exploratory data analytics tool built with Gradio, Pandas, and Seaborn.",
      fullDesc: "Interactive exploratory data analysis portal. Users drag-and-drop any CSV or Excel tabular file to generate correlation heatmaps, missing value diagnostics, statistical outlier distributions, and exportable charts without writing a single line of code.",
      tech: ["Gradio", "Pandas", "Seaborn", "Matplotlib", "Python"],
      github: "https://github.com/avijit-28/EDA_Dashboard",
      badge: "Analytics Tool",
      room: "dev_bay",
      color: "#3b82f6"
    },
    {
      id: "water_level",
      num: "16",
      title: "Smart Water Level Monitoring & Control",
      category: "IoT Systems & Embedded",
      shortDesc: "Connected IoT embedded system with NodeMCU, ultrasonic ranging, and Blynk Cloud automation.",
      fullDesc: "Hardware-connected IoT system built with ESP8266 NodeMCU and ultrasonic distance transducers. Communicates with Blynk Cloud to trigger mobile warnings, track reservoir depletion curves, and actuate electric water pumps automatically.",
      tech: ["NodeMCU", "Blynk Cloud", "C / C++", "Ultrasonic Sensors", "Relay Control"],
      github: "https://github.com/avijit-28",
      badge: "Hardware & IoT",
      room: "ai_lab",
      color: "#0ea5e9"
    }
  ],

  research: [
    {
      id: "vedic_math",
      title: "Vedic Mathematics + Karatsuba Algorithm for Efficient Face Recognition",
      type: "SPRINGER INDEXED RESEARCH PAPER",
      venue: "Final Publication 2026 · Springer Indexed · ISBN Conference (Abstract Accepted)",
      year: "2026",
      abstract: "This research proposes a groundbreaking paradigm that integrates ancient Indian Vedic mathematical sutras (specifically Urdhva Tiryagbhyam and Karatsuba fast-multiplication) directly into the arithmetic computational kernels of Convolutional Neural Networks. By eliminating high-dimensional multiplication bottlenecks during convolutional layer processing, the architecture yields significant computational acceleration in biometric face verification and low-power hardware edge deployment.",
      tags: ["CNN Acceleration", "Vedic Mathematics", "Karatsuba Multiplication", "Face Recognition", "Biometrics", "Edge AI"]
    },
    {
      id: "precision_agri",
      title: "Precision Agriculture with ML: Soil Moisture & Crop Selection Optimization",
      type: "SPRINGER PROCEEDINGS // icSoftComp2024",
      venue: "icSoftComp2024 · Bangkok, Thailand · Springer Proceedings · CHARUSAT International",
      year: "2024",
      abstract: "Co-authored an empirical machine learning pipeline for sustainable agriculture and resource preservation. Evaluates multi-depth soil moisture sensor inputs with recurrent neural modeling to predict upcoming depletion windows, while ensemble algorithms (Random Forest, Decision Trees) map microclimate metrics to the highest-yielding crop recommendations. Presented at the prestigious CHARUSAT international conference in Bangkok.",
      tags: ["AgriTech", "LSTM / Recurrent Nets", "Soil Moisture Prediction", "Ensemble ML", "Bangkok Conference"]
    }
  ],

  experience: [
    {
      role: "AI/ML Engineer Intern — TechSaksham Program",
      company: "Edunet Foundation (Microsoft & SAP CSR Initiative)",
      year: "2024",
      badge: "Microsoft & SAP CSR",
      description: "Engineered real-time computer vision and object detection pipelines leveraging YOLOv3 and OpenCV. Optimized algorithmic preprocessing and frame throughput, reducing inference latency by 20%. Mentored 15+ peers in neural network fundamentals and edge deployment.",
      skills: ["YOLOv3", "OpenCV", "Deep Learning", "Edge AI", "Python"]
    },
    {
      role: "Python Developer Intern",
      company: "Virtunexa",
      year: "2024",
      badge: "Productivity & Speech",
      description: "Developed speech-enabled productivity assistants, automated log-based student grading utilities, and real-time news extraction scrapers. Improved internal software tool execution speeds by 35% and modularized reusable Python service layers.",
      skills: ["Python", "Speech API", "Web Scraping", "Automation", "Flask"]
    },
    {
      role: "Data Science & Vision Intern",
      company: "Pinnacle",
      year: "2024",
      badge: "Autonomous Driving",
      description: "Researched and built AI road lane detection architectures for autonomous vehicle simulations. Implemented Hough mathematical transforms alongside convolutional filtering to deliver consistent lane tracking in low-light and noisy road conditions.",
      skills: ["Data Science", "Computer Vision", "TensorFlow", "Autonomous Systems"]
    }
  ],

  education: [
    {
      degree: "B.Tech in Computer Science & Engineering (AI & ML Specialization)",
      institution: "JIS University, Kolkata, West Bengal",
      period: "2022 — 2026",
      score: "9.41 / 10.0 CGPA",
      status: "Top Tier Honors · First Rank Standing",
      coursework: "Deep Learning, Computer Vision, Artificial Intelligence, Data Structures & Algorithms, Operating Systems, DBMS, Computer Networks, Software Engineering."
    },
    {
      degree: "Higher Secondary (Class XII) — Science Stream",
      institution: "Kendriya Vidyalaya (ARMY), Barrackpore",
      period: "2021",
      score: "85.8%",
      status: "First Division with Distinction"
    },
    {
      degree: "Secondary Examination (Class X)",
      institution: "Kendriya Vidyalaya (ARMY), Barrackpore",
      period: "2019",
      score: "83.6%",
      status: "First Division"
    }
  ],

  certifications: [
    { title: "Oracle Generative AI Certified Professional", issuer: "Oracle Cloud Infrastructure", icon: "brain", color: "#f59e0b", id: "OCI-GENAI" },
    { title: "Advanced Prompt Engineering Specialization", issuer: "DeepLearning.AI / Industry Program", icon: "wand-magic-sparkles", color: "#8b5cf6", id: "DL-PROMPT" },
    { title: "Programming In Java (NPTEL Elite)", issuer: "Indian Institute of Technology (IIT)", icon: "mug-saucer", color: "#ef4444", id: "NPTEL-IIT" },
    { title: "AI / Machine Learning Fundamentals", issuer: "TechSaksham / Edunet (Microsoft & SAP)", icon: "microchip", color: "#00f0ff", id: "TS-AI-MSFT" },
    { title: "Python Development Specialization", issuer: "Virtunexa", icon: "code", color: "#3b82f6", id: "VNX-PY" },
    { title: "Data Science & Analytical Methods", issuer: "Pinnacle", icon: "chart-line", color: "#10b981", id: "PIN-DS" }
  ],

  easterEggs: [
    { id: "coffee", name: "High-Octane Espresso", clue: "Drink espresso in the Break Room for a supersonic speed boost." },
    { id: "arcade", name: "Bug Smasher Champion", clue: "Play the retro arcade machine in the lounge and debug neural networks." },
    { id: "trophy", name: "The 9.41 CGPA Golden Cup", clue: "Inspect the glowing trophy case in the Executive Boardroom." },
    { id: "secret_terminal", name: "Root Access Terminal", clue: "Locate Avijit's personal workstation in the corner office." }
  ]
};
