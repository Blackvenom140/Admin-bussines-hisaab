// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNc_n-_u44_vGJ8LYRhp3FQImv4TMS8bI",
  authDomain: "bussines-account-dfe93.firebaseapp.com",
  projectId: "bussines-account-dfe93",
  storageBucket: "bussines-account-dfe93.firebasestorage.app",
  messagingSenderId: "842112353395",
  appId: "1:842112353395:web:03ad33a1c01cb5e16d1606"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const salePage = document.getElementById('salePage');
const udharPage = document.getElementById('udharPage');
const analyticsPage = document.getElementById('analyticsPage');
const saleList = document.getElementById('saleList');
const udharList = document.getElementById('udharList');
const cashTotal = document.getElementById('cashTotal');
const upiTotal = document.getElementById('upiTotal');
const grandTotal = document.getElementById('grandTotal');
const udharTotal = document.getElementById('udharTotal');
const currentDate = document.getElementById('currentDate');

// Global storage
let allSales = {};
let daySalesMap = {};

// Current Date
currentDate.textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// ================= TAB SWITCH =================
window.switchTab = (tab) => {
  if (tab === 'sale') {
    salePage.classList.add('active');
    analyticsPage.classList.remove('active');
    document.getElementById('tabSale').classList.add('active');
    document.getElementById('tabAnalytics').classList.remove('active');
  } else {
    analyticsPage.classList.add('active');
    salePage.classList.remove('active');
    document.getElementById('tabAnalytics').classList.add('active');
    document.getElementById('tabSale').classList.remove('active');
    calculateAnalytics();
  }
};

// ================= NAVIGATION =================
window.showSale = () => {
  salePage.classList.remove('hidden');
  udharPage.classList.add('hidden');
  document.getElementById('saleNavBtn').classList.add('active');
  document.getElementById('udharNavBtn').classList.remove('active');
};

window.showUdhar = () => {
  udharPage.classList.remove('hidden');
  salePage.classList.add('hidden');
  document.getElementById('udharNavBtn').classList.add('active');
  document.getElementById('saleNavBtn').classList.remove('active');
};

// ================= QUANTITY =================
window.checkCustomQty = () => {
  const customQtyGroup = document.getElementById('customQtyGroup');
  const itemQty = document.getElementById('itemQty');
  customQtyGroup.style.display = itemQty.value === 'custom' ? 'block' : 'none';
};

// ================= SAVE SALE =================
window.saveSale = () => {
  const itemName = document.getElementById('itemName');
  const itemPrice = document.getElementById('itemPrice');
  const itemQty = document.getElementById('itemQty');
  const customQty = document.getElementById('customQty');
  const paymentMethod = document.getElementById('paymentMethod');

  let qty = itemQty.value === 'custom' ? parseInt(customQty.value) : parseInt(itemQty.value);
  let price = parseFloat(itemPrice.value);

  if (!itemName.value || !price || !qty) {
    alert('Please fill all required fields!');
    return;
  }

  push(ref(db, "sales"), {
    name: itemName.value,
    price: price,
    qty: qty,
    total: price * qty,
    payment: paymentMethod.value,
    time: new Date().toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true }),
    timestamp: Date.now()
  });

  itemName.value = "";
  itemPrice.value = "";
  itemQty.value = "1";
  customQty.value = "";
};

// ================= LOAD SALES =================
onValue(ref(db, "sales"), snap => {
  saleList.innerHTML = "";
  let cash = 0, upi = 0;
  let today = new Date().toISOString().split("T")[0];

  snap.forEach(child => {
    let key = child.key;
    let s = child.val();

    let saleDate = new Date(s.timestamp).toISOString().split("T")[0];
    if (saleDate !== today) return;

    if (s.payment === "Cash") cash += s.total;
    else upi += s.total;

    const saleElement = document.createElement('div');
    saleElement.className = 'transaction-item';
    saleElement.innerHTML = `
      <div class="transaction-header">
        <div class="transaction-name">${s.name}</div>
        <div class="payment-tag tag-${s.payment.toLowerCase()}">${s.payment}</div>
      </div>
      <div class="transaction-amount">₹${s.total}</div>
      <div class="transaction-meta">₹${s.price} × ${s.qty} • ${s.time}</div>
      <div class="actions">
        <button class="btn-small btn-delete" onclick="deleteSale('${key}')">Delete</button>
      </div>
    `;
    saleList.appendChild(saleElement);
  });

  cashTotal.textContent = `₹${cash}`;
  upiTotal.textContent = `₹${upi}`;
  grandTotal.textContent = `₹${cash + upi}`;
});

// ================= DELETE =================
window.deleteSale = (id) => {
  if (confirm('Delete this transaction?')) {
    remove(ref(db, "sales/" + id));
  }
};

// ================= SAVE UDHAR =================
window.saveUdhar = () => {
  const udharName = document.getElementById('udharName');
  const udharAmount = document.getElementById('udharAmount');
  const udharPayment = document.getElementById('udharPayment');

  if (!udharName.value || !udharAmount.value) {
    alert('Please fill all required fields!');
    return;
  }

  push(ref(db, "udhar"), {
    name: udharName.value,
    amount: parseFloat(udharAmount.value),
    payment: udharPayment.value,
    time: new Date().toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true }),
    timestamp: Date.now()
  });

  udharName.value = "";
  udharAmount.value = "";
};

// ================= LOAD UDHAR =================
onValue(ref(db, "udhar"), snap => {
  udharList.innerHTML = "";
  let total = 0;

  snap.forEach(child => {
    let u = child.val();
    total += u.amount;

    const udharElement = document.createElement('div');
    udharElement.className = 'transaction-item';
    udharElement.innerHTML = `
      <div class="transaction-header">
        <div class="transaction-name">${u.name}</div>
        <div class="payment-tag tag-${u.payment.toLowerCase()}">${u.payment}</div>
      </div>
      <div class="transaction-amount">₹${u.amount}</div>
      <div class="transaction-meta">${u.time}</div>
    `;
    udharList.appendChild(udharElement);
  });

  udharTotal.textContent = `₹${total}`;
});

// ================= ANALYTICS =================
onValue(ref(db, "sales"), snap => {
  allSales = snap.val() || {};
});

function calculateAnalytics() {

  let cashSum = 0, upiSum = 0;
  let productCount = {};
  daySalesMap = {};

  Object.values(allSales).forEach(sale => {

    if (sale.payment === 'Cash') cashSum += sale.total;
    else upiSum += sale.total;

    const cleanName = sale.name.toLowerCase().trim();
    productCount[cleanName] = (productCount[cleanName] || 0) + sale.qty;

    const rawDate = new Date(sale.timestamp);
    const dateKey = rawDate.toISOString().split("T")[0];

    if (!daySalesMap[dateKey]) {
      daySalesMap[dateKey] = {
        display: rawDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        sales: [],
        total: 0
      };
    }

    daySalesMap[dateKey].sales.push(sale);
    daySalesMap[dateKey].total += sale.total;
  });

  // ===== FINANCIAL OVERVIEW =====
  document.getElementById('aCash').textContent = `₹${cashSum}`;
  document.getElementById('aUpi').textContent = `₹${upiSum}`;
  document.getElementById('aGrand').textContent = `₹${cashSum + upiSum}`;

  // ===== TOP PERFORMER =====
  let topProduct = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])[0];

  document.getElementById('mostProduct').textContent =
    topProduct ? `${topProduct[0]} (${topProduct[1]} sold)` : 'No data';

  // ===== BEST DAY =====
  let bestDay = Object.values(daySalesMap)
    .sort((a, b) => b.total - a.total)[0];

  document.getElementById('bestDay').textContent =
    bestDay ? `${bestDay.display} (₹${bestDay.total})` : 'No data';

  // ===== DAILY BREAKDOWN =====
  const breakdownDiv = document.getElementById('dailyBreakdown');
  breakdownDiv.innerHTML = '';

  Object.keys(daySalesMap)
    .sort((a, b) => b.localeCompare(a))
    .forEach(dateKey => {

      const data = daySalesMap[dateKey];

      const dayElement = document.createElement('div');
      dayElement.style.padding = '10px 0';
      dayElement.style.borderBottom = '1px solid #ddd';
      dayElement.style.cursor = 'pointer';

      dayElement.innerHTML = `
        <div style="display:flex; justify-content:space-between">
          <span>${data.display}</span>
          <strong>₹${data.total}</strong>
        </div>
      `;

      dayElement.onclick = () => openDayHistory(dateKey);

      breakdownDiv.appendChild(dayElement);
    });
}

// ================= DAY HISTORY MODAL =================
function openDayHistory(dateKey) {

  const data = daySalesMap[dateKey];
  if (!data) return;

  let cash = 0, upi = 0;
  let listHTML = '';

  data.sales.forEach(s => {

    if (s.payment === "Cash") cash += s.total;
    else upi += s.total;

    listHTML += `
      <div style="padding:10px 0;border-bottom:1px solid #eee;">
        <strong>${s.name}</strong><br>
        ₹${s.price} × ${s.qty} = ₹${s.total}<br>
        <small>${s.payment} • ${s.time}</small>
      </div>
    `;
  });

  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.right = "0";
  modal.style.bottom = "0";
  modal.style.background = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "9999";

  modal.innerHTML = `
    <div style="background:#fff;width:95%;max-width:400px;
                max-height:80vh;overflow:auto;
                border-radius:16px;padding:20px;">
      
      <h3>📅 ${data.display}</h3>
      <p><strong>Cash:</strong> ₹${cash}</p>
      <p><strong>UPI:</strong> ₹${upi}</p>
      <p><strong>Total:</strong> ₹${cash + upi}</p>

      ${listHTML}

      <button style="margin-top:15px;width:100%;
              padding:10px;border:none;
              border-radius:8px;background:#111;color:#fff;"
              id="closeDayHistory">
        Close
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("closeDayHistory").onclick = () => {
    document.body.removeChild(modal);
  };
}
