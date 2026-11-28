import { DataPenitipan, RincianBiaya, HARGA_PER_HARI } from './menuutama';
import {
    hitungRincian,
    ambilNamaMakanan,
    ambilHargaMakanan,
    ambilNamaLayanan,
    ambilHargaLayanan,
    JUMLAH_PILIHAN_MAKANAN,
    JUMLAH_PILIHAN_LAYANAN
} from './perhitungan';

// 2.1  FUNGSI FORMAT DAN TAMPILAN

// formatRupiah (arrow function): mengubah angka menjadi teks rupiah dengan titik pemisah ribuan
export const formatRupiah = (angka: number): string => {
    const teks: string = Math.round(angka).toString();             // bulatkan lalu ubah menjadi teks
    return "Rp" + teks.replace(/\B(?=(\d{3})+(?!\d))/g, ".");      // sisipkan titik setiap tiga digit, contoh: Rp1.500.000
};

// formatLama: mengubah jumlah hari menjadi format "x minggu y hari" (memakai operator / dan %)
export function formatLama(hari: number): string {
    if (hari < 1 || !Number.isInteger(hari)) {
        return "0 hari"; // pengaman: lama harus bilangan bulat minimal 1 hari (operator < dan || dan !)
    }
    const minggu: number = Math.floor(hari / 7); // jumlah minggu penuh (operator pembagian)
    const sisaHari: number = hari % 7;           // sisa hari setelah dibagi 7 (operator modulus)
    if (minggu > 0 && sisaHari > 0) {
        return minggu + " minggu " + sisaHari + " hari"; // ada minggu dan sisa hari
    } else if (sisaHari === 0) {
        return minggu + " minggu";                       // hanya minggu penuh (operator ===)
    } else {
        return sisaHari + " hari";                       // kurang dari satu minggu
    }
}

// teksStatus: mengubah nilai boolean sudahDiambil menjadi teks yang mudah dibaca
export function teksStatus(data: DataPenitipan): string {
    if (!data.sudahDiambil) {
        return "Dititipkan";    // kucing masih berada di tempat penitipan (operator !)
    }
    return "Sudah diambil";     // kucing sudah dijemput pemilik
}

// cetakBaris: mencetak satu baris "label : nilai" dengan label rata kiri (fungsi void)
export function cetakBaris(label: string, nilai: string): void {
    console.log("  " + label.padEnd(22) + ": " + nilai);
}

// cetakRincian: mencetak detail lengkap satu data beserta rincian biayanya (fungsi void)
export function cetakRincian(data: DataPenitipan): void {
    const rincian: RincianBiaya = hitungRincian(data); // hitung seluruh biaya dari data ini
    let teksLama: string = data.lamaPenitipan + " hari"; // teks dasar lama penitipan
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

// daftar pilihan makanan beserta harganya, ditampilkan sebelum pengguna memilih
export function tampilPilihanMakanan(): void {
    console.log("Pilihan Makanan (harga per kucing per hari):");
    for (let nomor: number = 1; nomor <= JUMLAH_PILIHAN_MAKANAN; nomor++) {
        console.log("  " + nomor + ". " + ambilNamaMakanan(nomor) + " (" + formatRupiah(ambilHargaMakanan(nomor)) + ")");
    }
}

// daftar pilihan layanan beserta harganya
export function tampilPilihanLayanan(): void {
    console.log("Pilihan Layanan (harga per kucing):");
    for (let nomor: number = 1; nomor <= JUMLAH_PILIHAN_LAYANAN; nomor++) {
        console.log("  " + nomor + ". " + ambilNamaLayanan(nomor) + " (" + formatRupiah(ambilHargaLayanan(nomor)) + ")");
    }
}