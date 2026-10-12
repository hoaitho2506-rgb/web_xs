/**
 * Logic ứng dụng Xổ Số Gia Đình - Đồng bộ 100% Bộ Chọn Ngày & Bảng Kết Quả
 */

let activeRegion = 'mn';
let lotteryCache = {};
let currentDate = null;

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
  loadRegionData(activeRegion);
  updateTicketInputHint();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});

// Chuyển tab vùng miền (Nam - Trung - Bắc)
function changeRegion(region) {
  activeRegion = region;
  
  // Đồng bộ cả 2 thanh chọn miền (trên đầu trang & trong khung dò vé)
  document.querySelectorAll('.region-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === region);
  });
  document.querySelectorAll('.checker-region-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === region);
  });
  
  // Xóa kết quả dò vé cũ nếu có
  const resBox = document.getElementById('checkResultDisplay');
  if (resBox) resBox.style.display = 'none';

  updateTicketInputHint();
  loadRegionData(region);
}

// Cập nhật gợi ý và giới hạn độ dài số vé theo miền
function updateTicketInputHint() {
  const input = document.getElementById('ticketNumberInput');
  const label = document.getElementById('ticketStepLabel');
  const badge = document.getElementById('ticketDigitsBadge');
  if (!input) return;

  const isMB = activeRegion === 'mb';
  const requiredDigits = isMB ? 5 : 6;
  const regionName = isMB ? 'Miền Bắc' : (activeRegion === 'mt' ? 'Miền Trung' : 'Miền Nam');

  input.maxLength = requiredDigits;
  input.placeholder = isMB ? 'Nhập đủ 5 số (ví dụ: 07363)' : 'Nhập đủ 6 số (ví dụ: 667748)';
  
  if (label) {
    label.textContent = `Nhập đủ ${requiredDigits} số in trên tờ vé (${regionName}):`;
  }

  if (badge) {
    badge.textContent = `Vé ${requiredDigits} số`;
    badge.className = isMB ? 'digits-badge badge-mb' : 'digits-badge badge-mn';
  }

  // Nếu số đang có dài hơn độ dài miền mới thì cắt bớt
  if (input.value.length > requiredDigits) {
    input.value = input.value.slice(0, requiredDigits);
  }
}

// Tải dữ liệu vùng miền từ API
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

    // Mặc định chọn ngày đầu tiên (ngày mới nhất)
    currentDate = data.days[0].date;
    renderDateSelector(data.days);
    renderResults();

  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding: 30px; color: #dc2626;">Lỗi kết nối máy chủ: ${err.message}</div>`;
  }
}

// Điền danh sách ngày vào cả 2 bộ chọn (bảng xem & khung dò vé)
function renderDateSelector(days) {
  const unifiedSelect = document.getElementById('unifiedDateSelect');
  const checkDateSelect = document.getElementById('checkDateSelect');

  const fillSelect = (selectEl) => {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    days.forEach((d, idx) => {
      const opt = document.createElement('option');
      opt.value = d.date;
      let label = `Ngày ${d.date}`;
      if (d.dayOfWeek) label += ` (${d.dayOfWeek})`;
      if (idx === 0) label += ` — Mới nhất`;
      opt.textContent = label;
      if (d.date === currentDate) opt.selected = true;
      selectEl.appendChild(opt);
    });
  };

  fillSelect(unifiedSelect);
  fillSelect(checkDateSelect);

  // Cập nhật danh sách đài cho khung dò vé
  updateCheckerProvinces(days);
}

// Cập nhật danh sách đài tương ứng của ngày đang chọn
function updateCheckerProvinces(days) {
  const provSelect = document.getElementById('checkProvinceSelect');
  if (!provSelect) return;
  provSelect.innerHTML = '';

  const dayData = days.find(d => d.date === currentDate) || days[0];
  if (!dayData) return;

  // Lựa chọn từng đài cụ thể (để chống nhầm đài)
  dayData.provinces.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.province;
    opt.textContent = `Đài ${p.province}`;
    provSelect.appendChild(opt);
  });

  // Tùy chọn kiểm tra tất cả các đài nếu muốn
  if (dayData.provinces.length > 1) {
    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = `⭐ Kiểm tra cả ${dayData.provinces.length} đài (${dayData.provinces.map(p => p.province).join(', ')})`;
    provSelect.appendChild(optAll);
  }
}

// Khi người dùng chọn ngày ở bộ chọn ngày chính
function onUnifiedDateChange() {
  const select = document.getElementById('unifiedDateSelect');
  if (!select) return;
  currentDate = select.value;

  // Đồng bộ sang ô chọn ngày của khung dò vé
  const checkDateSelect = document.getElementById('checkDateSelect');
  if (checkDateSelect) checkDateSelect.value = currentDate;

  const days = lotteryCache[activeRegion]?.days || [];
  updateCheckerProvinces(days);
  
  // Ẩn kết quả dò cũ
  const resBox = document.getElementById('checkResultDisplay');
  if (resBox) resBox.style.display = 'none';

  renderResults();
}

// Khi người dùng chọn ngày ở khung Dò vé
function onCheckerDateChange() {
  const checkDateSelect = document.getElementById('checkDateSelect');
  if (!checkDateSelect) return;
  currentDate = checkDateSelect.value;

  // Đồng bộ sang ô chọn ngày chính
  const unifiedSelect = document.getElementById('unifiedDateSelect');
  if (unifiedSelect) unifiedSelect.value = currentDate;

  const days = lotteryCache[activeRegion]?.days || [];
  updateCheckerProvinces(days);

  // Ẩn kết quả dò cũ
  const resBox = document.getElementById('checkResultDisplay');
  if (resBox) resBox.style.display = 'none';

  renderResults();
}

/**
 * HIỂN THỊ DUY NHẤT 1 BẢNG TỔNG HỢP CHO TẤT CẢ CÁC ĐÀI TRONG NGÀY ĐANG CHỌN
 * - Header: Cột "Giải" + Các cột đài (3 đài thì 3 cột, 4 đài thì 4 cột)
 * - Rows: Mỗi hàng là một Giải từ Giải 8 lên Giải Đặc Biệt
 */
function renderResults() {
  const container = document.getElementById('resultsSection');
  const curData = lotteryCache[activeRegion];
  if (!curData || !curData.days) return;

  const dayData = curData.days.find(d => d.date === currentDate) || curData.days[0];
  if (!dayData) return;

  const provinces = dayData.provinces || [];
  const isMB = activeRegion === 'mb';

  // Thứ tự giải:
  // Miền Nam & Miền Trung: Giải 8 -> Giải 7 -> ... -> Đặc Biệt
  // Miền Bắc: Giải 7 -> Giải 6 -> ... -> Đặc Biệt
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

  // 1. DÒNG HEADER: Cột "Giải" và TẤT CẢ CÁC ĐÀI CỦA NGÀY NẰM TRÊN CÙNG 1 HÀNG
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

  const regionNameText = activeRegion === 'mb' ? 'Miền Bắc' : (activeRegion === 'mt' ? 'Miền Trung' : 'Miền Nam');
  const stationsNamesStr = provinces.map(p => p.province).join(' • ');

  // PHẦN 2: THANH BANNER NGÀY NỔI BẬT TRÊN ĐẦU BẢNG KẾT QUẢ
  const dateBannerHtml = `
    <div class="results-date-banner">
      <div class="banner-date-main">
        KẾT QUẢ XỔ SỐ ${regionNameText.toUpperCase()} — ${dayData.date} ${dayData.dayOfWeek ? `(${dayData.dayOfWeek.toUpperCase()})` : ''}
      </div>
      <div class="banner-date-sub">
        Mở thưởng ${provinces.length} đài: <strong>${stationsNamesStr}</strong>
      </div>
    </div>
  `;

  // Xuất ra BANNER NGÀY NỔI BẬT + DUY NHẤT 1 BẢNG TABLE
  container.innerHTML = `
    ${dateBannerHtml}
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

// LOGIC DÒ VÉ TỰ ĐỘNG - TỰ ĐỘNG ĐỐI CHIẾU MỌI ĐÀI CỦA NGÀY ĐANG CHỌN
async function handleCheckTicket() {
  const numInput = document.getElementById('ticketNumberInput');
  const ticketNumber = numInput ? numInput.value.trim().replace(/\D/g, '') : '';
  const resBox = document.getElementById('checkResultDisplay');
  const isMB = activeRegion === 'mb';
  const requiredDigits = isMB ? 5 : 6;
  const regionName = isMB ? 'Miền Bắc' : (activeRegion === 'mt' ? 'Miền Trung' : 'Miền Nam');

  if (!ticketNumber) {
    alert(`Bác vui lòng nhập dãy số in trên tờ vé số ${regionName}!`);
    numInput.focus();
    return;
  }

  if (ticketNumber.length !== requiredDigits) {
    alert(`Vé số ${regionName} có đúng ${requiredDigits} chữ số.\nBác đang nhập ${ticketNumber.length} số. Bác hãy nhập đủ ${requiredDigits} số in trên tờ vé để đối chiếu chính xác và không bỏ sót Giải Đặc Biệt nhé!`);
    numInput.focus();
    return;
  }

  const dateSelect = document.getElementById('checkDateSelect');
  const provSelect = document.getElementById('checkProvinceSelect');
  const selectedDateForCheck = dateSelect ? dateSelect.value : currentDate;
  const selectedProvForCheck = provSelect ? provSelect.value : 'all';

  const provDisplayName = selectedProvForCheck !== 'all' ? `đài ${selectedProvForCheck}` : 'tất cả các đài';
  resBox.className = 'check-result-display no-win';
  resBox.style.display = 'block';
  resBox.innerHTML = `Đang kiểm tra đối chiếu vé với ${provDisplayName} ngày ${selectedDateForCheck}...`;

  try {
    const res = await fetch('/api/check-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketNumber,
        region: activeRegion,
        date: selectedDateForCheck,
        province: selectedProvForCheck
      })
    });

    const result = await res.json();
    if (result.error) {
      resBox.className = 'check-result-display no-win';
      resBox.textContent = result.error;
      return;
    }

    if (result.isWinner && result.winningStations.length > 0) {
      resBox.className = 'check-result-display winner';
      
      const tier = typeof determineCelebrationTier === 'function' 
        ? determineCelebrationTier(result.winningStations) 
        : 1;

      // Kích hoạt hiệu ứng pháo hoa và âm thanh theo cấp độ giải thưởng
      if (typeof launchCelebrationFX === 'function') launchCelebrationFX(tier);
      if (typeof playCelebrationSound === 'function') playCelebrationSound(tier);

      // Hiển thị khung chúc mừng hoành tráng kèm Meme biểu cảm
      if (typeof buildCelebrationHTML === 'function') {
        resBox.innerHTML = buildCelebrationHTML(result, tier);
      }
    } else {
      resBox.className = 'check-result-display no-win';
      let message = '';
      if (selectedProvForCheck && selectedProvForCheck !== 'all') {
        message = `Số vé <strong>${result.ticketNumber}</strong> không trúng giải nào của đài <strong>${selectedProvForCheck}</strong> ngày <strong>${result.date}</strong>.`;
      } else {
        const stationsListStr = (result.allStations || []).join(', ');
        message = `Số vé <strong>${result.ticketNumber}</strong> không trúng giải ở đài nào trong các đài mở thưởng ngày <strong>${result.date}</strong> (${stationsListStr}).`;
      }
      resBox.innerHTML = `
        <div class="res-title">Vé không trúng giải</div>
        <div>${message}</div>
        <div style="font-size:13px; color:#64748b; margin-top:8px;">Chúc bác luôn vui vẻ và may mắn ở lần mua vé sau ạ! ☘️</div>
      `;
    }

  } catch (err) {
    resBox.className = 'check-result-display no-win';
    resBox.textContent = 'Không thể kiểm tra lúc này: ' + err.message;
  }
}
