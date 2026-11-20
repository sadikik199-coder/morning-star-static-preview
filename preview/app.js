'use strict';
// v0.5 READ-ONLY public preview: never collect personal data, never call a remote API.
(function () {
  const allowedPages = new Set(['home','cricket','kpl','service','meetings','gallery','overseas','members','finance','documents','security']);
  const pages = Array.from(document.querySelectorAll('.page'));
  const navButtons = Array.from(document.querySelectorAll('button[data-page]'));
  function showPage(name) {
    if (!allowedPages.has(name)) return;
    for (const p of pages) {
      const isActive = p.id === 'page-' + name;
      p.hidden = !isActive;
      p.classList.toggle('active', isActive);
    }
    for (const btn of navButtons) {
      const active = btn.dataset.page === name;
      btn.classList.toggle('selected', active);
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    }
    window.scrollTo(0,0);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (button) showPage(button.dataset.page);
  });
  // No persistent storage, cookies, form submissions, telemetry, network calls or content injection.
  const offline = document.getElementById('offline-notice');
  function updateOnlineState() { if (offline) offline.hidden = navigator.onLine !== false; }
  window.addEventListener('offline', updateOnlineState);
  window.addEventListener('online', updateOnlineState);
  updateOnlineState();
  if ('serviceWorker' in navigator && window.isSecureContext && /^https:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js', {scope:'./'}).catch(() => {
        // Optional offline shell; installation remains unverified until device tests.
      });
    }, {once:true});
  }
  // Synthetic in-memory auction UI: no user input, storage, API or real bids.
  let demoBid = 0;
  let demoTeam = '';
  let lotClosed = false;
  const demoValue = document.getElementById('kpl-highest-bid');
  const demoLead = document.getElementById('kpl-leading-team');
  const demoStatus = document.getElementById('kpl-demo-status');
  function updateAuction() {
    if (demoValue) demoValue.textContent = demoBid ? demoBid + ' pts' : '–';
    if (demoLead) demoLead.textContent = demoTeam || 'No bid yet';
  }
  document.querySelectorAll('button[data-demo-bid]').forEach(btn => btn.addEventListener('click', () => {
    if (lotClosed) return;
    const next = demoBid ? demoBid + 10 : 50;
    if (next > 150) {
      if (demoStatus) demoStatus.textContent = 'Demo budget ಮಿತಿ: 150 points. Lot ಮುಗಿಸಿ ಅಥವಾ Reset ಮಾಡி.';
      return;
    }
    demoBid = next;
    demoTeam = btn.dataset.demoBid;
    if (demoStatus) demoStatus.textContent = demoTeam + ' bid ದಾಖಲಿಸಲಾಗಿದೆ — ' + demoBid + ' demo points (ನಿಜವಾದ Auction ಅಲ್ಲ).';
    updateAuction();
  }));
  const closeButton = document.getElementById('kpl-sold');
  if (closeButton) closeButton.addEventListener('click', () => {
    if (lotClosed) return;
    lotClosed = true;
    if (demoStatus) demoStatus.textContent = demoTeam ? 'SOLD — ' + demoTeam + ' • ' + demoBid + ' demo points.' : 'UNSOLD — Demo bid ಬಂದಿಲ್ಲ.';
  });
  const resetButton = document.getElementById('kpl-reset');
  if (resetButton) resetButton.addEventListener('click', () => {
    demoBid = 0; demoTeam = ''; lotClosed = false;
    updateAuction();
    if (demoStatus) demoStatus.textContent = 'ಪ್ರತಿ Teamಗೆ 150 demo points. ಪ್ರತಿ Bid ಕನಿಷ್ಠ 10 points ಹೆಚ್ಚುತ್ತದೆ.';
  });
  showPage('home');
})();
