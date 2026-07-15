// ===== Мобильное меню =====
const burger = document.getElementById('burger');
const navMobile = document.getElementById('navMobile');

burger.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('nav-mobile--open');
  burger.setAttribute('aria-expanded', String(isOpen));
});

navMobile.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navMobile.classList.remove('nav-mobile--open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

// ===== Обратный отсчёт до начала форума =====
// Дата начала форума: 8 октября 2026, 00:00 (по местному времени посетителя)
const FORUM_START = new Date('2026-10-08T00:00:00');

const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');

function pad(n) { return String(n).padStart(2, '0'); }

function setCountdownValue(el, value) {
  if (el.textContent === value) return;
  el.textContent = value;
  el.classList.remove('tick');
  // eslint-disable-next-line no-unused-expressions
  el.offsetWidth; // force reflow so the animation replays on rapid updates
  el.classList.add('tick');
}

function updateCountdown() {
  const diff = FORUM_START - new Date();
  if (diff <= 0) {
    setCountdownValue(cdDays, '00');
    setCountdownValue(cdHours, '00');
    setCountdownValue(cdMins, '00');
    setCountdownValue(cdSecs, '00');
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  setCountdownValue(cdDays, pad(days));
  setCountdownValue(cdHours, pad(hours));
  setCountdownValue(cdMins, pad(mins));
  setCountdownValue(cdSecs, pad(secs));
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Форма регистрации =====
// TODO(разработчик): чтобы заявки уходили в Google Таблицу, создайте
// Google Apps Script Web App (он даёт URL вида
// https://script.google.com/macros/s/XXXXX/exec), который принимает
// POST-запрос и записывает данные в таблицу. Вставьте этот URL сюда:
const GOOGLE_SHEETS_ENDPOINT = ''; // <-- вставить URL Web App

const regForm = document.getElementById('regForm');
const regStatus = document.getElementById('regStatus');

regForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(regForm).entries());

  if (!GOOGLE_SHEETS_ENDPOINT) {
    console.log('Заявка (заглушка, endpoint не настроен):', data);
    regStatus.textContent = 'Форма пока не подключена к таблице — заявка выведена в консоль браузера.';
    return;
  }

  regStatus.textContent = 'Отправляем заявку…';
  try {
    await fetch(GOOGLE_SHEETS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    regStatus.textContent = 'Спасибо! Заявка отправлена.';
    regForm.reset();
  } catch (err) {
    regStatus.textContent = 'Не удалось отправить заявку. Попробуйте позже.';
  }
});

// ===== Scroll-reveal появление блоков =====
const revealItems = document.querySelectorAll('[data-reveal]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  revealItems.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      // Elements that cross the threshold together (e.g. a card grid scrolling
      // into view as one group) cascade in with a slight stagger instead of
      // popping in simultaneously.
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = Math.min(i, 6) * 90;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px 150px 0px' }
  );
  revealItems.forEach((el) => revealObserver.observe(el));

  // Safety net: guarantee content is never stuck invisible (fast flick-scroll,
  // tab throttling, etc.) — force-reveal anything the observer missed.
  window.addEventListener('load', () => {
    setTimeout(() => {
      revealItems.forEach((el) => el.classList.add('is-visible'));
    }, 4000);
  });
}

// ===== Плавающая CTA-кнопка на мобильном =====
const stickyCta = document.getElementById('stickyCta');
const heroSection = document.getElementById('top');
const registerSection = document.getElementById('register');

const stickyObserver = new IntersectionObserver(
  ([entry]) => {
    stickyCta.classList.toggle('is-visible', !entry.isIntersecting);
  },
  { threshold: 0 }
);
stickyObserver.observe(heroSection);

const registerObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) stickyCta.classList.remove('is-visible');
  },
  { threshold: 0.3 }
);
registerObserver.observe(registerSection);
