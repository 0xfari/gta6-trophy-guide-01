/* Leonida 55 — GTA VI trophy tracker. Offline, no network: data comes from data/trophies.json next to this file. Progress lives in localStorage. */
(function () {
  'use strict';
  var EARNED_KEY = 'leonida55-earned-v1';
  var SPOILER_KEY = 'leonida55-spoiler-v1';
  // Fixed preview seed used only when the page is opened with #demo=13 (screenshot previews):
  // the same 13 trophies every time, so renders are reproducible.
  var DEMO_EARNED = ['t03', 't04', 't05', 't08', 't10', 't15', 't16', 't19', 't21', 't28', 't35', 't42', 't53'];

  var STAGES = [
    { n: 1, title: 'Story first — Chapters 1–4 and the finale', text: 'Play the story straight through. Chapter trophies and the named story missions land on their own; do the missable story missions the first time they are offered.' },
    { n: 2, title: 'Strangers & side missions', text: 'Work the stranger strands (Andy, Kenton, Billy, Randy, Tyrone and three more) to their final missions, plus Gone Fishing. Finish strands in the mid-game, before the endgame closes them.' },
    { n: 3, title: 'Activities & skills', text: 'Shooting-range gold, 250 stunts, 20 race wins, drone races at every location, fishing vs Cal, the arcade, Combat Focus. One focused session per activity type.' },
    { n: 4, title: 'Collectibles & exploration', text: 'Cards (3 sets), WAiNK at 100 spots, 100 vehicles, all of Leonida, meditation spots, the unique hunt, garages, Scooter Bros registrations. Sweep region by region after the story.' },
    { n: 5, title: 'Heists & robberies', text: 'Bank vaults x5, the armored truck, the undetected jewelry store, one illegal operation per gang, and the two partner robberies. Plan every escape before going in.' },
    { n: 6, title: 'Cleanup & economy', text: '50 challenges, $250,000 laundered, $100,000 spent, the odd one-off moments (bowling, the beach cocktail, the showroom smash, the choices), then 100% completion — and the Platinum.' }
  ];

  var KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

  var state = {
    trophies: [],
    earned: new Set(),
    spoiler: false,
    kind: 'all',
    search: '',
    todoOnly: false,
    view: 'checklist',
    selectedId: null
  };

  function $(id) { return document.getElementById(id); }
  function loadEarned() {
    try {
      var raw = localStorage.getItem(EARNED_KEY);
      if (!raw) return new Set();
      return new Set(JSON.parse(raw).filter(function (x) { return typeof x === 'string'; }));
    } catch (e) { return new Set(); }
  }
  function saveEarned() {
    try { localStorage.setItem(EARNED_KEY, JSON.stringify(Array.from(state.earned).sort())); } catch (e) { /* private mode */ }
  }
  function loadSpoiler() {
    try { return localStorage.getItem(SPOILER_KEY) === '1'; } catch (e) { return false; }
  }
  function saveSpoiler() {
    try { localStorage.setItem(SPOILER_KEY, state.spoiler ? '1' : '0'); } catch (e) { /* private mode */ }
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function isSpoiled(t) {
    return state.spoiler && t.kind === 'story' && !state.earned.has(t.id);
  }
  function trophyById(id) {
    for (var i = 0; i < state.trophies.length; i++) if (state.trophies[i].id === id) return state.trophies[i];
    return null;
  }

  function visibleTrophies() {
    var q = state.search.trim().toLowerCase();
    return state.trophies.filter(function (t) {
      if (state.kind !== 'all' && t.kind !== state.kind) return false;
      if (state.todoOnly && state.earned.has(t.id)) return false;
      if (q && t.name.toLowerCase().indexOf(q) === -1 && t.description.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function renderProgress() {
    var total = state.trophies.length;
    var n = state.earned.size;
    $('earnedCount').textContent = String(n);
    var pct = total ? Math.round(n / total * 100) : 0;
    $('progressFill').style.width = pct + '%';
    $('progressPct').textContent = pct + '% to Platinum (' + n + ' of ' + total + ' earned)';
  }

  function renderList() {
    var list = $('trophyList');
    list.innerHTML = '';
    var vis = visibleTrophies();
    var earnedVis = vis.filter(function (t) { return state.earned.has(t.id); }).length;
    $('listMeta').textContent = 'Showing ' + vis.length + ' of ' + state.trophies.length + ' trophies' +
      (state.kind !== 'all' ? ' · ' + KIND_LABELS[state.kind] : '') +
      (state.todoOnly ? ' · to do only' : '') + ' · ' + earnedVis + ' earned in this view';
    $('emptyState').hidden = vis.length !== 0;
    vis.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'trophy' + (state.earned.has(t.id) ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : '');
      var spoiled = isSpoiled(t);
      var name = spoiled ? 'Hidden story trophy' : t.name;
      var desc = spoiled ? 'Spoiler-safe mode is on — earn this trophy to reveal its name and description.' : t.description;
      li.innerHTML =
        '<input type="checkbox" aria-label="Earned: ' + esc(name) + '"' + (state.earned.has(t.id) ? ' checked' : '') + '>' +
        '<div class="body"><div class="name">' + esc(name) + '</div>' +
        '<div class="desc">' + esc(desc) + '</div>' +
        '<div class="tags">' +
        '<span class="tag grade-' + esc(t.grade) + '">' + esc(t.grade) + '</span>' +
        '<span class="tag kind">' + esc(KIND_LABELS[t.kind] || t.kind) + '</span>' +
        (t.missable ? '<span class="tag missable">Missable</span>' : '') +
        (t.hidden ? '<span class="tag hiddenflag">Hidden</span>' : '') +
        '<span class="tag stage">Stage ' + t.stage + '</span>' +
        '</div></div><span class="open">Guide &rsaquo;</span>';
      li.querySelector('input').addEventListener('click', function (ev) {
        ev.stopPropagation();
        toggleEarned(t.id);
      });
      li.addEventListener('click', function () { selectTrophy(t.id); });
      list.appendChild(li);
    });
  }

  function renderDetail() {
    var box = $('detail');
    var t = state.selectedId ? trophyById(state.selectedId) : null;
    if (!t) {
      box.innerHTML = '<p class="detail-hint">Select a trophy on the left to read its guide and source here.</p>';
      return;
    }
    var spoiled = isSpoiled(t);
    var earned = state.earned.has(t.id);
    var html = '<div class="tags">' +
      '<span class="tag grade-' + esc(t.grade) + '">' + esc(t.grade) + '</span>' +
      '<span class="tag kind">' + esc(KIND_LABELS[t.kind] || t.kind) + '</span>' +
      (t.missable ? '<span class="tag missable">Missable</span>' : '') +
      (t.hidden ? '<span class="tag hiddenflag">Hidden</span>' : '') +
      '<span class="tag stage">Roadmap stage ' + t.stage + '</span></div>' +
      '<h2>' + esc(spoiled ? 'Hidden story trophy' : t.name) + '</h2>' +
      '<p class="official">' + esc(spoiled ? 'Hidden until earned (spoiler-safe mode).' : 'Official description: “' + t.description + '”') + '</p>' +
      '<p><strong>Status:</strong> ' + (earned ? 'Earned ✓' : 'Not earned yet') + '</p>';
    if (spoiled) {
      html += '<p class="guide spoiled">Spoiler-safe mode hides this story trophy until you earn it. Untick the spoiler setting above, or tick the trophy earned, to read its guide.</p>';
    } else {
      if (t.missable) html += '<p class="warn"><strong>Missable:</strong> tied to a named mission or a one-time moment — do it before the story moves on, or it may need a replay.</p>';
      html += '<p class="guide">' + esc(t.guide) + '</p>';
      html += '<p class="src"><b>Source:</b> <a href="' + esc(t.source.url) + '">' + esc(t.source.name) + '</a> — official name, description and grade. Guide text is our own words, written from that official description.</p>';
    }
    box.innerHTML = html;
  }

  function renderRoadmap() {
    var box = $('roadmapView');
    box.innerHTML = '';
    STAGES.forEach(function (s) {
      var mine = state.trophies.filter(function (t) { return t.stage === s.n; });
      var done = mine.filter(function (t) { return state.earned.has(t.id); }).length;
      var div = document.createElement('div');
      div.className = 'stage';
      div.innerHTML = '<h3><span class="n">Stage ' + s.n + '</span>' + esc(s.title) +
        '<span class="stage-count">' + done + '/' + mine.length + '</span></h3>' +
        '<p>' + esc(s.text) + '</p>' +
        '<ul>' + mine.map(function (t) {
          return '<li class="' + (state.earned.has(t.id) ? 'done' : '') + '">' +
            esc(isSpoiled(t) ? 'Hidden story trophy' : t.name) +
            (t.missable ? ' <span class="tag missable">Missable</span>' : '') + '</li>';
        }).join('') + '</ul>';
      box.appendChild(div);
    });
  }

  function renderMissable() {
    var box = $('missableView');
    var miss = state.trophies.filter(function (t) { return t.missable; });
    var done = miss.filter(function (t) { return state.earned.has(t.id); }).length;
    box.innerHTML = '<p class="intro"><strong>' + miss.length + ' missable trophies</strong> (' + done + ' earned). Missable means tied to a named mission or a one-time moment: finish it before the story moves on, because a replay may be the only way back. Chapter trophies are not missable — the story always gives them — but these are the ones to check before every story push.</p>';
    var ul = document.createElement('ul');
    ul.className = 'trophy-list';
    miss.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'trophy' + (state.earned.has(t.id) ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : '');
      var spoiled = isSpoiled(t);
      li.innerHTML =
        '<input type="checkbox" aria-label="Earned: ' + esc(t.name) + '"' + (state.earned.has(t.id) ? ' checked' : '') + '>' +
        '<div class="body"><div class="name">' + esc(spoiled ? 'Hidden story trophy' : t.name) + '</div>' +
        '<div class="desc">' + esc(spoiled ? 'Spoiler-safe mode is on — earn this trophy to reveal it.' : t.description) + '</div>' +
        '<div class="tags"><span class="tag grade-' + esc(t.grade) + '">' + esc(t.grade) + '</span>' +
        '<span class="tag missable">Missable</span><span class="tag stage">Stage ' + t.stage + '</span></div></div>' +
        '<span class="open">Guide &rsaquo;</span>';
      li.querySelector('input').addEventListener('click', function (ev) { ev.stopPropagation(); toggleEarned(t.id); });
      li.addEventListener('click', function () { selectTrophy(t.id); });
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  function render() {
    renderProgress();
    var isRoadmap = state.view === 'roadmap';
    var isMissable = state.view === 'missable';
    $('trophyList').style.display = isRoadmap || isMissable ? 'none' : '';
    $('listMeta').style.display = isRoadmap || isMissable ? 'none' : '';
    $('roadmapView').hidden = !isRoadmap;
    $('missableView').hidden = !isMissable;
    if (isRoadmap) renderRoadmap();
    else if (isMissable) renderMissable();
    else renderList();
    renderDetail();
    document.querySelectorAll('#viewTabs button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-view') === state.view);
    });
    document.querySelectorAll('#kindFilters button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-kind') === state.kind);
    });
  }

  function toggleEarned(id) {
    if (state.earned.has(id)) state.earned.delete(id);
    else state.earned.add(id);
    saveEarned();
    render();
  }
  function selectTrophy(id) {
    state.selectedId = id;
    render();
  }

  function exportProgress() {
    var data = { game: 'Grand Theft Auto VI', guide: 'Leonida 55', exportedAt: new Date().toISOString(), earned: Array.from(state.earned).sort() };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida55-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    $('saveMsg').textContent = 'Exported ' + state.earned.size + ' earned trophies to leonida55-progress.json.';
  }
  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var ids = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(ids)) throw new Error('no earned list');
        var known = new Set(state.trophies.map(function (t) { return t.id; }));
        var next = new Set(ids.filter(function (id) { return known.has(id); }));
        state.earned = next;
        saveEarned();
        render();
        $('saveMsg').textContent = 'Imported ' + next.size + ' earned trophies.';
      } catch (e) {
        $('saveMsg').textContent = 'That file could not be imported — it is not a Leonida 55 progress file.';
      }
    };
    reader.readAsText(file);
  }

  function applyHash() {
    var h = window.location.hash.replace(/^#/, '');
    var p = new URLSearchParams(h);
    if (p.get('view') && ['checklist', 'roadmap', 'missable'].indexOf(p.get('view')) !== -1) state.view = p.get('view');
    if (p.get('kind') && (p.get('kind') === 'all' || KIND_LABELS[p.get('kind')])) state.kind = p.get('kind');
    if (p.get('spoiler') === 'on') state.spoiler = true;
    if (p.get('todo') === '1') state.todoOnly = true;
    if (p.get('demo') === '13') state.earned = new Set(DEMO_EARNED);
    if (p.get('trophy')) state.selectedId = p.get('trophy');
    if (p.get('q')) state.search = p.get('q');
  }

  function bind() {
    $('search').addEventListener('input', function (e) { state.search = e.target.value; render(); });
    document.querySelectorAll('#kindFilters button').forEach(function (b) {
      b.addEventListener('click', function () { state.kind = b.getAttribute('data-kind'); if (state.view !== 'checklist') state.view = 'checklist'; render(); });
    });
    document.querySelectorAll('#viewTabs button').forEach(function (b) {
      b.addEventListener('click', function () { state.view = b.getAttribute('data-view'); render(); });
    });
    $('todoOnly').addEventListener('change', function (e) { state.todoOnly = e.target.checked; render(); });
    $('spoilerToggle').addEventListener('change', function (e) { state.spoiler = e.target.checked; saveSpoiler(); render(); });
    $('exportBtn').addEventListener('click', exportProgress);
    $('importFile').addEventListener('change', function (e) { if (e.target.files[0]) importProgress(e.target.files[0]); e.target.value = ''; });
    $('resetBtn').addEventListener('click', function () {
      state.earned = new Set();
      saveEarned();
      render();
      $('saveMsg').textContent = 'Progress reset.';
    });
  }

  function boot() {
    state.earned = loadEarned();
    state.spoiler = loadSpoiler();
    applyHash();
    $('spoilerToggle').checked = state.spoiler;
    $('todoOnly').checked = state.todoOnly;
    $('search').value = state.search;
    bind();
    fetch('data/trophies.json')
      .then(function (r) { if (!r.ok) throw new Error('trophies.json ' + r.status); return r.json(); })
      .then(function (d) {
        state.trophies = Array.isArray(d) ? d : d.trophies;
        render();
      })
      .catch(function (e) {
        $('listMeta').textContent = 'Could not load data/trophies.json (' + e.message + '). Serve the app/ folder over HTTP and reload.';
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
