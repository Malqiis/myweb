document.addEventListener("DOMContentLoaded", () => {
  // Keep the footer year current.
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  // Responsive navigation.
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#site-nav");
  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }


  // Dark / light theme toggle. 
  const themeButton = document.querySelector("#theme-toggle");
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    if (themeButton) {
      const dark = theme === "dark";
      themeButton.innerHTML = dark ? "☀ <span>Light mode</span>" : "☾ <span>Dark mode</span>";
      themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
  };
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("qis-theme"); } catch (_) {}
  const initialTheme = savedTheme || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(initialTheme);
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("qis-theme", next); } catch (_) {}
    });
  }

  // Interactive photo gallery with keyboard-friendly lightbox controls.
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.querySelector("#gallery-lightbox");
  if (galleryItems.length && lightbox) {
    const image = lightbox.querySelector("#lightbox-image");
    const caption = lightbox.querySelector("#lightbox-caption");
    let activeIndex = 0;
    const showPhoto = (index) => {
      activeIndex = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[activeIndex];
      image.src = item.dataset.full;
      image.alt = item.querySelector("img").alt;
      caption.textContent = item.dataset.caption || "";
    };
    const closeGallery = () => { lightbox.hidden = true; document.body.classList.remove("lightbox-open"); };
    galleryItems.forEach((item, index) => item.addEventListener("click", () => {
      showPhoto(index); lightbox.hidden = false; document.body.classList.add("lightbox-open");
      lightbox.querySelector(".lightbox-close").focus();
    }));
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeGallery);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showPhoto(activeIndex - 1));
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(activeIndex + 1));
    lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeGallery(); });
    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") showPhoto(activeIndex - 1);
      if (event.key === "ArrowRight") showPhoto(activeIndex + 1);
    });
  }

  // Comments form: validate locally and show a preview. It does not send data.
  const form = document.querySelector("#comment-form");
  const message = document.querySelector("#visitor-message");
  const count = document.querySelector("#char-count");
  const result = document.querySelector("#form-result");

  if (message && count) {
    const updateCount = () => { count.textContent = String(message.value.length); };
    message.addEventListener("input", updateCount);
    updateCount();
  }

  if (form && result) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const topic = String(data.get("topic") || "");
      const rating = String(data.get("rating") || "");
      const comment = String(data.get("message") || "").trim();

      // Use textContent to avoid treating user-entered text as HTML.
      result.replaceChildren();
      const heading = document.createElement("h3");
      heading.textContent = `Thank you, ${name} ♡`;
      const topicLine = document.createElement("p");
      topicLine.textContent = `Topic: ${topic} · Rating: ${rating}/5`;
      const commentLine = document.createElement("p");
      commentLine.textContent = `Your comment: “${comment}”`;
      const note = document.createElement("p");
      note.textContent = "This is a local preview only. Nothing has been sent or stored online.";
      result.append(heading, topicLine, commentLine, note);
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
});
