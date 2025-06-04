/**
 * Lucky Wheel JavaScript
 * Xử lý logic cho vòng quay may mắn
 */

document.addEventListener('DOMContentLoaded', function () {
  initLuckyWheel();
});

var theWheel;
var canSpin = true;
var currentWheelType = 'gold'; // Mặc định là vòng quay GOLD
// Biến cho chức năng kéo-thả
var isDragging = false;
var startAngle = 0;
var startX = 0;
var startY = 0;
var currentAngle = 0;
var wheelCenterX = 0;
var wheelCenterY = 0;
var lastAngle = 0;
var releaseSpeed = 0;
var lastFrameTime = 0;
var minReleaseSpeed = 200; // Tốc độ tối thiểu để kích hoạt quay

// Biến theo dõi số lần quay cho mỗi loại vòng quay
var spinCount = {
  gold: 0,
  vip: 0,
};
var maxSpins = 3; // Số lần quay tối đa cho mỗi loại

// Định nghĩa phần thưởng cho cả hai loại vòng quay

// 25% - Gói VIP tiếp theo giảm 55% chỉ còn 2.000.000Đ (gốc 4.500.000Đ)
// 20% - 2 gói VIP tổng 5,000,000Đ tặng 1 gói VIP giá chỉ 1.000.000Đ (giá gốc 4,500,000Đ)
// 25% - Gói VIP tiếp theo chỉ còn 1,600,000Đ (giá gốc 4,500,000Đ)
// 15% - FIle thần số học giá chỉ còn 300,000Đ (giá gốc 2,500,000Đ)
// 15% - Gói Gold Iconic chỉ còn 399,000Đ (giá gốc 2,500,000Đ
// 0% - Buổi Coaching 1:1 30 phút với chuyên gia (giá trị 1.000.000Đ)
// 0% - File tính cách Iconic giá 0Đ (giá trị 500,000Đ)
// 0% - Gói VIP Iconic giá 0Đ (giá trị 4,500,000Đ). Áp dụng dụng cho tất cả đơn hàng
// 0% - Gói Gold Iconic giá 0Đ (giá trị 2,500,000Đ)
const vipPrizes = [
  {
    text: 'Gói VIP tiếp theo giảm 55%\nchỉ còn 2.000.000Đ (gốc 4.500.000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description:
      'Gói VIP tiếp theo giảm 55% chỉ còn 2.000.000Đ (gốc 4.500.000Đ)',
    chance: 25, // Tỷ lệ phần trăm
  },
  {
    text: '2 gói VIP tổng 5,000,000Đ tặng 1 gói\nVIP giá chỉ 1.000.000Đ (giá gốc 4,500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#fc0',
    textFillStyle: '#fff',
    description:
      '2 gói VIP tổng 5,000,000Đ tặng 1 gói VIP giá chỉ 1.000.000Đ (giá gốc 4,500,000Đ)',
    chance: 20,
  },
  {
    text: 'Gói VIP tiếp theo\nchỉ còn 1,600,000Đ (giá gốc 4,500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description: 'Gói VIP tiếp theo chỉ còn 1,600,000Đ (giá gốc 4,500,000Đ)',
    chance: 25,
  },
  {
    text: 'FIle thần số học giá chỉ còn\n300,000Đ (giá gốc 2,500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#fc0',
    textFillStyle: '#fff',
    description: 'FIle thần số học giá chỉ còn 300,000Đ (giá gốc 2,500,000Đ)',
    chance: 15,
  },
  {
    text: 'Gói Gold Iconic chỉ còn\n399,000Đ (giá gốc 2,500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description: 'Gói Gold Iconic chỉ còn 399,000Đ (giá gốc 2,500,000Đ)',
    chance: 15,
  },
  {
    text: 'Buổi Coaching với\nchuyên gia (giá trị 1.000.000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#fc0',
    textFillStyle: '#fff',
    description:
      'Buổi Coaching 1:1 30 phút với chuyên gia (giá trị 1.000.000Đ)',
    chance: 0, // Không có xác suất, chỉ để hiển thị
  },
  {
    text: 'File tính cách Iconic\ngiá 0Đ (giá trị 500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description: 'File tính cách Iconic giá 0Đ (giá trị 500,000Đ)',
    chance: 0, // Không có xác suất, chỉ để hiển thị
  },
  {
    text: 'Gói VIP Iconic\ngiá 0Đ (giá trị 4,500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#fc0',
    textFillStyle: '#fff',
    description:
      'Gói VIP Iconic giá 0Đ (giá trị 4,500,000Đ). Áp dụng dụng cho tất cả đơn hàng',
    chance: 0, // Không có xác suất, chỉ để hiển thị
  },
  {
    text: 'Gói Gold Iconic\ngiá 0Đ (giá trị 2,500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description: 'Gói Gold Iconic giá 0Đ (giá trị 2,500,000Đ)',
    chance: 0, // Không có xác suất, chỉ để hiển thị
  },
];

// 30% - Voucher giảm 2,200,000Đ khi mua gói VIP 4,500,000Đ
// 20% - Voucher giảm 2,000,000Đ khi mua gói VIP 4,500,000Đ
// 10% - Tặng gói Gold 2,500,000Đ khi mua gói VIP giá gốc 4,500,000Đ giảm còn 2,800,000Đ
// 20% - Voucher 500.000Đ áp dụng khi nâng cấp lên gói VIP
// 20% - FIle thần số học chỉ còn 300,000Đ (giá gốc 2,500,000Đ)
// 0% -  Buổi Coaching 1:1 với chuyên gia (giá trị 1.000.000Đ)
// 0% - File tính cách Iconic giá 0Đ (giá trị 500,000Đ)
// 0% - Gói Gold Iconic giá 0Đ (giá trị 2,500,000Đ). Áp dụng cho đơn hàng tiếp theo
const goldPrizes = [
  {
    text: 'Voucher giảm 2,200,000Đ\nkhi mua gói VIP 4,500,000Đ',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#fc0',
    textFillStyle: '#fff',
    description: 'Voucher giảm 2,200,000Đ khi mua gói VIP 4,500,000Đ',
    chance: 30,
  },
  {
    text: 'Voucher giảm 2,000,000Đ\nkhi mua gói VIP 4,500,000Đ',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description: 'Voucher giảm 2,000,000Đ khi mua gói VIP 4,500,000Đ',
    chance: 20,
  },
  {
    text: 'Tặng gói Gold 2,500,000Đ khi mua gói\nVIP giá gốc 4,500,000Đ giảm còn 2,800,000Đ',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#fc0',
    textFillStyle: '#fff',
    description:
      'Tặng gói Gold Iconic giá trị 2.500.000đ khi mua gói VIP giá gốc 4.500.000đ giảm còn 2.800.000đ',
    chance: 10,
  },
  {
    text: 'Voucher giảm giá nâng cấp\nlên gói VIP (giá trị voucher là 500.000đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description: 'Voucher nâng cấp lên gói VIP (giá trị voucher là 500.000đ)',
    chance: 20,
  },
  {
    text: 'FIle thần số học chỉ còn\n300,000Đ (giá gốc 2,500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#fc0',
    textFillStyle: '#fff',
    description: 'FIle thần số học chỉ còn 300,000Đ (giá gốc 2,500,000Đ)',
    chance: 20,
  },
  {
    text: 'Buổi Coaching 1:1 với\nchuyên gia (giá trị 1.000.000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description: 'Buổi Coaching 1:1 với chuyên gia (giá trị 1.000.000Đ)',
    chance: 0, // Không có xác suất, chỉ để hiển thị
  },
  {
    text: 'File tính cách Iconic\ngiá 0Đ (giá trị 500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#fc0',
    textFillStyle: '#fff',
    description: 'File tính cách Iconic giá 0Đ (giá trị 500,000Đ)',
    chance: 0, // Không có xác suất, chỉ để hiển thị
  },
  {
    text: 'Gói Gold Iconic\ngiá 0Đ (giá trị 2,500,000Đ)',
    textFontSize: 14,
    textFontFamily: 'Arial',
    fillStyle: '#ff0000',
    textFillStyle: '#fff',
    description:
      'Gói Gold Iconic giá 0Đ (giá trị 2,500,000Đ). Áp dụng cho tất cả đơn hàng.',
    chance: 0, // Không có xác suất, chỉ để hiển thị
  },
];

function initLuckyWheel() {
  // Tạo WinWheel với phần thưởng mặc định (GOLD)
  createWheel(goldPrizes);

  // Xử lý sự kiện nút quay
  var startBtn = document.getElementById('start-spin');
  var canvas = document.getElementById('canvas');

  // Xử lý sự kiện chọn loại vòng quay
  var goldBtn = document.getElementById('gold-wheel-btn');
  var vipBtn = document.getElementById('vip-wheel-btn');

  if (goldBtn) {
    goldBtn.onclick = function () {
      switchWheelType('gold');
    };
  }

  if (vipBtn) {
    vipBtn.onclick = function () {
      switchWheelType('vip');
    };
  }

  if (startBtn) {
    startBtn.onclick = function () {
      spinWheel();
    };
  }

  if (canvas) {
    // Lấy kích thước và vị trí của canvas
    var canvasRect = canvas.getBoundingClientRect();
    wheelCenterX = canvasRect.width / 2;
    wheelCenterY = canvasRect.height / 2;

    // Thêm các sự kiện kéo thả cho canvas
    canvas.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);

    // Hỗ trợ cảm ứng cho thiết bị di động
    canvas.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleDragEnd);
  }

  // Cập nhật hiển thị số lần quay còn lại
  updateSpinCountDisplay();

  // Kiểm tra khóa chuyển đổi loại vòng quay
  checkWheelTypeLock();

  // Thêm xử lý responsive
  handleResponsiveWheel();
}

function handleResponsiveWheel() {
  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Adjust canvas size
  function adjustCanvasSize() {
    const container = document.querySelector('.wheel-container');
    const canvas = document.getElementById('canvas');

    if (!container || !canvas) return;

    const containerRect = container.getBoundingClientRect();
    const size = Math.floor(containerRect.width);

    canvas.width = size;
    canvas.height = size;

    if (typeof theWheel !== 'undefined') {
      theWheel.centerX = size / 2;
      theWheel.centerY = size / 2;
      theWheel.outerRadius = (size - 20) / 2;
      theWheel.innerRadius = size * 0.07;

      if (theWheel.pins) {
        theWheel.pins.outerRadius = size * 0.01;
      }

      // Gọi hàm cập nhật kích thước font
      updateWheelTextSize();
    }
  }

  // Handle resize
  const debouncedAdjust = debounce(adjustCanvasSize, 250);
  window.addEventListener('resize', debouncedAdjust);

  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(adjustCanvasSize, 100);
  });

  // Initial adjustment
  adjustCanvasSize();

  // Create ResizeObserver
  if (window.ResizeObserver) {
    const container = document.querySelector('.wheel-container');
    if (container) {
      const observer = new ResizeObserver(debouncedAdjust);
      observer.observe(container);
    }
  }
}

function createWheel(prizes) {
  const container = document.querySelector('.wheel-container');
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const size = Math.floor(containerRect.width);

  // Điều chỉnh kích thước font dựa trên kích thước màn hình
  let textFontSize;
  let textMargin;

  if (window.innerWidth <= 576) {
    // Mobile
    textFontSize = size * 0.025;
    textMargin = size * 0.015;
  } else if (window.innerWidth <= 768) {
    // Tablet
    textFontSize = size * 0.028;
    textMargin = size * 0.018;
  } else {
    // Desktop
    textFontSize = size * 0.032;
    textMargin = size * 0.024;
  }

  // Điều chỉnh prizes để responsive
  const responsivePrizes = prizes.map((prize) => {
    return {
      ...prize,
      textFontSize:
        window.innerWidth <= 576 ? 12 : window.innerWidth <= 768 ? 13 : 14,
    };
  });

  theWheel = new Winwheel({
    canvasId: 'canvas',
    centerX: size / 2,
    centerY: size / 2,
    outerRadius: (size - 20) / 2,
    innerRadius: size * 0.07,
    textFontSize: textFontSize,
    textAlignment: 'center',
    numSegments: responsivePrizes.length,
    segments: responsivePrizes,
    animation: {
      type: 'spinToStop',
      duration: 5,
      spins: 8,
      callbackFinished: 'alertPrize()',
    },
    pins: {
      number: responsivePrizes.length,
      fillStyle: '#000',
      outerRadius: size * 0.01,
      responsive: true,
      strokeStyle: '#ffffff',
      lineWidth: 0.5,
    },
    lineWidth: 1.5,
    lineColor: '#ffffff',
    textFontFamily: 'Arial, sans-serif',
    textMargin: textMargin,
  });

  theWheel.draw();
}

function switchWheelType(wheelType) {
  // Kiểm tra xem có thể chuyển đổi không
  if (
    (spinCount.gold > 0 && wheelType === 'vip') ||
    (spinCount.vip > 0 && wheelType === 'gold')
  ) {
    alert(
      'Bạn đã quay ở vòng quay ' +
        (currentWheelType === 'gold' ? 'HỌC VIÊN' : 'KHÁCH HÀNG') +
        ', không thể chuyển sang vòng quay khác!'
    );
    return;
  }

  currentWheelType = wheelType;

  // Cập nhật trạng thái nút
  var goldBtn = document.getElementById('gold-wheel-btn');
  var vipBtn = document.getElementById('vip-wheel-btn');

  const goldPrizeList = document.getElementById('gold-prize-list');
  const vipPrizeList = document.getElementById('vip-prize-list');

  if (goldBtn && vipBtn) {
    if (wheelType === 'gold') {
      goldBtn.classList.add('active');
      vipBtn.classList.remove('active');
      goldPrizeList.style.display = 'block';
      vipPrizeList.style.display = 'none';
    } else {
      goldBtn.classList.remove('active');
      vipBtn.classList.add('active');
      goldPrizeList.style.display = 'none';
      vipPrizeList.style.display = 'block';
    }
  }

  // Tạo lại vòng quay với phần thưởng tương ứng
  if (wheelType === 'gold') {
    createWheel(goldPrizes);
  } else {
    createWheel(vipPrizes);
  }

  // Đảm bảo cập nhật kích thước và font size cho mobile
  updateWheelTextSize();

  // Cập nhật hiển thị số lần quay còn lại
  updateSpinCountDisplay();
}

function handleDragStart(e) {
  if (!canSpin) return;

  e.preventDefault();
  isDragging = true;

  // Lưu góc bắt đầu và vị trí
  var rect = document.getElementById('canvas').getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;

  // Tính góc bắt đầu từ tâm vòng quay
  startAngle = calculateAngle(startX, startY);

  // Lưu trạng thái ban đầu
  currentAngle = theWheel.rotationAngle % 360;
  lastFrameTime = Date.now();
  lastAngle = currentAngle;
}

function handleTouchStart(e) {
  if (!canSpin) return;

  e.preventDefault();
  isDragging = true;

  // Lưu góc bắt đầu và vị trí cho cảm ứng
  var rect = document.getElementById('canvas').getBoundingClientRect();
  var touch = e.touches[0];
  startX = touch.clientX - rect.left;
  startY = touch.clientY - rect.top;

  // Tính góc bắt đầu từ tâm vòng quay
  startAngle = calculateAngle(startX, startY);

  // Lưu trạng thái ban đầu
  currentAngle = theWheel.rotationAngle % 360;
  lastFrameTime = Date.now();
  lastAngle = currentAngle;
}

function handleDragMove(e) {
  if (!isDragging || !canSpin) return;

  e.preventDefault();

  var rect = document.getElementById('canvas').getBoundingClientRect();
  var clientX = e.clientX;
  var clientY = e.clientY;

  // Nếu là sự kiện cảm ứng
  if (e.touches) {
    var touch = e.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  }

  var mouseX = clientX - rect.left;
  var mouseY = clientY - rect.top;

  // Tính góc mới
  var newAngle = calculateAngle(mouseX, mouseY);

  // Tính sự khác biệt và cập nhật góc quay
  var angleDiff = newAngle - startAngle;
  theWheel.rotationAngle = currentAngle + angleDiff;

  // Vẽ lại bánh xe
  theWheel.draw();

  // Tính toán tốc độ quay
  var currentTime = Date.now();
  var timeDiff = currentTime - lastFrameTime;

  if (timeDiff > 0) {
    var angleDelta = theWheel.rotationAngle - lastAngle;
    releaseSpeed = (Math.abs(angleDelta) / timeDiff) * 1000; // Tốc độ tính bằng độ/giây

    lastFrameTime = currentTime;
    lastAngle = theWheel.rotationAngle;
  }
}

function handleTouchMove(e) {
  if (!isDragging || !canSpin) return;

  e.preventDefault();

  var rect = document.getElementById('canvas').getBoundingClientRect();
  var touch = e.touches[0];
  var mouseX = touch.clientX - rect.left;
  var mouseY = touch.clientY - rect.top;

  // Tính góc mới
  var newAngle = calculateAngle(mouseX, mouseY);

  // Tính sự khác biệt và cập nhật góc quay
  var angleDiff = newAngle - startAngle;
  theWheel.rotationAngle = currentAngle + angleDiff;

  // Vẽ lại bánh xe
  theWheel.draw();

  // Tính toán tốc độ quay
  var currentTime = Date.now();
  var timeDiff = currentTime - lastFrameTime;

  if (timeDiff > 0) {
    var angleDelta = theWheel.rotationAngle - lastAngle;
    releaseSpeed = (Math.abs(angleDelta) / timeDiff) * 1000; // Tốc độ tính bằng độ/giây

    lastFrameTime = currentTime;
    lastAngle = theWheel.rotationAngle;
  }
}

function handleDragEnd(e) {
  if (!isDragging) return;

  e.preventDefault();
  isDragging = false;

  // Kiểm tra số lần quay
  var totalSpinsUsed = spinCount.gold + spinCount.vip;
  if (totalSpinsUsed >= maxSpins) {
    // Nếu đã hết lượt quay, không cho kéo quay nữa
    return;
  }

  // Nếu tốc độ thả đủ cao, kích hoạt quay
  if (canSpin && releaseSpeed > minReleaseSpeed) {
    // Đặt số vòng quay dựa trên tốc độ thả
    var spins = Math.min(10, Math.max(3, Math.floor(releaseSpeed / 100)));

    // Cập nhật tùy chọn animation
    theWheel.animation.spins = spins;

    // Bắt đầu quay
    spinWheel();
  } else {
    // Nếu tốc độ không đủ, chỉ vẽ lại vòng quay ở vị trí hiện tại
    theWheel.draw();
  }
}

function calculateAngle(x, y) {
  // Tính góc từ tâm vòng quay đến vị trí chuột
  var deltaX = x - wheelCenterX;
  var deltaY = y - wheelCenterY;

  // Sử dụng hàm Math.atan2 để tính góc (theo radian)
  var rad = Math.atan2(deltaY, deltaX);

  // Chuyển đổi từ radian sang độ
  var deg = rad * (180 / Math.PI);

  // Điều chỉnh góc để phù hợp với hệ tọa độ của vòng quay
  return deg;
}

function validateForm() {
  return true; // Luôn trả về true vì không còn cần kiểm tra form
}

// Thêm lại hàm spinWheel với kiểm soát số lần quay
function spinWheel() {
  // Kiểm tra số lần quay
  var totalSpinsUsed = spinCount.gold + spinCount.vip;
  if (totalSpinsUsed >= maxSpins) {
    alert('Bạn đã sử dụng hết lượt quay. Vui lòng tải lại trang để tiếp tục.');
    return;
  }

  if (canSpin) {
    canSpin = false;
    // Đánh dấu đang xử lý phần thưởng
    window.isSpinning = true;

    // Tăng số lần quay cho loại vòng quay hiện tại
    spinCount[currentWheelType]++;

    // Cập nhật hiển thị số lần quay còn lại
    updateSpinCountDisplay();

    // Vô hiệu hóa nút chuyển đổi vòng quay sau lần quay đầu tiên
    // lockWheelTypeSelection();

    // let weights = [40, 25, 20, 10, 5, 0, 0];
    let prizes = currentWheelType === 'gold' ? goldPrizes : vipPrizes;
    let weights = [];
    for (let i = 0; i < prizes.length; i++) {
      weights.push(prizes[i].chance);
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const randomValue = Math.random() * totalWeight;

    let weightSum = 0;
    let selectedSegment = 1;

    for (let i = 0; i < weights.length; i++) {
      weightSum += weights[i];
      if (randomValue < weightSum) {
        selectedSegment = i + 1;
        break;
      }
    }
    theWheel.animation.stopAngle =
      theWheel.getRandomForSegment(selectedSegment);
    // Bắt đầu quay
    theWheel.startAnimation();
  }
}

// Bọc lại function spinWheel để thêm kiểm soát trạng thái
var originalSpinWheel = spinWheel;
spinWheel = function () {
  // Nếu đang quay hoặc đang xử lý phần thưởng, bỏ qua
  if (
    !canSpin ||
    window.isPrizeRequestInProgress ||
    window.isAlertPrizeInProgress ||
    window.isSpinning
  ) {
    console.log('Vòng quay đang bận, vui lòng đợi');
    return;
  }

  // Đánh dấu đang xử lý
  window.isSpinningWheel = true;
  originalSpinWheel();
};

// Xóa hàm alertPrize ở đây để tránh xung đột, nó sẽ được định nghĩa lại trong VongQuayMayMan.cshtml
// Biến này chỉ là khai báo để khi load script, nó không báo lỗi thiếu hàm này
var alertPrize = function () {
  console.log(
    'Cảnh báo: Hàm alertPrize gốc được gọi. Nó nên bị ghi đè bởi VongQuayMayMan.cshtml'
  );

  // Reset trạng thái quay
  window.isSpinning = false;
  window.isSpinningWheel = false;
  window.isPrizeRequestInProgress = false;

  setTimeout(function () {
    theWheel.stopAnimation(false);
    theWheel.rotationAngle = 0;
    theWheel.draw();
    canSpin = true;
  }, 1000);
};

// Thêm hàm để xóa hoàn toàn localStorage liên quan đến phần thưởng và tải lại trang
function resetAllPrizeData() {
  localStorage.clear(); // Xóa mọi thứ trong localStorage
  alert('Đã xóa hoàn toàn dữ liệu phần thưởng. Trang sẽ được tải lại.');
  location.reload(); // Tải lại trang
}

// Thêm sự kiện beforeunload để xử lý khi trang bị reload
window.addEventListener('beforeunload', function (e) {
  // Chỉ hiển thị cảnh báo nếu có dữ liệu phần thưởng trong localStorage
  if (localStorage.getItem('userPrizes')) {
    // Xóa dữ liệu phần thưởng
    localStorage.removeItem('userPrizes');
    // Xóa cả prizeSignatures
    localStorage.removeItem('prizeSignatures');

    // Hiển thị cảnh báo
    var confirmationMessage =
      'Dữ liệu phần thưởng sẽ mất nếu bạn rời khỏi trang. Bạn có chắc không?';
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  }
});

// Hàm cập nhật hiển thị số lần quay còn lại
function updateSpinCountDisplay() {
  var remainingSpinsElement = document.getElementById('remaining-spins');
  if (remainingSpinsElement) {
    var totalSpinsUsed = spinCount.gold + spinCount.vip;
    var remaining = maxSpins - totalSpinsUsed;
    remaining = remaining < 0 ? 0 : remaining;
    remainingSpinsElement.textContent = remaining;

    // Cập nhật trạng thái nút quay
    var startBtn = document.getElementById('start-spin');
    if (startBtn) {
      if (remaining <= 0) {
        startBtn.disabled = true;
        startBtn.classList.add('disabled');
        startBtn.textContent = 'HẾT LƯỢT QUAY';
      } else {
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');
        startBtn.textContent = 'QUAY NGAY';
      }
    }
  }
}

// Hàm khóa lựa chọn loại vòng quay
function lockWheelTypeSelection() {
  var goldBtn = document.getElementById('gold-wheel-btn');
  var vipBtn = document.getElementById('vip-wheel-btn');

  if (goldBtn && vipBtn) {
    // Kiểm tra loại vòng quay hiện tại
    if (currentWheelType === 'gold') {
      // Vô hiệu hóa nút VIP
      vipBtn.disabled = true;
      vipBtn.classList.add('disabled');
      vipBtn.title =
        'Bạn đã quay vòng HỌC VIÊN, không thể chuyển sang vòng KHÁCH HÀNG';
    } else {
      // Vô hiệu hóa nút Gold
      goldBtn.disabled = true;
      goldBtn.classList.add('disabled');
      goldBtn.title =
        'Bạn đã quay vòng KHÁCH HÀNG, không thể chuyển sang vòng HỌC VIÊN';
    }
  }

  // Thêm message thông báo
  var wheelTypeMessage = document.getElementById('wheel-type-message');
  if (wheelTypeMessage) {
    wheelTypeMessage.style.display = 'block';
    wheelTypeMessage.textContent =
      'Bạn chỉ có thể quay ở vòng quay ' +
      (currentWheelType === 'gold' ? 'HỌC VIÊN' : 'KHÁCH HÀNG') +
      ' đã chọn!';
  }
}

// Thêm hàm kiểm tra khóa chuyển đổi loại vòng quay
function checkWheelTypeLock() {
  // Kiểm tra xem đã quay ít nhất một lần ở loại vòng quay nào
  if (spinCount.gold > 0 || spinCount.vip > 0) {
    lockWheelTypeSelection();
  }
}

// Thêm hàm mới để cập nhật kích thước font text của vòng quay
function updateWheelTextSize() {
  if (typeof theWheel !== 'undefined') {
    const container = document.querySelector('.wheel-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const size = Math.floor(containerRect.width);

    // Điều chỉnh kích thước font text dựa trên kích thước màn hình
    let textFontSize;
    let textMargin;

    if (window.innerWidth <= 576) {
      // Mobile
      textFontSize = size * 0.025;
      textMargin = size * 0.015;
    } else if (window.innerWidth <= 768) {
      // Tablet
      textFontSize = size * 0.028;
      textMargin = size * 0.018;
    } else {
      // Desktop
      textFontSize = size * 0.032;
      textMargin = size * 0.024;
    }

    // Cập nhật kích thước font text cho từng phần thưởng
    theWheel.segments.forEach((segment) => {
      if (segment && segment.text) {
        segment.textFontSize =
          window.innerWidth <= 576 ? 12 : window.innerWidth <= 768 ? 13 : 14;
      }
    });

    // Cập nhật các thuộc tính của vòng quay
    theWheel.textFontSize = textFontSize;
    theWheel.textMargin = textMargin;
    theWheel.centerX = size / 2;
    theWheel.centerY = size / 2;
    theWheel.outerRadius = (size - 20) / 2;
    theWheel.innerRadius = size * 0.07;

    if (theWheel.pins) {
      theWheel.pins.outerRadius = size * 0.01;
    }

    theWheel.draw();
  }
}

// Thêm xử lý sự kiện resize để cập nhật kích thước khi thay đổi kích thước màn hình
window.addEventListener('resize', function () {
  if (typeof theWheel !== 'undefined') {
    updateWheelTextSize();
  }
});

// Thêm xử lý sự kiện orientationchange cho mobile
window.addEventListener('orientationchange', function () {
  setTimeout(function () {
    if (typeof theWheel !== 'undefined') {
      updateWheelTextSize();
    }
  }, 100);
});
