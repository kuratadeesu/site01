(function () {
  'use strict';

  /* ===== ビフォーアフターの境目 ===== */
  function initSlider(root) {
    var range = root.querySelector('input[type="range"]');
    if (!range) return;
    function update() { root.style.setProperty('--pos', range.value + '%'); }
    range.addEventListener('input', update);
    update();
  }
  document.querySelectorAll('.ba').forEach(initSlider);

  /* ===== 種類での絞り込み ===== */
  var filters = document.querySelectorAll('.filter');
  var cards = document.querySelectorAll('#grid > li');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      cards.forEach(function (li) {
        li.hidden = !(key === 'all' || li.getAttribute('data-cat') === key);
      });
    });
  });

  /* ===== 施工事例の詳細(ダイアログ) ===== */
  var dlg = document.getElementById('work-dialog');
  if (dlg && typeof dlg.showModal === 'function') {
    var ba = document.getElementById('dlg-ba');
    var range = ba.querySelector('input[type="range"]');

    document.querySelectorAll('.work').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var title = btn.getAttribute('data-title');
        document.getElementById('dlg-title').textContent = title;
        document.getElementById('dlg-before').src = btn.getAttribute('data-before');
        document.getElementById('dlg-after').src = btn.getAttribute('data-after');
        document.getElementById('dlg-before').alt = title + '(施工前)';
        document.getElementById('dlg-after').alt = title + '(施工後)';
        document.getElementById('dlg-desc').textContent = btn.getAttribute('data-desc');
        document.getElementById('dlg-term').textContent = btn.getAttribute('data-term');
        document.getElementById('dlg-cost').textContent = btn.getAttribute('data-cost');
        range.value = 50;
        ba.style.setProperty('--pos', '50%');
        dlg.showModal();
      });
    });

    document.getElementById('dlg-close').addEventListener('click', function () { dlg.close(); });
    // 外側(暗い部分)をクリックしたら閉じる
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ===== お問い合わせフォーム(サンプルなので送信しない) ===== */
  var form = document.getElementById('sample-form');
  var msg = document.getElementById('form-msg');
  if (form && msg) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.textContent = 'これは制作サンプルのため、送信されていません。';
    });
  }
})();
