(function () {
  'use strict';

  var KEY = 'tonari-demo-reservations-v1';
  var MENUS = ['カット', 'カラー', 'パーマ', 'ヘッドスパ'];
  var DAYS = ['日', '月', '火', '水', '木', '金', '土'];
  var SLOTS = [];
  for (var h = 10; h < 18; h++) { SLOTS.push(pad(h) + ':00'); SLOTS.push(pad(h) + ':30'); }

  var items = [];
  var currentDate = todayStr();

  /* ---------- 小さな道具 ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayStr() { return fmt(new Date()); }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return fmt(d); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function $(id) { return document.getElementById(id); }

  // 画面の部品を作る(文字は textContent で入れるので、入力内容がHTMLとして解釈されない)
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function labelDate(s) {
    var p = s.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日(' + DAYS[d.getDay()] + ')';
  }

  /* ---------- 保存(ブラウザ内) ---------- */
  function seed() {
    return [
      { id: uid(), date: addDays(0), time: '10:30', name: '山本 様', phone: '090-0000-0001', menu: 'カット', memo: '' },
      { id: uid(), date: addDays(0), time: '13:00', name: '佐々木 様', phone: '090-0000-0002', menu: 'カラー', memo: '前回と同じ色' },
      { id: uid(), date: addDays(0), time: '15:30', name: '中島 様', phone: '', menu: 'ヘッドスパ', memo: '' },
      { id: uid(), date: addDays(1), time: '11:00', name: '山本 様', phone: '090-0000-0001', menu: 'パーマ', memo: '' },
      { id: uid(), date: addDays(1), time: '14:00', name: '井上 様', phone: '090-0000-0003', menu: 'カット', memo: '初めてのご来店' },
      { id: uid(), date: addDays(-7), time: '10:00', name: '佐々木 様', phone: '090-0000-0002', menu: 'カラー', memo: '' }
    ];
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var a = JSON.parse(raw); if (Array.isArray(a)) return a; }
    } catch (e) { /* 保存できない環境でも、画面上では動かす */ }
    return null;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* 何もしない */ }
  }

  /* ---------- 予約台帳 ---------- */
  function renderBoard() {
    $('board-title').textContent = labelDate(currentDate) + 'の予約';
    $('board-date').value = currentDate;

    var list = $('board');
    list.textContent = '';
    SLOTS.forEach(function (time) {
      var found = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].date === currentDate && items[i].time === time) { found = items[i]; break; }
      }
      var li = el('li', 'slot ' + (found ? 'busy' : 'free'));
      li.appendChild(el('span', 'time', time));

      var mid = el('span', found ? 'who' : '', found ? found.name : '空き');
      if (found) {
        var sub = found.menu + (found.phone ? ' / ' + found.phone : '') + (found.memo ? ' / ' + found.memo : '');
        mid.appendChild(el('span', 'sub', sub));
      }
      li.appendChild(mid);

      var btn;
      if (found) {
        btn = el('button', 'cancel', '取り消し');
        btn.type = 'button';
        btn.setAttribute('aria-label', time + ' ' + found.name + 'の予約を取り消す');
        btn.addEventListener('click', (function (id, name) {
          return function () {
            if (window.confirm(name + 'の予約を取り消しますか?')) {
              items = items.filter(function (x) { return x.id !== id; });
              save(); renderAll();
            }
          };
        })(found.id, found.name));
      } else {
        btn = el('button', 'book', '予約する');
        btn.type = 'button';
        btn.setAttribute('aria-label', time + 'に予約を入れる');
        btn.addEventListener('click', (function (t) {
          return function () {
            $('f-date').value = currentDate;
            $('f-time').value = t;
            $('f-name').focus();
          };
        })(time));
      }
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  /* ---------- 顧客一覧(予約から自動で集計) ---------- */
  function renderCustomers() {
    var map = {};
    items.forEach(function (it) {
      var c = map[it.name] || (map[it.name] = { name: it.name, phone: '', count: 0, last: '' });
      c.count += 1;
      if (it.phone) c.phone = it.phone;
      if (it.date > c.last) c.last = it.date;
    });
    var rows = Object.keys(map).map(function (k) { return map[k]; });
    rows.sort(function (a, b) { return a.last < b.last ? 1 : -1; });

    var tbody = $('customers');
    tbody.textContent = '';
    if (!rows.length) {
      var tr0 = el('tr'); var td0 = el('td', '', 'まだ予約がありません。'); td0.colSpan = 4;
      tr0.appendChild(td0); tbody.appendChild(tr0); return;
    }
    rows.forEach(function (c) {
      var tr = el('tr');
      tr.appendChild(el('td', '', c.name));
      tr.appendChild(el('td', '', c.phone || '―'));
      tr.appendChild(el('td', 'num', c.count + '回'));
      tr.appendChild(el('td', 'num', labelDate(c.last)));
      tbody.appendChild(tr);
    });
  }

  function renderAll() { renderBoard(); renderCustomers(); }

  /* ---------- 予約の追加 ---------- */
  function showMsg(text, isError) {
    var m = $('msg');
    m.textContent = text;
    m.className = 'msg' + (isError ? ' error' : '');
  }

  $('add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var date = $('f-date').value;
    var time = $('f-time').value;
    var name = $('f-name').value.trim();

    if (!date || !time || !name) { showMsg('日付、時間、お名前を入力してください。', true); return; }

    var dup = items.some(function (x) { return x.date === date && x.time === time; });
    if (dup) { showMsg('その時間はすでに予約が入っています。別の時間を選んでください。', true); return; }

    items.push({
      id: uid(), date: date, time: time, name: name,
      phone: $('f-phone').value.trim(), menu: $('f-menu').value, memo: $('f-memo').value.trim()
    });
    save();
    currentDate = date;
    renderAll();
    showMsg(labelDate(date) + ' ' + time + ' に予約を追加しました。', false);
    $('f-name').value = ''; $('f-phone').value = ''; $('f-memo').value = '';
  });

  $('board-date').addEventListener('change', function () {
    if (this.value) { currentDate = this.value; renderBoard(); }
  });

  /* ---------- タブ ---------- */
  function showTab(which) {
    var board = which === 'board';
    $('view-board').hidden = !board;
    $('view-customers').hidden = board;
    $('tab-board').setAttribute('aria-pressed', String(board));
    $('tab-customers').setAttribute('aria-pressed', String(!board));
  }
  $('tab-board').addEventListener('click', function () { showTab('board'); });
  $('tab-customers').addEventListener('click', function () { showTab('customers'); });

  /* ---------- CSV と初期化 ---------- */
  function csvCell(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
  $('btn-csv').addEventListener('click', function () {
    var sorted = items.slice().sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
    var lines = [['日付', '時間', 'お名前', '電話番号', 'メニュー', 'メモ'].map(csvCell).join(',')];
    sorted.forEach(function (x) {
      lines.push([x.date, x.time, x.name, x.phone, x.menu, x.memo].map(csvCell).join(','));
    });
    // 先頭にBOMをつけると、Excelで文字化けせずに開ける
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'yoyaku-demo.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  $('btn-reset').addEventListener('click', function () {
    if (window.confirm('入力したデータを消して、初期データに戻しますか?')) {
      items = seed(); currentDate = todayStr(); save(); renderAll();
      $('f-date').value = currentDate;
      showMsg('初期データに戻しました。', false);
    }
  });

  /* ---------- 起動 ---------- */
  var timeSel = $('f-time');
  SLOTS.forEach(function (t) { var o = el('option', '', t); o.value = t; timeSel.appendChild(o); });
  var menuSel = $('f-menu');
  MENUS.forEach(function (m) { var o = el('option', '', m); o.value = m; menuSel.appendChild(o); });

  items = load() || seed();
  save();
  $('f-date').value = currentDate;
  renderAll();
})();
