/* Leonida 55 — GTA VI trophy guide & tracker. Offline static app.
   Data: app/data/trophies.json (official names/descriptions/grades + own-words guides).
   Progress is stored in localStorage only; export/import backs it up. */
(function () {
  'use strict';
  var LS_KEY = 'leonida55-earned-v1';
  var DEMO_EARNED = [2, 3, 8, 15, 16, 21, 28, 35, 42, 52, 53];
  var STAGES = {
    story: { title: 'Step 1 — Story (60–80 hours)', note: 'Play the 5 chapters, take optional missions as they appear, scan vehicles and study animals on the way. Grab the Chapter 1 meditation (Positive Mental Attitude) before the chapter ends — it is the one trophy that can be missed.' },
    checklist: { title: 'Step 2 — 100% checklist (about 100 hours)', note: 'After the credits, work through the 100% checklist (Progress > Stats > 100% Completion), including 70 of 80 challenges. The thresholds are lenient — roughly 60% of true completion — so most of it comes from the trophies above.' },
    cleanup: { title: 'Step 3 — Strangers & cleanup (about 10 hours)', note: 'Finish the 8 Strangers & Freaks strands and the character quests, then clean up whatever is left. Free roam stays open after the story.' },
    platinum: { title: 'Platinum', note: 'Earn the other 54 trophies. No multiplayer, no DLC, no difficulty setting — one playthrough is enough.' }
  };
  var KIND_LABEL = { story: 'Story', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

  var params = new URLSearchParams(location.search);
  var state = {
    trophies: [],
    earned: new Set(),
    filter: params.get('filter') || 'all',
    search: '',
    spoiler: params.get('spoiler') === 'on',
    view: params.get('view') === 'roadmap' ? 'roadmap' : 'checklist',
    selected: null,
    demo: params.get('demo') === 'earned'
  };

  var listEl = document.getElementById('trophyList');
  var detailEl = document.getElementById('detail');
  var searchEl = document.getElementById('search');
  var spoilerEl = document.getElementById('spoilerToggle');

  function loadEarned() {
    if (state.demo) { state.earned = new Set(DEMO_EARNED); return; }
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) state.earned = new Set(JSON.parse(raw).filter(function (id) { return Number.isInteger(id); }));
    } catch (e) { state.earned = new Set(); }
  }
  function saveEarned() {
    if (state.demo) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify(Array.from(state.earned).sort(function (a, b) { return a - b; }))); } catch (e) {}
  }

  function gradeLetter(g) { return g === 'platinum' ? 'P' : g === 'gold' ? 'G' : g === 'silver' ? 'S' : 'B'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function isSpoilerHidden(t) {
    return state.spoiler && t.kind === 'story' && !state.earned.has(t.id);
  }

  function visibleTrophies() {
    var q = state.search.trim().toLowerCase();
    return state.trophies.filter(function (t) {
      if (state.filter === 'story' && t.kind !== 'story') return false;
      if (state.filter === 'missable' && !t.missable) return false;
      if (state.filter === 'collectibles' && t.kind !== 'collectibles') return false;
      if (state.filter === 'activities' && t.kind !== 'activities') return false;
      if (state.filter === 'online' && t.kind !== 'online') return false;
      if (q && (t.name + ' ' + t.description).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function renderTotals() {
    var earned = state.earned.size;
    document.getElementById('earnedCount').textContent = earned;
    document.getElementById('progressFill').style.width = Math.round(earned / 55 * 100) + '%';
    var counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
    state.trophies.forEach(function (t) {
      counts[t.grade][1]++;
      if (state.earned.has(t.id)) counts[t.grade][0]++;
    });
    document.getElementById('gradeCounts').innerHTML =
      '<b class="p">Platinum ' + counts.platinum[0] + '/' + counts.platinum[1] + '</b> · ' +
      '<b class="g">Gold ' + counts.gold[0] + '/' + counts.gold[1] + '</b> · ' +
      '<b class="s">Silver ' + counts.silver[0] + '/' + counts.silver[1] + '</b> · ' +
      '<b class="b">Bronze ' + counts.bronze[0] + '/' + counts.bronze[1] + '</b>';
  }

  function cardHtml(t) {
    var hidden = isSpoilerHidden(t);
    var name = hidden ? 'Hidden story trophy' : esc(t.name);
    var desc = hidden ? 'Earn it to reveal. (Spoilers hidden.)' : esc(t.description);
    var earned = state.earned.has(t.id);
    var tags = '<span class="tag kind">' + esc(KIND_LABEL[t.kind] || t.kind) + '</span>' +
      (t.missable ? '<span class="tag miss">MISSABLE</span>' : '') +
      (t.hidden && !hidden ? '<span class="tag hidden">Hidden</span>' : '');
    return '<button type="button" class="card' + (earned ? ' earned' : '') + (state.selected === t.id ? ' selected' : '') + '" data-id="' + t.id + '">' +
      '<span class="row1"><span class="grade ' + t.grade + '">' + gradeLetter(t.grade) + '</span>' +
      '<span><span class="tname">' + name + '</span><span class="tdesc">' + desc + '</span></span></span>' +
      '<span class="tags">' + tags + '</span>' +
      '<span class="check"><input type="checkbox" tabindex="-1"' + (earned ? ' checked' : '') + ' aria-label="Mark earned"> <span>' + (earned ? 'Earned' : 'Mark earned') + '</span></span>' +
      '</button>';
  }

  function renderList() {
    var items = visibleTrophies();
    if (!items.length) {
      var note = state.filter === 'online'
        ? 'No online trophies in this list — all 55 are single-player.'
        : 'No trophies match this filter.';
      listEl.innerHTML = '<p class="empty">' + esc(note) + '</p>';
      return;
    }
    listEl.innerHTML = items.map(cardHtml).join('');
    listEl.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('click', function (ev) {
        var id = Number(card.getAttribute('data-id'));
        if (ev.target.tagName === 'INPUT') {
          toggleEarned(id);
          return;
        }
        select(id);
      });
    });
  }

  function renderDetail() {
    var t = state.trophies.find(function (x) { return x.id === state.selected; });
    if (!t) {
      detailEl.innerHTML = '<p class="detailEmpty">Select a trophy to read its guide, source and missable notes.</p>';
      return;
    }
    var hidden = isSpoilerHidden(t);
    var html = '<h3>' + (hidden ? 'Hidden story trophy' : esc(t.name)) + '</h3>' +
      '<p class="dmeta"><b>' + esc(t.grade) + '</b> · ' + esc(KIND_LABEL[t.kind] || t.kind) + ' · ' +
      esc(STAGES[t.stage].title.split(' — ')[0]) + (t.hidden ? ' · Hidden' : '') + '</p>';
    if (hidden) {
      html += '<p class="guide">Spoilers are hidden until you earn this trophy. Turn the spoiler setting off to read its guide.</p>';
    } else {
      html += '<p class="guide">' + esc(t.guide) + '</p>' +
        '<p class="srcLine">Source: <a href="' + esc(t.source.url) + '" target="_blank" rel="noopener">' + esc(t.source.name) + '</a></p>';
    }
    if (t.missable) {
      html += '<div class="missNote"><b>Missable — read this first.</b> The first meditation is at Jason\u2019s house in Chapter 1 and becomes permanently unavailable after that chapter. There is no mission replay, so do it before Chapter 1 ends and keep a manual save at the start of every chapter.</div>';
    }
    detailEl.innerHTML = html;
  }

  function renderRoadmap() {
    var host = document.getElementById('roadmapStages');
    host.innerHTML = Object.keys(STAGES).map(function (key) {
      var stage = STAGES[key];
      var items = state.trophies.filter(function (t) { return t.stage === key; });
      var earned = items.filter(function (t) { return state.earned.has(t.id); }).length;
      var lis = items.map(function (t) {
        var hidden = isSpoilerHidden(t);
        var label = hidden ? 'Hidden story trophy' : esc(t.name);
        return '<li' + (state.earned.has(t.id) ? ' style="text-decoration:line-through;opacity:.7"' : '') + '>' +
          '<span class="g">' + gradeLetter(t.grade) + '</span> ' + label +
          (t.missable ? ' <b style="color:var(--danger)">MISSABLE</b>' : '') + '</li>';
      }).join('');
      return '<div class="stage"><h3>' + esc(stage.title) + ' — ' + earned + '/' + items.length + '</h3>' +
        '<p class="smeta">' + esc(stage.note) + '</p><ul>' + lis + '</ul></div>';
    }).join('');
  }

  function renderAll() { renderTotals(); renderList(); renderDetail(); renderRoadmap(); }

  function toggleEarned(id) {
    if (state.earned.has(id)) state.earned.delete(id); else state.earned.add(id);
    saveEarned();
    renderAll();
  }
  function select(id) { state.selected = id; renderList(); renderDetail(); }

  function setView(view) {
    state.view = view;
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === view); });
    document.getElementById('view-checklist').classList.toggle('active', view === 'checklist');
    document.getElementById('view-roadmap').classList.toggle('active', view === 'roadmap');
    if (view === 'roadmap') renderRoadmap();
  }

  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { setView(b.getAttribute('data-view')); });
  });
  document.getElementById('filters').addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-filter]');
    if (!btn) return;
    state.filter = btn.getAttribute('data-filter');
    document.querySelectorAll('#filters button').forEach(function (b) { b.classList.toggle('active', b === btn); });
    renderList();
  });
  searchEl.addEventListener('input', function () { state.search = searchEl.value; renderList(); });
  spoilerEl.addEventListener('change', function () { state.spoiler = spoilerEl.checked; renderAll(); });
  document.getElementById('exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', exported_at: new Date().toISOString(), earned: Array.from(state.earned).sort(function (a, b) { return a - b; }) }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida55-progress.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  document.getElementById('importFile').addEventListener('change', function (ev) {
    var file = ev.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var ids = new Set((data.earned || []).filter(function (id) { return state.trophies.some(function (t) { return t.id === id; }); }));
        state.earned = ids;
        saveEarned();
        renderAll();
      } catch (e) { alert('Could not read that progress file.'); }
    };
    reader.readAsText(file);
    ev.target.value = '';
  });

  fetch('data/trophies.json')
    .then(function (r) { if (!r.ok) throw new Error('trophies.json failed to load'); return r.json(); })
    .then(function (data) {
      state.trophies = data.trophies;
      loadEarned();
      spoilerEl.checked = state.spoiler;
      document.querySelectorAll('#filters button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-filter') === state.filter); });
      var open = Number(params.get('open'));
      if (open && state.trophies.some(function (t) { return t.id === open; })) state.selected = open;
      setView(state.view);
      renderAll();
    })
    .catch(function (err) {
      listEl.innerHTML = '<p class="empty">Could not load the trophy data. ' + esc(err.message) + '</p>';
    });
})();
