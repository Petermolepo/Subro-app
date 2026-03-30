document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("regMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerText = "";

    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      role: document.getElementById("role").value
    };

    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (!r.ok) {
        msg.innerText = j.error || "Registration failed";
        return;
      }
      alert("Account created. Please log in.");
      window.location = "/";
    } catch {
      msg.innerText = "Server error";
    }
  });
});
