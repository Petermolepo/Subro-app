document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location = "/");

  const form = document.getElementById("claimForm");
  const documents = document.querySelector('input[name="documents"]');
  const fileList = document.getElementById("fileList");
  const msg = document.getElementById("createMsg");

  documents.addEventListener("change", () => {
    const files = Array.from(documents.files);
    fileList.innerHTML = files.map((f) => `<div>${f.name} (${(f.size / 1024).toFixed(0)} KB)</div>`).join("");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerText = "";
    const fd = new FormData(form);
    for (const file of documents.files) fd.append("documents", file);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Claim ${data.claimNumber} created successfully!`);
      window.location = "/dashboard.html";
    } catch (err) {
      msg.innerText = err.message;
    }
  });
});
