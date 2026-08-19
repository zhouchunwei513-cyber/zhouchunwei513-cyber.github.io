const TRACK_API = "https://api.aiduty.asia";

function initRevealOnScroll() {
  const cards = document.querySelectorAll(".card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  cards.forEach((card) => observer.observe(card));
}

function trackVisit() {
  if (!TRACK_API || TRACK_API.includes("REPLACE_WITH_WORKER_URL")) return;
  try {
    navigator.sendBeacon(
      TRACK_API + "/api/track",
      new Blob([JSON.stringify({ path: location.pathname, ua: navigator.userAgent })], {
        type: "application/json",
      })
    );
  } catch (e) {
    fetch(TRACK_API + "/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname, ua: navigator.userAgent }),
    }).catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initRevealOnScroll();
  const cards = document.querySelectorAll(".card");
  if (cards.length && "IntersectionObserver" in window === false) {
    cards.forEach((card) => card.classList.add("visible"));
  }
  trackVisit();
});
