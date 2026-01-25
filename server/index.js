import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Initialize Express
const app = express()
app.use(cors())
app.use(express.json())

// Initialize Database
const db = new Database(path.join(__dirname, 'data.db'))

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hubs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    theme TEXT DEFAULT 'default',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    hub_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🔗',
    position INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS rules (
    id TEXT PRIMARY KEY,
    link_id TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    rule_config TEXT NOT NULL,
    FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    hub_id TEXT NOT NULL,
    link_id TEXT,
    event_type TEXT NOT NULL,
    device_type TEXT,
    location TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE
  );
`)

// Simple password hashing (for demo - use bcrypt in production)
const hashPassword = (password) => {
    return Buffer.from(password).toString('base64')
}

const verifyPassword = (password, hash) => {
    return hashPassword(password) === hash
}

// Auth middleware
const authenticate = (req, res, next) => {
    const userId = req.headers.authorization?.replace('Bearer ', '')
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = user
    next()
}

// =====================
// AUTH ROUTES
// =====================

app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
        return res.status(400).json({ error: 'Email already registered' })
    }

    const id = uuidv4()
    const hashedPassword = hashPassword(password)

    db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)')
        .run(id, email, hashedPassword, name || null)

    res.json({
        user: { id, email, name }
    })
})

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' })
    }

    res.json({
        user: { id: user.id, email: user.email, name: user.name }
    })
})

// =====================
// HUB ROUTES
// =====================

app.get('/api/hubs', authenticate, (req, res) => {
    const hubs = db.prepare(`
    SELECT h.*, 
           COUNT(DISTINCT l.id) as linkCount,
           (SELECT COUNT(*) FROM analytics WHERE hub_id = h.id AND event_type = 'click') as clickCount
    FROM hubs h
    LEFT JOIN links l ON l.hub_id = h.id
    WHERE h.user_id = ?
    GROUP BY h.id
    ORDER BY h.created_at DESC
  `).all(req.user.id)

    const totalClicks = hubs.reduce((sum, h) => sum + (h.clickCount || 0), 0)
    const totalLinks = hubs.reduce((sum, h) => sum + (h.linkCount || 0), 0)

    res.json({ hubs, totalClicks, totalLinks })
})

app.post('/api/hubs', authenticate, (req, res) => {
    const { title, slug, description, theme, links } = req.body

    if (!title || !slug) {
        return res.status(400).json({ error: 'Title and slug are required' })
    }

    // Check slug uniqueness
    const existing = db.prepare('SELECT id FROM hubs WHERE slug = ?').get(slug)
    if (existing) {
        return res.status(400).json({ error: 'Slug already taken' })
    }

    const hubId = uuidv4()

    db.prepare(`
    INSERT INTO hubs (id, user_id, slug, title, description, theme)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(hubId, req.user.id, slug, title, description || null, theme || 'default')

    // Insert links
    if (links && links.length > 0) {
        const insertLink = db.prepare(`
      INSERT INTO links (id, hub_id, title, url, icon, position, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
        const insertRule = db.prepare(`
      INSERT INTO rules (id, link_id, rule_type, rule_config)
      VALUES (?, ?, ?, ?)
    `)

        for (const link of links) {
            const linkId = uuidv4()
            insertLink.run(
                linkId,
                hubId,
                link.title,
                link.url,
                link.icon || '🔗',
                link.position ?? 0,
                link.isActive !== false ? 1 : 0
            )

            // Insert rules for this link
            if (link.rules && link.rules.length > 0) {
                for (const rule of link.rules) {
                    insertRule.run(uuidv4(), linkId, rule.type, JSON.stringify(rule.config))
                }
            }
        }
    }

    res.json({ hub: { id: hubId, slug, title, description, theme } })
})

app.get('/api/hubs/:id', authenticate, (req, res) => {
    const hub = db.prepare('SELECT * FROM hubs WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id)

    if (!hub) {
        return res.status(404).json({ error: 'Hub not found' })
    }

    const links = db.prepare(`
    SELECT l.*, 
           (SELECT json_group_array(json_object('id', r.id, 'type', r.rule_type, 'config', r.rule_config))
            FROM rules r WHERE r.link_id = l.id) as rules_json
    FROM links l
    WHERE l.hub_id = ?
    ORDER BY l.position ASC
  `).all(hub.id)

    // Parse rules JSON
    const linksWithRules = links.map(link => ({
        ...link,
        isActive: Boolean(link.is_active),
        rules: link.rules_json ? JSON.parse(link.rules_json).filter(r => r.id).map(r => ({
            ...r,
            config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config
        })) : []
    }))

    res.json({ hub, links: linksWithRules })
})

app.put('/api/hubs/:id', authenticate, (req, res) => {
    const { title, slug, description, theme, links } = req.body
    const hubId = req.params.id

    const hub = db.prepare('SELECT * FROM hubs WHERE id = ? AND user_id = ?')
        .get(hubId, req.user.id)

    if (!hub) {
        return res.status(404).json({ error: 'Hub not found' })
    }

    // Check slug uniqueness (excluding current hub)
    if (slug && slug !== hub.slug) {
        const existing = db.prepare('SELECT id FROM hubs WHERE slug = ? AND id != ?').get(slug, hubId)
        if (existing) {
            return res.status(400).json({ error: 'Slug already taken' })
        }
    }

    // Update hub
    db.prepare(`
    UPDATE hubs SET title = ?, slug = ?, description = ?, theme = ?
    WHERE id = ?
  `).run(title, slug, description, theme, hubId)

    // Update links - delete existing and re-insert
    if (links) {
        db.prepare('DELETE FROM links WHERE hub_id = ?').run(hubId)

        const insertLink = db.prepare(`
      INSERT INTO links (id, hub_id, title, url, icon, position, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
        const insertRule = db.prepare(`
      INSERT INTO rules (id, link_id, rule_type, rule_config)
      VALUES (?, ?, ?, ?)
    `)

        for (const link of links) {
            const linkId = uuidv4()
            insertLink.run(
                linkId,
                hubId,
                link.title,
                link.url,
                link.icon || '🔗',
                link.position ?? 0,
                link.isActive !== false ? 1 : 0
            )

            if (link.rules && link.rules.length > 0) {
                for (const rule of link.rules) {
                    insertRule.run(uuidv4(), linkId, rule.type, JSON.stringify(rule.config))
                }
            }
        }
    }

    res.json({ hub: { id: hubId, slug, title, description, theme } })
})

app.delete('/api/hubs/:id', authenticate, (req, res) => {
    const hub = db.prepare('SELECT * FROM hubs WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id)

    if (!hub) {
        return res.status(404).json({ error: 'Hub not found' })
    }

    db.prepare('DELETE FROM hubs WHERE id = ?').run(req.params.id)
    res.json({ success: true })
})

// =====================
// PUBLIC HUB ROUTE
// =====================

app.get('/api/public/:slug', (req, res) => {
    const hub = db.prepare('SELECT * FROM hubs WHERE slug = ?').get(req.params.slug)

    if (!hub) {
        return res.status(404).json({ error: 'Hub not found' })
    }

    const links = db.prepare(`
    SELECT l.*, 
           (SELECT json_group_array(json_object('type', r.rule_type, 'config', r.rule_config))
            FROM rules r WHERE r.link_id = l.id) as rules_json
    FROM links l
    WHERE l.hub_id = ? AND l.is_active = 1
    ORDER BY l.position ASC
  `).all(hub.id)

    // Parse rules and filter based on context
    const deviceType = req.query.device || 'desktop'
    const currentHour = new Date().getHours()

    const filteredLinks = links.filter(link => {
        const rules = link.rules_json ? JSON.parse(link.rules_json).filter(r => r.type) : []

        // If no rules, always show
        if (rules.length === 0) return true

        // Check each rule
        for (const rule of rules) {
            const config = typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config

            // Time-based rule
            if (rule.type === 'time') {
                const { startHour, endHour } = config
                if (currentHour < startHour || currentHour >= endHour) {
                    return false
                }
            }

            // Device-based rule
            if (rule.type === 'device') {
                const { devices } = config
                if (devices && devices.length > 0 && !devices.includes(deviceType)) {
                    return false
                }
            }
        }

        return true
    })

    res.json({
        hub: {
            title: hub.title,
            description: hub.description,
            theme: hub.theme,
            slug: hub.slug
        },
        links: filteredLinks.map(l => ({
            id: l.id,
            title: l.title,
            url: l.url,
            icon: l.icon
        }))
    })
})

// =====================
// ANALYTICS ROUTES
// =====================

app.post('/api/analytics/track', (req, res) => {
    const { slug, linkId, eventType, deviceType, timestamp } = req.body

    const hub = db.prepare('SELECT id FROM hubs WHERE slug = ?').get(slug)
    if (!hub) {
        return res.status(404).json({ error: 'Hub not found' })
    }

    db.prepare(`
    INSERT INTO analytics (id, hub_id, link_id, event_type, device_type, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), hub.id, linkId || null, eventType, deviceType, timestamp || new Date().toISOString())

    res.json({ success: true })
})

app.get('/api/analytics/:hubId', authenticate, (req, res) => {
    const hubId = req.params.hubId
    const range = req.query.range || '7d'

    // Verify ownership
    const hub = db.prepare('SELECT * FROM hubs WHERE id = ? AND user_id = ?')
        .get(hubId, req.user.id)

    if (!hub) {
        return res.status(404).json({ error: 'Hub not found' })
    }

    // Calculate date range
    let dateFilter = ''
    if (range === '24h') {
        dateFilter = "AND timestamp >= datetime('now', '-1 day')"
    } else if (range === '7d') {
        dateFilter = "AND timestamp >= datetime('now', '-7 days')"
    } else if (range === '30d') {
        dateFilter = "AND timestamp >= datetime('now', '-30 days')"
    }

    // Total counts
    const totalViews = db.prepare(`
    SELECT COUNT(*) as count FROM analytics 
    WHERE hub_id = ? AND event_type = 'visit' ${dateFilter}
  `).get(hubId)?.count || 0

    const totalClicks = db.prepare(`
    SELECT COUNT(*) as count FROM analytics 
    WHERE hub_id = ? AND event_type = 'click' ${dateFilter}
  `).get(hubId)?.count || 0

    // Link stats
    const linkStats = db.prepare(`
    SELECT l.id, l.title, l.url, l.icon, COUNT(a.id) as clicks
    FROM links l
    LEFT JOIN analytics a ON a.link_id = l.id AND a.event_type = 'click' ${dateFilter.replace('AND', 'AND a.')}
    WHERE l.hub_id = ?
    GROUP BY l.id
    ORDER BY clicks DESC
  `).all(hubId)

    // Device breakdown
    const deviceBreakdown = db.prepare(`
    SELECT device_type as type, COUNT(*) as count
    FROM analytics
    WHERE hub_id = ? AND event_type = 'visit' ${dateFilter}
    GROUP BY device_type
    ORDER BY count DESC
  `).all(hubId)

    // Daily stats (last 7 days)
    const dailyStats = db.prepare(`
    SELECT 
      date(timestamp) as date,
      SUM(CASE WHEN event_type = 'visit' THEN 1 ELSE 0 END) as views,
      SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
    FROM analytics
    WHERE hub_id = ? ${dateFilter}
    GROUP BY date(timestamp)
    ORDER BY date DESC
    LIMIT 7
  `).all(hubId).reverse()

    // Format daily stats with labels
    const formattedDailyStats = dailyStats.map(d => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
    }))

    res.json({
        totalViews,
        totalClicks,
        linkStats,
        deviceBreakdown,
        dailyStats: formattedDailyStats
    })
})

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
