/**
 * Indkøbsliste frontend – 100% API baseret
 * Backend: ASP.NET Core + Dapper + SQL Server
 */

const API_BASE = "http://localhost:5000/api";

const $ = (sel) => document.querySelector(sel);

const els = {
  btnNewList: $("#btnNewList"),
  listSearch: $("#listSearch"),
  lists: $("#lists"),

  activeListTitle: $("#activeListTitle"),
  activeListMeta: $("#activeListMeta"),

  btnRenameList: $("#btnRenameList"),
  btnDeleteList: $("#btnDeleteList"),

  itemForm: $("#itemForm"),
  itemName: $("#itemName"),
  itemQty: $("#itemQty"),
  items: $("#items"),

  filterAll: $("#filterAll"),
  filterOpen: $("#filterOpen"),
  filterDone: $("#filterDone"),
  btnClearDone: $("#btnClearDone"),

  stats: $("#stats"),

  modalBackdrop: $("#modalBackdrop"),
  modalTitle: $("#modalTitle"),
  modalText: $("#modalText"),
  modalInputWrap: $("#modalInputWrap"),
  modalInput: $("#modalInput"),
  modalCancel: $("#modalCancel"),
  modalOk: $("#modalOk"),
};

const state = {
  lists: [],
  activeListId: null,
  listSearch: "",
  itemFilter: "all",
};

// =====================================================
// API CALLS
// =====================================================

async function apiGetLists() {
  const r = await fetch(`${API_BASE}/lists`);
  if (!r.ok) throw new Error("Kunne ikke hente lister");
  return await r.json();
}

async function apiGetList(id) {
  const r = await fetch(`${API_BASE}/lists/${id}`);
  if (!r.ok) throw new Error("Kunne ikke hente liste");
  return await r.json();
}

async function apiCreateList(name) {
  const r = await fetch(`${API_BASE}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error("Kunne ikke oprette liste");
  return await r.json();
}

async function apiRenameList(id, name) {
  const r = await fetch(`${API_BASE}/lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error("Kunne ikke omdøbe liste");
}

async function apiDeleteList(id) {
  const r = await fetch(`${API_BASE}/lists/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Kunne ikke slette liste");
}

async function apiAddItem(listId, name, qty) {
  const r = await fetch(`${API_BASE}/lists/${listId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, qty }),
  });
  if (!r.ok) throw new Error("Kunne ikke tilføje vare");
  return await r.json(); // updated list
}

async function apiToggleItem(listId, itemId) {
  const r = await fetch(`${API_BASE}/lists/${listId}/items/${itemId}/toggle`, {
    method: "PATCH",
  });
  if (!r.ok) throw new Error("Kunne ikke toggle vare");
}

async function apiDeleteItem(listId, itemId) {
  const r = await fetch(`${API_BASE}/lists/${listId}/items/${itemId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error("Kunne ikke slette vare");
}

async function apiClearDone(listId) {
  const r = await fetch(`${API_BASE}/lists/${listId}/items/done`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error("Kunne ikke rydde købte");
}

// =====================================================
// DATA LOAD
// =====================================================

async function loadLists() {
  // Hent lister (summary)
  const summaries = await apiGetLists();

  // Gem i state som “full-ish” objekter (items tom indtil vi henter en liste)
  state.lists = summaries.map(l => ({
    id: l.id,
    name: l.name,
    createdAt: l.createdAt,
    items: []
  }));

  // Vælg automatisk første liste hvis ingen aktiv
  if (!state.activeListId && state.lists.length > 0) {
    state.activeListId = state.lists[0].id;
  }

  if (state.activeListId) {
    await loadActiveList();       // henter items + navn fra server
    setRightPanelEnabled(true);   // AKTIVER højre panel
  } else {
    setRightPanelEnabled(false);  // ingen liste → lås højre panel
  }

  renderAll();
}

async function loadActiveList() {
  if (!state.activeListId) return;
  const full = await apiGetList(state.activeListId);

  const idx = state.lists.findIndex(l => l.id === full.id);
  if (idx >= 0) {
    state.lists[idx] = full;
  }
}

// =====================================================
// RENDERING
// =====================================================

function renderLists() {
  const q = state.listSearch.toLowerCase();
  els.lists.innerHTML = "";

  const filtered = state.lists
    .filter(l => l.name.toLowerCase().includes(q))
    .sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  for (const list of filtered) {

    const openCount = (list.items ?? []).filter(i => !i.isDone).length;
    const total = (list.items ?? []).length;

    const card = document.createElement("div");
    card.className = "list-card" + (list.id === state.activeListId ? " active" : "");

    card.innerHTML = `
      <div class="row">
        <div class="title">${escapeHtml(list.name)}</div>
        <div class="badge">${openCount}/${total}</div>
      </div>
    `;

    card.addEventListener("click", async () => {
      state.activeListId = list.id;
      await loadActiveList();
      renderAll();
    });

    els.lists.appendChild(card);
  }
}

function renderItems() {
  const list = state.lists.find(l => l.id === state.activeListId);
  els.items.innerHTML = "";

  if (!list) return;

  els.activeListTitle.textContent = list.name;

  const items = list.items ?? [];

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "item" + (item.isDone ? " done" : "");

    row.innerHTML = `
      <div class="item-left">
        <div class="check">${item.isDone ? "✓" : ""}</div>
        <div class="item-name">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${item.qty ?? ""}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="iconbtn">✔</button>
        <button class="iconbtn danger">🗑</button>
      </div>
    `;

    const [btnToggle, btnDelete] = row.querySelectorAll("button");

    btnToggle.addEventListener("click", async () => {
      await apiToggleItem(list.id, item.id);
      await loadActiveList();
      renderAll();
    });

    btnDelete.addEventListener("click", async () => {
      await apiDeleteItem(list.id, item.id);
      await loadActiveList();
      renderAll();
    });

    els.items.appendChild(row);
  }
}

function renderAll() {
  renderLists();
  renderItems();
}

// =====================================================
// ACTIONS
// =====================================================

async function createList() {
  const name = prompt("Navn på liste:");
  if (!name) return;

  await apiCreateList(name);
  await loadLists();
}

async function renameList() {
  const list = state.lists.find(l => l.id === state.activeListId);
  if (!list) return;

  const name = prompt("Nyt navn:", list.name);
  if (!name) return;

  await apiRenameList(list.id, name);
  await loadLists();
}

async function deleteList() {
  const list = state.lists.find(l => l.id === state.activeListId);
  if (!list) return;

  if (!confirm("Slet liste?")) return;

  await apiDeleteList(list.id);
  state.activeListId = null;
  await loadLists();
}

async function addItem(e) {
  e.preventDefault();

  const list = state.lists.find(l => l.id === state.activeListId);
  if (!list) return;

  const name = els.itemName.value.trim();
  const qty = els.itemQty.value.trim();

  if (!name) return;

  await apiAddItem(list.id, name, qty);
  els.itemName.value = "";
  els.itemQty.value = "";

  await loadActiveList();
  renderAll();
}

// =====================================================
// UTILS
// =====================================================

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// =====================================================
// EVENTS
// =====================================================

els.btnNewList.addEventListener("click", createList);
els.btnRenameList.addEventListener("click", renameList);
els.btnDeleteList.addEventListener("click", deleteList);
els.itemForm.addEventListener("submit", addItem);

// =====================================================
// INIT
// =====================================================
function setRightPanelEnabled(enabled) {
  els.btnRenameList.disabled = !enabled;
  els.btnDeleteList.disabled = !enabled;

  els.itemName.disabled = !enabled;
  els.itemQty.disabled = !enabled;
  els.itemForm.querySelector("button[type='submit']").disabled = !enabled;

  els.filterAll.disabled = !enabled;
  els.filterOpen.disabled = !enabled;
  els.filterDone.disabled = !enabled;
  els.btnClearDone.disabled = !enabled;
}

loadLists();