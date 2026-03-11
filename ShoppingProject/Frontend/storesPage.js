// Vi lægger komponenten på window, så app.js kan bruge den uden imports
// Den her linje tilføjer en property på window, der hedder StoresPage, så nu findes windows.StoresPage som vi bruger i
window.StoresPage = function StoresPage({
  activeList,
  selectedStores,
  setSelectedStores,
  onBack,
  onAiResult,
}) {
  const { useState } = React;
  const API_BASE = "http://localhost:5000/api";

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const stores = [
    "Lidl",
    "Netto",
    "Føtex",
    "Bilka",
    "Coop365",
    "SuperBrugsen",
    "Kvickly",
    "Rema 1000",
    "Aldi",
    "Spar",
    "Min Købmand",
    "Meny",
  ];

  const toggleStore = (store) => {
    setSelectedStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    );
  };

  const handleAiGenerate = async () => {
    setAiError(null);
    setAiResult(null);

    // Små guardrails, så endpoint'et får noget fornuftigt at arbejde med
    if (!activeList?.id) {
      alert("Ingen aktiv liste valgt.");
      return;
    }
    if ((activeList.items || []).length === 0) {
      alert("Din indkøbsliste er tom.");
      return;
    }
    if ((selectedStores || []).length === 0) {
      alert("Vælg mindst én butik først.");
      return;
    }

    setAiLoading(true);
    try {
      const r = await fetch(`${API_BASE}/lists/${activeList.id}/ai-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stores: selectedStores,
          items: activeList.items,
        }),
      });

      if (!r.ok) {
        const msg = await r.text();
        throw new Error(msg || `HTTP ${r.status}`);
      }

      const data = await r.json();
      setAiResult(data);

      // Send resultatet op til App, så vi kan vise AI-resultat-siden.
      if (typeof onAiResult === "function") {
        onAiResult(data);
      }
    } catch (e) {
      setAiError(e?.message || "Noget gik galt");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="border border-white/10 bg-white/5 rounded-2xl p-4 shadow-2xl min-h-[560px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Vælg dagligvarebutikker</h2>
          <p className="text-xs text-slate-400 mt-1">
            Liste:{" "}
            <span className="font-semibold text-slate-200">{activeList.name}</span>
          </p>
        </div>

        <button
          onClick={onBack}
          className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
        >
          ← Tilbage
        </button>
      </div>

      <div className="border border-white/10 bg-black/10 rounded-2xl p-3 mb-4">
         {/* Header med 2 kolonner */}
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Varer i listen:</span>
            <span>Antal:</span>
        </div>
        <div className="flex flex-col gap-1">
          {(activeList.items || []).length === 0 ? (
            <div className="text-slate-500 text-sm italic">Ingen varer endnu.</div>
          ) : (
            (activeList.items || []).map((it) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span className={it.isDone ? "line-through text-slate-500" : ""}>
                  {it.name}
                </span>
                <span>{it.qty}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold mb-2">Butikker</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {stores.map((store) => {
          const checked = selectedStores.includes(store);

          return (
            <label
              key={store}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all
              ${
                checked
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-white/10 bg-black/10 hover:border-white/20"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleStore(store)}
                className="w-4 h-4"
              />
              <span className="font-semibold">{store}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Valgte butikker:{" "}
          <span className="text-slate-200 font-semibold">{selectedStores.length}</span>
        </div>

        <button
          onClick={handleAiGenerate}
          disabled={aiLoading}
          className={`text-xs px-3 py-2 rounded-lg border transition-all font-bold whitespace-nowrap
            ${aiLoading
              ? "bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
              : "bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30"}
          `}
          title="Send indkøbslisten + valgte butikker til AI-generering"
        >
          {aiLoading ? "Arbejder..." : "AI generering"}
        </button>
      </div>

      {aiError && <div className="mt-2 text-xs text-red-300">{aiError}</div>}

      {/* Lige nu gemmer vi resultatet i state, så du senere kan vise det på siden */}
      {aiResult && (
        <div className="mt-2 text-[10px] text-slate-500">
          Seneste AI-svar modtaget ({(aiResult?.items || []).length} varer).
        </div>
      )}
    </section>
  );
};