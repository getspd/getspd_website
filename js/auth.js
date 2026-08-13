(() => {
  // Soft gate only (client-side). Change credentials by updating AUTH_HASH.
  // Generate a new hash: echo -n "user:password" | shasum -a 256
  // Default for now: getspd / surf2026
  const AUTH_HASH = "81fc8097019cfed56f17f081ddbc56364fac01646f7320ed3dc2b28e21b859e1";
  const SESSION_KEY = "getspd-site-auth";

  const gate = document.getElementById("auth-gate");
  const form = document.getElementById("auth-form");
  const userInput = document.getElementById("auth-user");
  const passInput = document.getElementById("auth-pass");
  const errorEl = document.getElementById("auth-error");

  const sha256 = async (value) => {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const unlock = () => {
    document.body.classList.remove("is-locked");
    if (gate) {
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
    }
    const shell = document.getElementById("site-shell");
    if (shell) shell.removeAttribute("aria-hidden");
    window.scrollTo(0, 0);
  };

  const lock = () => {
    document.body.classList.add("is-locked");
    if (gate) {
      gate.hidden = false;
      gate.removeAttribute("aria-hidden");
    }
    const shell = document.getElementById("site-shell");
    if (shell) shell.setAttribute("aria-hidden", "true");
  };

  if (sessionStorage.getItem(SESSION_KEY) === AUTH_HASH) {
    unlock();
    return;
  }

  lock();

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = (userInput?.value || "").trim();
    const pass = passInput?.value || "";

    if (!user || !pass) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = "Enter username and password.";
      }
      return;
    }

    const hash = await sha256(`${user}:${pass}`);
    if (hash !== AUTH_HASH) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = "Invalid username or password.";
      }
      if (passInput) {
        passInput.value = "";
        passInput.focus();
      }
      return;
    }

    sessionStorage.setItem(SESSION_KEY, AUTH_HASH);
    if (errorEl) errorEl.hidden = true;
    unlock();
  });
})();
