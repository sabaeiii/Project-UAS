import * as readline from 'readline';
import { cetakRincian, tampilPilihanMakanan, tampilPilihanLayanan } from './tampilan';
import { JUMLAH_PILIHAN_MAKANAN, JUMLAH_PILIHAN_LAYANAN } from './perhitungan';

const rl: readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// input dibaca per baris lewat event, jadi perlu antrean supaya baris yang
// datang sebelum ada pertanyaan (misal saat input di-paste) tidak hilang
const antrianBaris: string[] = [];
let penunggu: ((baris: string) => void) | null = null;
let inputSelesai: boolean = false;

rl.on('line', (baris: string): void => {
    if (penunggu !== null) {
        const kirim: (baris: string) => void = penunggu;
        penunggu = null;
        kirim(baris);
    } else {
        antrianBaris.push(baris);
    }
});

rl.on('close', (): void => {
    inputSelesai = true;
    if (penunggu !== null) {
        console.log("\n[Info] Input ditutup. Program dihentikan.");
        process.exit(0);
    }
});

// satu transaksi penitipan
export interface DataPenitipan {
    id: string;
    namaPemilik: string;
    jumlahKucing: number;
    lamaPenitipan: number;  // dalam hari
    pilihanMakanan: number; // 1 sendiri, 2 standar, 3 premium
    pilihanLayanan: number; // 1 tidak ada, 2 grooming, 3 potong kuku, 4 keduanya
    sudahDiambil: boolean;
}

// hasil hitung biaya satu penitipan
export interface RincianBiaya {
    biayaPenitipan: number;
    biayaMakanan: number;
    biayaLayanan: number;
    totalSebelumDiskon: number;
    persenDiskon: number;
    diskon: number;
    totalBayar: number;
    dapatDiskon: boolean;
}

export const HARGA_PER_HARI: number = 30000; // per kucing per hari
const MAKS_KUCING: number = 50;
const MAKS_HARI: number = 365;

const MENU_UTAMA: string[] = [
    "1. Tambah Data Penitipan        (Create)",
    "2. Lihat Semua Data             (Read)",
    "3. Lihat Detail Berdasarkan ID  (Read)",
    "4. Ubah Data                    (Update)",
    "5. Hapus Data                   (Delete)",
    "6. Cari Data                    (Search)",
    "0. Keluar"
];

// data awal, disimpan di memori (belum pakai database)
export const daftarPenitipan: DataPenitipan[] = [
    { id: "PTK-001", namaPemilik: "Budi Santoso", jumlahKucing: 2, lamaPenitipan: 4, pilihanMakanan: 2, pilihanLayanan: 2, sudahDiambil: false },
    { id: "PTK-002", namaPemilik: "Siti Rahma", jumlahKucing: 3, lamaPenitipan: 7, pilihanMakanan: 3, pilihanLayanan: 4, sudahDiambil: false },
    { id: "PTK-003", namaPemilik: "Andi Wijaya", jumlahKucing: 1, lamaPenitipan: 3, pilihanMakanan: 1, pilihanLayanan: 1, sudahDiambil: true },
    { id: "PTK-004", namaPemilik: "Dewi Lestari", jumlahKucing: 6, lamaPenitipan: 15, pilihanMakanan: 2, pilihanLayanan: 3, sudahDiambil: false },
    { id: "PTK-005", namaPemilik: "Rudi Hartono", jumlahKucing: 5, lamaPenitipan: 14, pilihanMakanan: 1, pilihanLayanan: 2, sudahDiambil: true },
    { id: "PTK-006", namaPemilik: "Maya Putri", jumlahKucing: 4, lamaPenitipan: 10, pilihanMakanan: 3, pilihanLayanan: 1, sudahDiambil: false }
];

// nomor ID terakhir yang dipakai, naik setiap ada data baru
let nomorUrut: number = daftarPenitipan.length;

// tampilkan pertanyaan, lalu tunggu jawaban pengguna
export function tanya(pertanyaan: string): Promise<string> {
    process.stdout.write(pertanyaan);
    return new Promise<string>((selesai: (baris: string) => void): void => {
        const baris: string | undefined = antrianBaris.shift();
        if (baris !== undefined) {
            selesai(baris);
        } else if (inputSelesai) {
            // tidak akan ada jawaban lagi (misal Ctrl+D), langsung keluar
            console.log("\n[Info] Input ditutup. Program dihentikan.");
            process.exit(0);
        } else {
            penunggu = selesai;
        }
    });
}

// teks pertanyaan dibuat selebar 34 karakter supaya titik dua di semua prompt lurus
function buatLabel(teks: string): string {
    return teks.padEnd(34) + ": ";
}

// baca nama pemilik, ulangi terus sampai valid
async function bacaNama(pertanyaan: string): Promise<string> {
    let hasil: string = "";
    let valid: boolean = false;
    while (!valid) {
        const teks: string = (await tanya(pertanyaan)).trim().replace(/\s+/g, " "); // spasi berlebih dirapikan
        if (teks === "") {
            console.log("  [!] Nama tidak boleh kosong.");
        } else if (teks.length < 2 || teks.length > 30) {
            console.log("  [!] Nama harus terdiri dari 2 sampai 30 karakter.");
        } else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(teks)) {
            console.log("  [!] Nama hanya boleh berisi huruf, spasi, titik, apostrof, atau tanda hubung.");
        } else {
            hasil = teks;
            valid = true;
        }
    }
    return hasil;
}

// baca bilangan bulat dalam rentang minimal..maksimal, ulangi terus sampai valid
async function bacaAngka(pertanyaan: string, minimal: number, maksimal: number): Promise<number> {
    let hasil: number = 0;
    let valid: boolean = false;
    while (!valid) {
        const teks: string = (await tanya(pertanyaan)).trim();
        const angka: number = Number(teks); // NaN kalau teksnya bukan angka
        if (teks === "") {
            console.log("  [!] Input tidak boleh kosong.");
        } else if (Number.isNaN(angka) || !/^-?\d+(\.\d+)?$/.test(teks)) {
            console.log("  [!] \"" + teks + "\" bukan angka yang valid.");
        } else if (angka < 0) {
            console.log("  [!] Nilai tidak boleh negatif.");
        } else if (!Number.isInteger(angka)) {
            console.log("  [!] Nilai harus berupa bilangan bulat.");
        } else if (angka < minimal || angka > maksimal) {
            console.log("  [!] Nilai harus berada di antara " + minimal + " dan " + maksimal + ".");
        } else {
            hasil = angka;
            valid = true;
        }
    }
    return hasil;
}

// buat ID baru (PTK-007, PTK-008, ...); diulang kalau ternyata sudah dipakai data lain
function buatIdBaru(): string {
    let idBaru: string = "";
    let sudahAda: boolean = true;
    while (sudahAda) {
        nomorUrut += 1;
        idBaru = "PTK-" + String(nomorUrut).padStart(3, "0");
        const idUji: string = idBaru;
        sudahAda = daftarPenitipan.some((data: DataPenitipan): boolean => data.id === idUji);
    }
    return idBaru;
}

// fitur Create: input -> validasi -> push ke array -> tampilkan rincian
async function tambahData(): Promise<void> {
    console.log("\n=== TAMBAH DATA PENITIPAN (CREATE) ===");
    const nama: string = await bacaNama(buatLabel("Nama pemilik"));
    const jumlah: number = await bacaAngka(buatLabel("Jumlah kucing (1-" + MAKS_KUCING + ")"), 1, MAKS_KUCING);
    const lama: number = await bacaAngka(buatLabel("Lama penitipan (hari, 1-" + MAKS_HARI + ")"), 1, MAKS_HARI);
    tampilPilihanMakanan();
    const makanan: number = await bacaAngka(buatLabel("Pilih makanan (1-" + JUMLAH_PILIHAN_MAKANAN + ")"), 1, JUMLAH_PILIHAN_MAKANAN);
    tampilPilihanLayanan();
    const layanan: number = await bacaAngka(buatLabel("Pilih layanan (1-" + JUMLAH_PILIHAN_LAYANAN + ")"), 1, JUMLAH_PILIHAN_LAYANAN);

    // kucing yang baru dititipkan otomatis belum diambil
    const dataBaru: DataPenitipan = {
        id: buatIdBaru(),
        namaPemilik: nama,
        jumlahKucing: jumlah,
        lamaPenitipan: lama,
        pilihanMakanan: makanan,
        pilihanLayanan: layanan,
        sudahDiambil: false
    };
    daftarPenitipan.push(dataBaru);
    console.log("\n[OK] Data berhasil ditambahkan dengan ID " + dataBaru.id + ".");
    cetakRincian(dataBaru);
}

export function tampilBanner(): void {
    console.log("=".repeat(60));
    console.log("   SISTEM MANAJEMEN PENITIPAN KUCING");
    console.log("   UAS Pemrograman Dasar - Aplikasi Console TypeScript");
    console.log("=".repeat(60));
    console.log("Data awal dimuat: " + daftarPenitipan.length + " data penitipan.");
}

function tampilMenu(): void {
    console.log("\n------------------- MENU UTAMA -------------------");
    MENU_UTAMA.forEach((teks: string): void => {
        console.log("  " + teks);
    });
    console.log("--------------------------------------------------");
}

// placeholder untuk fitur yang dikerjakan di progress berikutnya
function fiturBelumTersedia(namaFitur: string, progressKe: number): void {
    console.log("\n[Info] Fitur " + namaFitur + " akan tersedia pada Progress " + progressKe + ".");
}

// menu berulang terus sampai pengguna memilih 0
export async function jalankanMenu(): Promise<void> {
    let berjalan: boolean = true;
    while (berjalan) {
        tampilMenu();
        const batasMenu: number = MENU_UTAMA.length - 1; // dikurangi 1 karena "0. Keluar" ikut terhitung
        const pilihan: string = (await tanya("Pilih menu (0-" + batasMenu + "): ")).trim();
        switch (pilihan) {
            case "1":
                await tambahData();
                break;
            case "2":
                daftarPenitipan.forEach((data: DataPenitipan): void => {
                    cetakRincian(data);
                });
                break;
            case "3":
                // toUpperCase supaya "ptk-001" tetap ketemu
                const cariId: string = (await tanya("Masukkan ID Penitipan (contoh PTK-001): ")).trim().toUpperCase();
                const ditemukan: DataPenitipan | undefined = daftarPenitipan.find((d: DataPenitipan) => d.id === cariId);
                if (ditemukan) {
                    cetakRincian(ditemukan);
                } else {
                    console.log("  [!] Data dengan ID " + cariId + " tidak ditemukan.");
                }
                break;
            case "4":
                fiturBelumTersedia("Ubah Data (Update)", 5);
                break;
            case "5":
                fiturBelumTersedia("Hapus Data (Delete)", 5);
                break;
            case "6":
                fiturBelumTersedia("Cari Data (Search)", 6);
                break;
            case "0":
                berjalan = false;
                console.log("\nTerima kasih telah menggunakan Sistem Manajemen Penitipan Kucing.");
                break;
            default:
                // selain 0-6, tidak berhenti, menu muncul lagi
                console.log("  [!] Pilihan menu tidak valid. Masukkan angka 0 sampai 6.");
                break;
        }
    }
}