// assets/aiResultPage.js
// Displays the AI result returned from POST /api/lists/{id}/ai-generate

window.AiResultPage = function AiResultPage({ aiResponse, onBackToStores, onBackToList }) {
  const result = aiResponse?.result;

  if (!aiResponse) {
    return (
      <section className="border border-white/10 bg-white/5 rounded-2xl p-4 shadow-2xl min-h-[560px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">AI resultat</h2>
            <p className="text-xs text-slate-400 mt-1">Ingen data endnu.</p>
          </div>
          <button
            onClick={onBackToStores}
            className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
          >
            ← Tilbage
          </button>
        </div>
      </section>
    );
  }

  const stores = result?.stores || [];
  const grand = result?.grandTotalDkk;
  const disclaimer = result?.disclaimer;

  return (
    <section className="border border-white/10 bg-white/5 rounded-2xl p-4 shadow-2xl min-h-[560px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">AI resultat</h2>
          <p className="text-xs text-slate-400 mt-1">
            Liste: <span className="font-semibold text-slate-200">{aiResponse.listName}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBackToStores}
            className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
          >
            ← Butikker
          </button>
          <button
            onClick={onBackToList}
            className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
          >
            ← Liste
          </button>
        </div>
      </div>

      {disclaimer && (
        <div className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
          {disclaimer}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-300">
          Butikker i plan: <span className="font-semibold text-slate-100">{stores.length}</span>
        </div>
        {typeof grand === "number" && (
          <div className="text-sm">
            Samlet pris: <span className="font-bold">{grand.toFixed(2)} DKK</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {stores.map((s) => (
          <div key={s.store} className="border border-white/10 bg-black/10 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">{s.store}</h3>
              {typeof s.storeSubtotalDkk === "number" && (
                <div className="text-xs text-slate-300">
                  Subtotal: <span className="font-semibold text-slate-100">{s.storeSubtotalDkk.toFixed(2)} DKK</span>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 grid grid-cols-[1fr_80px_110px_110px] gap-2 mb-1">
              <div>Vare</div>
              <div className="text-right">Antal</div>
              <div className="text-right">Stk. pris</div>
              <div className="text-right">Linje total</div>
            </div>

            <div className="flex flex-col gap-1">
              {(s.items || []).map((it, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_110px_110px] gap-2 text-sm">
                  <div className="text-slate-100">{it.name}</div>
                  <div className="text-right">{it.quantity}</div>
                  <div className="text-right">{Number(it.unitPriceDkk).toFixed(2)}</div>
                  <div className="text-right font-semibold">{Number(it.lineTotalDkk).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Debug: raw JSON */}
      <details className="mt-4 text-xs text-slate-400">
        <summary className="cursor-pointer">Vis råt AI-svar (JSON)</summary>
        <pre className="mt-2 bg-black/20 border border-white/10 rounded-xl p-3 overflow-auto text-[10px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </section>
  );
};
