/**
 * Bộ Máy So Vé Tương Tác - Interactive Ticket Scanner
 */

let scannerTicketInput = '';
let scannerRegion = 'mn';

function openScannerModal(region = null) {
  if (region) scannerRegion = region;
  else scannerRegion = window.currentRegion || 'mn';

  const modal = document.getElementById('scannerModal');
  modal.classList.add('active');

  const regSelect = document.getElementById('scannerRegionSelect');
  if (regSelect) regSelect.value = scannerRegion;

  populateScannerDatesAndProvinces();
  renderMockTicketDigits();
}

function closeScannerModal() {
  const modal = document.getElementById('scannerModal');
  modal.classList.remove('active');
  const resBox = document.getElementById('verificationResultBox');
  if (resBox) {
    resBox.className = 'verification-result';
    resBox.innerHTML = '';
  }
}

// Điền ngày và danh sách đài vào scanner
function populateScannerDatesAndProvinces() {
  const curData = window.lotteryDataCache?.[scannerRegion];
  const dateSelect = document.getElementById('scannerDateSelect');
  const provSelect = document.getElementById('scannerProvSelect');

  if (!curData || !curData.days || curData.days.length === 0) return;

  if (dateSelect) {
    dateSelect.innerHTML = '';
    curData.days.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.date;
      opt.textContent = `${d.date} (${d.dayOfWeek || ''})`;
      dateSelect.appendChild(opt);
    });
  }

  updateScannerProvinces();
}

function updateScannerProvinces() {
  const curData = window.lotteryDataCache?.[scannerRegion];
  const dateSelect = document.getElementById('scannerDateSelect');
  const provSelect = document.getElementById('scannerProvSelect');
  if (!curData || !provSelect) return;

  provSelect.innerHTML = '';
  const selDate = dateSelect?.value || curData.days[0].date;
  const dayData = curData.days.find(d => d.date === selDate) || curData.days[0];

  dayData.provinces.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.province;
    opt.textContent = `Đài: ${p.province}`;
    provSelect.appendChild(opt);
  });
}

// Hiển thị các ô số trên tờ vé số mô phỏng
function renderMockTicketDigits() {
  const container = document.getElementById('mockTicketDigits');
  if (!container) return;

  const maxLen = scannerRegion === 'mb' ? 5 : 6;
  let html = '';

  for (let i = 0; i < maxLen; i++) {
    const char = scannerTicketInput[i];
    if (char !== undefined) {
      html += `<div class="mock-digit-cell filled">${char}</div>`;
    } else {
      html += `<div class="mock-digit-cell empty">•</div>`;
    }
  }

  container.innerHTML = html;
}

// Xúc giác & bấm số
function onKeypadDigit(digit) {
  if (navigator.vibrate) navigator.vibrate(15);
  const maxLen = scannerRegion === 'mb' ? 5 : 6;
  if (scannerTicketInput.length < maxLen) {
    scannerTicketInput += String(digit);
    renderMockTicketDigits();
  }
}

function onKeypadBackspace() {
  if (navigator.vibrate) navigator.vibrate(20);
  if (scannerTicketInput.length > 0) {
    scannerTicketInput = scannerTicketInput.slice(0, -1);
    renderMockTicketDigits();
  }
}

function onKeypadClear() {
  if (navigator.vibrate) navigator.vibrate(30);
  scannerTicketInput = '';
  renderMockTicketDigits();
  const resBox = document.getElementById('verificationResultBox');
  if (resBox) {
    resBox.className = 'verification-result';
    resBox.innerHTML = '';
  }
}

// Bắt đầu đối chiếu kết quả
async function runTicketVerification() {
  const maxLen = scannerRegion === 'mb' ? 5 : 6;
  if (scannerTicketInput.length < 2) {
    alert(`Bác hãy bấm đủ ${maxLen} chữ số trên tờ vé số nhé!`);
    return;
  }

  const date = document.getElementById('scannerDateSelect')?.value || '';
  const prov = document.getElementById('scannerProvSelect')?.value || '';
  const resBox = document.getElementById('verificationResultBox');
  if (!resBox) return;

  resBox.className = 'verification-result';
  resBox.style.display = 'block';
  resBox.innerHTML = `
    <div style="padding: 10px; color:#a7f3d0; font-weight:700;">
      <div style="width:30px; height:30px; border:3px solid #10b981; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin: 0 auto 10px auto;"></div>
      Đang đối chiếu số vé với lồng cầu quay thưởng...
    </div>
  `;

  try {
    const res = await fetch('/api/check-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketNumber: scannerTicketInput,
        region: scannerRegion,
        date: date,
        province: prov
      })
    });

    const data = await res.json();
    if (data.error) {
      resBox.className = 'verification-result miss';
      resBox.innerHTML = `<p style="color:#f87171; font-weight:700;">${data.error}</p>`;
      return;
    }

    if (data.isWinner && data.prizesWon.length > 0) {
      // TRÚNG GIẢI
      playWinningHarmonics();
      resBox.className = 'verification-result win';

      let prizesListHtml = '';
      data.prizesWon.forEach(p => {
        prizesListHtml += `
          <div style="margin: 10px 0; padding: 10px; background: #fffbeb; border-radius: 12px; border: 1px solid #fde68a;">
            <div style="font-size:18px; font-weight:900; color:#b45309;">🌟 ${p.name} (Số trúng: <strong>${p.matchedNumber}</strong>)</div>
            <div style="font-size:22px; font-weight:900; color:#b91c1c; margin-top:4px;">💰 Tiền thưởng: ${p.reward}</div>
          </div>
        `;
      });

      resBox.innerHTML = `
        <div style="font-size:24px; font-weight:900; color:#dc2626; margin-bottom:6px;">🎉 CHÚC MỪNG BÁC ĐÃ TRÚNG THƯỞNG! 🎉</div>
        <p style="font-weight:700; color:#475569;">Đài: <strong>${data.province}</strong> • Ngày: <strong>${data.date}</strong></p>
        <p style="font-size:18px; margin: 8px 0;">Vé của bác: <strong style="font-size:28px; color:#065f46; letter-spacing:3px;">${data.ticketNumber}</strong></p>
        ${prizesListHtml}
        <p style="margin-top:10px; font-size:14px; font-weight:600; color:#78350f;">Bác nhớ giữ vé cẩn thận để đổi thưởng tại đại lý nhé!</p>
      `;

    } else {
      // CHƯA TRÚNG
      resBox.className = 'verification-result miss';
      resBox.innerHTML = `
        <div style="font-size:20px; font-weight:800; color:#e2e8f0; margin-bottom:4px;">Rất tiếc chưa trúng giải lần này ☘️</div>
        <p style="font-weight:600; color:#94a3b8;">Số vé: <strong style="color:#ffffff; font-size:22px;">${data.ticketNumber}</strong></p>
        <p style="font-size:14px; color:#64748b; margin-top:4px;">Đài: ${data.province} • Ngày: ${data.date}</p>
        <p style="margin-top:10px; font-weight:700; color:#34d399; font-size:16px;">Chúc bác luôn mạnh khỏe, may mắn và vui vẻ mỗi ngày!</p>
      `;
    }

  } catch (err) {
    resBox.className = 'verification-result miss';
    resBox.innerHTML = `<p style="color:#f87171;">Lỗi kết nối: ${err.message}</p>`;
  }
}

// Âm thanh chúc mừng hân hoan
function playWinningHarmonics() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
    });
  } catch (e) {}
}

// Hỗ trợ gõ phím vật lý
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('scannerModal');
  if (!modal || !modal.classList.contains('active')) return;

  if (e.key >= '0' && e.key <= '9') {
    onKeypadDigit(e.key);
  } else if (e.key === 'Backspace') {
    onKeypadBackspace();
  } else if (e.key === 'Enter') {
    runTicketVerification();
  } else if (e.key === 'Escape') {
    closeScannerModal();
  }
});
