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

document.addEventListener("DOMContentLoaded", () => {
  initRevealOnScroll();
  const cards = document.querySelectorAll(".card");
  if (cards.length && "IntersectionObserver" in window === false) {
    cards.forEach((card) => card.classList.add("visible"));
  }
});
