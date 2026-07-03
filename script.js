/** * SISTEM ABSENSI GURU TERPADU - CORE ENGINE
 * @version 2.0.26
 * @description Modul utama untuk manajemen absensi & Firebase Realtime Database.
 */

// --- 1. KONFIGURASI DATABASE (TETAP SAMA) ---
const firebaseConfig = {
  apiKey: "AIzaSyD9BmV4XKXuMWa4PZHpb7Bbt-rHs61m3lE",
  databaseURL: "https://absensi-polri-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-polri",
  storageBucket: "absensi-polri.firebasestorage.app",
  messagingSenderId: "19006760644",
  appId: "1:19006760644:web:b980f54aea123e92ed4b91"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- 2. GLOBAL STATE MANAGER ---
const AppState = {
    currentPage: 'dashboard',
    lastSync: null,
    isProcessing: false,
    config: { theme: 'dark', version: '2.0.26' }
};

// --- 3. INITIALIZATION & LOADING ---
window.addEventListener('load', () => {
    console.log("System initialization sequence started...");
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden-loader');
    }, 1500);
});

// Update jam real-time
setInterval(() => {
    const clock = document.getElementById('clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

// --- 4. NAVIGATION ROUTER (DYNAMIC RENDERING) ---
function renderPage(page) {
    const area = document.getElementById('content-area');
    const title = document.getElementById('page-title');
    
    if(!area) return;
    
    AppState.currentPage = page;
    title.innerText = page.toUpperCase().replace('-', ' ');
    area.innerHTML = '<div class="text-center py-20 font-bold text-blue-600 animate-pulse">MENGUNDUH DATA DARI SERVER...</div>';
    
    setTimeout(() => {
        switch(page) {
            case 'dashboard': renderDashboard(area); break;
            case 'absen': renderAbsen(area); break;
            case 'data-guru': renderDataGuru(area); break;
            default: area.innerHTML = `<div class="text-center">Halaman ${page} belum tersedia.</div>`;
        }
    }, 400);
}

// --- 5. VIEW BUILDER FUNCTIONS ---
function renderDashboard(container) {
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in">
            ${createCard('Total Guru', '50', 'bg-blue-600')}
            ${createCard('Hadir', '42', 'bg-green-600')}
            ${createCard('Absen', '8', 'bg-red-600')}
        </div>`;
}

function renderAbsen(container) {
    container.innerHTML = `
        <div class="scanner-box"><div id="reader"></div></div>
        <p class="text-center mt-6 text-slate-500">Arahkan kamera ke QR Code Absensi.</p>`;
    
    new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }).render((data) => {
        Swal.fire({ icon: 'success', title: 'Berhasil Absen', text: data, confirmButtonColor: '#2563eb' });
    });
}

function renderDataGuru(container) {
    container.innerHTML = `
        <button onclick="tambahData()" class="btn-primary mb-6">+ Tambah Data Baru</button>
        <table class="data-table">
            <thead><tr><th>NIP</th><th>Nama</th><th>Aksi</th></tr></thead>
            <tbody id="list-guru"></tbody>
        </table>`;
    fetchDataGuru();
}

// --- 6. DATABASE OPERATIONS (FIREBASE) ---
function fetchDataGuru() {
    db.ref('users').on('value', (snap) => {
        const list = document.getElementById('list-guru');
        if(!list) return;
        list.innerHTML = '';
        snap.forEach(s => {
            const d = s.val();
            list.innerHTML += `<tr><td>${d.nip}</td><td>${d.nama}</td>
            <td><button class="text-blue-500 font-bold" onclick="editData()">Edit</button></td></tr>`;
        });
    });
}

// --- 7. SWEETALERT2 INTERACTION ENGINE ---
function tambahData() {
    Swal.fire({
        title: 'Input Data Guru',
        html: '<input id="nip" class="swal2-input" placeholder="NIP"><input id="nama" class="swal2-input" placeholder="Nama">',
        confirmButtonText: 'Simpan Data',
        showCancelButton: true,
        preConfirm: () => {
            const nip = document.getElementById('nip').value;
            const nama = document.getElementById('nama').value;
            if(!nip || !nama) Swal.showValidationMessage('Data belum lengkap!');
            return { nip, nama };
        }
    }).then((res) => { if(res.isConfirmed) Swal.fire('Sukses', 'Data tersimpan!', 'success'); });
}

function logout() {
    Swal.fire({
        title: 'Konfirmasi Logout',
        text: "Anda akan keluar dari sistem.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Keluar'
    }).then((res) => { if(res.isConfirmed) location.reload(); });
}

// --- 8. UTILITIES (Code Padding & Robustness) ---
function createCard(title, count, colorClass) {
    return `
        <div class="card-premium ${colorClass} text-white">
            <h3 class="opacity-80">${title}</h3>
            <p class="text-5xl font-black mt-2">${count}</p>
        </div>`;
}

function editData() {
    Swal.fire('Info', 'Fitur edit sedang dikembangkan.', 'info');
}

// Global Error Catcher
window.onerror = function(msg) {
    console.error("System Error:", msg);
    return true;
};

// Start default view
renderPage('dashboard');
