function saveField(key, value) {
  localStorage.setItem('ff_' + key, value);
}

function autofill() {
  const fields = {
    fullname: 'Juan Dela Cruz',
    email:    'juan.delacruz@email.com',
    contact:  '+63 912 345 6789'
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = val;
      saveField(id, val);
      el.style.borderColor = 'var(--green)';
      setTimeout(() => el.style.borderColor = '', 1800);
    }
  });
}

function updateCount(el, counterId, max) {
  const len = el.value.length;
  const counter = document.getElementById(counterId);
  if (!counter) return;
  counter.textContent = `${len} / ${max} characters`;
  if (len >= max)            counter.style.color = 'var(--red)';
  else if (len > max * 0.85) counter.style.color = '#F59E0B';
  else                       counter.style.color = 'var(--text-light)';
}

async function expandWithAI(fieldId, statusId) {
  const textarea = document.getElementById(fieldId);
  const status   = document.getElementById(statusId);
  const keywords = textarea.value.trim();

  if (!keywords) {
    status.textContent = '⚠️ Type a few words first, then click the button.';
    status.style.color = '#F59E0B';
    setTimeout(() => status.textContent = '', 3000);
    return;
  }

  const btn = document.querySelector(`button[onclick="expandWithAI('${fieldId}','${statusId}')"]`);
  btn.disabled = true;
  btn.textContent = '✦ Writing...';
  status.textContent = '';

  const prompts = {
    confusing:   `The user is filling out a form survey about their form-filling experience. They typed these rough notes about a time they found a form confusing or difficult: "${keywords}". Write 2–3 natural, first-person sentences expanding this into a clear, honest answer. Stay true to their intent. Do not add fake details. Only output the answer text, nothing else.`,
    coping:      `The user is filling out a form survey. They typed these rough notes about what they do when they encounter a confusing form field: "${keywords}". Write 2–3 natural, first-person sentences expanding this into a clear answer. Stay true to their intent. Only output the answer text, nothing else.`,
    improvement: `The user is filling out a form survey. They typed these rough notes about one change they'd make to form design: "${keywords}". Write 2–3 natural, first-person sentences expanding this into a clear, opinionated answer. Stay true to their intent. Only output the answer text, nothing else.`
  };

  const prompt = prompts[fieldId] || `Expand these rough notes into 2–3 clear first-person sentences: "${keywords}". Only output the answer text.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim();

    if (text) {
      textarea.value = text;
      saveField(fieldId, text);
      updateCount(textarea, 'count-' + fieldId, 300);
      status.textContent = '✓ Expanded!';
      status.style.color = 'var(--green)';
    } else {
      throw new Error('Empty response');
    }
  } catch (err) {
    status.textContent = '✗ Could not connect to AI. Check your internet.';
    status.style.color = 'var(--red)';
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Deliver Message with AI`;
    setTimeout(() => status.textContent = '', 4000);
  }
}

function submitForm() {
  const consent = document.getElementById('consent');
  if (!consent?.checked) {
    const box = consent.closest('.consent-box');
    box.style.outline = '2px solid var(--red)';
    box.style.outlineOffset = '2px';
    setTimeout(() => { box.style.outline = ''; }, 2000);
    return;
  }
  localStorage.setItem('ff_submittime', new Date().toISOString());
  window.location.href = 'success.html';
}