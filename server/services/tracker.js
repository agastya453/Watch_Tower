const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');
const Diff = require('diff');
const db = require('../config/db');

const startTracker = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log(`[Scheduler] Running tracker job at ${new Date().toISOString()}`);
        try {
            const [sites] = await db.query('SELECT * FROM websites');

            for (const site of sites) {
                await checkWebsite(site);
            }
        } catch (error) {
            console.error('Tracker job error:', error);
        }
    });
};

const checkWebsite = async (site) => {
    try {
        // Find latest snapshot
        const [latestSnapshots] = await db.query(
            'SELECT * FROM snapshots WHERE site_id = ? ORDER BY timestamp DESC LIMIT 1',
            [site.id]
        );

        if (latestSnapshots.length === 0) return;
        const lastSnapshot = latestSnapshots[0];

        // Fetch current site
        const response = await axios.get(site.url, { headers: { 'User-Agent': 'Mozilla/5.0 Website Change Tracker' } });
        const html = response.data;
        const $ = cheerio.load(html);
        $('script, style, noscript, iframe, link, meta').remove();
        const content = $('body').text().replace(/\s+/g, ' ').trim();

        if (content === lastSnapshot.content) {
            // No structural change
            return; 
        }

        // Compare text
        const diffs = Diff.diffWords(lastSnapshot.content, content);
        
        // Calculate % diff
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

        // if totalChars is 0, we can define percent = 100%
        let diffPercent = 0;
        if (totalChars > 0) {
           diffPercent = ((addedChars + removedChars) / totalChars) * 100;
        } else {
           diffPercent = 100;
        }

        let changeType = 'none';
        if (diffPercent > 0 && diffPercent < 30) {
            changeType = 'minor';
        } else if (diffPercent >= 30) {
            changeType = 'major';
        }

        if (changeType === 'none') {
            return;
        }

        if (changeType === 'major') {
            console.log(`ALERT: Major change detected on ${site.url}`);
        }

        // Store new snapshot
        await db.execute(
            'INSERT INTO snapshots (site_id, content, change_type, diff_added, diff_removed) VALUES (?, ?, ?, ?, ?)',
            [site.id, content, changeType, JSON.stringify(diff_added), JSON.stringify(diff_removed)]
        );

    } catch (error) {
        console.error(`Error checking site ${site.url}:`, error.message);
    }
};

module.exports = {
    startTracker
};
