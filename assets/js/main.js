/* CX Craft Js */

  // Clear hash on load
  history.replaceState(null, '', window.location.pathname);

  // Hamburger
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  ham.addEventListener('click', () => {
    nav.classList.toggle('open');
    ham.innerHTML = nav.classList.contains('open') ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    ham.innerHTML = '<i class="bi bi-list"></i>';
  }));

  // Prevent hash in URL — smooth scroll instead
  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  //Scroll to top on logo click
  const logoLink = document.querySelector('a.logo[href^="#"]');
  if (logoLink) {
    logoLink.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active nav on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');
  sections.forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          const active = document.querySelector('nav a[href="#' + e.target.id + '"]');
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.3 }).observe(s);
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // Fade up
  document.querySelectorAll('.fade-up').forEach(el => {
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 }).observe(el);
  });

  // Form submit
  const form = document.querySelector('.contact-form-wrap');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      const successMsg = document.getElementById('form-success');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          form.reset();
          btn.innerHTML = '✓ Sent! I’ll be in touch soon.';
          setTimeout(() => {
            btn.innerHTML = 'Book a free consultation <i class="bi bi-arrow-right"></i>';
            btn.disabled = false;
            successMsg.style.display = 'none';
          }, 8000);
        } else {
          const data = await response.json().catch(() => ({}));
          if (data.errors) {
            alert(data.errors.map(e => e.message).join(', '));
          } else {
            alert('Something went wrong. Please try again or message me on WhatsApp.');
          }
          btn.innerHTML = 'Book a free consultation <i class="bi bi-arrow-right"></i>';
          btn.disabled = false;
        }
      } catch (error) {
        alert('Connection error. Please try again or message me on WhatsApp.');
        btn.innerHTML = 'Book a free consultation <i class="bi bi-arrow-right"></i>';
        btn.disabled = false;
      }
    });
  }
*/

  // Form submit — (contact.php)
  const form = document.getElementById('contactForm');
  if (form) {
    // Show success if redirected back
    if (window.location.hash.includes('contact') && window.location.search.includes('success=1')) {
      const s = document.getElementById('form-success');
      if (s) { s.style.display = 'block'; setTimeout(() => s.style.display = 'none', 8000); }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn  = form.querySelector('.submit-btn');
      const succ = document.getElementById('form-success');
      const err  = document.getElementById('form-error');
      succ.style.display = 'none';
      err.style.display  = 'none';
      btn.textContent    = 'Sending…';
      btn.disabled       = true;

      try {
        const res  = await fetch('contact.php', {
          method: 'POST',
          body: new FormData(form),
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          succ.style.display = 'block';
          succ.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          form.reset();
          btn.innerHTML = '✓ Sent! I’ll be in touch within 24 hours.';
          setTimeout(() => {
            btn.innerHTML = 'Book a free consultation <i class="bi bi-arrow-right"></i>';
            btn.disabled  = false;
            succ.style.display = 'none';
          }, 8000);
        } else {
          const msg = data.errors ? data.errors.join(' ') : (data.message || 'Something went wrong. Please try WhatsApp.');
          err.textContent   = msg;
          err.style.display = 'block';
          btn.innerHTML     = 'Book a free consultation <i class="bi bi-arrow-right"></i>';
          btn.disabled      = false;
        }
      } catch (ex) {
        err.textContent   = 'Connection error. Please try again or message on WhatsApp.';
        err.style.display = 'block';
        btn.innerHTML     = 'Book a free consultation <i class="bi bi-arrow-right"></i>';
        btn.disabled      = false;
      }
    });
  }
