# Cloud: penyimpanan gabungan banyak akun Google Drive

## Setup (sekali saja)
1. **Firebase**: buat proyek, aktifkan *Authentication > Email/Password* dan *Firestore*. Salin config web ke `www/config.js`.
2. **Aturan Firestore**:
```
rules_version = '2';
service cloud.firestore { match /databases/{d}/documents {
  match /users/{uid}/{document=**} { allow read, write: if request.auth.uid == uid; }
}}
```
3. **Google Cloud Console** (proyek yang sama): aktifkan *Google Drive API*. Buat *OAuth consent screen* lalu ubah status ke **In production** (kalau tidak, token mati tiap 7 hari). Buat **OAuth Client ID tipe iOS** (bundle ID bebas, mis. `com.cloud.app`), salin Client ID ke `clientId` di `www/config.js`.
4. Upload semua isi folder ini ke repo GitHub, buka tab **Actions > Build APK Cloud > Run workflow**. APK **release** ada di *Artifacts* (Cloud-APK-release).

## Catatan
- Scope `drive.file`: hanya file yang diunggah lewat aplikasi ini yang tampil.
- Refresh token akun Google disimpan di Firestore, dilindungi aturan di atas. Jangan bagikan akun Cloud kamu.

## Tanda tangan release (agar APK bisa di-update, bukan terpasang ulang)
Tanpa secrets, tiap build memakai keystore sementara yang berbeda. Untuk keystore tetap, buat sekali di komputer:
`keytool -genkeypair -keystore cloud.jks -alias cloud -keyalg RSA -keysize 2048 -validity 10000`
(pakai password yang sama untuk keystore dan key), lalu isi *Settings > Secrets > Actions*:
`KEYSTORE_BASE64` (hasil `base64 -w0 cloud.jks`), `KEYSTORE_PASSWORD`, `KEY_ALIAS`. Simpan cloud.jks baik-baik.

## Pemutar video
- Streaming lewat service worker (`www/sw.js`) yang meneruskan permintaan Range ke Drive, jadi video langsung main dan bisa digeser tanpa unduh penuh.
- Posisi tonton disimpan ke Firestore tiap 15 detik dan saat keluar; buka lagi, lanjut dari menit terakhir.
- Format paling aman: MP4 (H.264/AAC) dan WebM. MKV sering tidak bisa diputar WebView Android.
- Tambahkan aturan Firestore yang sama untuk koleksi `folders` dan `prog` (sudah tercakup oleh aturan `users/{uid}/{document=**}`).

## Fitur tambahan
- **Sampah**: hapus memindahkan berkas ke sampah Drive (otomatis dibuang Google setelah 30 hari). Ada Pulihkan, Hapus selamanya, dan Kosongkan sampah.
- **Pilih banyak**: tahan lama satu berkas, atau tombol Pilih, lalu Pindahkan, Offline, atau Hapus sekaligus.
- **Cari**: tombol Cari mencari nama berkas di semua akun dan folder.
- **Simpan offline**: berkas disimpan di penyimpanan aplikasi (Cache API) dan bisa dibuka tanpa internet. Batasnya mengikuti kuota penyimpanan WebView di HP.
- **Pemutar**: geser vertikal kiri untuk kecerahan, kanan untuk volume; tombol CC memuat subtitle .srt/.vtt; tombol ▭ membuat pemutar mini yang tetap jalan saat menjelajah galeri (hanya di dalam aplikasi).
