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
  const label = document.getElementById('ticketStepLabel');
  const badge = document.getElementById('ticketDigitsBadge');

  const isMB = activeRegion === 'mb';
  const requiredDigits = isMB ? 5 : 6;
  const regionName = isMB ? 'Miền Bắc' : (activeRegion === 'mt' ? 'Miền Trung' : 'Miền Nam');

  if (label) {
    label.textContent = `Nhập đủ ${requiredDigits} số in trên tờ vé (${regionName}):`;
  }

  if (badge) {
    badge.textContent = `Vé ${requiredDigits} số`;
    badge.className = isMB ? 'digits-badge badge-mb' : 'digits-badge badge-mn';
  }

  // Tự động tạo 5 ô vuông cho Miền Bắc hoặc 6 ô vuông cho Miền Nam/Miền Trung
  renderTicketDigitBoxes(requiredDigits);
}

// Tạo các ô vuông nhập số theo miền (5 ô hoặc 6 ô)
function renderTicketDigitBoxes(count) {
  const container = document.getElementById('ticketDigitsContainer');
  if (!container) return;

  // Thu thập các chữ số đang có trước khi chuyển đổi
  const existingValues = [];
  const oldBoxes = container.querySelectorAll('.ticket-digit-box');
  oldBoxes.forEach(b => {
    if (b.value) existingValues.push(b.value);
  });

  // Nếu số lượng ô hiện tại đã đúng bằng count thì chỉ cần đồng bộ lại
  if (oldBoxes.length === count) {
    syncHiddenTicketInput();
    return;
  }

  container.innerHTML = '';
  container.setAttribute('data-count', count);

  for (let i = 0; i < count; i++) {
    const box = document.createElement('input');
    box.type = 'tel';
    box.inputMode = 'numeric';
    box.pattern = '[0-9]*';
    box.maxLength = 1;
    box.className = 'ticket-digit-box';
    box.setAttribute('data-index', i);
    box.setAttribute('aria-label', `Chữ số thứ ${i + 1}`);
    box.autocomplete = 'off';

    // Giữ lại các số đã gõ trước đó nếu chuyển giữa các miền
    if (existingValues[i] !== undefined) {
      box.value = existingValues[i];
      box.classList.add('has-value');
    }

    // Tự động chuyển ô khi gõ số
    box.addEventListener('input', (e) => {
      handleDigitBoxInput(e, i, count);
    });

    // Xử lý phím Backspace, Mũi tên, Enter
    box.addEventListener('keydown', (e) => {
      handleDigitBoxKeyDown(e, i, count);
    });

    // Hỗ trợ dán (paste) cả dãy số
    box.addEventListener('paste', (e) => {
      handleDigitBoxPaste(e, count);
    });

    // Tự động bôi đen để gõ đè số mới tiện lợi
    box.addEventListener('focus', () => {
      box.select();
    });

    container.appendChild(box);
  }

  syncHiddenTicketInput();
}

// Xử lý khi gõ vào ô vuông: tự động nhảy sang ô tiếp theo
function handleDigitBoxInput(e, index, count) {
  const box = e.target;
  const rawValue = box.value.replace(/\D/g, '');

  if (rawValue.length > 0) {
    box.value = rawValue.slice(-1);
    box.classList.add('has-value');

    // Tự động nhảy sang ô kế tiếp
    if (index < count - 1) {
      const nextBox = document.querySelector(`.ticket-digit-box[data-index="${index + 1}"]`);
      if (nextBox) {
        nextBox.focus();
        nextBox.select();
      }
    }
  } else {
    box.value = '';
    box.classList.remove('has-value');
  }

  syncHiddenTicketInput();
}

// Xử lý phím: Backspace tự lùi ô, Mũi tên trái/phải di chuyển, Enter dò vé
function handleDigitBoxKeyDown(e, index, count) {
  const box = e.target;

  if (e.key === 'Backspace') {
    if (!box.value && index > 0) {
      // Nếu ô đang trống, bấm Backspace sẽ lùi về ô trước và xóa số ô trước
      e.preventDefault();
      const prevBox = document.querySelector(`.ticket-digit-box[data-index="${index - 1}"]`);
      if (prevBox) {
        prevBox.value = '';
        prevBox.classList.remove('has-value');
        prevBox.focus();
        syncHiddenTicketInput();
      }
    } else if (box.value) {
      box.classList.remove('has-value');
    }
  } else if (e.key === 'ArrowLeft' && index > 0) {
    e.preventDefault();
    const prevBox = document.querySelector(`.ticket-digit-box[data-index="${index - 1}"]`);
    if (prevBox) {
      prevBox.focus();
      prevBox.select();
    }
  } else if (e.key === 'ArrowRight' && index < count - 1) {
    e.preventDefault();
    const nextBox = document.querySelector(`.ticket-digit-box[data-index="${index + 1}"]`);
    if (nextBox) {
      nextBox.focus();
      nextBox.select();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    handleCheckTicket();
  }
}

// Hỗ trợ paste (dán) nguyên dãy 5 hoặc 6 số vào các ô vuông
function handleDigitBoxPaste(e, count) {
  e.preventDefault();
  const pasteData = (e.clipboardData || window.clipboardData)?.getData('text') || '';
  const digits = pasteData.replace(/\D/g, '').slice(0, count);

  if (!digits) return;

  const boxes = document.querySelectorAll('.ticket-digit-box');
  for (let i = 0; i < boxes.length; i++) {
    if (i < digits.length) {
      boxes[i].value = digits[i];
      boxes[i].classList.add('has-value');
    } else {
      boxes[i].value = '';
      boxes[i].classList.remove('has-value');
    }
  }

  // Focus vào ô tiếp theo cần nhập hoặc ô cuối
  const targetIndex = Math.min(digits.length, count - 1);
  if (boxes[targetIndex]) {
    boxes[targetIndex].focus();
    boxes[targetIndex].select();
  }

  syncHiddenTicketInput();
}

// Lấy toàn bộ dãy số từ các ô vuông
function getTicketNumber() {
  const boxes = document.querySelectorAll('.ticket-digit-box');
  let result = '';
  boxes.forEach(b => {
    result += b.value.trim();
  });
  return result;
}

// Đồng bộ giá trị vào input ẩn ticketNumberInput
function syncHiddenTicketInput() {
  const hiddenInput = document.getElementById('ticketNumberInput');
  if (hiddenInput) {
    hiddenInput.value = getTicketNumber();
  }
}

// Xóa nhanh toàn bộ các ô để nhập lại từ đầu
function clearTicketDigits() {
  const boxes = document.querySelectorAll('.ticket-digit-box');
  boxes.forEach(b => {
    b.value = '';
    b.classList.remove('has-value');
  });
  syncHiddenTicketInput();
  if (boxes[0]) boxes[0].focus();
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

  // PHẦN 2: THANH BANNER NGÀY NỔI BẬT TRÊN ĐẦU BẢNG KẾT QUẢ KÈM NÚT CHIA SẺ
  const dateBannerHtml = `
    <div class="results-date-banner">
      <div class="banner-content-wrap">
        <div class="banner-date-main">
          KẾT QUẢ XỔ SỐ ${regionNameText.toUpperCase()} — ${dayData.date} ${dayData.dayOfWeek ? `(${dayData.dayOfWeek.toUpperCase()})` : ''}
        </div>
        <div class="banner-date-sub">
          Mở thưởng ${provinces.length} đài: <strong>${stationsNamesStr}</strong>
        </div>
      </div>
      <button type="button" class="btn-share-banner" onclick="openShareModal()" title="Tạo ảnh đẹp chia sẻ nhóm Zalo gia đình">
        <svg class="share-btn-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        <span>Chia sẻ Zalo / Tải ảnh</span>
      </button>
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
  const ticketNumber = getTicketNumber() || (numInput ? numInput.value.trim().replace(/\D/g, '') : '');
  const resBox = document.getElementById('checkResultDisplay');
  const isMB = activeRegion === 'mb';
  const requiredDigits = isMB ? 5 : 6;
  const regionName = isMB ? 'Miền Bắc' : (activeRegion === 'mt' ? 'Miền Trung' : 'Miền Nam');
  const boxes = document.querySelectorAll('.ticket-digit-box');

  if (!ticketNumber) {
    alert(`Bác vui lòng nhập dãy số in trên tờ vé số ${regionName}!`);
    if (boxes[0]) boxes[0].focus();
    return;
  }

  if (ticketNumber.length !== requiredDigits) {
    alert(`Vé số ${regionName} có đúng ${requiredDigits} chữ số.\nBác đang nhập ${ticketNumber.length} số. Bác hãy nhập đủ ${requiredDigits} số in trên tờ vé để đối chiếu chính xác và không bỏ sót Giải Đặc Biệt nhé!`);
    for (const b of boxes) {
      if (!b.value) {
        b.focus();
        break;
      }
    }
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
