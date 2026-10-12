/**
 * Logic ứng dụng Xổ Số Gia Đình - BẢNG MA TRẬN DUY NHẤT CHO TẤT CẢ CÁC ĐÀI
 */

let activeRegion = 'mn';
let lotteryCache = {};
let currentDate = null;

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
  loadRegionData(activeRegion);
  loadCheckerRegionData('mn');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});

// Chuyển tab vùng miền
function changeRegion(region) {
  activeRegion = region;
  document.querySelectorAll('.region-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === region);
  });
  loadRegionData(region);
}

// Tải dữ liệu vùng miền chính
async function loadRegionData(region) {
  const container = document.getElementById('resultsSection');
  container.innerHTML = `<div style="text-align:center; padding: 40px 0; color: #64748b;">Đang tải dữ liệu kết quả...</div>`;

  try {
    const res = await fetch(`/api/lottery?region=${region}&_t=${Date.now()}`);
    const data = await res.json();

    if (data.error) {
      container.innerHTML = `<div style="text-align:center; padding: 30px; color: #dc2626;">${data.error}</div>`;
      return;
    }

    lotteryCache[region] = data;

    if (!data.days || data.days.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 30px; color: #64748b;">Chưa có dữ liệu kết quả.</div>`;
      return;
    }

    currentDate = data.days[0].date;
    renderFilterDateOptions(data.days);
    renderResults();

  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding: 30px; color: #dc2626;">Lỗi kết nối máy chủ: ${err.message}</div>`;
  }
}

// Điền các ngày vào bộ chọn ngày
function renderFilterDateOptions(days) {
  const select = document.getElementById('filterDateSelect');
  if (!select) return;
  select.innerHTML = '';
  days.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.date;
    opt.textContent = `Xem kết quả ngày ${d.date} (${d.dayOfWeek || ''})`;
    if (d.date === currentDate) opt.selected = true;
    select.appendChild(opt);
  });
}

function onFilterDateChange() {
  currentDate = document.getElementById('filterDateSelect').value;
  renderResults();
}

/**
 * HIỂN THỊ DUY NHẤT 1 BẢNG TỔNG HỢP CHO TẤT CẢ CÁC ĐÀI
 * - Hàng 1 (Header): Cột "Giải" + Cột của từng đài (3 đài = 3 cột, 4 đài = 4 cột trên cùng 1 hàng)
 * - Các hàng tiếp theo: Mỗi giải là 1 hàng ngang, đối chiếu trực tiếp giữa các đài
 */
function renderResults() {
  const container = document.getElementById('resultsSection');
  const curData = lotteryCache[activeRegion];
  if (!curData || !curData.days) return;

  const dayData = curData.days.find(d => d.date === currentDate) || curData.days[0];
  if (!dayData) return;

  const provinces = dayData.provinces || [];
  const isMB = activeRegion === 'mb';

  // Thứ tự giải chuẩn:
  // Miền Nam & Miền Trung: Từ Giải Tám (2 số) lên đến Giải Đặc Biệt (6 số)
  // Miền Bắc: Từ Giải Bảy (2 số) lên đến Giải Đặc Biệt (5 số)
  const prizeOrder = isMB
    ? [
        { key: '7', name: 'Giải Bảy', css: 'matrix-row-eighth' },
        { key: '6', name: 'Giải Sáu', css: '' },
        { key: '5', name: 'Giải Năm', css: '' },
        { key: '4', name: 'Giải Tư', css: '' },
        { key: '3', name: 'Giải Ba', css: '' },
        { key: '2', name: 'Giải Nhì', css: '' },
        { key: '1', name: 'Giải Nhất', css: 'matrix-row-first' },
        { key: 'ĐB', name: 'Đặc Biệt', css: 'matrix-row-special' }
      ]
    : [
        { key: '8', name: 'Giải Tám', css: 'matrix-row-eighth' },
        { key: '7', name: 'Giải Bảy', css: '' },
        { key: '6', name: 'Giải Sáu', css: '' },
        { key: '5', name: 'Giải Năm', css: '' },
        { key: '4', name: 'Giải Tư', css: '' },
        { key: '3', name: 'Giải Ba', css: '' },
        { key: '2', name: 'Giải Nhì', css: '' },
        { key: '1', name: 'Giải Nhất', css: 'matrix-row-first' },
        { key: 'ĐB', name: 'Đặc Biệt', css: 'matrix-row-special' }
      ];

  // 1. DÒNG HEADER: Cột "Giải" và TẤT CẢ CÁC ĐÀI NẰM TRÊN CÙNG 1 HÀNG
  let headerColsHtml = `<th class="col-prize-sticky col-prize-corner">Giải</th>`;
  provinces.forEach(prov => {
    headerColsHtml += `<th class="col-station-header">${prov.province}</th>`;
  });

  // 2. CÁC HÀNG GIẢI: Mỗi giải là 1 hàng ngang duy nhất
  let rowsHtml = '';
  prizeOrder.forEach(item => {
    let cellsHtml = `<td class="col-prize-sticky">${item.name}</td>`;
    
    // Điền số của từng đài vào cột tương ứng
    provinces.forEach(prov => {
      const numbers = prov.prizes[item.key] || [];
      const numLines = numbers.map(n => `<span class="matrix-num">${n}</span>`).join('');
      cellsHtml += `
        <td class="col-station-data">
          <div class="cell-numbers-wrap">
            ${numLines || '<span style="color:#cbd5e1;">—</span>'}
          </div>
        </td>
      `;
    });

    rowsHtml += `<tr class="${item.css}">${cellsHtml}</tr>`;
  });

  const scrollHint = provinces.length > 2 
    ? `<div class="mobile-scroll-hint">← Vuốt màn hình sang ngang để xem đủ ${provinces.length} đài →</div>` 
    : '';

  // Xuất ra DUY NHẤT 1 THẺ TABLE
  container.innerHTML = `
    ${scrollHint}
    <div class="table-scroll-container">
      <table class="lottery-matrix-table">
        <thead>
          <tr class="header-stations-row">
            ${headerColsHtml}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// LOGIC KHUNG DÒ VÉ TỰ ĐỘNG
async function loadCheckerRegionData(region) {
  let data = lotteryCache[region];
  if (!data) {
    try {
      const res = await fetch(`/api/lottery?region=${region}`);
      data = await res.json();
      lotteryCache[region] = data;
    } catch (e) {
      return;
    }
  }

  const dateSelect = document.getElementById('checkDateSelect');
  dateSelect.innerHTML = '';
  if (data?.days) {
    data.days.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.date;
      opt.textContent = `${d.date} (${d.dayOfWeek || ''})`;
      dateSelect.appendChild(opt);
    });
  }

  onCheckerDateChange();
}

function onCheckerRegionChange() {
  const reg = document.getElementById('checkRegionSelect').value;
  loadCheckerRegionData(reg);
}

function onCheckerDateChange() {
  const reg = document.getElementById('checkRegionSelect').value;
  const selDate = document.getElementById('checkDateSelect').value;
  const provSelect = document.getElementById('checkProvinceSelect');
  provSelect.innerHTML = '';

  const data = lotteryCache[reg];
  if (!data?.days) return;

  const dayData = data.days.find(d => d.date === selDate) || data.days[0];
  if (!dayData) return;

  dayData.provinces.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.province;
    opt.textContent = `Đài ${p.province}`;
    provSelect.appendChild(opt);
  });
}

async function handleCheckTicket() {
  const numInput = document.getElementById('ticketNumberInput');
  const ticketNumber = numInput.value.trim().replace(/\D/g, '');
  const region = document.getElementById('checkRegionSelect').value;
  const date = document.getElementById('checkDateSelect').value;
  const province = document.getElementById('checkProvinceSelect').value;
  const resBox = document.getElementById('checkResultDisplay');

  if (!ticketNumber) {
    alert('Vui lòng nhập dãy số trên tờ vé số.');
    numInput.focus();
    return;
  }

  resBox.className = 'check-result-display no-win';
  resBox.style.display = 'block';
  resBox.innerHTML = 'Đang kiểm tra đối chiếu kết quả...';

  try {
    const res = await fetch('/api/check-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketNumber, region, date, province })
    });

    const result = await res.json();
    if (result.error) {
      resBox.className = 'check-result-display no-win';
      resBox.textContent = result.error;
      return;
    }

    if (result.isWinner && result.prizesWon.length > 0) {
      resBox.className = 'check-result-display winner';
      let detailsHtml = '';
      result.prizesWon.forEach(p => {
        detailsHtml += `
          <div class="res-detail">
            • <strong>${p.name}</strong> (Số trúng: ${p.matchedNumber}) — Tiền thưởng: <strong>${p.reward}</strong>
          </div>
        `;
      });

      resBox.innerHTML = `
        <div class="res-title">Chúc mừng! Vé số của bạn đã trúng giải</div>
        <div>Số vé: <strong>${result.ticketNumber}</strong> | Đài: <strong>${result.province}</strong> (${result.date})</div>
        ${detailsHtml}
      `;
    } else {
      resBox.className = 'check-result-display no-win';
      resBox.innerHTML = `
        <div class="res-title">Vé không trúng giải</div>
        <div>Số vé <strong>${result.ticketNumber}</strong> không trùng khớp với các giải của đài <strong>${result.province}</strong> ngày ${result.date}.</div>
      `;
    }

  } catch (err) {
    resBox.className = 'check-result-display no-win';
    resBox.textContent = 'Không thể kiểm tra lúc này: ' + err.message;
  }
}
