document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location = "/");
  const urlParams = new URLSearchParams(location.search);
  const id = urlParams.get("id");
  if (!id) return;

  const area = document.getElementById("claimArea");

  async function loadClaim() {
    try {
      const res = await fetch(`/api/claims/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      render(data);
    } catch {
      area.innerHTML = '<div class="alert alert-danger">Could not load claim.</div>';
    }
  }

  function render({ claim, documents, responses }) {
    let html = `
      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h4>${escapeHtml(claim.claim_number)}</h4>
            <span class="badge bg-secondary">${claim.status || "Initiated"}</span>
          </div>
          <p><strong>Claimant:</strong> ${escapeHtml(claim.claimant_name)}<br>
          <strong>Insurer B:</strong> ${escapeHtml(claim.insurer_b)}<br>
          <strong>Amount Paid:</strong> $${(claim.amount_paid || 0).toFixed(2)}</p>
          <p>${escapeHtml(claim.description)}</p>
          <h5>Documents</h5>
          <ul>${documents.map((d) => `<li><a href="/api/uploads/${d.filename}" target="_blank">${escapeHtml(d.original_name)}</a> <span class="text-muted">(${new Date(d.uploaded_at).toLocaleString()})</span></li>`).join("")}</ul>
        </div>
      </div>
      <div class="card mb-4">
        <div class="card-body">
          <h5>Responses</h5>
          ${responses.length ? responses.map((r) => `<div><strong>${escapeHtml(r.responder_name)}</strong> (${r.response_type})<br>${escapeHtml(r.message)}${r.amount_offered ? `<br>Offered: $${r.amount_offered}` : ""}<div class="small text-muted">${new Date(r.created_at).toLocaleString()}</div></div><hr>`).join("") : "<p>No responses yet.</p>"}
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <h5>Submit Response (Insurer B)</h5>
          <form id="responseForm">
            <select name="response_type" class="form-select mb-2">
              <option value="accept">Accept & Pay</option>
              <option value="deny">Deny</option>
              <option value="negotiate">Negotiate</option>
            </select>
            <input name="amount_offered" type="number" step="0.01" class="form-control mb-2" placeholder="Amount offered (if negotiation)">
            <textarea name="message" rows="3" class="form-control mb-2" placeholder="Message"></textarea>
            <div id="respMsg" class="text-danger mb-2"></div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    `;
    area.innerHTML = html;

    document.getElementById("responseForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd);
      try {
        const res = await fetch(`/api/claims/${id}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error();
        alert("Response recorded.");
        loadClaim();
      } catch {
        document.getElementById("respMsg").innerText = "Failed to submit.";
      }
    });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  }
  loadClaim();
});
