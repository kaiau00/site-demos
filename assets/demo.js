const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const root = document.documentElement;
const hero = document.querySelector(".hero");
const rating = document.querySelector(".rating");
const counters = [...(rating ? rating.querySelectorAll("[data-count]") : [])].map((element) => ({
  element,
  value: Number(element.textContent),
  decimals: element.textContent.split(".")[1]?.length ?? 0,
}));
let ratingStarted = false;

function showCounts(progress) {
  for (const { element, value, decimals } of counters) {
    element.textContent = (value * progress).toFixed(decimals);
  }
}

if (!reducedMotion.matches) root.classList.add("intro");

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      target.classList.add("visible");
      if (target !== rating || reducedMotion.matches || ratingStarted) continue;

      ratingStarted = true;
      requestAnimationFrame(function count(start) {
        const tick = (now) => {
          const time = Math.min((now - start) / 1050, 1);
          showCounts(reducedMotion.matches ? 1 : 1 - (1 - time) ** 3);
          if (time < 1 && !reducedMotion.matches) requestAnimationFrame(tick);
        };
        tick(start);
      });
    }
  }, { threshold: 0.12 });

  root.classList.add("motion");
  document.querySelectorAll("[data-reveal], .rating").forEach((element) => observer.observe(element));
}

let scrollFrame = 0;
function updateDrift() {
  scrollFrame = 0;
  const offset = reducedMotion.matches ? 0 : Math.min(window.scrollY * 0.1, 38);
  hero.style.setProperty("--drift", `${offset}px`);
}
addEventListener("scroll", () => {
  if (!scrollFrame && !reducedMotion.matches) scrollFrame = requestAnimationFrame(updateDrift);
}, { passive: true });
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    root.classList.remove("intro", "motion");
    ratingStarted = true;
    showCounts(1);
  }
  updateDrift();
});
updateDrift();
