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

// Smooth Scroll for on-page anchors
const internalLinks = document.querySelectorAll('a[href^="#"]');
internalLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Back to top button
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

// Optional: Support setting YouTube video via URL query, e.g., ?v=YOUR_ID
(function(){
  const params = new URLSearchParams(location.search);
  const vid = params.get('v');
  const frame = document.getElementById('liveFrame');
  const errorBox = document.getElementById('liveError');
  const ytLiveLink = document.getElementById('ytLiveLink');
  if (!frame) return;

  const ORIGIN = location.origin || window.location.origin || '';

  const HOST = 'https://www.youtube-nocookie.com';

  function withParams(base, extra) {
    const url = new URL(base);
    const defaults = {
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      enablejsapi: '1',
      origin: ORIGIN
    };
    const all = Object.assign({}, defaults, extra || {});
    Object.entries(all).forEach(([k,v]) => url.searchParams.set(k, v));
    return url.toString();
  }

  function showError(linkHref) {
    if (!errorBox) return;
    errorBox.hidden = false;
    if (ytLiveLink && linkHref) ytLiveLink.href = linkHref;
  }

  // Highest priority: explicit video override via ?v=
  if (vid) {
    frame.src = withParams(`${HOST}/embed/${vid}`);
    return;
  }

  // Priority logic: try channel-live first (auto-picks new lives), then fallback to direct video ID
  const CHANNEL_ID = 'UCNGE1mV2DBLjbryJSU1c0NA';
  const FALLBACK_VIDEO_ID = 'sUpyNDIHU9w';

  // Start with channel live so new streams auto-play
  const channelLiveBase = `${HOST}/embed/live_stream?channel=${CHANNEL_ID}`;
  frame.src = withParams(channelLiveBase);

  // Load YouTube IFrame API
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  let player = null;
  let switched = false;
  let playStarted = false;

  function useFallback() {
    if (switched) return;
    switched = true;
    // Fallback to the specific known video ID
    const directVideoBase = `${HOST}/embed/${FALLBACK_VIDEO_ID}`;
    frame.src = withParams(directVideoBase);
  }

  // Global callback required by the API
  window.onYouTubeIframeAPIReady = function() {
    try {
      player = new YT.Player('liveFrame', {
        events: {
          onReady: function(){ /* no-op */ },
          onStateChange: function(e){
            // 1 = playing, 3 = buffering
            if (e.data === 1 || e.data === 3) {
              playStarted = true;
            }
          },
          onError: function(){
            useFallback();
          }
        }
      });
    } catch (err) {
      // If API init fails, fallback
      useFallback();
    }
  };

  // Time-based fallback if nothing starts within 8 seconds
  setTimeout(() => {
    if (!playStarted) {
      useFallback();
      // If still nothing after trying fallback, show error link
      setTimeout(() => {
        if (!playStarted) {
          showError(`https://www.youtube.com/@Saibabadarshanliveshirdi/live`);
        }
      }, 4000);
    }
  }, 8000);
})();
