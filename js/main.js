(function () {
  'use strict';

  // フッターの年
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ===== 自己チェック =====
  var checkForm = document.getElementById('check-form');
  var resultBox = document.getElementById('check-result');
  var lastSummary = '';

  function judge(score, total) {
    if (score <= 2) return '改善の余地が大きいです。伸びしろがあります。';
    if (score < total) return '基本はできています。あと少しで見違えます。';
    return '基本が整っています。さらに磨く余地を一緒に探せます。';
  }

  function escapeText(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  if (checkForm && resultBox) {
    checkForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var boxes = checkForm.querySelectorAll('input[name="q"]');
      var total = boxes.length;
      var score = 0;
      var todo = [];

      boxes.forEach(function (box) {
        if (box.checked) {
          score += 1;
        } else {
          todo.push({
            label: box.parentNode.querySelector('span').textContent,
            advice: box.getAttribute('data-advice')
          });
        }
      });

      var html = '<p class="score">' + score + '<small> / ' + total + '</small></p>' +
                 '<p class="result-msg">' + judge(score, total) + '</p>';

      if (todo.length) {
        html += '<ul class="advice">';
        todo.forEach(function (t) {
          html += '<li>' + escapeText(t.advice) + '</li>';
        });
        html += '</ul>';
      }
      html += '<a class="btn" href="#contact" id="to-contact">この結果をもとに相談する</a>';

      resultBox.innerHTML = html;
      resultBox.hidden = false;

      lastSummary = '【自己チェックの結果】' + score + '/' + total + '\n' +
        (todo.length ? '気になる点:\n' + todo.map(function (t) { return '・' + t.label; }).join('\n') : '');

      var toContact = document.getElementById('to-contact');
      toContact.addEventListener('click', function () {
        var msg = document.getElementById('message');
        if (msg && !msg.value) msg.value = lastSummary + '\n\n';
      });
    });
  }

  // ===== お問い合わせフォーム(Formspree) =====
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (form && status && window.fetch) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '送信しています…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          status.textContent = '送信しました。内容を確認して、メールでご連絡します。';
        } else {
          throw new Error('send failed');
        }
      }).catch(function () {
        status.className = 'form-status error';
        status.textContent = '送信できませんでした。時間をおいてもう一度お試しください。';
      });
    });
  }
})();
