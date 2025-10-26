// Mobile Nav Toggle
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

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Back to top
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

// ---------- YOUTUBE LIVE OR LATEST VIDEO AUTO DETECT ----------
(async function() {
  const frame = document.getElementById('liveFrame');
  const errorBox = document.getElementById('liveError');
  const ytLink = document.getElementById('ytLiveLink');
  const CHANNEL_ID = "UCNGE1mV2DBLjbryJSU1c0NA"; // your channel id
  const API_KEY = "AIzaSyBD838bAxqHF1Fh_X_PbvkxZtJgdEcsvYQ";

  async function getLiveVideoId() {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`);
    const data = await res.json();
    return data.items?.[0]?.id?.videoId || null;
  }

  async function getLatestVideoId() {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=1&key=${API_KEY}`);
    const data = await res.json();
    return data.items?.[0]?.id?.videoId || null;
  }

  async function loadVideo() {
    try {
      let videoId = await getLiveVideoId();
      if (!videoId) {
        videoId = await getLatestVideoId();
      }
      if (videoId) {
        frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
      } else {
        errorBox.hidden = false;
        ytLink.href = `https://www.youtube.com/channel/${CHANNEL_ID}`;
      }
    } catch (err) {
      console.error(err);
      errorBox.hidden = false;
      ytLink.href = `https://www.youtube.com/channel/${CHANNEL_ID}`;
    }
  }

  loadVideo();
})();
