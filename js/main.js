(() => {
  const WEB3FORMS_KEY = "f6802bf7-6074-43a6-9b7f-67ab5f61feaf";
  const WEB3FORMS_URL = "https://api.web3forms.com/submit";

  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const year = document.getElementById("year");
  const links = nav ? [...nav.querySelectorAll("a")] : [];

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const sections = [...document.querySelectorAll("main section[id]")];

  const setActive = () => {
    const y = window.scrollY + 96;
    let current = sections[0]?.id;

    for (const section of sections) {
      if (section.offsetTop <= y) current = section.id;
    }

    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });
  };

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const submitWeb3Forms = async (payload) => {
    const response = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        ...payload,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Failed to send form");
    }
    return data;
  };

  const setBusy = (button, busy, label) => {
    if (!button) return;
    button.disabled = busy;
    if (label) button.textContent = label;
  };

  const createModalController = ({
    modalId,
    openSelector,
    closeSelector,
    onOpen,
  }) => {
    const modal = document.getElementById(modalId);
    if (!modal) return { open: () => {}, close: () => {}, isOpen: () => false };

    let lastFocus = null;

    const open = (detail) => {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add("modal-open");
      if (typeof onOpen === "function") onOpen(detail, modal);
      const focusable = modal.querySelector("button, [href], input, textarea");
      if (focusable) focusable.focus();
    };

    const close = () => {
      modal.hidden = true;
      if (![...document.querySelectorAll(".modal")].some((m) => !m.hidden)) {
        document.body.classList.remove("modal-open");
      }
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    document.querySelectorAll(openSelector).forEach((btn) => {
      btn.addEventListener("click", () => open(btn));
    });
    document.querySelectorAll(closeSelector).forEach((btn) => {
      btn.addEventListener("click", close);
    });

    return {
      open,
      close,
      isOpen: () => !modal.hidden,
    };
  };

  const waitlistModal = document.getElementById("waitlist-modal");
  const waitlistForm = document.getElementById("waitlist-form");
  const waitlistEmail = document.getElementById("waitlist-email");
  const waitlistError = document.getElementById("waitlist-error");
  const waitlistSuccess = document.getElementById("waitlist-success");
  const waitlistSubmit = waitlistForm?.querySelector('button[type="submit"]');
  const waitlistSubmitLabel = waitlistSubmit?.textContent || "Join waitlist";

  const waitlist = createModalController({
    modalId: "waitlist-modal",
    openSelector: "[data-open-waitlist]",
    closeSelector: "[data-close-waitlist]",
    onOpen: () => {
      if (waitlistForm) waitlistForm.hidden = false;
      if (waitlistSuccess) waitlistSuccess.hidden = true;
      if (waitlistError) {
        waitlistError.hidden = true;
        waitlistError.textContent = "Please enter a valid email.";
      }
      setBusy(waitlistSubmit, false, waitlistSubmitLabel);
      if (waitlistEmail) {
        waitlistEmail.value = "";
        requestAnimationFrame(() => waitlistEmail.focus());
      }
    },
  });

  if (waitlistForm && waitlistEmail) {
    waitlistForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = waitlistEmail.value.trim().toLowerCase();

      if (!isValidEmail(email)) {
        if (waitlistError) {
          waitlistError.hidden = false;
          waitlistError.textContent = "Please enter a valid email.";
        }
        waitlistEmail.focus();
        return;
      }

      if (waitlistError) waitlistError.hidden = true;
      setBusy(waitlistSubmit, true, "Sending…");

      try {
        await submitWeb3Forms({
          subject: "GETSPD waitlist signup",
          from_name: "GETSPD Website",
          email,
          name: "Waitlist",
          message: `New waitlist signup: ${email}`,
          form_type: "waitlist",
        });

        waitlistForm.hidden = true;
        if (waitlistSuccess) waitlistSuccess.hidden = false;
      } catch (_) {
        if (waitlistError) {
          waitlistError.hidden = false;
          waitlistError.textContent = "Could not join the waitlist. Please try again.";
        }
        setBusy(waitlistSubmit, false, waitlistSubmitLabel);
      }
    });
  }

  const comingSoonDesc = document.getElementById("coming-soon-desc");
  const comingSoon = createModalController({
    modalId: "coming-soon-modal",
    openSelector: "[data-coming-soon]",
    closeSelector: "[data-close-coming-soon]",
    onOpen: (btn) => {
      const store = btn?.getAttribute("data-coming-soon") || "the stores";
      if (comingSoonDesc) {
        comingSoonDesc.textContent = `GETSPD on ${store} is coming soon. Stay tuned.`;
      }
    },
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (waitlistModal && !waitlistModal.hidden) waitlist.close();
    if (comingSoon.isOpen()) comingSoon.close();
  });

  const contactForm = document.getElementById("contact-form");
  const contactName = document.getElementById("contact-name");
  const contactEmail = document.getElementById("contact-email");
  const contactMessage = document.getElementById("contact-message");
  const contactError = document.getElementById("contact-error");
  const contactSuccess = document.getElementById("contact-success");
  const contactSubmit = contactForm?.querySelector('button[type="submit"]');
  const contactSubmitLabel = contactSubmit?.textContent || "Contact Us";

  if (contactForm && contactName && contactEmail && contactMessage) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = contactName.value.trim();
      const email = contactEmail.value.trim();
      const message = contactMessage.value.trim();

      if (!name || !isValidEmail(email) || message.length < 3) {
        if (contactError) {
          contactError.hidden = false;
          contactError.textContent = "Please fill in a valid name, email, and message.";
        }
        if (contactSuccess) contactSuccess.hidden = true;
        return;
      }

      if (contactError) contactError.hidden = true;
      if (contactSuccess) contactSuccess.hidden = true;
      setBusy(contactSubmit, true, "Sending…");

      try {
        await submitWeb3Forms({
          subject: `GETSPD contact — ${name}`,
          from_name: name,
          name,
          email,
          message,
          form_type: "contact",
        });

        contactForm.reset();
        if (contactSuccess) contactSuccess.hidden = false;
      } catch (_) {
        if (contactError) {
          contactError.hidden = false;
          contactError.textContent = "Could not send your message. Please try again.";
        }
      } finally {
        setBusy(contactSubmit, false, contactSubmitLabel);
      }
    });
  }
})();
