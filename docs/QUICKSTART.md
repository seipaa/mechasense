# 🚀 Mechasense Quick Start Guide

Panduan cepat untuk menjalankan Mechasense dalam 5 menit!

---

## ⚡ Super Quick Start (Copy-Paste)

Jalankan command berikut satu per satu di terminal:

```bash
# 1. Install dependencies
npm install

# 2. Setup database & run migrations
npx prisma migrate dev --name init

# 3. Generate Prisma Client
npx prisma generate

# 4. Seed database dengan dummy data
npm run prisma:seed

# 5. Run development server
npm run dev
```

Kemudian buka browser: **http://localhost:3000/dashboard**

---

## 📋 Step-by-Step Guide

### Step 1: Install Dependencies (2-3 menit)

```bash
npm install
```

Ini akan menginstall:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- Recharts
- Dan dependencies lainnya

### Step 2: Setup Database

Proyek ini sudah dikonfigurasi menggunakan **SQLite** untuk kemudahan demo.

```bash
npx prisma migrate dev --name init
```

Command ini akan:
- Membuat file database `prisma/dev.db`
- Menjalankan migrations untuk create tables
- Generate Prisma Client

### Step 3: Seed Database dengan Data Dummy

```bash
npm run prisma:seed
```

Ini akan membuat:
- 1 Motor: "Motor Utama Lantai 2"
- 100 sensor readings dengan timestamp berbeda
- Beberapa alerts untuk testing
- 1 health analysis

### Step 4: Run Development Server

```bash
npm run dev
```

Server akan berjalan di port **3000**.

### Step 5: Open Dashboard

Buka browser dan navigate ke:

**http://localhost:3000/dashboard**

Anda akan melihat:
- ✅ Realtime sensor dashboard
- ✅ Motor health overview
- ✅ Temperature, vibration, dan dust monitoring
- ✅ Active alerts list
- ✅ Sparkline charts

---

## 🔍 Explore Pages

Setelah server running, explore halaman-halaman berikut:

- **Dashboard**: http://localhost:3000/dashboard
- **Analytics**: http://localhost:3000/analytics
- **AI Center**: http://localhost:3000/ai-center
- **Settings**: http://localhost:3000/settings

---

## 🧪 Test API Endpoints

### 1. Get Latest Data

```bash
curl http://localhost:3000/api/latest?motorId=default-motor-1
```

### 2. Ingest New Data (Simulate ESP)

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "motorId": "default-motor-1",
    "gridVoltage": 225,
    "motorCurrent": 4.2,
    "powerConsumption": 850,
    "powerFactor": 0.87,
    "dailyEnergyKwh": 20,
    "gridFrequency": 50.0,
    "vibrationRms": 2.5,
    "rotorUnbalanceScore": 90,
    "bearingHealthScore": 85,
    "motorSurfaceTemp": 72,
    "bearingTemp": 68,
    "dustDensity": 45,
    "soilingLossPercent": 3.0
  }'
```

### 3. Run ML Prediction

```bash
curl -X POST http://localhost:3000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"motorId": "default-motor-1"}'
```

### 4. Run Expert Diagnosis

```bash
curl -X POST http://localhost:3000/api/expert/diagnose \
  -H "Content-Type: application/json" \
  -d '{"motorId": "default-motor-1"}'
```

---

## 📊 View Database

Prisma Studio adalah GUI untuk view/edit database:

```bash
npx prisma studio
```

Buka browser: **http://localhost:5555**

---

## 🎨 Color Palette Quick Reference

Tailwind classes yang bisa digunakan:

- `bg-primary` - #1B3C53 (dark blue)
- `bg-secondary` - #234C6A (secondary blue)
- `bg-accent` - #456882 (muted blue)
- `bg-lightgray` - #E3E3E3 (light grey)
- `bg-status-normal` - #10b981 (green)
- `bg-status-warning` - #f59e0b (amber)
- `bg-status-critical` - #ef4444 (red)

---

## 🛠️ Troubleshooting

### Error: "Command not found: npx"

Install Node.js 18+ dari https://nodejs.org

### Error: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Error: "Port 3000 already in use"

```bash
npx kill-port 3000
# atau
npm run dev -- -p 3001
```

### Database locked (SQLite)

Stop server (Ctrl+C) dan restart.

### Ingin reset database

```bash
npx prisma migrate reset
npm run prisma:seed
```

---

## 📱 ESP32 Testing (Optional)

Lihat **docs/ESP_INTEGRATION.md** untuk:
- Hardware wiring diagram
- Complete ESP32 code
- Sensor integration guide

Atau gunakan dummy data script untuk simulate ESP:

```bash
# Install jq jika belum ada (untuk Windows: via Git Bash atau WSL)
while true; do
  curl -X POST http://localhost:3000/api/ingest \
    -H "Content-Type: application/json" \
    -d "{
      \"motorId\": \"default-motor-1\",
      \"gridVoltage\": $((RANDOM % 20 + 210)),
      \"motorCurrent\": $(awk -v min=3 -v max=5 'BEGIN{srand(); print min+rand()*(max-min)}'),
      \"powerConsumption\": $((RANDOM % 200 + 700)),
      \"powerFactor\": $(awk -v min=0.8 -v max=0.95 'BEGIN{srand(); print min+rand()*(max-min)}'),
      \"dailyEnergyKwh\": $(awk -v min=15 -v max=25 'BEGIN{srand(); print min+rand()*(max-min)}'),
      \"gridFrequency\": $(awk -v min=49.8 -v max=50.2 'BEGIN{srand(); print min+rand()*(max-min)}'),
      \"vibrationRms\": $(awk -v min=1.5 -v max=3.5 'BEGIN{srand(); print min+rand()*(max-min)}'),
      \"rotorUnbalanceScore\": $((RANDOM % 15 + 85)),
      \"bearingHealthScore\": $((RANDOM % 15 + 80)),
      \"motorSurfaceTemp\": $((RANDOM % 15 + 60)),
      \"bearingTemp\": $((RANDOM % 15 + 58)),
      \"dustDensity\": $((RANDOM % 40 + 20)),
      \"soilingLossPercent\": $(awk -v min=1 -v max=5 'BEGIN{srand(); print min+rand()*(max-min)}')
    }"
  sleep 2
done
```

---

## 📦 Production Deployment

Untuk deploy ke production:

1. **Ganti ke PostgreSQL**:

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/mechasense"
```

2. **Run migrations**:
```bash
npx prisma migrate deploy
```

3. **Build**:
```bash
npm run build
```

4. **Deploy ke Vercel**:
```bash
npm install -g vercel
vercel
```

Atau deploy ke Railway, DigitalOcean, AWS, dll.

---

## 🎉 Next Steps

Setelah berhasil running:

1. ✅ Explore semua pages
2. ✅ Test API endpoints
3. ✅ Lihat Prisma Studio
4. ✅ Customize threshold values
5. ✅ Integrate dengan ESP32 (optional)
6. ✅ Tambahkan authentication (NextAuth.js)
7. ✅ Deploy ke production

---

## 📚 Documentation

- **README.md** - Full documentation
- **docs/ESP_INTEGRATION.md** - ESP32 integration guide
- **prisma/schema.prisma** - Database schema
- **lib/thresholds.ts** - Threshold configuration

---

**Selamat mencoba Mechasense! 🔧⚡**

Jika ada pertanyaan atau issues, check README.md untuk troubleshooting lengkap.

