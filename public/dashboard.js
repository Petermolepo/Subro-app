document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location = "/");

  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const clearFilters = document.getElementById("clearFilters");
  const claimsArea = document.getElementById("claimsArea");
  const statsRow = document.getElementById("statsRow");
  const exportBtn = document.getElementById("exportCsv");
  const paginationEl = document.getElementById("pagination");

  let claims = [];
  let filtered = [];
  let page = 1;
  const perPage = 6;

  async function loadClaims() {
    try {
      const res = await fetch("/api/claims", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      claims = await res.json();
      filtered = [...claims];
      renderStats();
      renderList();
      renderPagination();
    } catch {
      claimsArea.innerHTML = '<div class="alert alert-danger">Failed to load claims.</div>';
    }
  }

  function renderStats() {
    const total = claims.length;
    const resolved = claims.filter((c) => c.status === "resolved").length;
    const negotiation = claims.filter((c) => c.status === "negotiation").length;
    statsRow.innerHTML = `
      <div class="col-md-3"><div class="stat-card bg-primary"><h5>Total Claims</h5><div class="fs-3 fw-bold">${total}</div></div></div>
      <div class="col-md-3"><div class="stat-card bg-warning text-dark"><h5>Negotiation</h5><div class="fs-3 fw-bold">${negotiation}</div></div></div>
      <div class="col-md-3"><div class="stat-card bg-success"><h5>Resolved</h5><div class="fs-3 fw-bold">${resolved}</div></div></div>
      <div class="col-md-3"><div class="stat-card bg-danger"><h5>Denied</h5><div class="fs-3 fw-bold">${claims.filter((c) => c.status === "denied").length}</div></div></div>
    `;
  }

  function renderList() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value.toLowerCase();
    filtered = claims.filter((c) => {
      if (status && c.status !== status) return false;
      if (!q) return true;
      return (c.claim_number || "").toLowerCase().includes(q) || (c.claimant_name || "").toLowerCase().includes(q) || (c.insurer_b || "").toLowerCase().includes(q);
    });

    const start = (page - 1) * perPage;
    const pageItems = filtered.slice(start, start + perPage);
    if (!pageItems.length) {
      claimsArea.innerHTML = '<div class="alert alert-info">No claims found.</div>';
      return;
    }
    let html = '<div class="row g-4">';
    for (const c of pageItems) {
      let badgeClass = "bg-secondary";
      if (c.status === "negotiation") badgeClass = "bg-warning text-dark";
      if (c.status === "resolved") badgeClass = "bg-success";
      if (c.status === "denied") badgeClass = "bg-danger";
      html += `
        <div class="col-md-6">
          <div class="card p-3">
            <div class="d-flex justify-content-between">
              <h6 class="fw-bold">${escapeHtml(c.claim_number)}</h6>
              <span class="badge ${badgeClass}">${c.status || "Initiated"}</span>
            </div>
            <div class="small text-muted">${new Date(c.created_at).toLocaleDateString()}</div>
            <p class="mt-2 mb-1"><strong>Claimant:</strong> ${escapeHtml(c.claimant_name || "")}</p>
            <p><strong>Counterparty:</strong> ${escapeHtml(c.insurer_b || "")}</p>
            <div class="progress mb-2"><div class="progress-bar" style="width: ${c.status === "resolved" ? 100 : c.status === "negotiation" ? 60 : 20}%"></div></div>
            <a href="claim_view.html?id=${c.id}" class="btn btn-sm btn-outline-primary">View</a>
          </div>
        </div>
      `;
    }
    html += "</div>";
    claimsArea.innerHTML = html;
  }

  function renderPagination() {
    const totalPages = Math.ceil(filtered.length / perPage);
    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }
    let html = "";
    if (page > 1) html += `<li class="page-item"><a class="page-link" href="#" data-page="${page - 1}">Prev</a></li>`;
    for (let i = 1; i <= totalPages; i++) html += `<li class="page-item ${i === page ? "active" : ""}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    if (page < totalPages) html += `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">Next</a></li>`;
    paginationEl.innerHTML = html;
    document.querySelectorAll(".page-link").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const p = parseInt(e.target.dataset.page, 10);
        if (!isNaN(p)) {
          page = p;
          renderList();
          renderPagination();
          window.scrollTo(0, 0);
        }
      })
    );
  }

  function exportCsv() {
    if (!filtered.length) return alert("No claims to export");
    const headers = ["id", "claim_number", "claimant_name", "insurer_b", "amount_paid", "status", "created_at"];
    const rows = filtered.map((c) => headers.map((h) => `"${String(c[h] || "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claims.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  }

  searchInput.addEventListener("input", () => {
    page = 1;
    renderList();
    renderPagination();
  });
  statusFilter.addEventListener("change", () => {
    page = 1;
    renderList();
    renderPagination();
  });
  clearFilters.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "";
    page = 1;
    renderList();
    renderPagination();
  });
  exportBtn.addEventListener("click", exportCsv);
  loadClaims();
});
