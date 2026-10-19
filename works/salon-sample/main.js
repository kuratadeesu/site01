(function () {
  'use strict';

  /* ===== 営業中かどうか(火曜休み、10:00〜19:00) ===== */
  var status = document.getElementById('status');
  if (status) {
    var now = new Date();
    var t = now.getHours() + now.getMinutes() / 60;
    var open = now.getDay() !== 2 && t >= 10 && t < 19;
    status.textContent = open ? 'ただいま営業中です' : (now.getDay() === 2 ? '本日は定休日です' : 'ただいま営業時間外です');
    status.className = 'status' + (open ? ' open' : '');
  }

  /* ===== メニューを選ぶと、合計金額と時間が出る ===== */
  var form = document.getElementById('sim');
  if (form) {
    var boxes = form.querySelectorAll('input[type="checkbox"]');
    var len = document.getElementById('len');
    var yenEl = document.getElementById('total-yen');
    var timeEl = document.getElementById('total-time');

    function format(n) { return n.toLocaleString('ja-JP') + '円'; }
    function formatTime(min) {
      if (!min) return '―';
      var h = Math.floor(min / 60), m = min % 60;
      return '約' + (h ? h + '時間' : '') + (m ? m + '分' : '');
    }
    function update() {
      var surcharge = Number(len.value);
      var total = 0, minutes = 0;
      boxes.forEach(function (b) {
        if (!b.checked) return;
        total += Number(b.getAttribute('data-price'));
        minutes += Number(b.getAttribute('data-min'));
        // 髪の長さによる加算は、対象のメニューだけ
        if (b.getAttribute('data-len') === '1') total += surcharge;
      });
      yenEl.textContent = format(total);
      timeEl.textContent = formatTime(minutes);
    }
    boxes.forEach(function (b) { b.addEventListener('change', update); });
    len.addEventListener('change', update);
    update();
  }

  /* ===== ネット予約ボタン(サンプルなので移動しない) ===== */
  var btn = document.getElementById('reserve-btn');
  var msg = document.getElementById('reserve-msg');
  if (btn && msg) {
    btn.addEventListener('click', function () {
      msg.textContent = 'これは制作サンプルのため、予約画面には移動しません。';
    });
  }
})();
