import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Clapperboard, Layers, LogIn, Play, Save, Sparkles, Swords, Users } from "lucide-react";
import { cards, starterDeckIds, type CardDefinition } from "./cards";
import { createBattle, playTurn, pullGacha, type BattleState } from "./game/engine";
import { auth, firebaseReady, loadProfile, loginGuest, logoutGuest, saveProfile } from "./firebase/client";
import "./index.css";

type View = "battle" | "gacha" | "collection" | "lobby";

const localKey = "anime-card-gacha-profile";

function App() {
  const [view, setView] = useState<View>("battle");
  const [user, setUser] = useState<User>();
  const [ownedIds, setOwnedIds] = useState<string[]>(starterDeckIds);
  const [battle, setBattle] = useState<BattleState>(() => createBattle("Player", starterDeckIds));
  const [lastPulls, setLastPulls] = useState<CardDefinition[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(localKey);
    if (saved) setOwnedIds(JSON.parse(saved).ownedIds ?? starterDeckIds);
    if (!auth) return;
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser ?? undefined);
      if (!nextUser) return;
      const profile = await loadProfile(nextUser);
      if (profile?.ownedIds && Array.isArray(profile.ownedIds)) setOwnedIds(profile.ownedIds);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(localKey, JSON.stringify({ ownedIds }));
  }, [ownedIds]);

  const ownedCards = useMemo(() => ownedIds.map((id) => cards.find((card) => card.id === id)).filter(Boolean) as CardDefinition[], [ownedIds]);
  const rarityScore = useMemo(() => ownedCards.reduce((sum, card) => sum + ({ C: 1, R: 2, RR: 4, SR: 8, SSR: 15 }[card.rarity]), 0), [ownedCards]);

  async function handleSave() {
    setSaving(true);
    if (user) await saveProfile(user, { ownedIds, updatedAt: Date.now() });
    setSaving(false);
  }

  function handlePull(amount: number) {
    const pulls = pullGacha(amount);
    setLastPulls(pulls);
    setOwnedIds((current) => [...current, ...pulls.map((card) => card.id)]);
  }

  function startBattle() {
    setBattle(createBattle(user?.displayName ?? "Player", ownedIds));
    setView("battle");
  }

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand">
          <Sparkles size={26} />
          <div>
            <strong>Anime Vanguard Lab</strong>
            <span>Gacha cardfight prototype</span>
          </div>
        </div>
        <nav>
          <button className={view === "battle" ? "active" : ""} onClick={() => setView("battle")} title="AI Battle">
            <Swords /> Battle
          </button>
          <button className={view === "gacha" ? "active" : ""} onClick={() => setView("gacha")} title="Gacha">
            <Sparkles /> Gacha
          </button>
          <button className={view === "collection" ? "active" : ""} onClick={() => setView("collection")} title="Collection">
            <Layers /> Cards
          </button>
          <button className={view === "lobby" ? "active" : ""} onClick={() => setView("lobby")} title="Friend Lobby">
            <Users /> Lobby
          </button>
        </nav>
        <section className="account">
          <span>{firebaseReady ? "Firebase connected by env" : "Demo mode: add Firebase env"}</span>
          <strong>{user ? `Guest ${user.uid.slice(0, 6)}` : "Local Player"}</strong>
          <div className="account-actions">
            <button onClick={() => (user ? logoutGuest() : loginGuest())}>
              <LogIn size={16} /> {user ? "Logout" : "Login"}
            </button>
            <button onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? "Saving" : "Save"}
            </button>
          </div>
        </section>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <h1>{viewTitle(view)}</h1>
            <p>{ownedCards.length} owned cards · collection power {rarityScore}</p>
          </div>
          <button className="primary" onClick={startBattle}>
            <Play size={18} /> New AI Fight
          </button>
        </header>

        {view === "battle" && <BattleView battle={battle} onAdvance={() => setBattle((current) => playTurn(current))} />}
        {view === "gacha" && <GachaView pulls={lastPulls} onPull={handlePull} />}
        {view === "collection" && <CollectionView cards={ownedCards} />}
        {view === "lobby" && <LobbyView />}
      </section>
    </main>
  );
}

function BattleView({ battle, onAdvance }: { battle: BattleState; onAdvance: () => void }) {
  return (
    <div className="battle-grid">
      <FighterPanel fighter={battle.ai} side="opponent" />
      <section className="arena">
        <div className="versus">
          <span>{battle.active === "player" ? "Your turn" : "AI turn"}</span>
          <strong>{battle.winner ? `${battle.winner === "player" ? "You win" : "AI wins"}` : `Turn ${battle.turn}`}</strong>
          <button className="primary" onClick={onAdvance} disabled={Boolean(battle.winner)}>
            <Swords size={18} /> Resolve Turn
          </button>
        </div>
        <div className={`attack-fx ${battle.player.vanguard.attackAnimation ?? "slash"}`} />
        <div className="log">
          {battle.log.slice(0, 12).map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      </section>
      <FighterPanel fighter={battle.player} side="player" />
    </div>
  );
}

function FighterPanel({ fighter, side }: { fighter: BattleState["player"]; side: "player" | "opponent" }) {
  return (
    <section className={`fighter ${side}`}>
      <div className="fighter-stats">
        <strong>{fighter.name}</strong>
        <span>Damage {fighter.damage.length}/6 · Hand {fighter.hand.length} · Deck {fighter.deck.length}</span>
      </div>
      <div className="field">
        <CardMini card={fighter.vanguard} label="Vanguard" featured />
        {fighter.rearGuards.map((card, index) => (
          <CardMini key={`${card.id}-${index}`} card={card} label="Rear-guard" />
        ))}
      </div>
    </section>
  );
}

function GachaView({ pulls, onPull }: { pulls: CardDefinition[]; onPull: (amount: number) => void }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Dimensional Banner</h2>
          <p>SSR cards trigger reveal cutscenes and unlock signature attack animations.</p>
        </div>
        <div className="actions">
          <button onClick={() => onPull(1)}>Pull 1</button>
          <button className="primary" onClick={() => onPull(10)}>
            <Sparkles size={18} /> Pull 10
          </button>
        </div>
      </div>
      <div className="cards-grid reveal-grid">
        {(pulls.length ? pulls : cards.slice(0, 5)).map((card, index) => (
          <CardTile key={`${card.id}-${index}`} card={card} reveal={pulls.length > 0} />
        ))}
      </div>
    </section>
  );
}

function CollectionView({ cards }: { cards: CardDefinition[] }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Card Folder</h2>
          <p>Data is imported from `src/cards`; add more anime nations there without touching the battle UI.</p>
        </div>
      </div>
      <div className="cards-grid">
        {cards.map((card, index) => (
          <CardTile key={`${card.id}-${index}`} card={card} />
        ))}
      </div>
    </section>
  );
}

function LobbyView() {
  return (
    <section className="panel lobby">
      <Clapperboard size={44} />
      <h2>Friend Fight Lobby</h2>
      <p>Firebase Auth and Firestore are wired. The next server-side step is creating rooms documents with player seats, ready states, and battle snapshots.</p>
      <div className="lobby-flow">
        <span>Login</span>
        <span>Create Room</span>
        <span>Invite Friend</span>
        <span>Sync Turns</span>
      </div>
    </section>
  );
}

function CardTile({ card, reveal }: { card: CardDefinition; reveal?: boolean }) {
  return (
    <article className={`card-tile rarity-${card.rarity.toLowerCase()} ${reveal && card.cutscene ? "cutscene" : ""}`}>
      <img src={card.art} alt={card.name} />
      <div className="card-copy">
        <span>{card.nation} · G{card.grade} · {card.rarity}</span>
        <strong>{card.name}</strong>
        <p>{card.skills[0]?.name ?? card.flavor}</p>
      </div>
    </article>
  );
}

function CardMini({ card, label, featured }: { card: CardDefinition; label: string; featured?: boolean }) {
  return (
    <article className={`card-mini ${featured ? "featured" : ""}`}>
      <img src={card.art} alt={card.name} />
      <span>{label}</span>
      <strong>{card.name}</strong>
      <small>G{card.grade} / {card.power}</small>
    </article>
  );
}

function viewTitle(view: View) {
  return {
    battle: "AI Cardfight Simulator",
    gacha: "Gacha Summon",
    collection: "Collection",
    lobby: "Friend Login Lobby",
  }[view];
}

export default App;
