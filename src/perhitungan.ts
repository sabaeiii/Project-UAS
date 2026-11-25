import { DataPenitipan, RincianBiaya, HARGA_PER_HARI } from './menuutama';

export function ambilHargaMakanan(pilihan: number): number {
    let harga: number = 0;
    switch (pilihan) {
        case 1:
            harga = 0;
            break;
        case 2:
            harga = 10000;
            break;
        case 3:
            harga = 20000;
            break;
        default:
            harga = 0;
            break;
    }
    return harga;
}

export function ambilNamaMakanan(pilihan: number): string {
    let nama: string = "";
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

export function ambilHargaLayanan(pilihan: number): number {
    let harga: number = 0;
    switch (pilihan) {
        case 1:
            harga = 0;
            break;
        case 2:
            harga = 25000;
            break;
        case 3:
            harga = 10000;
            break;
        case 4:
            harga = 30000;
            break;
        default:
            harga = 0;
            break;
    }
    return harga;
}

export function ambilNamaLayanan(pilihan: number): string {
    let nama: string = "";
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

export function hitungPersenDiskon(jumlahKucing: number, lamaPenitipan: number): number {
    let persen: number = 0;
    if (jumlahKucing >= 3) {
        if (jumlahKucing <= 5) {
            if (lamaPenitipan >= 7 && lamaPenitipan <= 14) {
                persen = 10;
            }
        } else {
            if (lamaPenitipan >= 15) {
                persen = 15;
            }
        }
    }
    return persen;
}

export function hitungRincian(data: DataPenitipan): RincianBiaya {
    const hargaMakanan: number = ambilHargaMakanan(data.pilihanMakanan);
    const hargaLayanan: number = ambilHargaLayanan(data.pilihanLayanan);

    const biayaPenitipan: number = HARGA_PER_HARI * data.jumlahKucing * data.lamaPenitipan;
    const biayaMakanan: number = hargaMakanan * data.jumlahKucing * data.lamaPenitipan;
    const biayaLayanan: number = hargaLayanan * data.jumlahKucing;

    const biayaTambahan: number = biayaMakanan + biayaLayanan;

    let totalSebelumDiskon: number = biayaPenitipan;
    totalSebelumDiskon += biayaTambahan;

    const persenDiskon: number = hitungPersenDiskon(data.jumlahKucing, data.lamaPenitipan);

    let diskon: number = totalSebelumDiskon;
    diskon *= persenDiskon;
    diskon /= 100;

    let totalBayar: number = totalSebelumDiskon;
    totalBayar -= diskon;

    const dapatDiskon: boolean = persenDiskon > 0;

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