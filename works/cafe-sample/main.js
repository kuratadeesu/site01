(function () {
  'use strict';
  // 今日の営業状況を表示する(営業 8:00〜17:00、水曜定休)
  var el = document.getElementById('today');
  if (!el) return;

  var now = new Date();
  var day = now.getDay();               // 0=日 ... 3=水
  var t = now.getHours() + now.getMinutes() / 60;
  var OPEN = 8, CLOSE = 17, HOLIDAY = 3;

  if (day === HOLIDAY) {
    el.textContent = '本日は定休日です';
    el.className = 'today closed';
  } else if (t >= OPEN && t < CLOSE) {
    el.textContent = 'ただいま営業中(17:00まで)';
    el.className = 'today open';
  } else if (t < OPEN) {
    el.textContent = '本日は8:00から営業します';
    el.className = 'today closed';
  } else {
    el.textContent = '本日の営業は終了しました';
    el.className = 'today closed';
  }
})();
