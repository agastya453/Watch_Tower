const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');
const cheerio = require('cheerio');

router.post('/track', async (req, res) => {
    try {
        let { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        url = url.trim();

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const [existing] = await db.query(
            'SELECT id FROM websites WHERE url = ?',
            [url]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'URL is already being tracked'
            });
        }

        const response = await axios.get(url, {
            timeout: 15000,
            maxRedirects: 5,
            validateStatus: status => status >= 200 && status < 500,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                "Accept":
                    "text/html,application/xhtml+xml"
            }
        });

        const html = response.data;

        if (!html || html.length < 50) {
            return res.status(500).json({
                error: 'Website returned empty content'
            });
        }

        const $ = cheerio.load(html);

        $('script, style, noscript, iframe, link, meta').remove();

        const content = $('body')
            .text()
            .replace(/\s+/g, ' ')
            .trim();

        if (!content || content.length < 20) {
            return res.status(500).json({
                error: 'Website content could not be extracted'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO websites (url) VALUES (?)',
            [url]
        );

        const siteId = result.insertId;

        await db.execute(
            'INSERT INTO snapshots (site_id, content, change_type) VALUES (?, ?, ?)',
            [siteId, content, 'none']
        );

        res.status(201).json({
            id: siteId,
            url,
            message: 'Website is now being tracked'
        });

    } catch (error) {

        console.error('Tracking error:', error.message);

        res.status(500).json({
            error: 'Failed to track the website. It might be unreachable.'
        });

    }
});

router.get('/sites', async (req, res) => {
    try {

        const [sites] = await db.query(`
            SELECT w.id, w.url, w.created_at,
            (
                SELECT change_type
                FROM snapshots s
                WHERE s.site_id = w.id
                ORDER BY s.timestamp DESC
                LIMIT 1
            ) AS status,
            (
                SELECT timestamp
                FROM snapshots s
                WHERE s.site_id = w.id
                ORDER BY s.timestamp DESC
                LIMIT 1
            ) AS last_checked
            FROM websites w
        `);

        res.json(sites);

    } catch (error) {

        console.error('Error fetching sites:', error);

        res.status(500).json({
            error: 'Failed to fetch websites'
        });

    }
});

router.get('/history/:siteId', async (req, res) => {

    try {

        const { siteId } = req.params;

        const [history] = await db.query(
            `SELECT id, timestamp, change_type, diff_added, diff_removed
             FROM snapshots
             WHERE site_id = ?
             ORDER BY timestamp DESC`,
            [siteId]
        );

        res.json(history);

    } catch (error) {

        console.error('Error fetching history:', error);

        res.status(500).json({
            error: 'Failed to fetch history'
        });

    }

});

module.exports = router;