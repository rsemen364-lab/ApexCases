let balance = Number(localStorage.getItem("apex_balance")) || 10000;
let slotWidth = 180;
if (window.innerWidth <= 768) { slotWidth = 140; }
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTickSound() {
    try {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
}

function playWinSound() {
    try {
        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator(); const gain1 = audioCtx.createGain();
        osc1.type = 'sine'; osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.2, now); gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc1.connect(gain1); gain1.connect(audioCtx.destination); osc1.start(); osc1.stop(now + 0.4);
        setTimeout(() => {
            const osc2 = audioCtx.createOscillator(); const gain2 = audioCtx.createGain();
            osc2.type = 'sine'; osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.2, audioCtx.currentTime); gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc2.connect(gain2); gain2.connect(audioCtx.destination); osc2.start(); osc2.stop(audioCtx.currentTime + 0.5);
        }, 150);
    } catch (e) {}
}

function createBalancePopup(amount, isNegative) {
    const container = document.querySelector(".balance-container"); if (!container) return;
    const popup = document.createElement("div"); popup.className = `balance-popup ${isNegative ? 'minus' : 'plus'}`;
    popup.innerText = `${isNegative ? '-' : '+'}$${amount.toLocaleString()}`; container.appendChild(popup);
    setTimeout(() => { popup.remove(); }, 2500);
}

function openImageModal(imgSrc, itemName) {
    let modal = document.getElementById("global-image-modal");
    let modalImg = document.getElementById("global-modal-img");
    let modalTitle = document.getElementById("global-modal-title");
    if (!modal) {
        modal = document.createElement("div"); modal.id = "global-image-modal"; modal.className = "image-modal-overlay";
        modalImg = document.createElement("img"); modalImg.id = "global-modal-img"; modalImg.className = "image-modal-img-content";
        modalTitle = document.createElement("div"); modalTitle.id = "global-modal-title"; modalTitle.className = "image-modal-title-text";
        modal.appendChild(modalImg); modal.appendChild(modalTitle); document.body.appendChild(modal);
        modal.addEventListener("click", () => { modal.classList.remove("active"); setTimeout(() => { modal.style.display = "none"; }, 300); });
    }
    modalImg.src = imgSrc; modalTitle.innerText = itemName; modal.style.display = "flex"; setTimeout(() => { modal.classList.add("active"); }, 10);
}

function getFreeMoney() {
    if (balance >= 50) { alert("Пополнение доступно только если на балансе меньше $50!"); return; }
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    balance += 500;
    document.getElementById("balance-val").innerText = balance.toLocaleString();
    localStorage.setItem("apex_balance", balance);
    createBalancePopup(500, false); playWinSound();
    checkFreeMoneyButton();
}

function checkFreeMoneyButton() {
    const freeBtn = document.getElementById("btn-free-money"); if (!freeBtn) return;
    if (balance < 50) { freeBtn.style.display = "block"; } else { freeBtn.style.display = "none"; }
}

function openAdminPanel() {
    document.getElementById("admin-modal").style.display = "flex";
    document.getElementById("admin-stage-pass").style.display = "block";
    document.getElementById("admin-stage-money").style.display = "none";
    document.getElementById("admin-pass-field").value = "";
    document.getElementById("admin-money-field").value = "";
}

function closeAdminPanel() {
    document.getElementById("admin-modal").style.display = "none";
}

function submitAdminPassword() {
    const pass = document.getElementById("admin-pass-field").value;
    if (pass === "я бомж") {
        document.getElementById("admin-stage-pass").style.display = "none";
        document.getElementById("admin-stage-money").style.display = "block";
    } else {
        alert("Неверный пароль!");
        closeAdminPanel();
    }
}

function submitAdminMoney() {
    const moneyInput = document.getElementById("admin-money-field").value;
    const moneyAmount = Math.floor(Number(moneyInput));
    if (!isNaN(moneyAmount) && moneyAmount > 0) {
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }
        balance += moneyAmount;
        document.getElementById("balance-val").innerText = balance.toLocaleString();
        localStorage.setItem("apex_balance", balance);
        createBalancePopup(moneyAmount, false);
        playWinSound();
        checkFreeMoneyButton();
        closeAdminPanel();
    } else {
        alert("Нужно ввести правильное число!");
    }
}

function resetAdminBalance() {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    let previousBalance = balance;
    balance = 10000;
    document.getElementById("balance-val").innerText = balance.toLocaleString();
    localStorage.setItem("apex_balance", balance);
    if (previousBalance > 10000) {
        createBalancePopup(previousBalance - 10000, true);
    }
    playTickSound();
    checkFreeMoneyButton();
    closeAdminPanel();
}

window.addEventListener("DOMContentLoaded", () => { if (typeof initData === "function") initData(); });

function initData() {
    document.getElementById("balance-val").innerText = balance.toLocaleString();
    Object.keys(caseData).forEach(caseKey => {
        const config = caseData[caseKey]; const previewEl = document.getElementById(`preview-${caseKey}`);
        if (previewEl) {
            previewEl.innerHTML = '';
            config.items.forEach(item => {
                previewEl.innerHTML += `<div class="preview-card border-${item.rarity}" onclick="openImageModal('${item.img}', '${item.name}')" style="cursor: pointer;"><img src="${item.img}" alt="${item.name}"><div style="font-weight:700; margin-top:5px;">${item.name}</div><div class="color-${item.rarity}">$${item.price.toLocaleString()}</div></div>`;
            });
        }
        if (config.type === "tape") { buildTape(caseKey, 0); } else if (config.type === "wheel") { buildWheel(caseKey); }
    });
    checkFreeMoneyButton();
}

function buildTape(caseKey, offsetSlots = 0, targetItem = null) {
    const tape = document.getElementById(`tape-${caseKey}`); if (!tape) return;
    const itemsList = caseData[caseKey].items; tape.innerHTML = '';
    const totalSlots = 60; const targetIndex = 45;
    for (let i = 0; i < totalSlots; i++) {
        let item = (i === targetIndex && targetItem) ? targetItem : itemsList[Math.floor(Math.random() * itemsList.length)];
        tape.innerHTML += `<div class="item-slot border-${item.rarity}" id="${caseKey}-slot-${i}" onclick="openImageModal('${item.img}', '${item.name}')" style="cursor: pointer;"><img src="${item.img}" alt="${item.name}"><div class="item-name">${item.name}</div><div class="item-price color-${item.rarity}">$${item.price.toLocaleString()}</div></div>`;
    }
    tape.style.transition = 'none'; tape.style.transform = `translateX(0px)`;
}

function buildWheel(caseKey) {
    const wheel = document.getElementById(`wheel-${caseKey}`); if (!wheel) return;
    const itemsList = caseData[caseKey].items; wheel.innerHTML = '';
    itemsList.forEach((item, index) => {
        const centerAngle = (item.startAngle + item.endAngle) / 2;
        wheel.innerHTML += `<div class="wheel-sector color-${item.rarity}" id="${caseKey}-sector-${index}" style="transform: rotate(${centerAngle}deg);"><img src="${item.img}" alt="${item.name}"><div class="sector-name">${item.name}</div></div>`;
    });
}

function spin(caseKey) {
    const config = caseData[caseKey];
    if (balance < config.price) { alert("У вас недостаточно средств на балансе!"); return; }
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    document.querySelectorAll('.winner-pulse').forEach(el => el.classList.remove('winner-pulse'));
    balance -= config.price; document.getElementById("balance-val").innerText = balance.toLocaleString();
    localStorage.setItem("apex_balance", balance); createBalancePopup(config.price, true);
    checkFreeMoneyButton();
    document.querySelectorAll('.btn-action').forEach(b => b.disabled = true);
    let rand = Math.random() * 100;
    let chosenItem = config.items[config.items.length - 1]; let chosenIndex = config.items.length - 1; let sum = 0;
    for (let i = 0; i < config.items.length; i++) {
        sum += config.items[i].chance; if (rand <= sum) { chosenItem = config.items[i]; chosenIndex = i; break; }
    }
    if (config.type === "tape") {
        const tape = document.getElementById(`tape-${caseKey}`); if (!tape) return;
        buildTape(caseKey, 0, chosenItem);
        const wrapperWidth = document.querySelector('.roulette-wrapper').offsetWidth; const targetIndex = 45;
        const randomInnerClick = Math.floor(Math.random() * (slotWidth - 2)) + 1 - (slotWidth / 2);
        const finalShift = (targetIndex * slotWidth) - (wrapperWidth / 2) + (slotWidth / 2) + randomInnerClick;
        setTimeout(() => { tape.style.transition = 'transform 5s cubic-bezier(0.15, 0.85, 0.1, 1)'; tape.style.transform = `translateX(-${finalShift}px)`; }, 50);
        let lastTickSlot = 0;
        const tickInterval = setInterval(() => {
            const matrix = new WebKitCSSMatrix(window.getComputedStyle(tape).transform);
            let currentSlot = Math.floor((Math.abs(matrix.m41) + (wrapperWidth / 2)) / slotWidth);
            if (currentSlot !== lastTickSlot && currentSlot < targetIndex + 2) { playTickSound(); lastTickSlot = currentSlot; }
        }, 30);
        setTimeout(() => { clearInterval(tickInterval); const winSlot = document.getElementById(`${caseKey}-slot-${targetIndex}`); if (winSlot) winSlot.classList.add("winner-pulse"); finalizeWin(chosenItem); }, 5100);
    } else if (config.type === "wheel") {
        const arrow = document.getElementById(`arrow-${caseKey}`); if (!arrow) return;
        const randomAngleInSector = Math.random() * (chosenItem.endAngle - chosenItem.startAngle) + chosenItem.startAngle;
        const finalSpinAngle = 1800 + randomAngleInSector;
        arrow.style.transition = 'none'; arrow.style.transform = `rotate(0deg)`;
        setTimeout(() => { arrow.style.transition = 'transform 5s cubic-bezier(0.15, 0.85, 0.1, 1)'; arrow.style.transform = `rotate(${finalSpinAngle}deg)`; }, 50);
        let lastDegrees = 0;
        const wheelTickInterval = setInterval(() => {
            const matrix = new WebKitCSSMatrix(window.getComputedStyle(arrow).transform);
            let angle = Math.round(Math.atan2(matrix.m12, matrix.m11) * (180/Math.PI)); if (angle < 0) angle += 360;
            if (Math.abs(angle - lastDegrees) > 25) { playTickSound(); lastDegrees = angle; }
        }, 40);
        setTimeout(() => { clearInterval(wheelTickInterval); const winSector = document.getElementById(`${caseKey}-sector-${chosenIndex}`); if (winSector) winSector.classList.add("winner-pulse"); finalizeWin(chosenItem); }, 5100);
    }
}

function finalizeWin(chosenItem) {
    playWinSound(); balance += chosenItem.price;
    document.getElementById("balance-val").innerText = balance.toLocaleString();
    localStorage.setItem("apex_balance", balance); createBalancePopup(chosenItem.price, false);
    document.querySelectorAll('.btn-action').forEach(b => b.disabled = false); checkFreeMoneyButton();
}

window.onresize = () => { slotWidth = (window.innerWidth <= 768) ? 140 : 180; };
window.onload = initData;
