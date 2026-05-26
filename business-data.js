const TGSCreative = {
  contactEmail: 'info@tgsstudios.com',
  website: 'https://tgsstudios.co.uk',
  linkedin: 'https://www.linkedin.com/company/118834600',
  formspree: 'https://formspree.io/f/mykvbdzp',
  regions: ['United Kingdom', 'West Africa', 'United States'],
  brands: [
    {
      name: 'tGS Creative',
      summary: 'Strategy, management, media production, and brand architecture for expertise that deserves reach.'
    },
    {
      name: 'WYA',
      summary: 'Wear Your Ambition — a fashion label built around execution, authenticity, and standard.'
    }
  ]
};

(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  const currentYear = new Date().getFullYear();
  const yearNodes = document.querySelectorAll('[data-year]');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

  yearNodes.forEach(node => {
    node.textContent = currentYear;
  });

  if (themeToggle) {
    const syncLabel = () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.innerHTML = isDark
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3c0 .29.02.58.05.87A7 7 0 0 0 21 12.79Z"></path></svg>';
    };
    syncLabel();
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      syncLabel();
    });
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open');
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }
})();
