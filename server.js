const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
	console.warn('Warning: TELEGRAM_BOT_TOKEN is not set. Telegram delivery will fail.');
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/submit', async (req, res) => {
	try {
		const { password, answers } = req.body || {};
		if (password !== 'brand') {
			return res.status(401).json({ ok: false, error: 'Invalid password' });
		}

		if (!answers || typeof answers !== 'object') {
			return res.status(400).json({ ok: false, error: 'Invalid payload' });
		}

		const formatted = [
			'🕯️ CoolGhost Confessions 🕯️',
			'',
			`Confession 1: ${answers.c1 || ''}`,
			`Confession 2: ${answers.c2 || ''}`,
			`Confession 3: ${answers.c3 || ''}`,
			`Confession 4: ${answers.c4 || ''}`,
			answers.c5 ? `Confession 5 (Contact): ${answers.c5}` : null,
			'',
			`Timestamp: ${new Date().toISOString()}`
		].filter(Boolean).join('\n');

		let delivered = false;
		if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
			const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
			const payload = { chat_id: TELEGRAM_CHAT_ID, text: formatted, parse_mode: 'HTML' };
			const tgResp = await fetch(telegramUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const tgData = await tgResp.json();
			delivered = !!tgData.ok;
		}

		return res.json({ ok: true, delivered });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ ok: false, error: 'Server error' });
	}
});

app.listen(PORT, () => {
	console.log(`CoolGhost server running on http://localhost:${PORT}`);
});


