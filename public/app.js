const gateForm = document.getElementById('gate-form');
const passwordInput = document.getElementById('password');
const gateError = document.getElementById('gate-error');
const gate = document.getElementById('gate');
const confessional = document.getElementById('confessional');
const confessionForm = document.getElementById('confession-form');
const statusEl = document.getElementById('status');
const yearEl = document.getElementById('year');

yearEl.textContent = new Date().getFullYear();

let unlocked = false;

gateForm.addEventListener('submit', (e) => {
	e.preventDefault();
	gateError.textContent = '';
	if (passwordInput.value.trim() !== 'brand') {
		gateError.textContent = 'The spirits deny your entry.';
		return;
	}
	unlocked = true;
	gate.classList.add('hidden');
	confessional.classList.remove('hidden');
	confessional.setAttribute('aria-hidden', 'false');
});

confessionForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	statusEl.textContent = '';
	if (!unlocked) {
		statusEl.textContent = 'You must pass the gate first.';
		return;
	}
	const answers = {
		c1: document.getElementById('c1').value.trim(),
		c2: document.getElementById('c2').value.trim(),
		c3: document.getElementById('c3').value.trim(),
		c4: document.getElementById('c4').value.trim(),
		c5: document.getElementById('c5').value.trim(),
	};
	try {
		const resp = await fetch('/submit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password: 'brand', answers })
		});
		const data = await resp.json();
		if (!resp.ok || !data.ok) {
			throw new Error(data.error || 'Submission failed');
		}
		statusEl.textContent = data.delivered ? '🕯️ The spirits received your confession.' : 'Saved. Spirits are silent (Telegram not configured).';
		confessionForm.reset();
	} catch (err) {
		statusEl.textContent = 'The void rejected your offering.';
	}
});


