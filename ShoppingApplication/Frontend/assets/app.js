const { useState, useEffect } = React;

const API_BASE = "http://localhost:5000/api";

const App = () => {
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(null);
  const [activeListId, setActiveListId] = useState(null);
  const [listSearch, setListSearch] = useState("");
  const [itemFilter, setItemFilter] = useState("all");
  const [newItem, setNewItem] = useState({ name: "", qty: "" });

  // Init: Hent lister
  useEffect(() => {
    fetchLists();
  }, []);

  // Hent aktiv liste når ID skifter
  useEffect(() => {
    if (activeListId) fetchActiveList(activeListId);
  }, [activeListId]);

  const fetchLists = async () => {
    const r = await fetch(`${API_BASE}/lists`);
    const data = await r.json();
    setLists(data);
    if (data.length > 0 && !activeListId) setActiveListId(data[0].id);
  };

  const fetchActiveList = async (id) => {
    const r = await fetch(`${API_BASE}/lists/${id}`);
    const data = await r.json();
    setActiveList(data);
  };

  const handleCreateList = async () => {
    const name = prompt("Navn på liste:");
    if (!name) return;
    await fetch(`${API_BASE}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    fetchLists();
  };

  // NY: Logik til at omdøbe liste
  const handleRenameList = async () => {
    if (!activeListId) return;
    const newName = prompt("Nyt navn på listen:", activeList.name);
    if (!newName || newName === activeList.name) return;

    await fetch(`${API_BASE}/lists/${activeListId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    
    fetchLists(); // Opdater oversigten til venstre
    fetchActiveList(activeListId); // Opdater titlen i højre panel
  };

  // NY: Logik til at slette liste
  const handleDeleteList = async () => {
    if (!activeListId) return;
    if (!confirm(`Er du sikker på at du vil slette "${activeList.name}"?`)) return;

    await fetch(`${API_BASE}/lists/${activeListId}`, {
      method: "DELETE",
    });

    setActiveListId(null);
    setActiveList(null);
    fetchLists();
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !activeListId) return;
    await fetch(`${API_BASE}/lists/${activeListId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    setNewItem({ name: "", qty: "" });
    fetchActiveList(activeListId);
  };

  const toggleItem = async (itemId) => {
    await fetch(`${API_BASE}/lists/${activeListId}/items/${itemId}/toggle`, { method: "PATCH" });
    fetchActiveList(activeListId);
  };

  const deleteItem = async (itemId) => {
    await fetch(`${API_BASE}/lists/${activeListId}/items/${itemId}`, { method: "DELETE" });
    fetchActiveList(activeListId);
  };

  // Filtrering af varer
  const filteredItems = (activeList?.items || []).filter(item => {
    if (itemFilter === "open") return !item.isDone;
    if (itemFilter === "done") return item.isDone;
    return true;
  });

  return (
    <div className="max-w-[1100px] mx-auto my-7 p-4">
      {/* Topbar */}
      <header className="flex justify-between items-center p-4 border border-white/10 bg-white/5 rounded-2xl shadow-2xl mb-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400/30 to-blue-500/20 border border-white/10 text-2xl">🛒</div>
          <div>
            <h1 className="text-xl font-bold">Indkøbslister</h1>
            <p className="text-slate-400 text-xs">Hold styr på dine varer — enkelt og hurtigt.</p>
          </div>
        </div>
        <button onClick={handleCreateList} className="bg-cyan-500/20 border border-cyan-400/30 text-white px-4 py-2 rounded-xl hover:bg-cyan-500/30 transition-all font-bold">+ Ny liste</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        {/* Left Panel: Lister */}
        <section className="border border-white/10 bg-white/5 rounded-2xl p-4 shadow-2xl min-h-[560px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Dine lister</h2>
            <input 
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500/50"
              placeholder="Søg lister..."
              onChange={(e) => setListSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            {lists.filter(l => l.name.toLowerCase().includes(listSearch.toLowerCase())).map(list => (
              <div 
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${activeListId === list.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/5 bg-black/10 hover:border-white/20'}`}
              >
                <span className="font-semibold">{list.name}</span>
                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full">{list.totalCount || 0} varer</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Panel: Varer */}
        <section className="border border-white/10 bg-white/5 rounded-2xl p-4 shadow-2xl min-h-[560px]">
          {activeList ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{activeList.name}</h2>
                <div className="flex gap-2">
                  <button onClick={handleRenameList} className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">Omdøb</button>
                  <button onClick={handleDeleteList} className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg">Slet</button>
                </div>
              </div>

              <form onSubmit={handleAddItem} className="grid grid-cols-[1fr_120px_auto] gap-2 mb-4">
                <input 
                  className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-cyan-500/50"
                  placeholder="Tilføj vare..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
                <input 
                  className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-cyan-500/50"
                  placeholder="Antal"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({...newItem, qty: e.target.value})}
                />
                <button type="submit" className="bg-cyan-500/20 border border-cyan-400/30 px-4 rounded-xl font-bold">+</button>
              </form>

              <div className="flex gap-2 mb-4 text-xs">
                {["all", "open", "done"].map(f => (
                  <button 
                    key={f}
                    onClick={() => setItemFilter(f)}
                    className={`px-3 py-1.5 rounded-full border transition-all ${itemFilter === f ? 'border-cyan-500/50 bg-cyan-500/20' : 'border-white/10 bg-white/5'}`}
                  >
                    {f === "all" ? "Alle" : f === "open" ? "Ikke købt" : "Købt"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {filteredItems.map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/10 ${item.isDone ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleItem(item.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.isDone ? 'bg-green-500/20 border-green-500/50' : 'border-white/20'}`}>
                        {item.isDone && "✓"}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${item.isDone ? 'line-through' : ''}`}>{item.name}</span>
                        <span className="text-[10px] text-slate-500">{item.qty}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="text-slate-500 hover:text-red-400">🗑</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 italic">Vælg en liste til venstre</div>
          )}
        </section>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);