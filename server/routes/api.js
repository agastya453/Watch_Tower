const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');
const cheerio = require('cheerio');

// POST /api/track - track a new website
router.post('/track', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Check if already tracked
        const [existing] = await db.query('SELECT * FROM websites WHERE url = ?', [url]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'URL is already being tracked' });
        }

        // Fetch initial content
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 Website Change Tracker' } });
        const html = response.data;
        const $ = cheerio.load(html);
        $('script, style, noscript, iframe, link, meta').remove();
        const content = $('body').text().replace(/\s+/g, ' ').trim();

        // Save website
        const [result] = await db.execute('INSERT INTO websites (url) VALUES (?)', [url]);
        const siteId = result.insertId;

        // Save initial snapshot
        await db.execute(
            'INSERT INTO snapshots (site_id, content, change_type) VALUES (?, ?, ?)',
            [siteId, content, 'none']
        );

        res.status(201).json({ id: siteId, url, message: 'Website is now being tracked' });
    } catch (error) {
        console.error('Error tracking website:', error.message);
        res.status(500).json({ error: 'Failed to track the website. It might be unreachable.' });
    }
});

// GET /api/sites - Returns all tracked sites along with status
router.get('/sites', async (req, res) => {
    try {
        const [sites] = await db.query(`
            SELECT w.id, w.url, w.created_at,
            (SELECT change_type FROM snapshots s WHERE s.site_id = w.id ORDER BY s.timestamp DESC LIMIT 1) as status,
            (SELECT timestamp FROM snapshots s WHERE s.site_id = w.id ORDER BY s.timestamp DESC LIMIT 1) as last_checked
            FROM websites w
        `);
        res.json(sites);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: 'Failed to fetch websites' });
    }
});

// GET /api/history/:siteId - history of a site
router.get('/history/:siteId', async (req, res) => {
    try {
        const { siteId } = req.params;
        const [history] = await db.query(
            'SELECT id, timestamp, change_type, diff_added, diff_removed FROM snapshots WHERE site_id = ? ORDER BY timestamp DESC',
            [siteId]
        );
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
