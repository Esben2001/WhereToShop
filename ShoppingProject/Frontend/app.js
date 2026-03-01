const { useState, useEffect } = React; // Hent useState og useEffect direkte fra React-objektet

const API_BASE = "http://localhost:5000/api";

const App = () => {
  // HENT StoresPage-komponenten fra window (kommer fra storesPage.js)
  const StoresPage = window.StoresPage; // Vi har defineret StoresPage i storesPage.js og lagt den på window, så vi kan bruge den her uden at importere den.
  const [lists, setLists] = useState([]); //Alle lister - bruges til venstre panel
  const [activeList, setActiveList] = useState(null); // Den valgte liste - bruges til højre panel
  const [activeListId, setActiveListId] = useState(null); // ID på den valgte liste - når denne ændrer sig, hentes den nye aktive liste
  const [listSearch, setListSearch] = useState(""); // Søgetekst til at filtrere lister i venstre panel
  const [itemFilter, setItemFilter] = useState("all"); // Filter 
  const [newItem, setNewItem] = useState({ name: "", qty: "" }); // Tilføj vare og antal - bruges i formularen til at tilføje nye varer
  
  // NY: State til at holde styr på valgte butikker i StoresPage
  const [page, setPage] = useState("list"); // "list" eller "stores"
  const [selectedStores, setSelectedStores] = useState([]); // Array af de valgte butikker

  // Hent alle lister når appen starter
  useEffect(() => {
    fetchLists();
  }, []); // [] betyder: kør kun én gang.

  // Hent valgteliste når activeListId ændrer sig
  useEffect(() => {
    if (activeListId) fetchActiveList(activeListId); // Hvis den er true så kald funktionen fetchActiveList med activeListId som argument. Det vil hente den valgte liste og opdatere activeList state, som igen vil opdatere højre panel med den nye liste.
  }, [activeListId]); // [activeListId] betyder: kør når activeListId ændrer sig.

  // Hent alle lister fra backend og opdater state
  const fetchLists = async () => {
    const r = await fetch(`${API_BASE}/lists`);
    const data = await r.json(); // laver JSON om til JavaScript-objekter
    setLists(data); // Opdater state dvs render appen igen med de nye lister
    if (data.length > 0 && !activeListId) setActiveListId(data[0].id); // Hvis der ikke er en aktiv liste, sæt den første som aktiv liste
  };
  
  // Hent detaljer for en specifik liste baseret på ID
  const fetchActiveList = async (id) => { 
    const r = await fetch(`${API_BASE}/lists/${id}`);
    const data = await r.json();
    setActiveList(data);
  };

  // Funktion til at oprette en ny liste
  const handleCreateList = async () => {
    const name = prompt("Navn på liste:"); // Viser en popup dialogboks i browseren
    if (!name) return;
    await fetch(`${API_BASE}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }), // Opretter et JavaScript-objekt med en "name" property og konverterer det til JSON, som backend kan forstå
    });
    fetchLists();
  };

  // NY: Logik til at omdøbe liste
  const handleRenameList = async () => {
    if (!activeListId) return; // Hvis der ikke er en aktiv liste, gør ingenting
    const newName = prompt("Nyt navn på listen:", activeList.name);
    if (!newName || newName === activeList.name) return; // Hvis der ikke er indtastet et nyt navn, eller hvis det nye navn er det samme som det gamle, gør ingenting

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
    if (!activeListId) return; // Hvis der ikke er en aktiv liste, gør ingenting
    if (!confirm(`Er du sikker på at du vil slette "${activeList.name}"?`)) return; 
    // Viser en bekræftelsesdialog, og hvis brugeren klikker "Annuller", gør ingenting

    await fetch(`${API_BASE}/lists/${activeListId}`, {
      method: "DELETE",
    });

    setActiveListId(null);
    setActiveList(null);
    setPage("list"); // hvis man stod på stores-siden, så gå tilbage til list-siden, fordi den aktive liste er slettet
    fetchLists();
  };

  // Logik til at tilføje en vare til den aktive liste
  const handleAddItem = async (e) => {
    e.preventDefault(); // Forhindrer at siden genindlæses når formularen submittes
    if (!newItem.name || !activeListId) return; // Hvis der ikke er indtastet et navn på varen, eller hvis der ikke er en aktiv liste, gør ingenting
    await fetch(`${API_BASE}/lists/${activeListId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    setNewItem({ name: "", qty: "" }); // Nulstil inputfelterne efter tilføjelse
    fetchActiveList(activeListId); 
  };

  // Logik til at toggle en vares status (købt/ikke købt)
  const toggleItem = async (itemId) => { 
    await fetch(`${API_BASE}/lists/${activeListId}/items/${itemId}/toggle`, 
      { method: "PATCH" });
    fetchActiveList(activeListId);
  };

  // Logik til at slette en vare 
  const deleteItem = async (itemId) => {
    await fetch(`${API_BASE}/lists/${activeListId}/items/${itemId}`, 
      { method: "DELETE" });
    fetchActiveList(activeListId);
  };

  // Filtrer varer baseret på itemFilter state. Hvis itemFilter er "open", vis kun varer der ikke er købt. Hvis itemFilter er "done", vis kun varer der er købt. Hvis itemFilter er "all", vis alle varer.
  const filteredItems = (activeList?.items || []).filter(item => {
    if (itemFilter === "open") return !item.isDone; // Hvis itemFilter er "open", returner true for varer der ikke er købt (isDone er false)
    if (itemFilter === "done") return item.isDone; // Hvis itemFilter er "done", returner true for varer der er købt (isDone er true)
    return true;
  });

 return (
    <div className="max-w-[1100px] mx-auto my-7 p-4">
      {/* Topbar */}
      <header className="flex justify-between items-center p-4 border border-white/10 bg-white/5 rounded-2xl shadow-2xl mb-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400/30 to-blue-500/20 border border-white/10 text-2xl">
            🛒
          </div>
          <div>
            <h1 className="text-xl font-bold">Indkøbslister</h1>
            <p className="text-slate-400 text-xs">Hold styr på dine varer - enkelt og hurtigt.</p>
          </div>
        </div>
        <button
          onClick={handleCreateList}
          className="bg-cyan-500/20 border border-cyan-400/30 text-white px-4 py-2 rounded-xl hover:bg-cyan-500/30 transition-all font-bold"
        >
          + Ny liste
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        {/* Left Panel */}
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
            {/* Filtrering af lister baseret på søgetekst. Hvis listSearch er tom, vises alle lister. Ellers vises kun de lister, hvis navn inkluderer søgeteksten. */}
            {lists.filter((l) => l.name.toLowerCase().includes(listSearch.toLowerCase())).map((list) => (
                <div
                  key={list.id} // Til at holde styr på hvert element i en liste
                  onClick={() => {
                    setActiveListId(list.id);
                    setPage("list"); // hvis man var på stores-siden, så tilbage til list-view
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                    activeListId === list.id
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-white/5 bg-black/10 hover:border-white/20"
                  }`}
                >
                  <span className="font-semibold">{list.name}</span>
                  <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                    {list.totalCount || 0} varer
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* Right Panel */}
        {page === "list" ? (
          <section className="border border-white/10 bg-white/5 rounded-2xl p-4 shadow-2xl min-h-[560px]">
            {activeList ? ( // Hvis der er en aktiv liste, vis dens indhold. Ellers vis en besked om at vælge en liste.
              <>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{activeList.name}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRenameList} className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10" > Omdøb </button>
                    <button onClick={handleDeleteList} className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg" > Slet </button>
                  </div>
                </div>
                {/* Form til at tilføje nye varer. Når den submittes, kaldes handleAddItem funktionen. I en Form kan man ENTER */ }
                <form onSubmit={handleAddItem} className="grid grid-cols-[1fr_120px_auto] gap-2 mb-4"> 
                  <input
                    type="text"
                    required
                    pattern=".*[a-zA-ZæøåÆØÅ]+.*"
                    className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-cyan-500/50"
                    placeholder="Tilføj vare..."
                    value={newItem.name} // Den her sørger for at når du tilføjer en vare, så bliver inputfeltet nulstillet til tomt, fordi newItem.name sættes til "" i handleAddItem funktionen.
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} // Når du skriver i vare-feltet, opdateres newItem state med det nye navn, samtidig med at antallet på varen bevares. Det gør vi ved at sprede det eksisterende newItem objekt og så overskrive name property med den nye værdi.
                    // e står for event, og e.target.value er den aktuelle værdi i inputfeltet.
                 />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-cyan-500/50"
                    placeholder="Antal"
                    value={newItem.qty} // Den her sørger for at når du tilføjer en vare, så bliver inputfeltet nulstillet til tomt, fordi newItem.qty sættes til "" i handleAddItem funktionen.
                    onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })} // Når du skriver i antal-feltet, opdateres newItem state med det nye antal, samtidig med at navnet på varen bevares. Det gør vi ved at sprede det eksisterende newItem objekt og så overskrive qty property med den nye værdi.
                    // e står for event, og e.target.value er den aktuelle værdi i inputfeltet.
                  />
                  <button type="submit" className="bg-cyan-500/20 border border-cyan-400/30 px-4 rounded-xl font-bold" >  Tilføj  </button>
                </form>

                {/* Knapper til at filtrere varer baseret på deres status (alle, åbne, købte). Når en knap klikkes, opdateres itemFilter state, som igen opdaterer den viste liste af varer. */ }
                {/* React laver en liste med 3 knapper ved at mappe arrayet: knap for "all", knap for "open", knap for "done" */ }
                <div className="flex gap-2 mb-4 text-xs">
                  {["all", "open", "done"].map((f) => (
                    <button
                      key={f} // Til at holde styr all, open, done knapperne
                      onClick={() => setItemFilter(f)} // Når knappen klikkes, opdateres itemFilter state til den tilsvarende værdi ("all", "open", eller "done"), som derefter bruges til at filtrere de viste varer.
                      className={`px-3 py-1.5 rounded-full border transition-all ${
                        itemFilter === f
                          ? "border-cyan-500/50 bg-cyan-500/20"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      {f === "all" ? "Alle" : f === "open" ? "Ikke købt" : "Købt"}
                    </button>
                  ))}
                </div>

                {/* Items */}
                <div className="flex flex-col gap-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/10 ${
                        item.isDone ? "opacity-50" : ""
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => toggleItem(item.id)} // Når en vare klikkes, kaldes toggleItem funktionen med vare-id som argument, hvilket toggler dens status mellem købt og ikke købt.
                      >  {/* Hvis varen er markeret som købt (isDone er true), vises et flueben og baggrunden bliver grøn. Hvis ikke, vises ingen tekst og kun en grå kant. */}
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            item.isDone
                              ? "bg-green-500/20 border-green-500/50"
                              : "border-white/20"
                          }`}
                        >
                          {item.isDone && "✓"}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold ${
                              item.isDone ? "line-through" : ""
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-500">{item.qty}</span>
                        </div>
                      </div>
                        {/* Når skraldespands-ikonet klikkes, kaldes deleteItem funktionen med vare-id som argument, hvilket sletter varen fra listen.*/}      
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                {/* Vælg dagligvarebutikker - Knap*/}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setPage("stores")} // Når knappen klikkes, opdateres page state til "stores", hvilket får appen til at vise StoresPage komponenten i stedet for listevisningen.
                    className="w-full bg-cyan-500/20 border border-cyan-400/30 px-4 py-3 rounded-xl font-bold hover:bg-cyan-500/30 transition-all"
                  >
                    Vælg dagligvarebutikker →
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 italic">
                Vælg en liste til venstre
              </div>
            )}
          </section>
        ) : (
          <StoresPage
            activeList={activeList} // Den aktive liste sendes som prop til StoresPage, så den kan vise varerne i listen og navnet på listen.
            selectedStores={selectedStores} // De valgte butikker sendes som prop til StoresPage, så den kan vise hvilke butikker der er valgt og opdatere dem når brugeren vælger eller fravælger butikker.
            setSelectedStores={setSelectedStores} // Funktionen til at opdatere de valgte butikker sendes som prop til StoresPage, så den kan kalde denne funktion når brugeren vælger eller fravælger butikker, og dermed opdatere selectedStores state i App-komponenten.
            onBack={() => setPage("list")} // Funktionen til at gå tilbage til listevisningen sendes som prop til StoresPage, så den kan kalde denne funktion når brugeren klikker på "Tilbage" knappen, og dermed opdatere page state i App-komponenten til "list", så appen viser listevisningen igen.
          />
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));