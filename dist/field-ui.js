// Field simulator UI: every character's real contract actions, sent with the chosen latency and
// packet loss, applied by dist/field-sim.js and replayed in the logic map and the 3D arena.
(function () {
  const config = window.ATLAS_GAMEPLAY_ROSTER;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  if (!config || !window.AtlasFieldSim || !$("#field")) return;
  const roster = config.roster;
  const sim = window.AtlasFieldSim.create(config, { now: performance.now() });
  const net = { latency: 60, loss: 5, sent: 0, delivered: 0, lost: 0, latencyTotal: 0 };
  const holds = {};
  let selected = roster[$("#roleSelect")?.value] ? $("#roleSelect").value : "guardian";

  const copy = {
    en: {
      bossHp: "Boss HP", charge: "Phase charge", focus: "Boss focus", taunted: "taunted",
      seat: "Seat", reserve: "Reserve", bench: "Bench", down: "Down", ai: "AI",
      connected: "Prop connected", unplug: "Unplug prop → AI takes over", replug: "Plug prop back in",
      aiOwns: "Prop unplugged — the seat AI owns these abilities", bossNoAi: "Boss seat has no AI: abilities come from the greatsword (or keyboard).",
      swap: "Reserve Warrior takes seat", none: "Stay on bench",
      unity: { done: "Unity ✓", planned: "Planned in Unity" }, hold: "hold", key: "key",
      cooldown: s => `${s} s`, ready: "ready",
      sent: "sent", lost: "lost", heldReport: "SHOT_SEEN held for its FIRE",
      reasons: { cooldown: "on cooldown", not_charged: "not charged", heal_no_target: "no ally below 85 %", not_seated: "not seated (reserve)", seat_down: "seat is down", duplicate: "duplicate seq", stale: "stale seq", role_mismatch: "role mismatch", unknown_action: "unknown action", duplicate_hit: "duplicate hit ignored", unsupported_version: "unsupported version" },
      dmgBoss: n => `Boss −${n}`, heal: (who, n) => `${who} +${n} HP`, shield: ms => `team takes 60 % for ${ms / 1000} s`, block: "blocking: takes 30 %", released: "block released",
      taunt: ms => `Boss locked on Guardian ${ms / 1000} s`, parry: ms => `parry window ${ms} ms`, trapSet: ms => `trap arms in ${ms / 1000} s`, trapHit: n => `trap sprung · Boss −${n}`,
      shot: n => `shot #${n} open · waiting for armour`, hit: (zone, n, ms) => `HIT_CONFIRM · ${zone} · Boss −${n} · ${ms} ms`, expired: (n, why) => `shot #${n} ${why}`,
      knock: "knockback · 0 damage", draw: "presentation only", heroHit: list => list, letDown: "Let down before DRAW_READY — no shot", isDown: who => `${who} is down`,
      plugged: who => `${who}: prop plugged in`, unplugged: (who, rel) => `${who}: prop unplugged → AI${rel ? " · BLOCK_END forced" : ""}`, lineup: (who, seat, out) => `${who} takes ${seat} · ${out} to the bench`,
      reset: "Simulation reset", zones: { left: "left shoulder", chest: "chest", right: "right shoulder" }
    },
    vi: {
      bossHp: "Máu Boss", charge: "Nạp tuyệt kỹ", focus: "Boss nhắm", taunted: "bị khiêu khích",
      seat: "Ghế", reserve: "Dự bị", bench: "Ghế chờ", down: "Gục", ai: "AI",
      connected: "Prop đã cắm", unplug: "Rút prop → AI tiếp quản", replug: "Cắm prop lại",
      aiOwns: "Prop đã rút — AI của ghế đang giữ các kỹ năng này", bossNoAi: "Ghế Boss không có AI: kỹ năng đến từ đại kiếm (hoặc bàn phím).",
      swap: "Warrior dự bị vào ghế", none: "Ngồi ghế chờ",
      unity: { done: "Unity ✓", planned: "Chưa nối Unity" }, hold: "giữ", key: "phím",
      cooldown: s => `${s} s`, ready: "sẵn sàng",
      sent: "đã gửi", lost: "mất gói", heldReport: "giữ SHOT_SEEN chờ FIRE",
      reasons: { cooldown: "đang hồi chiêu", not_charged: "chưa nạp đủ", heal_no_target: "không ai dưới 85 % máu", not_seated: "chưa vào ghế (dự bị)", seat_down: "đã gục", duplicate: "trùng seq", stale: "seq cũ", role_mismatch: "sai role", unknown_action: "action lạ", duplicate_hit: "bỏ qua hit lặp", unsupported_version: "sai phiên bản" },
      dmgBoss: n => `Boss −${n}`, heal: (who, n) => `${who} +${n} máu`, shield: ms => `cả đội nhận 60 % trong ${ms / 1000} s`, block: "đang đỡ: nhận 30 %", released: "thôi đỡ",
      taunt: ms => `Boss khóa Hộ vệ ${ms / 1000} s`, parry: ms => `cửa sổ đỡ ${ms} ms`, trapSet: ms => `bẫy kích hoạt sau ${ms / 1000} s`, trapHit: n => `bẫy nổ · Boss −${n}`,
      shot: n => `mở phát #${n} · chờ giáp báo`, hit: (zone, n, ms) => `HIT_CONFIRM · ${zone} · Boss −${n} · ${ms} ms`, expired: (n, why) => `phát #${n} ${why}`,
      knock: "đẩy lùi · 0 sát thương", draw: "chỉ để hiển thị", heroHit: list => list, letDown: "Hạ dây trước DRAW_READY — không bắn", isDown: who => `${who} đã gục`,
      plugged: who => `${who}: đã cắm prop`, unplugged: (who, rel) => `${who}: rút prop → AI${rel ? " · ép BLOCK_END" : ""}`, lineup: (who, seat, out) => `${who} vào ${seat} · ${out} ra ghế chờ`,
      reset: "Đã đặt lại mô phỏng", zones: { left: "vai trái", chest: "ngực", right: "vai phải" }
    }
  };
  const lang = () => (document.documentElement.lang === "en" ? "en" : "vi");
  const t = () => copy[lang()];
  const li = () => (lang() === "vi" ? 1 : 0);
  const nameOf = key => roster[key]?.name[li()] || key;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const now = () => performance.now();

  // ---- Network --------------------------------------------------------------------------
  function transmit(line, from, to) {
    const jitter = Math.round((Math.random() - 0.5) * net.latency * 0.25);
    const travel = Math.max(0, net.latency + jitter);
    const lost = Math.random() * 100 < net.loss;
    const duration = Math.max(180, travel);
    net.sent++;
    log("", line, t().sent);
    window.dispatchEvent(new CustomEvent("atlas-field-action", { detail: { role: from, action: line.action || line.type, lost, duration, target: to, type: line.type } }));
    animatePacket(from, to, lost, duration);
    setTimeout(() => {
      if (lost) { net.lost++; log("lost", line, t().lost); }
      else { net.delivered++; net.latencyTotal += travel; sim.deliver(line, now()); }
      render();
    }, duration);
    render();
    return { line, lost, latencyMs: travel };
  }
  function targetOf(key) { return roster[key].team === "boss" ? sim.snapshot(now()).boss.focus : "boss"; }
  function send(key, event) { return transmit(sim.makeIntent(key, event, now()), key, targetOf(key)); }
  function fireArrow() {
    const sent = send("archer", "FIRE");
    // The coded IR packet takes ~70 ms (firmware/arc-bow NEC frame); the armour then reports on its own link.
    setTimeout(() => transmit(sim.makeShotSeen(sent.line.shot, now()), "boss", "archer"), 70);
    return sent;
  }

  // ---- Player input (press / release keeps holds honest) --------------------------------
  function press(index, key = selected) {
    const spec = roster[key].actions[index]; if (!spec) return null;
    const hero = sim.snapshot(now()).heroes[key];
    if (hero && !hero.connected) { toast(t().aiOwns); return { status: "prop_unplugged" }; }
    const id = `${key}:${index}`; if (holds[id]) return null;
    if (spec.draw) {
      holds[id] = { ready: false };
      send(key, spec.draw[0]);
      holds[id].timer = setTimeout(() => { if (holds[id]) { holds[id].ready = true; send(key, spec.draw[1]); renderActions(); } }, spec.drawReadyMs);
      renderActions(); return { status: "drawing" };
    }
    if (spec.hold) { holds[id] = { ready: true }; renderActions(); return send(key, spec.event); }
    return send(key, spec.event);
  }
  function release(index, key = selected) {
    const spec = roster[key].actions[index]; const id = `${key}:${index}`; const hold = holds[id];
    if (!spec || !hold) return null;
    delete holds[id]; clearTimeout(hold.timer); renderActions();
    if (spec.draw) {
      if (!hold.ready) { toast(t().letDown); logNote("archer", t().letDown); return { status: "let_down" }; }
      return fireArrow();
    }
    if (spec.hold) return send(key, spec.hold);
    return null;
  }
  // Programmatic trigger (WebMCP / tests): a hold is pressed and released automatically.
  function trigger(key, event) {
    if (!roster[key]) throw new Error("Unknown role");
    const index = roster[key].actions.findIndex(spec => spec.event === event || spec.draw?.includes(event) || spec.hold === event);
    if (index < 0) throw new Error(`Unknown action for ${key}`);
    select(key);
    const spec = roster[key].actions[index];
    if (spec.hold && event === spec.hold) return release(index, key);
    const result = press(index, key);
    if (spec.draw) setTimeout(() => release(index, key), spec.drawReadyMs + 60);
    else if (spec.hold) setTimeout(() => release(index, key), 1500);
    return result || { status: "busy" };
  }

  // ---- Log -------------------------------------------------------------------------------
  function log(status, line, detail) {
    const key = Object.keys(roster).find(item => roster[item].deviceId === line.deviceId);
    const color = key ? roster[key].color : "#e8dfe3";
    const label = line.type === "SHOT_SEEN" ? `ARMOUR SHOT_SEEN #${line.shot}` : `${line.role || "AI"} ${line.action}${line.shot && line.action === "FIRE" ? ` #${line.shot}` : ""}`;
    addRow(status, `<i style="color:${color}">${esc(label)}</i> · ${esc(detail)}`);
  }
  function logNote(key, text, status = "") { addRow(status, `<i style="color:${roster[key]?.color || "#e8dfe3"}">${esc(nameOf(key))}</i> · ${esc(text)}`); }
  function addRow(status, html) {
    const item = document.createElement("li");
    const stamp = new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
    item.innerHTML = `<span>${stamp}</span><b class="${status}">${html}</b>`;
    $("#eventLog").prepend(item);
    while ($("#eventLog").children.length > 14) $("#eventLog").lastElementChild.remove();
  }
  function describe(event) {
    const c = t(); const o = event.outcome || {}; const parts = [];
    if (o.presentation) parts.push(c.draw);
    if (o.released) parts.push(c.released);
    if (o.blocking) parts.push(c.block);
    if (o.parryMs) parts.push(c.parry(o.parryMs));
    if (o.tauntMs) parts.push(c.taunt(o.tauntMs));
    if (o.shotOpened) parts.push(c.shot(o.shotOpened));
    if (event.action === "HIT_CONFIRM") parts.push(c.hit(c.zones[o.zone] || o.zone, o.bossDamage, o.latencyMs));
    else if (o.bossDamage) parts.push(c.dmgBoss(o.bossDamage));
    if (o.trap) parts.push(c.trapSet(roster[event.key].actions.find(spec => spec.effect.trap).effect.trap.armMs));
    if (o.healed) parts.push(c.heal(nameOf(o.healed.target), o.healed.amount));
    if (o.teamShieldMs) parts.push(c.shield(o.teamShieldMs));
    if (o.knockback) parts.push(c.knock);
    if (o.heroDamage) parts.push(Object.entries(o.heroDamage).map(([key, n]) => `${nameOf(key)} −${n}`).join(", ") || "0");
    return parts.join(" · ") || "accepted";
  }
  sim.on(event => {
    const c = t();
    if (event.kind === "accepted") {
      if (event.source === "ai") logNote(event.key, `${c.ai} ${event.action} · ${describe(event)}`, "good");
      else if (event.action === "HIT_CONFIRM") log("good", event.line, describe(event));
      else log("good", event.line, describe(event));
    } else if (event.kind === "refused") {
      log("lost", event.line, `${event.reason}${event.why ? ` · ${c.reasons[event.why] || event.why}` : ` · ${c.reasons[event.reason] || ""}`}`);
    } else if (event.kind === "held") log("", event.line, c.heldReport);
    else if (event.kind === "expired") logNote(event.key, c.expired(event.shot, event.reason), "lost");
    else if (event.kind === "trap") logNote(event.key, c.trapHit(event.bossDamage), "good");
    else if (event.kind === "down") { logNote(event.key, c.isDown(nameOf(event.key)), "lost"); toast(c.isDown(nameOf(event.key))); }
    else if (event.kind === "connection") logNote(event.key, event.connected ? c.plugged(nameOf(event.key)) : c.unplugged(nameOf(event.key), event.releasedBlock), event.connected ? "good" : "");
    else if (event.kind === "lineup") logNote(event.seated, c.lineup(nameOf(event.seated), config.seats[event.seat].label[li()], nameOf(event.benched)), "good");
    window.dispatchEvent(new CustomEvent("atlas-field-impact", { detail: { ...event, line: undefined } }));
    render();
  });

  // ---- Rendering ------------------------------------------------------------------------
  function seatPosition(key, snap) {
    const seat = Object.entries(snap.lineup).find(([, value]) => value === key)?.[0];
    if (key === "boss") return { left: 50, top: 50 };
    const info = config.seats[seat]; const r = info.bench ? 46 : 36;
    const a = info.angle * Math.PI / 180;
    return { left: 50 + Math.sin(a) * r, top: 50 - Math.cos(a) * r, seat };
  }
  function renderStats(snap) {
    const c = t(); const { bossHp, heroHp, bossCharge } = config.limits;
    $("#bossHpLabel").textContent = c.bossHp; $("#bossChargeLabel").textContent = c.charge;
    $("#bossHpText").textContent = `${snap.boss.hp} / ${bossHp}`;
    $("#bossHpBar").style.width = `${snap.boss.hp / bossHp * 100}%`;
    $("#bossChargeText").textContent = `${Math.round(snap.boss.charge)} %`;
    $("#bossChargeBar").style.width = `${snap.boss.charge / bossCharge * 100}%`;
    $("#bossFocusText").textContent = `${c.focus}: ${nameOf(snap.boss.focus)}${snap.boss.taunted ? ` (${c.taunted})` : ""}`;
    $("#partyHp").innerHTML = ["hero1", "hero2", "hero3", "hero4"].map(seat => {
      const key = snap.lineup[seat]; const h = snap.heroes[key];
      const tags = [h.blocking ? "▣" : "", h.shielded ? "◈" : "", !h.connected ? c.ai : ""].filter(Boolean).join(" ");
      return `<div class="party-hp${h.hp <= 0 ? " is-down" : ""}" style="--token:${roster[key].color}"><span>${esc(nameOf(key))}${tags ? ` <em>${esc(tags)}</em>` : ""}</span><b>${h.hp}</b><i><u style="width:${h.hp / heroHp * 100}%"></u></i></div>`;
    }).join("");
    $("#sentMetric").textContent = net.sent; $("#deliveredMetric").textContent = net.delivered; $("#lostMetric").textContent = net.lost;
    $("#avgMetric").textContent = net.delivered ? `${Math.round(net.latencyTotal / net.delivered)} ms` : "—";
  }
  function renderRoster(snap) {
    const c = t();
    const order = ["guardian", "archer", "assassin", "mage", "warrior", "boss"];
    $("#arenaRoleChips").innerHTML = order.map(key => {
      const benched = snap.lineup.reserve === key; const h = snap.heroes[key];
      const tag = benched ? c.reserve : h && !h.connected ? c.ai : h && h.hp <= 0 ? c.down : "";
      return `<button type="button" data-field-role="${key}" class="${key === selected ? "is-active" : ""}${benched ? " is-bench" : ""}" style="--token:${roster[key].color}"><i></i>${esc(nameOf(key))}${tag ? `<small>${esc(tag)}</small>` : ""}</button>`;
    }).join("");
    $("#arenaTokens").innerHTML = order.map(key => {
      const pos = seatPosition(key, snap); const item = roster[key]; const h = snap.heroes[key];
      const hp = key === "boss" ? snap.boss.hp / config.limits.bossHp : h.hp / config.limits.heroHp;
      const classes = ["field-token", key === "boss" ? "is-boss" : "", key === selected ? "is-selected" : "", key === snap.boss.focus ? "is-focus" : "", snap.lineup.reserve === key ? "is-bench" : "", h && !h.connected ? "is-ai" : "", hp <= 0 ? "is-down" : ""].filter(Boolean).join(" ");
      return `<button type="button" class="${classes}" data-role="${key}" style="--token:${item.color};--hp:${Math.max(0, hp)};left:${pos.left}%;top:${pos.top}%"><span>${item.glyph}</span><small>${esc(item.name[li()])}</small><em>${esc(pos.seat ? config.seats[pos.seat].label[li()] : item.propName[li()])}</em></button>`;
    }).join("");
    $("#arenaLegend").innerHTML = `<span><i class="hero-dot"></i>Hero</span><span><i class="boss-dot"></i>Boss</span><span><i class="zone-dot"></i>${lang() === "vi" ? "Vùng AoE" : "AoE / range"}</span>`;
  }
  function renderSeat(snap) {
    const c = t(); const item = roster[selected]; const h = snap.heroes[selected];
    const seat = Object.entries(snap.lineup).find(([, value]) => value === selected)?.[0];
    const seatLabel = selected === "boss" ? "Boss" : config.seats[seat].label[li()];
    const control = selected === "boss"
      ? `<p class="seat-note">${esc(c.bossNoAi)}</p>`
      : `<button type="button" class="button ghost compact seat-plug${h.connected ? "" : " is-ai"}" id="seatPlug">${esc(h.connected ? c.unplug : c.replug)}</button>`;
    const swapOptions = [["", c.none], ...roster.warrior.meleeSeats.map(seatId => [seatId, `${config.seats[seatId].label[li()]} · ${nameOf(snap.lineup[seatId] === "warrior" ? snap.lineup.reserve : snap.lineup[seatId])}`])];
    const warriorSeat = Object.entries(snap.lineup).find(([, value]) => value === "warrior")?.[0];
    const signature = [lang(), selected, h?.connected, JSON.stringify(snap.lineup)].join("|");
    if ($("#seatBar").dataset.signature === signature) return;
    $("#seatBar").dataset.signature = signature;
    $("#seatBar").innerHTML = `
      <div class="seat-id" style="--token:${item.color}"><b>${esc(nameOf(selected))}</b><span><code>${esc(item.deviceId)}</code> · ${esc(c.seat)}: ${esc(seatLabel)} · ${esc(item.firmware)}</span>
        <small>${h ? esc(h.connected ? c.connected : c.aiOwns) : ""}</small></div>
      <div class="seat-controls">${control}
        <label class="seat-swap"><span>${esc(c.swap)}</span><select id="reserveSwap">${swapOptions.map(([value, label]) => `<option value="${value}"${(warriorSeat === value || (!value && warriorSeat === "reserve")) ? " selected" : ""}>${esc(label)}</option>`).join("")}</select></label>
      </div>`;
  }
  function renderActions() {
    const c = t(); const item = roster[selected]; const tNow = now(); const snap = sim.snapshot(tNow);
    document.documentElement.style.setProperty("--field-role", item.color);
    const h = snap.heroes[selected];
    $("#actionBar").innerHTML = item.actions.map((spec, index) => {
      const left = sim.cooldownLeft(selected, spec.event, tNow);
      const holdState = holds[`${selected}:${index}`];
      const charging = spec.effect.ultimate ? ` · ${Math.round(snap.boss.charge)} %` : "";
      const disabled = (h && (!h.connected || h.hp <= 0)) || (selected === "boss" && snap.boss.hp <= 0);
      const events = [...(spec.draw || []), spec.event, ...(spec.hold ? [spec.hold] : [])].join(" → ");
      return `<button type="button" class="action-button${holdState ? " is-holding" : ""}${holdState?.ready ? " is-ready" : ""}${spec.unity === "planned" ? " is-planned" : ""}" data-slot="${index}" ${disabled ? "disabled" : ""} style="--cd:${spec.cooldownMs ? Math.min(1, left / spec.cooldownMs) : 0}">
        <span>${index + 1}</span><strong>${esc(spec.label[li()])}</strong>
        <small><code>${esc(events)}</code>${charging}</small>
        <em>${esc(c.unity[spec.unity])} · ${esc(spec.command)}${left > 0 ? ` · ${c.cooldown((left / 1000).toFixed(1))}` : ""}</em></button>`;
    }).join("");
  }
  function render() {
    const snap = sim.snapshot(now());
    renderStats(snap); renderRoster(snap); renderSeat(snap); renderActions();
    window.dispatchEvent(new CustomEvent("atlas-field-state", { detail: { ...snap, selected, limits: config.limits, bossHp: snap.boss.hp, role: selected } }));
  }
  function select(key) {
    if (!roster[key] || key === selected) return;
    selected = key; render();
    window.dispatchEvent(new CustomEvent("atlas-select-field-role", { detail: { role: key } }));
  }
  function animatePacket(from, to, lost, duration) {
    const arena = $("#arena"); if (arena.classList.contains("is-hidden")) return;
    const a = $(`.field-token[data-role="${from}"] span`); const b = $(`.field-token[data-role="${to}"] span`); if (!a || !b) return;
    const area = arena.getBoundingClientRect(); const p1 = a.getBoundingClientRect(); const p2 = b.getBoundingClientRect();
    const x1 = p1.left + p1.width / 2 - area.left - 6; const y1 = p1.top + p1.height / 2 - area.top - 6;
    let x2 = p2.left + p2.width / 2 - area.left - 6; let y2 = p2.top + p2.height / 2 - area.top - 6;
    if (lost) { x2 = x1 + (x2 - x1) * 0.55; y2 = y1 + (y2 - y1) * 0.55; }
    const dot = document.createElement("i"); dot.className = `packet${lost ? " is-lost" : ""}`; dot.style.setProperty("--packet", roster[from].color);
    $("#packetLayer").append(dot);
    const run = dot.animate([{ left: `${x1}px`, top: `${y1}px`, opacity: 1, transform: "scale(.8)" }, { left: `${x2}px`, top: `${y2}px`, opacity: lost ? 0.2 : 1, transform: lost ? "scale(.25)" : "scale(1.3)" }], { duration, easing: "cubic-bezier(.2,.7,.2,1)" });
    run.onfinish = () => dot.remove();
  }

  // ---- Wiring -----------------------------------------------------------------------------
  $("#arenaRoleChips").addEventListener("click", event => { const chip = event.target.closest("[data-field-role]"); if (chip) select(chip.dataset.fieldRole); });
  $("#arenaTokens").addEventListener("click", event => { const token = event.target.closest("[data-role]"); if (token) select(token.dataset.role); });
  const actionBar = $("#actionBar");
  actionBar.addEventListener("pointerdown", event => {
    const button = event.target.closest(".action-button"); if (!button || button.disabled || (event.button !== undefined && event.button !== 0)) return;
    event.preventDefault(); actionBar.dataset.pressed = button.dataset.slot; press(Number(button.dataset.slot));
  });
  const endPress = () => { if (actionBar.dataset.pressed === undefined) return; const slot = Number(actionBar.dataset.pressed); delete actionBar.dataset.pressed; release(slot); };
  window.addEventListener("pointerup", endPress); window.addEventListener("pointercancel", endPress);
  $("#seatBar").addEventListener("click", event => {
    if (!event.target.closest("#seatPlug")) return;
    const h = sim.snapshot().heroes[selected]; if (!h) return;
    Object.keys(holds).filter(id => id.startsWith(`${selected}:`)).forEach(id => { clearTimeout(holds[id].timer); delete holds[id]; });
    sim.setConnected(selected, !h.connected, now());
  });
  $("#seatBar").addEventListener("change", event => {
    if (event.target.id !== "reserveSwap") return;
    const target = event.target.value; const snap = sim.snapshot();
    const current = Object.entries(snap.lineup).find(([, value]) => value === "warrior")?.[0];
    if (current !== "reserve") sim.swapReserve(current);
    if (target) sim.swapReserve(target);
    render();
  });
  document.addEventListener("keydown", event => {
    if (!$("#field").classList.contains("is-active") || event.repeat || event.target.closest("input, select, textarea")) return;
    const index = Number(event.key) - 1; if (!(index >= 0 && index < roster[selected].actions.length)) return;
    event.preventDefault(); press(index);
  });
  document.addEventListener("keyup", event => {
    const index = Number(event.key) - 1; if (index >= 0 && index < (roster[selected]?.actions.length || 0)) release(index);
  });
  $("#resetSim").addEventListener("click", () => {
    Object.values(holds).forEach(hold => clearTimeout(hold.timer)); Object.keys(holds).forEach(id => delete holds[id]);
    Object.assign(net, { sent: 0, delivered: 0, lost: 0, latencyTotal: 0 });
    sim.reset(now()); $("#eventLog").innerHTML = ""; render();
    window.dispatchEvent(new CustomEvent("atlas-field-reset")); toast(t().reset);
  });
  $("#latencyRange").addEventListener("input", event => { net.latency = Number(event.target.value); $("#latencyValue").textContent = `${net.latency} ms`; });
  $("#lossRange").addEventListener("input", event => { net.loss = Number(event.target.value); $("#lossValue").textContent = `${net.loss}%`; });
  window.addEventListener("atlas-active-role", event => { if (roster[event.detail?.role] && event.detail.role !== selected) { selected = event.detail.role; render(); } });
  window.addEventListener("atlas-select-field-role", event => { if (roster[event.detail?.role] && event.detail.role !== selected) { selected = event.detail.role; render(); } });
  window.addEventListener("atlas-language-change", render);
  setInterval(() => { sim.tick(now()); if ($("#field").classList.contains("is-active")) { renderActions(); renderStats(sim.snapshot(now())); } }, 120);

  window.AtlasFieldUI = { trigger, press, release, select, snapshot: () => ({ ...sim.snapshot(now()), network: { ...net } }), sim };
  render();
})();
