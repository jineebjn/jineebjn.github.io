// Subtle connected-particle background for the hero section.
(function () {
  const canvas = document.querySelector(".hero-particles");
  if (!canvas || !canvas.getContext) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const hero = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const color = "15, 95, 168";
  const linkDist = 130;
  const mouse = { x: -9999, y: -9999 };
  let particles = [];
  let width = 0;
  let height = 0;
  let running = false;
  let frame = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(Math.min(70, Math.max(24, (width * height) / 16000)));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 1
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      // Gentle push away from the cursor
      const mx = p.x - mouse.x;
      const my = p.y - mouse.y;
      const md = Math.hypot(mx, my);
      if (md < 110 && md > 0) {
        p.x += (mx / md) * 0.9;
        p.y += (my / md) * 0.9;
      }

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < linkDist) {
          ctx.strokeStyle = "rgba(" + color + "," + (0.18 * (1 - d / linkDist)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = "rgba(" + color + ", 0.45)";
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (running) frame = requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    running = true;
    frame = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  hero.addEventListener("pointermove", function (e) {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener("pointerleave", function () {
    mouse.x = mouse.y = -9999;
  });

  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  // Only animate while the hero is on screen and the tab is visible
  let heroVisible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      heroVisible && !document.hidden ? start() : stop();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () {
    !document.hidden && heroVisible ? start() : stop();
  });

  resize();
  start();
})();
