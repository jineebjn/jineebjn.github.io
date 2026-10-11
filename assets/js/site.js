(function () {
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  toggle.addEventListener("click", function () {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Header shadow once the page is scrolled
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal, with a small stagger for items in the same group
  const groups = [
    ".section-title", ".section .lead", "#about p:not(.lead)",
    ".highlights li", ".timeline > li", ".skill-grid .card",
    ".cred-list li", ".contact-list li", ".contact-form"
  ];
  const revealEls = [];
  groups.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.setProperty("--delay", Math.min(i % 6, 5) * 0.08 + "s");
      revealEls.push(el);
    });
  });
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    const revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealer.observe(el); });
  }

  // Highlight the nav link for the section in view
  const links = nav.querySelectorAll('a[href^="#"]:not(.nav-cta)');
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) {
      const section = document.querySelector(a.getAttribute("href"));
      if (section) spy.observe(section);
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  // Contact form (sent via FormSubmit to info@jineebjn.com)
  const form = document.getElementById("contact-form");
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type=submit]");
  const endpoint = "https://formsubmit.co/ajax/info@jineebjn.com";

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    button.disabled = true;
    setStatus("Sending…");

    const data = new FormData(form);
    data.append("_captcha", "false");
    data.append("_template", "table");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        setStatus("Thank you. Your message has been sent.", "ok");
        form.reset();
      } else {
        const body = await response.json().catch(function () { return {}; });
        setStatus(body.message || "Sorry, something went wrong. Please email info@jineebjn.com.", "err");
      }
    } catch (err) {
      setStatus("Sorry, the message could not be sent. Please email info@jineebjn.com.", "err");
    } finally {
      button.disabled = false;
    }
  });
})();
