// ========================================================
// AVIJIT AI LABS — VERCEL SERVERLESS VISITOR & PRESENCE DATABASE
// Privacy-Protected, Multi-User Presence & Registration Engine
// ========================================================

const ADMIN_PIN = process.env.ADMIN_PIN || "9410"; // Honor 9.41 CGPA

// In-memory cache for serverless instance lifespan
let cachedVisitors = [];
let livePlayers = new Map(); // id -> { id, name, room, x, y, facing, moving, walkCycle, lastSeen }

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ------------------------------------------------------
  // 1. GET: PRIVACY PROTECTED VISITOR LIST & LIVE PRESENCE
  // ------------------------------------------------------
  if (req.method === 'GET') {
    const { adminKey, action } = req.query || {};

    // Live multiplayer presence poll
    if (action === 'presence') {
      const now = Date.now();
      // Drop inactive players (older than 10 seconds)
      for (const [id, p] of livePlayers.entries()) {
        if (now - p.lastSeen > 10000) {
          livePlayers.delete(id);
        }
      }
      return res.status(200).json({
        success: true,
        liveCount: livePlayers.size,
        players: Array.from(livePlayers.values())
      });
    }

    // Admin Verification for Full Database Access
    if (adminKey === ADMIN_PIN) {
      return res.status(200).json({
        success: true,
        isAdmin: true,
        totalVisitors: cachedVisitors.length,
        visitors: cachedVisitors
      });
    }

    // Regular users: ONLY return total count, NEVER return other users' names, emails, or locations!
    return res.status(200).json({
      success: true,
      isAdmin: false,
      totalVisitors: cachedVisitors.length,
      message: "Admin authentication required to view visitor records."
    });
  }

  // ------------------------------------------------------
  // 2. POST: REGISTRATION OR REAL-TIME PRESENCE BROADCAST
  // ------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { action } = body || {};

      // Action A: Real-Time Multiplayer Presence Heartbeat
      if (action === 'presence') {
        const { player } = body;
        if (player && player.id) {
          livePlayers.set(player.id, {
            ...player,
            lastSeen: Date.now()
          });
        }

        // Clean up stale players (10s threshold)
        const now = Date.now();
        for (const [id, p] of livePlayers.entries()) {
          if (now - p.lastSeen > 10000) {
            livePlayers.delete(id);
          }
        }

        return res.status(200).json({
          success: true,
          liveCount: livePlayers.size,
          players: Array.from(livePlayers.values())
        });
      }

      // Action B: Visitor Registration / Sign-In with Strict 1-Email = 1-User Rules
      const { name, location, email, badgeId } = body || {};

      // Validation
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, error: "Name must be at least 2 characters." });
      }
      if (!location || location.trim().length < 2) {
        return res.status(400).json({ success: false, error: "Location must be at least 2 characters." });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, error: "Invalid email address format." });
      }

      const normEmail = email.trim().toLowerCase();
      const normName = name.trim();

      // Check if email already registered
      const existingEmailRecord = cachedVisitors.find(v => v.email === normEmail);

      if (existingEmailRecord) {
        // STRICT RULE: If email already exists, Name MUST match the registered name!
        if (existingEmailRecord.name.toLowerCase() !== normName.toLowerCase()) {
          return res.status(409).json({
            success: false,
            code: 'EMAIL_NAME_MISMATCH',
            error: `⚠️ Yeh email pehle se '${existingEmailRecord.name}' ke naam par registered hai! Ek email se sirf wahi user enter kar sakta hai. Kripya apna alag (unique) email use karein.`
          });
        }

        // Existing user verified! Update location and return existing pass
        existingEmailRecord.location = location.trim();
        existingEmailRecord.lastActiveAt = new Date().toISOString();

        return res.status(200).json({
          success: true,
          isExistingUser: true,
          message: `Welcome back, ${existingEmailRecord.name}! Credentials verified.`,
          visitor: existingEmailRecord
        });
      }

      // Check if Name is already registered under a different email
      const existingNameRecord = cachedVisitors.find(v => v.name.toLowerCase() === normName.toLowerCase());
      if (existingNameRecord) {
        return res.status(409).json({
          success: false,
          code: 'NAME_EMAIL_MISMATCH',
          error: `⚠️ '${existingNameRecord.name}' naam se pehle hi ek account registered hai! Kripya apna registered email enter karein, ya apna poora alag naam likhein.`
        });
      }

      // New Unique Member: Register successfully
      const visitorRecord = {
        badgeId: badgeId || `AP-VIS-${Math.floor(1000 + Math.random() * 9000)}`,
        name: normName,
        location: location.trim(),
        email: normEmail,
        registeredAt: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      };

      cachedVisitors.unshift(visitorRecord);

      // Webhook alert if configured
      if (process.env.VISITOR_WEBHOOK_URL) {
        try {
          await fetch(process.env.VISITOR_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🏢 **New Visitor Registered at Avijit AI Labs!**\n**Name:** ${visitorRecord.name}\n**Location:** ${visitorRecord.location}\n**Email:** ${visitorRecord.email}\n**Badge:** #${visitorRecord.badgeId}\n**Time:** ${visitorRecord.registeredAt}`
            })
          });
        } catch (webhookErr) {
          console.error("Webhook forwarding error:", webhookErr);
        }
      }

      return res.status(200).json({
        success: true,
        isExistingUser: false,
        message: "Visitor successfully registered in database",
        visitor: visitorRecord
      });

    } catch (err) {
      console.error("Visitor registration error:", err);
      return res.status(500).json({ success: false, error: "Internal server error during registration." });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed." });
}
