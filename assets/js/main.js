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
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      try {
        const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
        if (res.ok) { document.getElementById('form-success').style.display = 'block'; form.reset(); }
      } catch(err) {}
      btn.innerHTML = 'Book a free consultation <i class="bi bi-arrow-right"></i>';
      btn.disabled = false;
    });
  }