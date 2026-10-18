const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const progressBar = document.querySelector("#scroll-progress-bar");

function updateHeader() {
  if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
}

function updateScrollProgress() {
  if (!progressBar) return;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
}

let scrollFrame = 0;
window.addEventListener("scroll", () => {
  updateHeader();
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateScrollProgress();
    scrollFrame = 0;
  });
}, { passive: true });
window.addEventListener("resize", updateScrollProgress, { passive: true });
updateHeader();
updateScrollProgress();

function closeMenu() {
  if (!menuToggle || !siteNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "メニューを開く");
  siteNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "メニューを開く" : "メニューを閉じる");
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const filterButtons = [...document.querySelectorAll(".work-filter")];
const workCards = [...document.querySelectorAll(".work-card")];
const filterStatus = document.querySelector("#work-filter-status");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    let visibleCount = 0;
    workCards.forEach((card) => {
      const matches = selectedFilter === "all" || card.dataset.category === selectedFilter;
      if (matches) visibleCount += 1;

      if (window.gsap && !prefersReducedMotion) {
        window.gsap.killTweensOf(card);
        if (matches) {
          card.hidden = false;
          window.gsap.fromTo(card, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "opacity,visibility,transform" });
        } else if (!card.hidden) {
          window.gsap.to(card, { autoAlpha: 0, y: 6, duration: 0.18, ease: "power1.out", onComplete: () => { card.hidden = true; } });
        }
      } else {
        card.hidden = !matches;
      }
    });

    if (filterStatus) filterStatus.textContent = `${visibleCount}件の施工事例を表示しています。`;
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
});

const galleryModal = document.querySelector("#gallery-modal");
const galleryModalImage = document.querySelector("#gallery-modal-image");
const galleryModalCaption = document.querySelector("#gallery-modal-caption");

function openGallery(workImage) {
  const image = workImage.querySelector("img");
  if (!galleryModal || !galleryModalImage || !image || !image.naturalWidth) return;
  const title = workImage.closest(".work-card")?.querySelector("h3")?.textContent.trim() || image.alt;
  galleryModalImage.src = image.currentSrc || image.src;
  galleryModalImage.alt = image.alt;
  if (galleryModalCaption) galleryModalCaption.textContent = title;
  if (typeof galleryModal.showModal === "function") galleryModal.showModal();
  else galleryModal.setAttribute("open", "");
}

document.querySelectorAll(".work-image[role='button']").forEach((workImage) => {
  workImage.addEventListener("click", () => openGallery(workImage));
  workImage.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGallery(workImage);
    }
  });
});

if (galleryModal) {
  galleryModal.querySelector(".modal-close")?.addEventListener("click", () => galleryModal.close());
  galleryModal.addEventListener("click", (event) => {
    if (event.target === galleryModal) galleryModal.close();
  });
  galleryModal.addEventListener("close", () => {
    if (galleryModalImage) galleryModalImage.removeAttribute("src");
    if (galleryModalCaption) galleryModalCaption.textContent = "";
  });
}

const faqItems = [...document.querySelectorAll(".faq-list details")];
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

const revealItems = document.querySelectorAll(".reveal");
function animateCounters(section) {
  const counters = section.querySelectorAll("[data-count]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatter = new Intl.NumberFormat("ja-JP");

  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      counter.textContent = formatter.format(target);
      return;
    }

    if (window.gsap) {
      const count = { value: 0 };
      window.gsap.to(count, {
        value: target,
        duration: 1.6,
        ease: "power1.out",
        snap: { value: 1 },
        onUpdate: () => { counter.textContent = formatter.format(count.value); },
      });
      return;
    }

    const startTime = performance.now();
    const duration = 1200;
    const update = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      counter.textContent = formatter.format(Math.floor(target * progress));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReducedMotion) {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
    if (item.matches(".stats")) animateCounters(item);
  });
} else if (window.gsap && window.ScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.gsap.from(".hero-eyebrow, .hero h1, .hero-copy, .hero .button", {
    y: 20,
    autoAlpha: 0,
    duration: 0.75,
    stagger: 0.1,
    ease: "power2.out",
    delay: 0.1,
  });
  revealItems.forEach((item) => {
    const animation = window.gsap.fromTo(item,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.72, ease: "power2.out", paused: true, onComplete: () => item.classList.add("is-visible") },
    );
    window.ScrollTrigger.create({
      trigger: item,
      start: "top 88%",
      once: true,
      onEnter: () => {
        animation.play();
        if (item.matches(".stats")) animateCounters(item);
      },
    });
  });
} else if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target.matches(".stats")) animateCounters(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
    if (item.matches(".stats")) animateCounters(item);
  });
}

document.querySelectorAll(".promise-photo img, .work-image img").forEach((image) => {
  const showPlaceholder = () => {
    const container = image.closest("[data-placeholder]");
    if (container) container.classList.add("is-placeholder");
    image.hidden = true;
  };
  image.addEventListener("error", showPlaceholder, { once: true });
  if (image.complete && image.naturalWidth === 0) showPlaceholder();
});

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const successModal = document.querySelector("#contact-success-modal");
if (contactForm && formStatus) {
  const submitButton = contactForm.querySelector("button[type='submit']");
  const submitLabel = submitButton?.textContent.trim() || "送信する";

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) {
      formStatus.classList.remove("is-success");
      formStatus.classList.add("is-error");
      formStatus.textContent = "必須項目をご確認ください。";
      return;
    }

    const values = Object.fromEntries(new FormData(contactForm).entries());
    if (values._honey) return;
    values._replyto = values.email;

    formStatus.classList.remove("is-error", "is-success");
    formStatus.textContent = "送信しています…";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "送信中…";
    }

    try {
      const endpoint = new URL(contactForm.action);
      endpoint.pathname = `/ajax${endpoint.pathname}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== "true")) {
        throw new Error("送信に失敗しました。");
      }

      formStatus.classList.add("is-success");
      formStatus.textContent = "お問い合わせを送信しました。ご連絡ありがとうございます。";
      contactForm.reset();
      if (successModal && typeof successModal.showModal === "function") successModal.showModal();
    } catch {
      formStatus.classList.add("is-error");
      formStatus.textContent = "送信できませんでした。時間をおいて再度お試しいただくか、お電話でご連絡ください。";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
      }
    }
  });
}