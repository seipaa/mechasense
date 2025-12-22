# ESP32 Integration Guide for Mechasense

Panduan lengkap integrasi ESP32 dengan Mechasense untuk mengirim data sensor ke dashboard.

---

## 📋 Overview

ESP32 akan membaca data dari 5 sensor fisik dan mengirimkan ke server Mechasense via HTTP POST setiap 2 detik.

### Sensors Required

1. **MLX90614** (GY-906) - IR Temperature Sensor
2. **PZEM-004T** - Wattmeter (Voltage, Current, Power, PF, Frequency)
3. **DS18B20** - Waterproof Temperature Sensor (Bearing)
4. **GP2Y1010AU0F** - Optical Dust Sensor
5. **MPU6050** (GY-521) - Gyroscope + Accelerometer (Vibration)

---

## 🔌 Hardware Connections

### ESP32 Pinout

```
ESP32         Sensor           Notes
-----------------------------------------------
GPIO 21  -->  SDA (MPU6050)    I2C Data
GPIO 22  -->  SCL (MPU6050)    I2C Clock
GPIO 21  -->  SDA (MLX90614)   I2C (shared bus)
GPIO 22  -->  SCL (MLX90614)   I2C (shared bus)

GPIO 16  -->  RX (PZEM)        UART RX
GPIO 17  -->  TX (PZEM)        UART TX

GPIO 4   -->  DQ (DS18B20)     OneWire Data

GPIO 34  -->  VOUT (GP2Y1010)  Analog Input
GPIO 25  -->  LED (GP2Y1010)   Dust sensor LED control

3.3V     -->  VCC (sensors)
GND      -->  GND (sensors)
```

---

## 📚 Required Libraries

Install via Arduino Library Manager atau PlatformIO:

```
- WiFi (built-in)
- HTTPClient (built-in)
- ArduinoJson (by Benoit Blanchon)
- Adafruit_MLX90614
- PZEM004Tv30 (by Jakub Mandula)
- OneWire
- DallasTemperature
- Adafruit_MPU6050
- Adafruit_Sensor
```

### PlatformIO `platformio.ini`

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps = 
    adafruit/Adafruit MLX90614 Library@^2.1.3
    mandulaj/PZEM-004T-v30@^1.1.2
    paulstoffregen/OneWire@^2.3.7
    milesburton/DallasTemperature@^3.11.0
    adafruit/Adafruit MPU6050@^2.2.6
    bblanchon/ArduinoJson@^6.21.3
```

---

## 💻 Complete ESP32 Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MLX90614.h>
#include <PZEM004Tv30.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server configuration
const char* serverUrl = "http://192.168.1.100:3000/api/ingest";
const char* motorId = "default-motor-1";

// Sensor objects
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
PZEM004Tv30 pzem(Serial2, 16, 17); // RX, TX
OneWire oneWire(4);
DallasTemperature ds18b20(&oneWire);
Adafruit_MPU6050 mpu;

// Dust sensor pins
#define DUST_LED_PIN 25
#define DUST_VOUT_PIN 34

// Global variables for sensor data
float gridVoltage = 0;
float motorCurrent = 0;
float powerConsumption = 0;
float powerFactor = 0;
float dailyEnergyKwh = 0;
float gridFrequency = 0;
float vibrationRms = 0;
float rotorUnbalanceScore = 90.0;
float bearingHealthScore = 85.0;
float motorSurfaceTemp = 0;
float bearingTemp = 0;
float dustDensity = 0;
float soilingLossPercent = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("Mechasense ESP32 Starting...");
  
  // Initialize WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  // Initialize I2C
  Wire.begin(21, 22);
  
  // Initialize MLX90614
  if (!mlx.begin()) {
    Serial.println("MLX90614 not found!");
  } else {
    Serial.println("MLX90614 initialized");
  }
  
  // Initialize PZEM-004T
  Serial.println("PZEM-004T initialized");
  
  // Initialize DS18B20
  ds18b20.begin();
  Serial.println("DS18B20 initialized");
  
  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("MPU6050 not found!");
  } else {
    Serial.println("MPU6050 initialized");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }
  
  // Initialize dust sensor
  pinMode(DUST_LED_PIN, OUTPUT);
  Serial.println("Dust sensor initialized");
  
  Serial.println("All sensors ready!");
}

void loop() {
  readAllSensors();
  sendDataToServer();
  delay(2000); // Send every 2 seconds
}

void readAllSensors() {
  // Read PZEM-004T (Wattmeter)
  gridVoltage = pzem.voltage();
  motorCurrent = pzem.current();
  powerConsumption = pzem.power();
  powerFactor = pzem.pf();
  dailyEnergyKwh = pzem.energy();
  gridFrequency = pzem.frequency();
  
  // Handle NaN values
  if (isnan(gridVoltage)) gridVoltage = 220.0;
  if (isnan(motorCurrent)) motorCurrent = 3.5;
  if (isnan(powerConsumption)) powerConsumption = 800.0;
  if (isnan(powerFactor)) powerFactor = 0.88;
  if (isnan(dailyEnergyKwh)) dailyEnergyKwh = 0.0;
  if (isnan(gridFrequency)) gridFrequency = 50.0;
  
  // Read MLX90614 (IR Temperature)
  motorSurfaceTemp = mlx.readObjectTempC();
  if (isnan(motorSurfaceTemp)) motorSurfaceTemp = 65.0;
  
  // Read DS18B20 (Bearing Temperature)
  ds18b20.requestTemperatures();
  bearingTemp = ds18b20.getTempCByIndex(0);
  if (bearingTemp == DEVICE_DISCONNECTED_C) bearingTemp = 65.0;
  
  // Read MPU6050 (Vibration)
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  // Calculate RMS vibration from accelerometer
  float accelMagnitude = sqrt(a.acceleration.x * a.acceleration.x + 
                               a.acceleration.y * a.acceleration.y + 
                               a.acceleration.z * a.acceleration.z);
  vibrationRms = accelMagnitude * 0.1; // Convert to mm/s (simplified)
  
  // Calculate rotor and bearing scores (simplified - actual calculation needs FFT)
  rotorUnbalanceScore = map(constrain(vibrationRms * 10, 0, 50), 0, 50, 100, 60);
  bearingHealthScore = map(constrain(bearingTemp, 40, 90), 40, 90, 100, 60);
  
  // Read Dust Sensor (GP2Y1010)
  digitalWrite(DUST_LED_PIN, LOW);
  delayMicroseconds(280);
  int dustRaw = analogRead(DUST_VOUT_PIN);
  delayMicroseconds(40);
  digitalWrite(DUST_LED_PIN, HIGH);
  
  // Convert to dust density (µg/m³)
  float dustVoltage = dustRaw * (3.3 / 4095.0);
  dustDensity = (dustVoltage - 0.6) * 600.0; // Simplified calibration
  if (dustDensity < 0) dustDensity = 0;
  
  // Calculate soiling loss (simplified)
  soilingLossPercent = dustDensity * 0.05;
  if (soilingLossPercent > 10) soilingLossPercent = 10;
  
  // Debug print
  Serial.println("--- Sensor Readings ---");
  Serial.printf("Voltage: %.1f V\n", gridVoltage);
  Serial.printf("Current: %.2f A\n", motorCurrent);
  Serial.printf("Power: %.1f W\n", powerConsumption);
  Serial.printf("PF: %.2f\n", powerFactor);
  Serial.printf("Motor Temp: %.1f C\n", motorSurfaceTemp);
  Serial.printf("Bearing Temp: %.1f C\n", bearingTemp);
  Serial.printf("Vibration: %.2f mm/s\n", vibrationRms);
  Serial.printf("Dust: %.1f ug/m3\n", dustDensity);
}

void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected!");
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);
  
  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["motorId"] = motorId;
  doc["gridVoltage"] = gridVoltage;
  doc["motorCurrent"] = motorCurrent;
  doc["powerConsumption"] = powerConsumption;
  doc["powerFactor"] = powerFactor;
  doc["dailyEnergyKwh"] = dailyEnergyKwh;
  doc["gridFrequency"] = gridFrequency;
  doc["vibrationRms"] = vibrationRms;
  doc["rotorUnbalanceScore"] = rotorUnbalanceScore;
  doc["bearingHealthScore"] = bearingHealthScore;
  doc["motorSurfaceTemp"] = motorSurfaceTemp;
  doc["bearingTemp"] = bearingTemp;
  doc["dustDensity"] = dustDensity;
  doc["soilingLossPercent"] = soilingLossPercent;
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("Sending data to server...");
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    Serial.printf("✓ Data sent successfully: HTTP %d\n", httpResponseCode);
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.printf("✗ Error sending data: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}
```

---

## 🧪 Testing Without Hardware

Jika belum punya sensor fisik, gunakan kode ini untuk testing dengan dummy data:

```cpp
void readAllSensors() {
  // Generate realistic dummy data for testing
  gridVoltage = 220.0 + random(-10, 10);
  motorCurrent = 3.5 + random(-5, 5) * 0.1;
  powerConsumption = 800.0 + random(-100, 100);
  powerFactor = 0.88 + random(-5, 5) * 0.01;
  dailyEnergyKwh += 0.01;
  gridFrequency = 50.0 + random(-2, 2) * 0.1;
  vibrationRms = 2.0 + random(-5, 5) * 0.1;
  rotorUnbalanceScore = 90.0 + random(-5, 5);
  bearingHealthScore = 85.0 + random(-5, 5);
  motorSurfaceTemp = 65.0 + random(-5, 5);
  bearingTemp = 63.0 + random(-5, 5);
  dustDensity = 40.0 + random(-10, 10);
  soilingLossPercent = 3.0 + random(-10, 10) * 0.1;
}
```

---

## 🔍 Troubleshooting

### ESP tidak connect ke WiFi
- Cek SSID dan password
- Pastikan WiFi 2.4 GHz (bukan 5 GHz)
- Reset ESP32

### HTTP POST gagal
- Cek server URL (gunakan IP lokal, bukan localhost)
- Pastikan server running di port 3000
- Cek firewall

### Sensor tidak terbaca
- Cek wiring dan power supply
- Test sensor satu per satu
- Gunakan I2C scanner untuk cek address

### Data tidak muncul di dashboard
- Cek motor ID harus sama dengan yang ada di database
- Cek log di ESP Serial Monitor
- Cek log di Next.js console

---

## 📊 Expected Payload Example

```json
{
  "motorId": "default-motor-1",
  "gridVoltage": 220.5,
  "motorCurrent": 3.8,
  "powerConsumption": 835.0,
  "powerFactor": 0.88,
  "dailyEnergyKwh": 18.5,
  "gridFrequency": 50.1,
  "vibrationRms": 2.3,
  "rotorUnbalanceScore": 92.0,
  "bearingHealthScore": 88.0,
  "motorSurfaceTemp": 68.2,
  "bearingTemp": 65.5,
  "dustDensity": 35.0,
  "soilingLossPercent": 2.5
}
```

---

## ✅ Success Response

```json
{
  "success": true,
  "readingId": "clxxx...",
  "alertsGenerated": 0,
  "alerts": []
}
```

---

## 🚀 Next Steps

1. Flash kode ke ESP32
2. Monitor Serial output
3. Buka dashboard Mechasense
4. Lihat data real-time muncul!

**Happy Monitoring! 🔧⚡**

