// 3.1  LOGIKA HARGA (SWITCH) - MATERI UTS

// ambilHargaMakanan: mengembalikan harga makanan per kucing per hari sesuai kode pilihan (switch)
function ambilHargaMakanan(pilihan: number): number {
    let harga: number = 0; // harga bawaan 0 untuk pilihan yang tidak dikenal
    switch (pilihan) {
        case 1: // jika pilihan sama dengan 1
            harga = 0;     // makanan sendiri: gratis
            break;
        case 2: // jika pilihan sama dengan 2
            harga = 10000; // makanan standar dari tempat penitipan
            break;
        case 3: // jika pilihan sama dengan 3
            harga = 20000; // makanan premium dari tempat penitipan
            break;
        default: // jika tidak ada case yang cocok
            harga = 0;     // kode selain 1-3 (tidak akan terjadi karena input sudah divalidasi)
            break;
    }
    return harga; // kembalikan harga hasil seleksi
}

// ambilNamaMakanan: mengembalikan nama makanan sesuai kode pilihan (switch)
function ambilNamaMakanan(pilihan: number): string {
    let nama: string = ""; // menampung nama makanan
    switch (pilihan) {
        case 1: // jika pilihan 1
            nama = "Makanan sendiri";
            break;
        case 2: // jika pilihan 2
            nama = "Makanan penitipan standar";
            break;
        case 3: // jika pilihan 3
            nama = "Makanan penitipan premium";
            break;
        default: // jika tidak ada case yang cocok
            nama = "Pilihan makanan tidak tersedia";
            break;
    }
    return nama;
}

// ambilHargaLayanan: mengembalikan harga layanan per kucing sesuai kode pilihan (switch)
function ambilHargaLayanan(pilihan: number): number {
    let harga: number = 0; // harga bawaan 0
    switch (pilihan) {
        case 1: // jika pilihan  1
            harga = 0;     // tidak memakai layanan
            break;
        case 2: // jika pilihan  2
            harga = 25000; // grooming
            break;
        case 3: // jika pilihan  3
            harga = 10000; // potong kuku
            break;
        case 4: // jika pilihan  4
            harga = 30000; // grooming dan potong kuku
            break;
        default: // jika tidak ada case yang cocok
            harga = 0;     // kode tidak dikenal
            break;
    }
    return harga;
}

// ambilNamaLayanan: mengembalikan nama layanan sesuai kode pilihan (switch)
function ambilNamaLayanan(pilihan: number): string {
    let nama: string = ""; // menampung nama layanan
    switch (pilihan) {
        case 1: // jika pilihan sama dengan 1
            nama = "Tidak memakai layanan";
            break;
        case 2: // jika pilihan sama dengan 2
            nama = "Grooming";
            break;
        case 3: // jika pilihan sama dengan 3
            nama = "Potong Kuku";
            break;
        case 4: // jika pilihan sama dengan 4
            nama = "Grooming dan Potong Kuku";
            break;
        default: // jika tidak ada case yang cocok
            nama = "Pilihan layanan tidak tersedia";
            break;
    }
    return nama;
}

// 3.2  LOGIKA DISKON DAN PERHITUNGAN BIAYA - MATERI UTS

// hitungPersenDiskon: menentukan persen diskon dengan percabangan bersarang 3 tingkat (aturan sama seperti UTS)
//   - 3 sampai 5 kucing dan lama 7 sampai 14 hari  => diskon 10%
//   - lebih dari 5 kucing dan lama minimal 15 hari => diskon 15%
//   - selain itu                                   => tidak ada diskon
function hitungPersenDiskon(jumlahKucing: number, lamaPenitipan: number): number {
    let persen: number = 0; // bawaan: tidak ada diskon
    if (jumlahKucing >= 3) {
        // tingkat 1: diskon hanya mungkin jika kucing minimal 3 ekor
        if (jumlahKucing <= 5) {
            // tingkat 2: kelompok 3 sampai 5 kucing
            if (lamaPenitipan >= 7 && lamaPenitipan <= 14) {
                // tingkat 3 (kondisi majemuk dengan &&): lama 7 sampai 14 hari
                persen = 10;
            }
        } else {
            // kelompok lebih dari 5 kucing
            if (lamaPenitipan >= 15) {
                persen = 15; // lama minimal 15 hari
            }
        }
    }
    return persen; // kembalikan persen diskon
}

// hitungRincian: menghitung seluruh biaya satu penitipan; memakai operator aritmatika dan compound
function hitungRincian(data: DataPenitipan): RincianBiaya {
    const hargaMakanan: number = ambilHargaMakanan(data.pilihanMakanan); // harga makanan per kucing per hari
    const hargaLayanan: number = ambilHargaLayanan(data.pilihanLayanan); // harga layanan per kucing

    const biayaPenitipan: number = HARGA_PER_HARI * data.jumlahKucing * data.lamaPenitipan; // operator perkalian
    const biayaMakanan: number = hargaMakanan * data.jumlahKucing * data.lamaPenitipan;     // biaya makanan seluruh kucing dan hari
    const biayaLayanan: number = hargaLayanan * data.jumlahKucing;                           // biaya layanan seluruh kucing

    const biayaTambahan: number = biayaMakanan + biayaLayanan; // operator + : biaya di luar menginap

    let totalSebelumDiskon: number = biayaPenitipan; // mulai dari biaya penitipan
    totalSebelumDiskon += biayaTambahan;             // compound +=  : tambahkan biaya makanan dan layanan

    const persenDiskon: number = hitungPersenDiskon(data.jumlahKucing, data.lamaPenitipan); // persen diskon dari aturan UTS

    let diskon: number = totalSebelumDiskon; // mulai dari total sebelum diskon
    diskon *= persenDiskon;                  // compound *=  : kalikan dengan persen diskon
    diskon /= 100;                           // compound /=  : bagi 100 untuk mendapatkan nilai rupiah

    let totalBayar: number = totalSebelumDiskon; // mulai dari total sebelum diskon
    totalBayar -= diskon;                        // compound -=  : kurangi dengan diskon

    const dapatDiskon: boolean = persenDiskon > 0; // operator perbandingan: true jika ada diskon

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