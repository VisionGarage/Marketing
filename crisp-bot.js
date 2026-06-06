(function () {
  'use strict';

  if (!window.$crisp) { window.$crisp = []; }

  // ── Branding (gold to match VisionGarage theme) ────────────────────────────
  $crisp.push(['config', 'color:theme', ['#b8952a']]);
  $crisp.push(['safe', true]);

  // ── Attach session context as soon as Crisp is ready ──────────────────────
  $crisp.push(['on', 'session:loaded', function () {
    $crisp.push(['set', 'session:data', [[
      ['pagina',    'Campanie Remote Dispozitiv'],
      ['cod_promo', 'VISIONGARAGE'],
      ['sursa',     document.referrer || 'direct']
    ]]]);
  }]);

  // ── Per-session state (avoids repeating the same message) ─────────────────
  var KEY = 'vg_crisp';
  var state = {};
  try { state = JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch (_) {}
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

  function bot(text) {
    $crisp.push(['do', 'message:show', ['text', text]]);
  }

  // ── 1. Greeting — 15 s after page load, once per session ──────────────────
  if (!state.greeted) {
    setTimeout(function () {
      bot('Salut! 👋 Ai ajuns pe pagina VisionGarage. Ai întrebări despre dispozitivul remote sau cum funcționează o sesiune? Scrie-mi — răspundem rapid.');
      state.greeted = true;
      save();
    }, 15000);
  }

  // ── 2. Device section tip — fires 6 s after scrolling to #dispozitive ──────
  var devEl = document.getElementById('dispozitive');
  if (devEl && !state.devsTip && window.IntersectionObserver) {
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        setTimeout(function () {
          if (!state.devsTip) {
            bot(
              'Nu ești sigur ce dispozitiv îți trebuie? 🤔\n\n' +
              '📶 Wi-Fi — lucrări standard: Component Protection VAG, codări BMW/VAG, SVM, inițializări.\n' +
              '🔌 LAN — programare ECU, SCN Coding Mercedes, NCD 2.0 BMW (seria G/I 2021+), sesiuni lungi.\n\n' +
              'Spune-mi cu ce mărci lucrezi și îți recomand varianta potrivită.'
            );
            state.devsTip = true;
            save();
          }
        }, 6000);
      }
    }, { threshold: 0.5 });
    obs.observe(devEl);
  }

  // ── 3. Exit intent — desktop, once per session ────────────────────────────
  if (!state.exitShown) {
    document.addEventListener('mouseleave', function onExit(e) {
      if (e.clientY < 5) {
        bot('Stai o secundă! 🛑 Codul promo VISIONGARAGE e activ și se aplică automat la checkout. Ai vreo întrebare înainte să pleci? Suntem și pe WhatsApp 📱');
        state.exitShown = true;
        save();
        document.removeEventListener('mouseleave', onExit);
      }
    });
  }

  // ── 4. Tag session when visitor clicks a checkout button ──────────────────
  document.querySelectorAll('a[href*="buy.stripe.com"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var label = this.textContent.trim().replace(/\s+/g, ' ');
      $crisp.push(['set', 'session:event', [[
        ['checkout_intent', { buton: label }]
      ]]]);
    });
  });

})();
