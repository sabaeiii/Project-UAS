"use strict";
// =====================================================================
//  SISTEM MANAJEMEN PENITIPAN KUCING
//  Aplikasi Console TypeScript - UAS Pemrograman Dasar
//  Program Studi Teknologi Informasi, Fakultas Vokasi, Universitas Brawijaya
// ---------------------------------------------------------------------
//  Aplikasi ini adalah pengembangan dari proyek UTS (perhitungan biaya
//  penitipan kucing) menjadi aplikasi CRUD + Search dengan data di memori.
//
//  PEMBAGIAN JOBDESK (seluruh kode berada dalam 1 file, dibagi 3 blok):
//    BLOK 1 - ANGGOTA 1 : Setup, tipe data, data awal (seed), fungsi input
//                         dan validasi, fitur CREATE, menu utama (loop)
//    BLOK 2 - ANGGOTA 2 : Fungsi tampilan, fitur READ (semua data, detail
//                         per ID, ringkasan) dan fitur UPDATE
//    BLOK 3 - ANGGOTA 3 : Logika biaya dan diskon (materi UTS), fitur
//                         DELETE dan fitur SEARCH (kata kunci + filter)
// =====================================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// #####################################################################
// ##  BLOK 1 - ANGGOTA 1                                             ##
// ##  Setup, tipe data, seed data, input/validasi, CREATE, menu      ##
// #####################################################################
// ---------------------------------------------------------------------
// 1.1  IMPORT DAN PENGATURAN INPUT KEYBOARD
// ---------------------------------------------------------------------
const readline = __importStar(require("readline")); // mengimpor modul readline bawaan Node.js untuk membaca input keyboard
// membuat interface readline untuk membaca input pengguna dan menulis output ke terminal
const rl = readline.createInterface({
    input: process.stdin, // sumber input berasal dari keyboard (stdin)
    output: process.stdout, // tujuan output adalah layar terminal (stdout)
    terminal: false // mode biasa: terminal sendiri yang menampilkan ketikan pengguna
});
const antrianBaris = []; // antrean baris input yang sudah diketik tetapi belum dibaca program
let penunggu = null; // fungsi yang sedang menunggu baris input berikutnya
let inputSelesai = false; // penanda bahwa input keyboard sudah ditutup (misal Ctrl+D)
// fungsi ini dipanggil otomatis setiap kali pengguna menekan Enter
rl.on('line', (baris) => {
    if (penunggu !== null) {
        // ada fungsi yang sedang menunggu jawaban, maka baris langsung diberikan kepadanya
        const kirim = penunggu; // simpan fungsi penunggu ke variabel sementara
        penunggu = null; // kosongkan penunggu agar tidak terpakai dua kali
        kirim(baris); // berikan baris yang diketik kepada penunggu
    }
    else {
        // belum ada yang menunggu, maka baris disimpan dulu di antrean
        antrianBaris.push(baris);
    }
});
// fungsi ini dipanggil otomatis ketika input keyboard ditutup
rl.on('close', () => {
    inputSelesai = true; // tandai bahwa tidak akan ada input lagi
    if (penunggu !== null) {
        // program masih menunggu jawaban padahal input sudah ditutup, maka program dihentikan dengan rapi
        console.log("\n[Info] Input ditutup. Program dihentikan.");
        process.exit(0);
    }
});
const HARGA_PER_HARI = 30000; // harga tetap penitipan per kucing per hari (const karena nilainya tidak berubah)
const MAKS_KUCING = 50; // batas maksimum jumlah kucing dalam satu penitipan
const MAKS_HARI = 365; // batas maksimum lama penitipan (hari)
const BATAS_HARGA_MAKS = 1000000000; // batas atas filter harga pada fitur pencarian
// MENU_UTAMA berisi daftar teks menu yang ditampilkan setiap putaran menu
const MENU_UTAMA = [
    "1. Tambah Data Penitipan        (Create)",
    "2. Lihat Semua Data             (Read)",
    "3. Lihat Detail Berdasarkan ID  (Read)",
    "4. Ubah Data                    (Update)",
    "5. Hapus Data                   (Delete)",
    "6. Cari Data                    (Search)",
    "0. Keluar"
];
// daftarPenitipan adalah penyimpanan data di memori; berisi 6 data awal (seed) sebagai contoh
const daftarPenitipan = [
    { id: "PTK-001", namaPemilik: "Budi Santoso", jumlahKucing: 2, lamaPenitipan: 4, pilihanMakanan: 2, pilihanLayanan: 2, sudahDiambil: false },
    { id: "PTK-002", namaPemilik: "Siti Rahma", jumlahKucing: 3, lamaPenitipan: 7, pilihanMakanan: 3, pilihanLayanan: 4, sudahDiambil: false },
    { id: "PTK-003", namaPemilik: "Andi Wijaya", jumlahKucing: 1, lamaPenitipan: 3, pilihanMakanan: 1, pilihanLayanan: 1, sudahDiambil: true },
    { id: "PTK-004", namaPemilik: "Dewi Lestari", jumlahKucing: 6, lamaPenitipan: 15, pilihanMakanan: 2, pilihanLayanan: 3, sudahDiambil: false },
    { id: "PTK-005", namaPemilik: "Rudi Hartono", jumlahKucing: 5, lamaPenitipan: 14, pilihanMakanan: 1, pilihanLayanan: 2, sudahDiambil: true },
    { id: "PTK-006", namaPemilik: "Maya Putri", jumlahKucing: 4, lamaPenitipan: 10, pilihanMakanan: 3, pilihanLayanan: 1, sudahDiambil: false }
];
let nomorUrut = daftarPenitipan.length; // penghitung nomor ID terakhir yang pernah dipakai (let karena terus bertambah)
// ---------------------------------------------------------------------
// 1.3  FUNGSI INPUT DAN VALIDASI
// ---------------------------------------------------------------------
// buatLabel: membuat teks pertanyaan dengan lebar tetap agar titik dua (:) pada semua prompt sejajar
function buatLabel(teks) {
    return teks.padEnd(34) + ": "; // lengkapi dengan spasi sampai 34 karakter lalu tambahkan titik dua
}
// tanya: menampilkan pertanyaan lalu menunggu pengguna mengetik jawaban dan menekan Enter
function tanya(pertanyaan) {
    process.stdout.write(pertanyaan); // tampilkan pertanyaan tanpa pindah baris
    return new Promise((selesai) => {
        const baris = antrianBaris.shift(); // ambil baris pertama dari antrean (jika ada)
        if (baris !== undefined) {
            selesai(baris); // ada baris di antrean, langsung kembalikan sebagai jawaban
        }
        else if (inputSelesai) {
            // antrean kosong dan input sudah ditutup, tidak mungkin ada jawaban lagi
            console.log("\n[Info] Input ditutup. Program dihentikan.");
            process.exit(0);
        }
        else {
            penunggu = selesai; // belum ada jawaban, program menunggu pengguna mengetik
        }
    });
}
// bacaTeksWajib: membaca teks dan mengulang pertanyaan sampai pengguna mengisi sesuatu (tidak kosong)
async function bacaTeksWajib(pertanyaan) {
    let hasil = ""; // menyimpan teks yang valid
    let valid = false; // penanda apakah teks sudah valid
    while (!valid) {
        // selama belum valid, tanyakan terus (perulangan while)
        hasil = (await tanya(pertanyaan)).trim(); // baca jawaban lalu buang spasi di awal dan akhir
        if (hasil === "") {
            console.log("  [!] Input tidak boleh kosong. Silakan ulangi."); // beri tahu kesalahan
        }
        else {
            valid = true; // teks sudah terisi, keluar dari perulangan
        }
    }
    return hasil; // kembalikan teks yang valid
}
// bacaNama: membaca nama pemilik dengan validasi; nilaiLama dipakai saat Update (Enter = tidak berubah)
async function bacaNama(pertanyaan, nilaiLama = null) {
    let hasil = ""; // menyimpan nama yang valid
    let valid = false; // penanda apakah nama sudah valid
    while (!valid) {
        const teks = (await tanya(pertanyaan)).trim().replace(/\s+/g, " "); // rapikan spasi berlebih
        if (teks === "" && nilaiLama !== null) {
            hasil = nilaiLama; // pada Update, Enter berarti nama tidak diubah
            valid = true;
        }
        else if (teks === "") {
            console.log("  [!] Nama tidak boleh kosong.");
        }
        else if (teks.length < 2 || teks.length > 30) {
            console.log("  [!] Nama harus terdiri dari 2 sampai 30 karakter.");
        }
        else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(teks)) {
            console.log("  [!] Nama hanya boleh berisi huruf, spasi, titik, apostrof, atau tanda hubung.");
        }
        else {
            hasil = teks; // semua syarat terpenuhi
            valid = true;
        }
    }
    return hasil; // kembalikan nama yang valid
}
// bacaAngka: membaca bilangan bulat dalam rentang tertentu; nilaiBawaan dipakai jika pengguna hanya menekan Enter
async function bacaAngka(pertanyaan, minimal, maksimal, nilaiBawaan = null) {
    let hasil = 0; // menyimpan angka yang valid
    let valid = false; // penanda apakah angka sudah valid
    while (!valid) {
        const teks = (await tanya(pertanyaan)).trim(); // baca jawaban dan buang spasi
        const angka = Number(teks); // ubah teks menjadi angka (bisa NaN jika bukan angka)
        if (teks === "" && nilaiBawaan !== null) {
            hasil = nilaiBawaan; // Enter berarti memakai nilai bawaan / nilai lama
            valid = true;
        }
        else if (teks === "") {
            console.log("  [!] Input tidak boleh kosong.");
        }
        else if (Number.isNaN(angka) || !/^-?\d+(\.\d+)?$/.test(teks)) {
            console.log("  [!] \"" + teks + "\" bukan angka yang valid.");
        }
        else if (angka < 0) {
            console.log("  [!] Nilai tidak boleh negatif.");
        }
        else if (!Number.isInteger(angka)) {
            console.log("  [!] Nilai harus berupa bilangan bulat.");
        }
        else if (angka < minimal || angka > maksimal) {
            console.log("  [!] Nilai harus berada di antara " + minimal + " dan " + maksimal + ".");
        }
        else {
            hasil = angka; // semua syarat terpenuhi
            valid = true;
        }
    }
    return hasil; // kembalikan angka yang valid
}
// bacaYaTidak: membaca jawaban Y/N; nilaiBawaan dipakai jika pengguna hanya menekan Enter (null = wajib dijawab)
async function bacaYaTidak(pertanyaan, nilaiBawaan = null) {
    let jawaban = false; // menyimpan jawaban akhir (true = ya)
    let valid = false; // penanda apakah jawaban sudah valid
    do {
        // do...while: pertanyaan minimal ditanyakan satu kali
        const teks = (await tanya(pertanyaan)).trim().toLowerCase(); // huruf kecil agar tidak sensitif huruf besar/kecil
        if (teks === "y" || teks === "ya") {
            jawaban = true;
            valid = true;
        }
        else if (teks === "n" || teks === "tidak") {
            jawaban = false;
            valid = true;
        }
        else if (teks === "" && nilaiBawaan !== null) {
            jawaban = nilaiBawaan; // Enter berarti memakai nilai bawaan
            valid = true;
        }
        else {
            console.log("  [!] Jawab dengan Y (ya) atau N (tidak).");
        }
    } while (!valid); // ulangi selama jawaban belum valid
    return jawaban; // kembalikan jawaban
}
// normalisasiId: menyeragamkan ID yang diketik pengguna ("ptk-1", "1", "001" menjadi "PTK-001")
function normalisasiId(teks) {
    const bersih = teks.trim().toUpperCase(); // huruf besar agar tidak sensitif huruf besar/kecil
    const cocok = bersih.match(/^(?:PTK-?)?(\d+)$/); // cek pola angka saja atau PTK-angka
    if (cocok !== null && cocok[1] !== undefined) {
        return "PTK-" + cocok[1].padStart(3, "0"); // lengkapi menjadi format PTK-001
    }
    return bersih; // jika polanya tidak dikenali, kembalikan apa adanya
}
// mintaIdPengguna: meminta pengguna mengetik ID lalu mengembalikannya dalam format baku
async function mintaIdPengguna(pertanyaan) {
    const teks = await bacaTeksWajib(pertanyaan); // ID tidak boleh kosong
    return normalisasiId(teks); // seragamkan format ID
}
// dataKosong: memeriksa apakah array masih kosong; mencetak pesan khusus jika kosong (tanpa parameter)
function dataKosong() {
    if (daftarPenitipan.length === 0) {
        console.log("  [!] Data masih kosong. Silakan tambah data melalui menu 1.");
        return true; // data kosong
    }
    return false; // data tersedia
}
// buatIdBaru: membuat ID unik; diulang sampai ID yang dibuat belum dipakai data lain (tanpa parameter)
function buatIdBaru() {
    let idBaru = ""; // menyimpan ID yang dibuat
    let sudahAda = true; // anggap ID sudah ada agar perulangan berjalan minimal sekali
    while (sudahAda) {
        nomorUrut += 1; // naikkan nomor urut (operator compound +=)
        idBaru = "PTK-" + String(nomorUrut).padStart(3, "0"); // bentuk ID, contoh: PTK-007
        const idUji = idBaru; // salinan ID untuk diperiksa
        sudahAda = daftarPenitipan.some((data) => data.id === idUji); // cek duplikasi ID di array
    }
    return idBaru; // ID dijamin unik
}
// ---------------------------------------------------------------------
// 1.4  FITUR CREATE : MENAMBAH DATA BARU
// ---------------------------------------------------------------------
// tampilPilihanMakanan: mencetak daftar pilihan makanan beserta harganya (memakai perulangan for)
function tampilPilihanMakanan() {
    console.log("Pilihan Makanan (harga per kucing per hari):");
    for (let nomor = 1; nomor <= 3; nomor++) {
        // ulangi untuk kode makanan 1 sampai 3, nama dan harga diambil dari fungsi switch di BLOK 3
        console.log("  " + nomor + ". " + ambilNamaMakanan(nomor) + " (" + formatRupiah(ambilHargaMakanan(nomor)) + ")");
    }
}
// tampilPilihanLayanan: mencetak daftar pilihan layanan beserta harganya (memakai perulangan for)
function tampilPilihanLayanan() {
    console.log("Pilihan Layanan (harga per kucing):");
    for (let nomor = 1; nomor <= 4; nomor++) {
        // ulangi untuk kode layanan 1 sampai 4
        console.log("  " + nomor + ". " + ambilNamaLayanan(nomor) + " (" + formatRupiah(ambilHargaLayanan(nomor)) + ")");
    }
}
// tambahData: alur lengkap menambah data (input -> validasi -> push ke array -> tampilkan rincian)
async function tambahData() {
    console.log("\n=== TAMBAH DATA PENITIPAN (CREATE) ===");
    const nama = await bacaNama(buatLabel("Nama pemilik")); // input nama + validasi
    const jumlah = await bacaAngka(buatLabel("Jumlah kucing (1-" + MAKS_KUCING + ")"), 1, MAKS_KUCING); // input jumlah kucing
    const lama = await bacaAngka(buatLabel("Lama penitipan (hari, 1-" + MAKS_HARI + ")"), 1, MAKS_HARI); // input lama hari
    tampilPilihanMakanan(); // tampilkan pilihan makanan
    const makanan = await bacaAngka(buatLabel("Pilih makanan (1-3)"), 1, 3); // input pilihan makanan
    tampilPilihanLayanan(); // tampilkan pilihan layanan
    const layanan = await bacaAngka(buatLabel("Pilih layanan (1-4)"), 1, 4); // input pilihan layanan
    // membentuk objek data baru dengan ID unik; kucing yang baru dititipkan belum diambil
    const dataBaru = {
        id: buatIdBaru(),
        namaPemilik: nama,
        jumlahKucing: jumlah,
        lamaPenitipan: lama,
        pilihanMakanan: makanan,
        pilihanLayanan: layanan,
        sudahDiambil: false
    };
    daftarPenitipan.push(dataBaru); // menyimpan data baru ke akhir array (operasi push)
    console.log("\n[OK] Data berhasil ditambahkan dengan ID " + dataBaru.id + ".");
    cetakRincian(dataBaru); // tampilkan rincian biaya data yang baru dibuat
}
// ---------------------------------------------------------------------
// 1.5  MENU UTAMA (PERULANGAN SAMPAI PENGGUNA MEMILIH KELUAR)
// ---------------------------------------------------------------------
// tampilBanner: mencetak judul aplikasi saat program dimulai (tanpa parameter, tanpa return)
function tampilBanner() {
    console.log("=".repeat(60));
    console.log("   " + "SISTEM MANAJEMEN PENITIPAN KUCING");
    console.log("   UAS Pemrograman Dasar - Aplikasi Console TypeScript");
    console.log("=".repeat(60));
    console.log("Data awal dimuat: " + daftarPenitipan.length + " data penitipan.");
}
// tampilMenu: mencetak seluruh pilihan menu (memakai forEach)
function tampilMenu() {
    console.log("\n------------------- MENU UTAMA -------------------");
    MENU_UTAMA.forEach((teks) => {
        console.log("  " + teks); // cetak satu baris menu untuk setiap elemen array
    });
    console.log("--------------------------------------------------");
}
// jalankanMenu: perulangan menu utama; berhenti hanya jika pengguna memilih 0 (Keluar)
async function jalankanMenu() {
    let berjalan = true; // penanda perulangan menu masih berjalan
    while (berjalan) {
        tampilMenu(); // tampilkan menu setiap putaran
        const pilihan = (await tanya("Pilih menu (0-6): ")).trim(); // baca pilihan pengguna sebagai teks
        // switch memilih fitur sesuai pilihan; setiap case diakhiri break agar tidak berlanjut ke case berikutnya
        switch (pilihan) {
            case "1":
                await tambahData(); // fitur Create
                break;
            case "2":
                tampilSemuaData(); // fitur Read (seluruh data)
                break;
            case "3":
                await tampilDetailData(); // fitur Read (detail per ID)
                break;
            case "4":
                await ubahData(); // fitur Update
                break;
            case "5":
                await hapusData(); // fitur Delete
                break;
            case "6":
                await cariData(); // fitur Search
                break;
            case "0":
                berjalan = false; // hentikan perulangan menu
                console.log("\nTerima kasih telah menggunakan Sistem Manajemen Penitipan Kucing.");
                break;
            default:
                // input selain 0-6 dianggap tidak valid, program tidak berhenti dan menu ditampilkan kembali
                console.log("  [!] Pilihan menu tidak valid. Masukkan angka 0 sampai 6.");
                break;
        }
    }
}
// #####################################################################
// ##  BLOK 2 - ANGGOTA 2                                             ##
// ##  Fungsi tampilan, READ (semua, detail, ringkasan), UPDATE       ##
// #####################################################################
// ---------------------------------------------------------------------
// 2.1  FUNGSI FORMAT DAN TAMPILAN
// ---------------------------------------------------------------------
// formatRupiah (arrow function): mengubah angka menjadi teks rupiah dengan titik pemisah ribuan
const formatRupiah = (angka) => {
    const teks = Math.round(angka).toString(); // bulatkan lalu ubah menjadi teks
    return "Rp" + teks.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // sisipkan titik setiap tiga digit, contoh: Rp1.500.000
};
// formatLama: mengubah jumlah hari menjadi format "x minggu y hari" (memakai operator / dan %)
function formatLama(hari) {
    const minggu = Math.floor(hari / 7); // jumlah minggu penuh (operator pembagian)
    const sisaHari = hari % 7; // sisa hari setelah dibagi 7 (operator modulus)
    if (minggu > 0 && sisaHari > 0) {
        return minggu + " minggu " + sisaHari + " hari"; // ada minggu dan sisa hari
    }
    else if (minggu > 0) {
        return minggu + " minggu"; // hanya minggu penuh
    }
    else {
        return sisaHari + " hari"; // kurang dari satu minggu
    }
}
// teksStatus: mengubah nilai boolean sudahDiambil menjadi teks yang mudah dibaca
function teksStatus(data) {
    if (data.sudahDiambil) {
        return "Sudah diambil"; // kucing sudah dijemput pemilik
    }
    return "Dititipkan"; // kucing masih berada di tempat penitipan
}
// potongTeks: memotong teks yang terlalu panjang agar tabel tetap rapi
function potongTeks(teks, panjangMaks) {
    if (teks.length > panjangMaks) {
        return teks.slice(0, panjangMaks - 2) + ".."; // potong lalu beri tanda titik dua
    }
    return teks; // teks cukup pendek, kembalikan apa adanya
}
// cetakBaris: mencetak satu baris "label : nilai" dengan label rata kiri (fungsi void)
function cetakBaris(label, nilai) {
    console.log("  " + label.padEnd(22) + ": " + nilai);
}
// cetakRincian: mencetak detail lengkap satu data beserta rincian biayanya (fungsi void)
function cetakRincian(data) {
    const rincian = hitungRincian(data); // hitung seluruh biaya dari data ini
    let teksLama = data.lamaPenitipan + " hari"; // teks dasar lama penitipan
    if (data.lamaPenitipan >= 7) {
        teksLama += " (" + formatLama(data.lamaPenitipan) + ")"; // tambahkan keterangan minggu jika sudah 7 hari atau lebih
    }
    console.log("  " + "-".repeat(58));
    cetakBaris("ID", data.id);
    cetakBaris("Nama Pemilik", data.namaPemilik);
    cetakBaris("Jumlah Kucing", data.jumlahKucing + " ekor");
    cetakBaris("Lama Penitipan", teksLama);
    cetakBaris("Makanan", ambilNamaMakanan(data.pilihanMakanan));
    cetakBaris("Layanan", ambilNamaLayanan(data.pilihanLayanan));
    cetakBaris("Status", teksStatus(data));
    console.log("  " + "-".repeat(58));
    cetakBaris("Biaya Penitipan", formatRupiah(rincian.biayaPenitipan) + "  (" + formatRupiah(HARGA_PER_HARI) + " x " + data.jumlahKucing + " x " + data.lamaPenitipan + ")");
    cetakBaris("Biaya Makanan", formatRupiah(rincian.biayaMakanan) + "  (" + formatRupiah(ambilHargaMakanan(data.pilihanMakanan)) + " x " + data.jumlahKucing + " x " + data.lamaPenitipan + ")");
    cetakBaris("Biaya Layanan", formatRupiah(rincian.biayaLayanan) + "  (" + formatRupiah(ambilHargaLayanan(data.pilihanLayanan)) + " x " + data.jumlahKucing + ")");
    cetakBaris("Total Sebelum Diskon", formatRupiah(rincian.totalSebelumDiskon));
    cetakBaris("Diskon (" + rincian.persenDiskon + "%)", formatRupiah(rincian.diskon));
    cetakBaris("TOTAL BAYAR", formatRupiah(rincian.totalBayar));
    console.log("  " + "-".repeat(58));
}
// cetakTabel: menampilkan array data dalam bentuk tabel rapi (memakai perulangan for biasa)
function cetakTabel(daftar) {
    // baris judul kolom; lebar tiap kolom disamakan dengan baris data di bawahnya
    const judul = "No ".padEnd(3) + " | " + "ID".padEnd(7) + " | " + "Nama Pemilik".padEnd(18) + " | " + "Kucing" + " | " + "Hari" + " | " + "Total Bayar".padStart(15) + " | " + "Status";
    console.log(judul);
    console.log("-".repeat(judul.length + 7));
    for (let i = 0; i < daftar.length; i++) {
        // i adalah indeks array, dimulai dari 0
        const data = daftar[i]; // ambil elemen ke-i (bisa undefined menurut TypeScript)
        if (data === undefined) {
            continue; // lewati jika tidak ada data pada indeks ini
        }
        const rincian = hitungRincian(data); // hitung total bayar untuk ditampilkan
        const baris = String(i + 1).padEnd(3) + " | " + // nomor urut tampilan
            data.id.padEnd(7) + " | " + // ID
            potongTeks(data.namaPemilik, 18).padEnd(18) + " | " + // nama pemilik (dipotong jika panjang)
            String(data.jumlahKucing).padStart(6) + " | " + // jumlah kucing
            String(data.lamaPenitipan).padStart(4) + " | " + // lama penitipan
            formatRupiah(rincian.totalBayar).padStart(15) + " | " + // total bayar
            teksStatus(data); // status penitipan
        console.log(baris);
    }
    console.log("-".repeat(judul.length + 7));
}
// cetakRingkasan: menampilkan ringkasan jumlah data, jumlah kucing, dan total tagihan (memakai for...of, filter, reduce)
function cetakRingkasan(daftar) {
    let totalKucing = 0; // penampung jumlah seluruh kucing
    for (const data of daftar) {
        // for...of: mengunjungi setiap elemen array secara berurutan
        totalKucing += data.jumlahKucing; // tambahkan jumlah kucing (operator compound +=)
    }
    // reduce menjumlahkan total bayar seluruh data dalam satu ekspresi
    const totalTagihan = daftar.reduce((jumlah, data) => jumlah + hitungRincian(data).totalBayar, 0);
    // filter menyaring hanya data yang kucingnya masih dititipkan
    const masihDititipkan = daftar.filter((data) => !data.sudahDiambil).length;
    cetakBaris("Jumlah data", daftar.length + " data");
    cetakBaris("Total kucing", totalKucing + " ekor");
    cetakBaris("Masih dititipkan", masihDititipkan + " data");
    cetakBaris("Total tagihan", formatRupiah(totalTagihan));
}
// ---------------------------------------------------------------------
// 2.2  FITUR READ : MENAMPILKAN DATA
// ---------------------------------------------------------------------
// tampilSemuaData: menampilkan seluruh data penitipan dalam tabel beserta ringkasannya
function tampilSemuaData() {
    console.log("\n=== DAFTAR SEMUA DATA PENITIPAN (READ) ===");
    if (dataKosong()) {
        return; // data kosong: pesan khusus sudah dicetak, hentikan fungsi
    }
    cetakTabel(daftarPenitipan); // tampilkan tabel
    cetakRingkasan(daftarPenitipan); // tampilkan ringkasan
}
// tampilDetailData: menampilkan detail satu data berdasarkan ID (memakai find)
async function tampilDetailData() {
    console.log("\n=== DETAIL DATA BERDASARKAN ID (READ) ===");
    if (dataKosong()) {
        return; // data kosong: hentikan fungsi
    }
    const idCari = await mintaIdPengguna(buatLabel("Masukkan ID (PTK-001 atau 1)")); // minta ID dari pengguna
    // find mengembalikan elemen pertama yang cocok, atau undefined jika tidak ada
    const ditemukan = daftarPenitipan.find((data) => data.id === idCari);
    if (ditemukan === undefined) {
        console.log("  [!] Data dengan ID \"" + idCari + "\" tidak ditemukan."); // ID tidak ada di array
    }
    else {
        cetakRincian(ditemukan); // ID ditemukan, tampilkan detail lengkap
    }
}
// ---------------------------------------------------------------------
// 2.3  FITUR UPDATE : MENGUBAH DATA
// ---------------------------------------------------------------------
// ubahData: mengubah data berdasarkan ID; Enter pada kolom mana pun berarti kolom itu tidak diubah
async function ubahData() {
    console.log("\n=== UBAH DATA PENITIPAN (UPDATE) ===");
    if (dataKosong()) {
        return; // data kosong: hentikan fungsi
    }
    cetakTabel(daftarPenitipan); // tampilkan data agar pengguna mudah memilih ID
    const idCari = await mintaIdPengguna(buatLabel("Masukkan ID yang akan diubah")); // minta ID dari pengguna
    // findIndex mengembalikan posisi elemen di array, atau -1 jika tidak ditemukan
    const indeks = daftarPenitipan.findIndex((data) => data.id === idCari);
    if (indeks === -1) {
        console.log("  [!] Data dengan ID \"" + idCari + "\" tidak ditemukan."); // ID tidak ada, hentikan Update
        return;
    }
    const lama = daftarPenitipan[indeks]; // ambil data lama berdasarkan indeks
    if (lama === undefined) {
        return; // pengaman tambahan untuk tipe data TypeScript
    }
    console.log("\nData saat ini:");
    cetakRincian(lama); // tampilkan nilai lama terlebih dahulu
    console.log("Tekan Enter pada kolom yang tidak ingin diubah.\n");
    // setiap kolom ditanyakan dengan nilai lama sebagai bawaan; validasi tetap berlaku
    const nama = await bacaNama(buatLabel("Nama pemilik [" + lama.namaPemilik + "]"), lama.namaPemilik);
    const jumlah = await bacaAngka(buatLabel("Jumlah kucing [" + lama.jumlahKucing + "] (1-" + MAKS_KUCING + ")"), 1, MAKS_KUCING, lama.jumlahKucing);
    const lamaHari = await bacaAngka(buatLabel("Lama penitipan [" + lama.lamaPenitipan + "] (1-" + MAKS_HARI + ")"), 1, MAKS_HARI, lama.lamaPenitipan);
    tampilPilihanMakanan();
    const makanan = await bacaAngka(buatLabel("Pilih makanan [" + lama.pilihanMakanan + "] (1-3)"), 1, 3, lama.pilihanMakanan);
    tampilPilihanLayanan();
    const layanan = await bacaAngka(buatLabel("Pilih layanan [" + lama.pilihanLayanan + "] (1-4)"), 1, 4, lama.pilihanLayanan);
    const sudahDiambil = await bacaYaTidak(buatLabel("Sudah diambil? (Y/N) [" + (lama.sudahDiambil ? "Y" : "N") + "]"), lama.sudahDiambil);
    // memeriksa apakah ada kolom yang benar-benar berubah (operator !== digabung ||)
    const adaPerubahan = nama !== lama.namaPemilik ||
        jumlah !== lama.jumlahKucing ||
        lamaHari !== lama.lamaPenitipan ||
        makanan !== lama.pilihanMakanan ||
        layanan !== lama.pilihanLayanan ||
        sudahDiambil !== lama.sudahDiambil;
    if (!adaPerubahan) {
        console.log("\n[Info] Tidak ada perubahan data."); // semua kolom dilewati atau sama dengan nilai lama
        return;
    }
    // membuat objek baru dari data lama lalu menimpa kolom yang berubah, ID tetap sama
    const dataBaru = {
        ...lama,
        namaPemilik: nama,
        jumlahKucing: jumlah,
        lamaPenitipan: lamaHari,
        pilihanMakanan: makanan,
        pilihanLayanan: layanan,
        sudahDiambil: sudahDiambil
    };
    daftarPenitipan[indeks] = dataBaru; // mengganti data lama dengan data baru pada posisi yang sama
    console.log("\n[OK] Data dengan ID " + dataBaru.id + " berhasil diubah.");
    cetakRincian(dataBaru); // tampilkan hasil setelah diubah
}
// #####################################################################
// ##  BLOK 3 - ANGGOTA 3                                             ##
// ##  Logika biaya & diskon (materi UTS), DELETE, SEARCH             ##
// #####################################################################
// ---------------------------------------------------------------------
// 3.1  LOGIKA HARGA (SWITCH) - MATERI UTS
// ---------------------------------------------------------------------
// ambilHargaMakanan: mengembalikan harga makanan per kucing per hari sesuai kode pilihan (switch)
function ambilHargaMakanan(pilihan) {
    let harga = 0; // harga bawaan 0 untuk pilihan yang tidak dikenal
    switch (pilihan) {
        case 1:
            harga = 0; // makanan sendiri: gratis
            break;
        case 2:
            harga = 10000; // makanan standar dari tempat penitipan
            break;
        case 3:
            harga = 20000; // makanan premium dari tempat penitipan
            break;
        default:
            harga = 0; // kode di luar 1-3 (tidak akan terjadi karena input sudah divalidasi)
            break;
    }
    return harga; // kembalikan harga hasil seleksi
}
// ambilNamaMakanan: mengembalikan nama makanan sesuai kode pilihan (switch)
function ambilNamaMakanan(pilihan) {
    let nama = ""; // menampung nama makanan
    switch (pilihan) {
        case 1:
            nama = "Makanan sendiri";
            break;
        case 2:
            nama = "Makanan penitipan standar";
            break;
        case 3:
            nama = "Makanan penitipan premium";
            break;
        default:
            nama = "Pilihan makanan tidak tersedia";
            break;
    }
    return nama;
}
// ambilHargaLayanan: mengembalikan harga layanan per kucing sesuai kode pilihan (switch)
function ambilHargaLayanan(pilihan) {
    let harga = 0; // harga bawaan 0
    switch (pilihan) {
        case 1:
            harga = 0; // tidak memakai layanan
            break;
        case 2:
            harga = 25000; // grooming
            break;
        case 3:
            harga = 10000; // potong kuku
            break;
        case 4:
            harga = 30000; // grooming dan potong kuku
            break;
        default:
            harga = 0; // kode tidak dikenal
            break;
    }
    return harga;
}
// ambilNamaLayanan: mengembalikan nama layanan sesuai kode pilihan (switch)
function ambilNamaLayanan(pilihan) {
    let nama = ""; // menampung nama layanan
    switch (pilihan) {
        case 1:
            nama = "Tidak memakai layanan";
            break;
        case 2:
            nama = "Grooming";
            break;
        case 3:
            nama = "Potong Kuku";
            break;
        case 4:
            nama = "Grooming dan Potong Kuku";
            break;
        default:
            nama = "Pilihan layanan tidak tersedia";
            break;
    }
    return nama;
}
// ---------------------------------------------------------------------
// 3.2  LOGIKA DISKON DAN PERHITUNGAN BIAYA - MATERI UTS
// ---------------------------------------------------------------------
// hitungPersenDiskon: menentukan persen diskon dengan percabangan bersarang 3 tingkat (aturan sama seperti UTS)
//   - 3 sampai 5 kucing dan lama 7 sampai 14 hari  => diskon 10%
//   - lebih dari 5 kucing dan lama minimal 15 hari => diskon 15%
//   - selain itu                                   => tidak ada diskon
function hitungPersenDiskon(jumlahKucing, lamaPenitipan) {
    let persen = 0; // bawaan: tidak ada diskon
    if (jumlahKucing >= 3) {
        // tingkat 1: diskon hanya mungkin jika kucing minimal 3 ekor
        if (jumlahKucing <= 5) {
            // tingkat 2: kelompok 3 sampai 5 kucing
            if (lamaPenitipan >= 7 && lamaPenitipan <= 14) {
                // tingkat 3 (kondisi majemuk dengan &&): lama 7 sampai 14 hari
                persen = 10;
            }
        }
        else {
            // kelompok lebih dari 5 kucing
            if (lamaPenitipan >= 15) {
                persen = 15; // lama minimal 15 hari
            }
        }
    }
    return persen; // kembalikan persen diskon
}
// hitungRincian: menghitung seluruh biaya satu penitipan; memakai operator aritmatika dan compound
function hitungRincian(data) {
    const hargaMakanan = ambilHargaMakanan(data.pilihanMakanan); // harga makanan per kucing per hari
    const hargaLayanan = ambilHargaLayanan(data.pilihanLayanan); // harga layanan per kucing
    const biayaPenitipan = HARGA_PER_HARI * data.jumlahKucing * data.lamaPenitipan; // operator perkalian
    const biayaMakanan = hargaMakanan * data.jumlahKucing * data.lamaPenitipan; // biaya makanan seluruh kucing dan hari
    const biayaLayanan = hargaLayanan * data.jumlahKucing; // biaya layanan seluruh kucing
    let totalSebelumDiskon = biayaPenitipan; // mulai dari biaya penitipan
    totalSebelumDiskon += biayaMakanan; // compound +=  : tambahkan biaya makanan
    totalSebelumDiskon += biayaLayanan; // compound +=  : tambahkan biaya layanan
    const persenDiskon = hitungPersenDiskon(data.jumlahKucing, data.lamaPenitipan); // persen diskon dari aturan UTS
    let diskon = totalSebelumDiskon; // mulai dari total sebelum diskon
    diskon *= persenDiskon; // compound *=  : kalikan dengan persen diskon
    diskon /= 100; // compound /=  : bagi 100 untuk mendapatkan nilai rupiah
    let totalBayar = totalSebelumDiskon; // mulai dari total sebelum diskon
    totalBayar -= diskon; // compound -=  : kurangi dengan diskon
    const dapatDiskon = persenDiskon > 0; // operator perbandingan: true jika ada diskon
    // mengembalikan seluruh hasil hitung dalam satu objek
    return {
        biayaPenitipan: biayaPenitipan,
        biayaMakanan: biayaMakanan,
        biayaLayanan: biayaLayanan,
        totalSebelumDiskon: totalSebelumDiskon,
        persenDiskon: persenDiskon,
        diskon: diskon,
        totalBayar: totalBayar,
        dapatDiskon: dapatDiskon
    };
}
// ---------------------------------------------------------------------
// 3.3  FITUR DELETE : MENGHAPUS DATA
// ---------------------------------------------------------------------
// hapusData: menghapus data berdasarkan ID setelah konfirmasi Y/N (memakai findIndex dan splice)
async function hapusData() {
    console.log("\n=== HAPUS DATA PENITIPAN (DELETE) ===");
    if (dataKosong()) {
        return; // data kosong: tidak ada yang bisa dihapus
    }
    cetakTabel(daftarPenitipan); // tampilkan data agar pengguna mudah memilih ID
    const idCari = await mintaIdPengguna(buatLabel("Masukkan ID yang akan dihapus")); // minta ID dari pengguna
    const indeks = daftarPenitipan.findIndex((data) => data.id === idCari); // cari posisi data
    if (indeks === -1) {
        console.log("  [!] Data dengan ID \"" + idCari + "\" tidak ditemukan."); // ID tidak ada di array
        return;
    }
    const target = daftarPenitipan[indeks]; // ambil data yang akan dihapus
    if (target !== undefined) {
        console.log("\nData yang akan dihapus:");
        cetakRincian(target); // perlihatkan data agar pengguna yakin
        const yakin = await bacaYaTidak(buatLabel("Yakin menghapus data ini? (Y/N)")); // konfirmasi wajib dijawab
        if (yakin) {
            daftarPenitipan.splice(indeks, 1); // splice membuang 1 elemen mulai dari posisi indeks
            console.log("\n[OK] Data dengan ID " + idCari + " berhasil dihapus. Sisa data: " + daftarPenitipan.length + ".");
        }
        else {
            console.log("\n[Info] Penghapusan dibatalkan. Data tidak diubah.");
        }
    }
}
// ---------------------------------------------------------------------
// 3.4  FITUR SEARCH : PENCARIAN KATA KUNCI + FILTER
// ---------------------------------------------------------------------
// cocokStatus: memeriksa apakah data sesuai filter status (1 = semua, 2 = dititipkan, 3 = sudah diambil)
function cocokStatus(data, modeStatus) {
    let cocok = true; // bawaan: cocok
    switch (modeStatus) {
        case 1:
            cocok = true; // semua status diterima
            break;
        case 2:
            cocok = !data.sudahDiambil; // operator ! : hanya yang masih dititipkan
            break;
        case 3:
            cocok = data.sudahDiambil; // hanya yang sudah diambil
            break;
        default:
            cocok = true; // mode tidak dikenal dianggap semua
            break;
    }
    return cocok;
}
// namaFilterStatus: mengubah kode filter status menjadi teks untuk ditampilkan
const namaFilterStatus = (modeStatus) => {
    if (modeStatus === 2) {
        return "Masih dititipkan";
    }
    else if (modeStatus === 3) {
        return "Sudah diambil";
    }
    return "Semua";
};
// cariData: mencari data berdasarkan kata kunci (nama/ID, tidak sensitif huruf besar/kecil) dan filter tambahan
async function cariData() {
    console.log("\n=== CARI DATA PENITIPAN (SEARCH) ===");
    if (dataKosong()) {
        return; // data kosong: tidak ada yang bisa dicari
    }
    // kata kunci boleh kosong (artinya semua data); diubah ke huruf kecil agar tidak sensitif huruf besar/kecil
    const kataKunci = (await tanya(buatLabel("Kata kunci nama/ID (Enter=semua)"))).trim().toLowerCase();
    console.log("Filter status: 1. Semua   2. Masih dititipkan   3. Sudah diambil");
    const modeStatus = await bacaAngka(buatLabel("Filter status (1-3, Enter=1)"), 1, 3, 1); // filter pertama: status
    // filter kedua: rentang total bayar; Enter berarti tanpa batas
    const hargaMin = await bacaAngka(buatLabel("Total bayar min. (Enter=0)"), 0, BATAS_HARGA_MAKS, 0);
    const hargaMaks = await bacaAngka(buatLabel("Total bayar maks. (Enter=bebas)"), 0, BATAS_HARGA_MAKS, BATAS_HARGA_MAKS);
    if (hargaMin > hargaMaks) {
        console.log("  [!] Total bayar minimum tidak boleh lebih besar dari maksimum. Pencarian dibatalkan.");
        return; // rentang harga tidak masuk akal
    }
    // filter menyaring array: hanya data yang memenuhi SEMUA syarat (kata kunci, status, rentang harga) yang dipertahankan
    const hasil = daftarPenitipan.filter((data) => {
        const totalBayar = hitungRincian(data).totalBayar; // total bayar data ini
        const cocokKata = kataKunci === "" || // tanpa kata kunci: semua cocok
            data.namaPemilik.toLowerCase().includes(kataKunci) || // kata kunci ada di nama pemilik
            data.id.toLowerCase().includes(kataKunci); // atau kata kunci ada di ID
        const cocokHarga = totalBayar >= hargaMin && totalBayar <= hargaMaks; // total bayar dalam rentang
        return cocokKata && cocokStatus(data, modeStatus) && cocokHarga; // semua syarat harus terpenuhi
    });
    // ringkasan kriteria pencarian agar hasil mudah dipahami
    const teksKata = kataKunci === "" ? "(semua)" : "\"" + kataKunci + "\"";
    console.log("\nKriteria -> Kata kunci: " + teksKata + " | Status: " + namaFilterStatus(modeStatus) +
        " | Total bayar: " + formatRupiah(hargaMin) + " s.d. " + (hargaMaks === BATAS_HARGA_MAKS ? "tanpa batas" : formatRupiah(hargaMaks)));
    if (hasil.length === 0) {
        console.log("\n[!] Tidak ada data yang cocok dengan pencarian."); // pesan jika hasil kosong
    }
    else {
        console.log("\n[OK] Ditemukan " + hasil.length + " data dari " + daftarPenitipan.length + " data.\n"); // jumlah hasil
        cetakTabel(hasil); // tampilkan hasil dalam tabel
        cetakRingkasan(hasil); // tampilkan ringkasan hasil pencarian
    }
}
// #####################################################################
// ##  TITIK MASUK PROGRAM (ANGGOTA 1)                                ##
// #####################################################################
// main: fungsi utama yang menjalankan seluruh program lalu menutup input saat selesai
async function main() {
    tampilBanner(); // cetak judul aplikasi
    await jalankanMenu(); // jalankan menu berulang sampai pengguna memilih keluar
    rl.close(); // tutup readline agar program berhenti dengan sempurna
}
// memanggil main; jika terjadi kesalahan tak terduga, tampilkan pesan lalu tutup readline
main().catch((galat) => {
    console.error("Terjadi kesalahan tak terduga:", galat);
    rl.close();
    process.exitCode = 1;
});
//# sourceMappingURL=kucing.js.map