const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');
const Diff = require('diff');
const db = require('../config/db');

const fetchWebsiteContent = async (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    const response = await axios.get(url, {
        timeout: 15000,
        maxRedirects: 5,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml"
        }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    $('script, style, noscript, iframe, link, meta').remove();

    return $('body').text().replace(/\s+/g, ' ').trim();
};

const checkWebsite = async (site) => {
    try {
        const [latestSnapshots] = await db.query(
            'SELECT * FROM snapshots WHERE site_id = ? ORDER BY timestamp DESC LIMIT 1',
            [site.id]
        );

        if (latestSnapshots.length === 0) return;

        const lastSnapshot = latestSnapshots[0];

        const content = await fetchWebsiteContent(site.url);

        if (!content || content.length < 20) return;

        if (content === lastSnapshot.content) return;

        const diffs = Diff.diffWords(lastSnapshot.content, content);

        let addedChars = 0;
        let removedChars = 0;
        let totalChars = lastSnapshot.content.length;

        let diff_added = [];
        let diff_removed = [];

        diffs.forEach((part) => {
            if (part.added) {
                addedChars += part.value.length;
                diff_added.push(part.value);
            }
            if (part.removed) {
                removedChars += part.value.length;
                diff_removed.push(part.value);
            }
        });

        let diffPercent = totalChars > 0
            ? ((addedChars + removedChars) / totalChars) * 100
            : 100;

        let changeType = 'none';

        if (diffPercent > 0 && diffPercent < 30) changeType = 'minor';
        if (diffPercent >= 30) changeType = 'major';

        if (changeType === 'none') return;

        await db.execute(
            'INSERT INTO snapshots (site_id, content, change_type, diff_added, diff_removed) VALUES (?, ?, ?, ?, ?)',
            [
                site.id,
                content,
                changeType,
                JSON.stringify(diff_added),
                JSON.stringify(diff_removed)
            ]
        );

    } catch (error) {
        console.error(`Error checking site ${site.url}:`, error.message);
    }
};

const startTracker = () => {
    cron.schedule('*/5 * * * *', async () => {
        console.log(`[Scheduler] Running tracker job at ${new Date().toISOString()}`);

        try {
            const [sites] = await db.query('SELECT * FROM websites');

            for (const site of sites) {
                await checkWebsite(site);
            }

        } catch (error) {
            console.error('Tracker job error:', error.message);
        }
    });
};

module.exports = {
    startTracker
};