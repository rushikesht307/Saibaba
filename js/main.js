// ----------------- MOBILE NAV TOGGLE -----------------
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('primaryNav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ----------------- SMOOTH SCROLL -----------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ----------------- BACK TO TOP -----------------
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  const toggleBtn = () => {
    if (window.scrollY > 600) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  };
  window.addEventListener('scroll', toggleBtn);
  toggleBtn();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ----------------- YOUTUBE VIA CLIENT API (browser) -----------------
const frame = document.getElementById('liveFrame');
const errorBox = document.getElementById('liveError');
const ytLink = document.getElementById('ytLiveLink');

const CHANNEL_ID = 'UCNGE1mV2DBLjbryJSU1c0NA';
const API_KEY = 'AIzaSyA4TC8cZV34hTcJVPSPcCE0UqRodqKGrLc';

function setVideo(videoId){
  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;
}

async function ytSearch(params){
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  params.forEach(([k,v]) => url.searchParams.set(k, v));
  url.searchParams.set('key', API_KEY);
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`YouTube API ${r.status}`);
  return r.json();
}

async function getLiveVideoId(){
  const data = await ytSearch([
    ['part','snippet'],
    ['channelId', CHANNEL_ID],
    ['eventType','live'],
    ['type','video'],
    ['maxResults','1']
  ]);
  return data.items?.[0]?.id?.videoId || null;
}

async function getLatestVideoId(){
  const data = await ytSearch([
    ['part','snippet'],
    ['channelId', CHANNEL_ID],
    ['order','date'],
    ['type','video'],
    ['maxResults','1']
  ]);
  return data.items?.[0]?.id?.videoId || null;
}

async function loadVideo(){
  try {
    const params = new URLSearchParams(location.search);
    const overrideVid = params.get('v');
    if (overrideVid){
      setVideo(overrideVid);
      errorBox.hidden = true;
      return;
    }

    let vid = await getLiveVideoId();
    if (!vid) vid = await getLatestVideoId();

    if (vid){
      setVideo(vid);
      errorBox.hidden = true;
    } else {
      frame.src = 'about:blank';
      errorBox.hidden = false;
      if (ytLink) ytLink.href = `https://www.youtube.com/channel/${CHANNEL_ID}`;
    }
  } catch (e) {
    console.error('YouTube load failed:', e);
    frame.src = 'about:blank';
    errorBox.hidden = false;
    if (ytLink) ytLink.href = `https://www.youtube.com/channel/${CHANNEL_ID}`;
  }
}

loadVideo();
setInterval(loadVideo, 2 * 60 * 1000);

// ----------------- LIVE PLAYER QUICK ACTIONS -----------------
const btnDirect = document.getElementById('tryDirect');
const btnChannel = document.getElementById('tryChannel');
if (btnDirect) {
  btnDirect.addEventListener('click', async () => {
    const manual = prompt('Enter YouTube video ID (the part after v=)');
    if (manual && manual.trim()) {
      setVideo(manual.trim());
      if (errorBox) errorBox.hidden = true;
    } else {
      const latest = await getLatestVideoId().catch(() => null);
      if (latest) {
        setVideo(latest);
        if (errorBox) errorBox.hidden = true;
      }
    }
  });
}
if (btnChannel && frame) {
  btnChannel.addEventListener('click', () => {
    frame.src = `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    if (errorBox) errorBox.hidden = true;
  });
}

// ----------------- DIGITAL PRASAD FORM -----------------
const prasadForm = document.getElementById('prasadForm');
const thankYou = document.getElementById('thankYou');
if (prasadForm) {
  prasadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name');
    const prayer = document.getElementById('prayer');
    const nm = name && name.value.trim();
    const pr = prayer && prayer.value.trim();
    if (!nm || !pr) return;
    try {
      const entries = JSON.parse(localStorage.getItem('prasad_offers') || '[]');
      entries.push({ n: nm, p: pr, t: Date.now() });
      localStorage.setItem('prasad_offers', JSON.stringify(entries));
    } catch {}
    prasadForm.reset();
    if (thankYou) {
      thankYou.classList.remove('hidden');
      setTimeout(() => thankYou.classList.add('hidden'), 4000);
    }
  });
}

// ----------------- FADE IN ON VIEW -----------------
const toReveal = document.querySelectorAll('.fade-in, .aarti-card, .place-card, .section');
if ('IntersectionObserver' in window && toReveal.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((ent) => {
      if (ent.isIntersecting) {
        ent.target.classList.add('in-view');
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.15 });
  toReveal.forEach(el => io.observe(el));
}
