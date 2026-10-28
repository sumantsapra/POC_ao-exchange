/**
 * Registration form. Fields are authored as table rows:
 * label, name, type, required|optional, placeholder.
 * A final row whose first cell is "submit" sets the button label.
 * Posts JSON to the `form-endpoint` meta tag when that tag has a URL.
 * @param {Element} block Register block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const titleRow = rows.shift();
  const title = titleRow ? titleRow.textContent.trim() : 'Register your interest';
  let buttonLabel = 'Register now';
  const fields = [];

  rows.forEach((row) => {
    const cells = [...row.children].map((cell) => cell.textContent.trim());
    if (cells[0] && cells[0].toLowerCase() === 'submit') {
      buttonLabel = cells[1] || buttonLabel;
      return;
    }
    if (!cells[0]) return;
    fields.push({
      label: cells[0],
      name: cells[1] || cells[0].toLowerCase(),
      type: cells[2] || 'text',
      required: (cells[3] || '').toLowerCase() === 'required',
      placeholder: cells[4] || '',
    });
  });

  const card = document.createElement('div');
  card.className = 'register-card';

  const heading = document.createElement('h2');
  heading.textContent = title;

  const form = document.createElement('form');
  form.noValidate = true;
  form.className = 'register-form';

  const grid = document.createElement('div');
  grid.className = 'register-grid';

  fields.forEach((field, index) => {
    const wrap = document.createElement('label');
    wrap.className = 'register-field';
    if (index === 0) wrap.classList.add('is-full');
    const caption = document.createElement('span');
    caption.textContent = field.label;
    const input = document.createElement('input');
    input.name = field.name;
    input.type = field.type === 'email' ? 'email' : 'text';
    input.placeholder = field.placeholder;
    input.autocomplete = field.type === 'email' ? 'email' : 'on';
    if (field.required) input.required = true;
    wrap.append(caption, input);
    grid.append(wrap);
  });

  const honeypot = document.createElement('label');
  honeypot.className = 'register-honeypot';
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.textContent = 'Company website';
  const trap = document.createElement('input');
  trap.type = 'text';
  trap.name = 'company_website';
  trap.tabIndex = -1;
  trap.autocomplete = 'off';
  honeypot.append(trap);

  const actions = document.createElement('div');
  actions.className = 'register-actions';
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = buttonLabel;
  actions.append(button);

  const status = document.createElement('p');
  status.className = 'register-status';
  status.setAttribute('role', 'status');

  const success = document.createElement('div');
  success.className = 'register-success';
  success.hidden = true;
  success.innerHTML = '<h2>Thank you</h2><p>Your interest in AO Exchange has been received. We will be in touch with event details.</p>';

  form.append(grid, honeypot, actions, status);
  card.append(heading, form, success);
  block.replaceChildren(card);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');
    const invalid = [...form.querySelectorAll('input')].find((input) => !input.checkValidity());
    if (invalid && invalid.name !== 'company_website') {
      invalid.reportValidity();
      return;
    }
    if (trap.value) {
      form.hidden = true;
      heading.hidden = true;
      success.hidden = false;
      return;
    }

    const endpoint = document.querySelector('meta[name="form-endpoint"]')?.content?.trim();
    const payload = { source: 'ao-exchange' };
    fields.forEach((field) => {
      payload[field.name] = form.elements[field.name].value.trim();
    });

    const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (!endpoint) {
      if (local) {
        form.hidden = true;
        heading.hidden = true;
        success.hidden = false;
        success.insertAdjacentHTML('beforeend', '<p class="register-preview-note">Preview only. Set the form-endpoint meta tag before go-live so responses are stored.</p>');
        return;
      }
      status.classList.add('is-error');
      status.textContent = 'Registration is not available yet. Please try again later.';
      return;
    }

    button.disabled = true;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      form.hidden = true;
      heading.hidden = true;
      success.hidden = false;
    } catch {
      status.classList.add('is-error');
      status.textContent = 'We could not send your registration. Please try again.';
      button.disabled = false;
    }
  });
}
