(function () {
  'use strict';

  // ===== 診療中かどうかを表示(トップページ) =====
  var status = document.getElementById('status');
  if (status) {
    // 曜日ごとの診療時間(時間を小数で表す。12.5 = 12:30)
    var weekday = [[9, 12.5], [15, 20]];
    var schedule = { 0: [], 1: weekday, 2: weekday, 3: weekday, 4: weekday, 5: weekday, 6: [[9, 13]] };
    var now = new Date();
    var t = now.getHours() + now.getMinutes() / 60;
    var open = (schedule[now.getDay()] || []).some(function (r) { return t >= r[0] && t < r[1]; });
    status.textContent = open ? 'ただいま診療中です' : 'ただいま診療時間外です';
    status.className = 'status' + (open ? ' open' : '');
  }

  // ===== お問い合わせフォーム(サンプルなので送信しない) =====
  var form = document.getElementById('sample-form');
  var msg = document.getElementById('form-msg');
  if (form && msg) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.textContent = 'これは制作サンプルのため、送信されていません。';
    });
  }
})();
