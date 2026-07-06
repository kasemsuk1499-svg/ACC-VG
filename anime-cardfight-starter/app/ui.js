export function renderCards(cards, root) {
  root.innerHTML = cards.map(card => `
    <div class="card">
      <h3>${card.name}</h3>
      <p>Grade ${card.grade} · ${card.rarity} · ${card.type}</p>
      <p>Power ${card.power.toLocaleString()} / Shield ${card.shield.toLocaleString()}</p>
      <p>Tags: ${card.styleTags.join(', ')}</p>
      <p>Trigger: ${card.trigger || '-'}</p>
    </div>
  `).join('');
}

function unitName(state, ref) {
  if (!ref) return '-';
  return state.cardMap[ref.cardId]?.name || ref.cardId;
}

export function renderField(state, root) {
  if (!state) {
    root.textContent = 'ยังไม่ได้เริ่มเกม';
    return;
  }
  root.innerHTML = Object.values(state.players).map(player => `
    <div class="player-field">
      <h3>${player.name} · Damage ${player.damage.length} · Hand ${player.hand.length} · Deck ${player.deck.length}</h3>
      <div class="row">
        <div class="circle"><strong>Front L</strong>${unitName(state, player.rear.frontLeft)}</div>
        <div class="circle"><strong>Vanguard</strong>${unitName(state, player.vanguard)}</div>
        <div class="circle"><strong>Front R</strong>${unitName(state, player.rear.frontRight)}</div>
      </div>
      <div class="row">
        <div class="circle"><strong>Back L</strong>${unitName(state, player.rear.backLeft)}</div>
        <div class="circle"><strong>Back C</strong>${unitName(state, player.rear.backCenter)}</div>
        <div class="circle"><strong>Back R</strong>${unitName(state, player.rear.backRight)}</div>
      </div>
    </div>
  `).join('');
}

export function renderLog(state, root) {
  root.textContent = state?.log?.slice(-80).join('\n') || '-';
}

export function renderProfile(profile, root) {
  root.textContent = JSON.stringify(profile, null, 2);
}
