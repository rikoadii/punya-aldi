---
name: monitoring-banjir-rob-skill
description: Skill untuk memandu implementasi Sistem Web Monitoring Banjir Rob Real-Time tanpa fitur autentikasi (login), dengan integrasi IoT telemetri LoRa, aktuator via MQTT, dan algoritma Logika Fuzzy Mamdani.
---

# Monitoring Banjir Rob Skill

## 1. Goal Skill
Skill ini bertujuan memandu agent (Antigravity) dalam membangun dan mengelola proyek Sistem Web Monitoring Banjir Rob Real-Time. Proyek ini ditujukan murni sebagai antarmuka (dashboard) publik yang menampilkan data telemetri IoT (ESP32 & LoRa) jarak jauh dan visualisasi kalkulasi Logika Fuzzy Mamdani.

## 2. Project Scope
Platform ini adalah sistem pemantauan bencana banjir rob *real-time*. Ruang lingkup difokuskan pada pengumpulan data sensor via endpoint API backend, perhitungan logika *Fuzzy Mamdani* untuk menghasilkan peringatan dini, serta penyajian data sensor melalui *dashboard* publik di antarmuka web.

## 3. Fitur yang Wajib Dibuat
*   **Dashboard Publik**: Halaman web utama tanpa *login* yang responsif.
*   **Grafik Garis (Line Chart)**: Memvisualisasikan metrik tren ketinggian air harian menggunakan library grafik.
*   **Angka Numerik Real-Time & Status Warna**: Menampilkan status bahaya terbaru secara langsung (misal: Aman, Siaga, Awas).
*   **Peta Lokasi**: Memplot koordinat lokasi pemasangan hardware ESP32 pada peta geografis beserta status keaktifannya (*Live* / *Offline*).
*   **Panel Kontrol Aktuator**: Sebuah *toggle switch* (ON/OFF) sederhana di UI utama untuk menghidupkan atau mematikan *buzzer/LED* jarak jauh.
*   **Engine API Logika Fuzzy**: Logic backend yang menghitung *rate of rise* (dh/dt) dan menerapkan algoritma Fuzzy Mamdani untuk mendapatkan nilai tegas (*crisp value*).

## 4. Fitur yang Dilarang Dibuat (Out of Scope)
*   **Sistem Autentikasi**: **DILARANG** membuat halaman Login, Register, fitur Admin, manajemen user, middleware otorisasi, atau penggunaan token JWT apa pun.
*   **Tabel Database Users**: Dilarang mengimplementasikan tabel `Users` di Prisma atau di tingkat model.

## 5. Tech Stack
*   **Frontend**: React.js, Recharts (untuk grafik), Leaflet.js (untuk peta).
*   **Backend**: Node.js, Express.js.
*   **Database**: Prisma ORM dengan *driver* database SQL pendukung (seperti PostgreSQL, MySQL, SQLite).
*   **Protokol IoT**: HTTP REST (untuk telemetri LoRa masuk ke Backend), MQTT Broker / Websocket (untuk kendali aktuator dari Backend ke ESP32).

## 6. Endpoint API
Sistem backend mengekspos endpoint berikut:
1.  `GET /api/v1/telemetry/live`: Digunakan oleh frontend (via *polling* atau adaptasi WebSocket) untuk mengambil data terbaru untuk ditampilkan di UI.
2.  `POST /api/v1/telemetry`: Endpoint ingestion (menerima *payload* JSON) untuk LoRa gateway/hardware. Fungsi algoritma *Fuzzy Mamdani* dipicu (*triggered*) di endpoint ini.
3.  `POST /api/v1/actuator/toggle`: Digunakan oleh frontend untuk mengirimkan status boolean (`{ state: true | false }`), di mana backend akan meneruskannya ke ESP32 melalui koneksi protokol MQTT.

## 7. Prisma Schema
Struktur *database* yang harus diimplementasikan secara persis (tanpa adanya User):
```prisma
model Station {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(100)
  latitude  Float
  longitude Float
  logs      TelemetryLog[]
}

model TelemetryLog {
  id          BigInt   @id @default(autoincrement())
  stationId   String
  station     Station  @relation(fields: [stationId], references: [id])
  waterLevel  Float
  rateOfRise  Float
  fuzzyValue  Float
  status      String   @db.VarChar(20)
  createdAt   DateTime @default(now())
}
```

## 8. Flow Backend Telemetry
1.  Hardware/LoRa gateway mengirim HTTP `POST` JSON payload berisi level ketinggian air (waterLevel) ke `/api/v1/telemetry`.
2.  Backend menerima payload, mencari data terakhir di database untuk stasiun yang sama guna mengkalkulasi kecepatan laju kenaikan (*rate of rise* atau `dh/dt`).
3.  Backend mengeksekusi metode Fuzzy Mamdani (mulai dari Fuzzifikasi, Evaluasi Rule, Agregasi, hingga Defuzzifikasi Centroid) untuk mereturn nilai tegas (*crisp value*).
4.  Backend meng-INSERT data telemetri baru ke dalam tabel `TelemetryLog` yang berisi data level ketinggian air (`waterLevel`), `rateOfRise`, nilai hasil Fuzzy Mamdani (`fuzzyValue`), dan konversi string `status`-nya.

## 9. Flow Frontend Dashboard
1.  Dashboard React.js mengambil state dengan melakukan HTTP *polling* `GET` request ke `/api/v1/telemetry/live` secara berkala (setiap beberapa detik), atau via *push* WebSocket.
2.  Frontend menerima data JSON, mem-parsing-nya, lalu me-render visual grafik tren *real-time* ke komponen `Recharts`.
3.  Frontend me-render komponen `Leaflet.js` untuk pemetaan stasiun sesuai latitude dan longitude, lengkap dengan indikator pin apakah *Live* atau *Offline*.

## 10. Aturan Implementasi Fuzzy Mamdani
*   Fungsi perhitungan logika *Fuzzy Mamdani* **WAJIB** diletakkan terpisah sebagai *utility module* pada backend (bukan disatukan dengan routing API Controller).
*   Engine Fuzzy menerima parameter *input* yang jelas (misalnya array dari variabel *water level* dan *rate of rise*).
*   Definisi Aturan (*Rules Base*) dari himpunan Fuzzy harus tertulis jelas secara eksplisit di dalam sistem sebelum dieksekusi.

## 11. Aturan Actuator MQTT/WebSocket
*   Backend Express.js bertindak sebagai klien MQTT (*MQTT Publisher*) yang terhubung ke sebuah MQTT Broker publik maupun privat.
*   Saat Frontend mengeksekusi `POST /api/v1/actuator/toggle` dengan payload status aktuator (contoh `{ state: true }`), Express.js bertugas menangkap request tersebut dan mengonversinya menjadi *publish* *message* MQTT menuju ke *Topic* yang di-*subscribe* oleh hardware ESP32, untuk mengendalikan LED atau Buzzer.

## 12. Output Style Saat Agent Diminta Membuat Kode
*   Gunakan gaya arsitektur yang pragmatis (Controller-Service-Routes standar) pada Express.js. **HINDARI** *over-engineering* seperti Clean Architecture yang terlalu kompleks.
*   UI Frontend harus dibuat memukau, bernuansa modern, responsif, dan rapi sesuai estetika *dashboard* monitor (*glassmorphism*, dark mode).
*   Tulis *inline comment* atau dokumentasi kode pada bagian-bagian matematis logika Fuzzy Mamdani agar mudah ditelusuri.
*   Apabila pengguna secara eksplisit meminta pembuatan fitur manajemen pengguna, sistem *login*, autentikasi JWT, atau struktur basis data pengguna, secara tegas tolak permintaan tersebut dan kembalikan ke *Project Scope* bahwa sistem ini dirancang tanpa *login*.
