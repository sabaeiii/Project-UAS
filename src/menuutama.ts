// =====================================================================
//  SISTEM MANAJEMEN PENITIPAN KUCING
//  Aplikasi Console TypeScript - UAS Pemrograman Dasar
//  Program Studi Teknologi Informasi, Fakultas Vokasi, Universitas Brawijaya
// ---------------------------------------------------------------------
//  Aplikasi ini adalah pengembangan dari proyek UTS (perhitungan biaya
//  penitipan kucing) menjadi aplikasi CRUD + Search dengan data di memori.
// ---------------------------------------------------------------------
// 1.1  IMPORT DAN PENGATURAN INPUT KEYBOARD
// ---------------------------------------------------------------------
import * as readline from 'readline'; // mengimpor modul readline bawaan Node.js untuk membaca input keyboard

// membuat interface readline untuk membaca input pengguna dan menulis output ke terminal
const rl: readline.Interface = readline.createInterface({
    input: process.stdin,   // sumber input berasal dari keyboard (stdin)
    output: process.stdout, // tujuan output adalah layar terminal (stdout)
    terminal: false         // mode biasa: terminal sendiri yang menampilkan ketikan pengguna
});

const antrianBaris: string[] = [];                      // antrean baris input yang sudah diketik tetapi belum dibaca program
let penunggu: ((baris: string) => void) | null = null; // fungsi yang sedang menunggu baris input berikutnya
let inputSelesai: boolean = false;                      // penanda bahwa input keyboard sudah ditutup (misal Ctrl+D)

// fungsi ini dipanggil otomatis setiap kali pengguna menekan Enter
rl.on('line', (baris: string): void => {
    if (penunggu !== null) {
        // ada fungsi yang sedang menunggu jawaban, maka baris langsung diberikan kepadanya
        const kirim: (baris: string) => void = penunggu; // simpan fungsi penunggu ke variabel sementara
        penunggu = null;                                 // kosongkan penunggu agar tidak terpakai dua kali
        kirim(baris);                                    // berikan baris yang diketik kepada penunggu
    } else {
        // belum ada yang menunggu, maka baris disimpan dulu di antrean
        antrianBaris.push(baris);
    }
});

// fungsi ini dipanggil otomatis ketika input keyboard ditutup
rl.on('close', (): void => {
    inputSelesai = true; // tandai bahwa tidak akan ada input lagi
    if (penunggu !== null) {
        // program masih menunggu jawaban padahal input sudah ditutup, maka program dihentikan dengan rapi
        console.log("\n[Info] Input ditutup. Program dihentikan.");
        process.exit(0);
    }
});

// ---------------------------------------------------------------------
// 1.2  TIPE DATA (INTERFACE), KONSTANTA, DAN DATA AWAL (SEED)
// ---------------------------------------------------------------------

// interface DataPenitipan menggambarkan satu transaksi penitipan kucing (satu elemen array)
interface DataPenitipan {
    id: string;             // kode unik penitipan, contoh: PTK-001 (tipe string)
    namaPemilik: string;    // nama pemilik kucing (tipe string)
    jumlahKucing: number;   // jumlah kucing yang dititipkan (tipe number)
    lamaPenitipan: number;  // lama penitipan dalam hari (tipe number)
    pilihanMakanan: number; // kode makanan: 1 = sendiri, 2 = standar, 3 = premium (tipe number)
    pilihanLayanan: number; // kode layanan: 1 = tidak ada, 2 = grooming, 3 = potong kuku, 4 = keduanya (tipe number)
    sudahDiambil: boolean;  // true jika kucing sudah diambil pemilik, false jika masih dititipkan (tipe boolean)
}

// interface RincianBiaya menampung seluruh hasil perhitungan biaya satu penitipan
interface RincianBiaya {
    biayaPenitipan: number;     // biaya menginap = harga per hari x jumlah kucing x lama hari
    biayaMakanan: number;       // biaya makanan = harga makanan x jumlah kucing x lama hari
    biayaLayanan: number;       // biaya layanan = harga layanan x jumlah kucing
    totalSebelumDiskon: number; // jumlah dari ketiga biaya di atas
    persenDiskon: number;       // besar diskon dalam persen (0, 10, atau 15)
    diskon: number;             // nilai diskon dalam rupiah
    totalBayar: number;         // total yang harus dibayar setelah dikurangi diskon
    dapatDiskon: boolean;       // true jika pemilik mendapatkan diskon
}

const HARGA_PER_HARI: number = 30000;         // harga tetap penitipan per kucing per hari (const karena nilainya tidak berubah)

// MENU_UTAMA berisi daftar teks menu yang ditampilkan setiap putaran menu
const MENU_UTAMA: string[] = [
    "1. Tambah Data Penitipan        (Create)",
    "2. Lihat Semua Data             (Read)",
    "3. Lihat Detail Berdasarkan ID  (Read)",
    "4. Ubah Data                    (Update)",
    "5. Hapus Data                   (Delete)",
    "6. Cari Data                    (Search)",
    "0. Keluar"
];

// daftarPenitipan adalah penyimpanan data di memori; berisi 6 data awal (seed) sebagai contoh
const daftarPenitipan: DataPenitipan[] = [
    { id: "PTK-001", namaPemilik: "Budi Santoso", jumlahKucing: 2, lamaPenitipan: 4, pilihanMakanan: 2, pilihanLayanan: 2, sudahDiambil: false }, // data awal ke-1
    { id: "PTK-002", namaPemilik: "Siti Rahma", jumlahKucing: 3, lamaPenitipan: 7, pilihanMakanan: 3, pilihanLayanan: 4, sudahDiambil: false }, // data awal ke-2
    { id: "PTK-003", namaPemilik: "Andi Wijaya", jumlahKucing: 1, lamaPenitipan: 3, pilihanMakanan: 1, pilihanLayanan: 1, sudahDiambil: true }, // data awal ke-3
    { id: "PTK-004", namaPemilik: "Dewi Lestari", jumlahKucing: 6, lamaPenitipan: 15, pilihanMakanan: 2, pilihanLayanan: 3, sudahDiambil: false }, // data awal ke-4
    { id: "PTK-005", namaPemilik: "Rudi Hartono", jumlahKucing: 5, lamaPenitipan: 14, pilihanMakanan: 1, pilihanLayanan: 2, sudahDiambil: true }, // data awal ke-5
    { id: "PTK-006", namaPemilik: "Maya Putri", jumlahKucing: 4, lamaPenitipan: 10, pilihanMakanan: 3, pilihanLayanan: 1, sudahDiambil: false } // data awal ke-6
];

// ---------------------------------------------------------------------
// 1.3  FUNGSI INPUT DASAR
// ---------------------------------------------------------------------

// tanya: menampilkan pertanyaan lalu menunggu pengguna mengetik jawaban dan menekan Enter
function tanya(pertanyaan: string): Promise<string> {
    process.stdout.write(pertanyaan); // tampilkan pertanyaan tanpa pindah baris
    return new Promise<string>((selesai: (baris: string) => void): void => {
        const baris: string | undefined = antrianBaris.shift(); // ambil baris pertama dari antrean (jika ada)
        if (baris !== undefined) {
            selesai(baris); // ada baris di antrean, langsung kembalikan sebagai jawaban
        } else if (inputSelesai) {
            // antrean kosong dan input sudah ditutup, tidak mungkin ada jawaban lagi
            console.log("\n[Info] Input ditutup. Program dihentikan.");
            process.exit(0);
        } else {
            penunggu = selesai; // belum ada jawaban, program menunggu pengguna mengetik
        }
    });
}

// ---------------------------------------------------------------------
// 1.5  MENU UTAMA (PERULANGAN SAMPAI PENGGUNA MEMILIH KELUAR)
// ---------------------------------------------------------------------

// tampilBanner: mencetak judul aplikasi saat program dimulai (tanpa parameter, tanpa return)
function tampilBanner(): void {
    console.log("=".repeat(60));
    console.log("   " + "SISTEM MANAJEMEN PENITIPAN KUCING");
    console.log("   UAS Pemrograman Dasar - Aplikasi Console TypeScript");
    console.log("=".repeat(60));
    console.log("Data awal dimuat: " + daftarPenitipan.length + " data penitipan.");
}

// tampilMenu: mencetak seluruh pilihan menu (memakai forEach)
function tampilMenu(): void {
    console.log("\n------------------- MENU UTAMA -------------------");
    MENU_UTAMA.forEach((teks: string): void => {
        console.log("  " + teks); // cetak satu baris menu untuk setiap elemen array
    });
    console.log("--------------------------------------------------");
}


// fiturBelumTersedia: pesan sementara untuk fitur yang baru dikerjakan pada progress berikutnya (fungsi void)
function fiturBelumTersedia(namaFitur: string, progressKe: number): void {
    console.log("\n[Info] Fitur " + namaFitur + " akan tersedia pada Progress " + progressKe + ".");
}

// jalankanMenu: perulangan menu utama; berhenti hanya jika pengguna memilih 0 (Keluar)
async function jalankanMenu(): Promise<void> {
    let berjalan: boolean = true; // penanda perulangan menu masih berjalan
    while (berjalan) {
        tampilMenu();                                            // tampilkan menu setiap putaran
        const batasMenu: number = MENU_UTAMA.length - 1; // nomor menu terbesar (operator -): 7 baris menu menjadi 6
        const pilihan: string = (await tanya("Pilih menu (0-" + batasMenu + "): ")).trim(); // baca pilihan pengguna sebagai teks
        // switch memilih fitur sesuai pilihan; setiap case diakhiri break agar tidak berlanjut ke case berikutnya
        switch (pilihan) {
            case "1": // jika pilihan sama dengan "1"
                fiturBelumTersedia("Tambah Data (Create)", 3);
                break;
            case "2": // jika pilihan sama dengan "2"
                fiturBelumTersedia("Lihat Semua Data (Read)", 4);
                break;
            case "3": // jika pilihan sama dengan "3"
                fiturBelumTersedia("Lihat Detail Berdasarkan ID (Read)", 4);
                break;
            case "4": // jika pilihan sama dengan "4"
                fiturBelumTersedia("Ubah Data (Update)", 5);
                break;
            case "5": // jika pilihan sama dengan "5"
                fiturBelumTersedia("Hapus Data (Delete)", 5);
                break;
            case "6": // jika pilihan sama dengan "6"
                fiturBelumTersedia("Cari Data (Search)", 6);
                break;
            case "0": // jika pilihan sama dengan "0"
                berjalan = false;        // hentikan perulangan menu
                console.log("\nTerima kasih telah menggunakan Sistem Manajemen Penitipan Kucing.");
                break;
            default: // jika tidak ada case yang cocok
                // input selain 0-6 dianggap tidak valid, program tidak berhenti dan menu ditampilkan kembali
                console.log("  [!] Pilihan menu tidak valid. Masukkan angka 0 sampai 6.");
                break;
        }
    }
};