#include <PZEM004Tv30.h>
#include <Wire.h>
#include <time.h>
#include <MPU6050.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MLX90614.h>
#include <WiFi.h>
#include <FirebaseESP32.h>

/* =======================
   WiFi Credentials
   ======================= */
#define WIFI_SSID "WIFIPARAREL"
#define WIFI_PASSWORD "pararel123"

/* =======================
   Firebase Configuration
   ======================= */
#define FIREBASE_HOST "test-mode-62bda-default-rtdb.firebaseio.com"  // TANPA https:// dan /
#define FIREBASE_AUTH "UK4P0trCSAcKN1iEMRNplvkYmkom3m6aHWba48DU"

/* =======================
   Firebase Objects
   ======================= */
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

/* =======================
   PZEM-004T
   ======================= */
#define RXD2 16
#define TXD2 17
HardwareSerial pzemSerial(2);
PZEM004Tv30 pzem(pzemSerial, RXD2, TXD2);

/* =======================
   I2C Sensors
   ======================= */
MPU6050 mpu;
Adafruit_MLX90614 mlx = Adafruit_MLX90614();

/* =======================
   DS18B20
   ======================= */
#define ONE_WIRE_BUS 14
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature ds18b20(&oneWire);

/* =======================
   Dust Sensor GP2Y
   ======================= */
#define DUST_PIN 34
#define LED_PIN  4
#define OFFSET_V 0.33

/* =======================
   MPU Sampling
   ======================= */
const int SAMPLE_COUNT = 500;

/* =======================
   Timing Variables
   ======================= */
unsigned long previousMillis = 0;
const long interval = 2000;
bool firebaseReady = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  /* =======================
     Initialize Sensors
     ======================= */
  pzemSerial.begin(9600, SERIAL_8N1, RXD2, TXD2);

  Wire.begin(21, 22);
  mpu.initialize();
  mlx.begin();

  ds18b20.begin();

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);
  analogSetPinAttenuation(DUST_PIN, ADC_11db);

  /* =======================
     Connect to WiFi
     ======================= */
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int wifiTimeout = 0;
  while (WiFi.status() != WL_CONNECTED && wifiTimeout < 20) {
    delay(500);
    Serial.print(".");
    wifiTimeout++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("RSSI: ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println("\nWiFi Connection Failed!");
    while(1) delay(1000);  // Stop jika WiFi gagal
  }

      configTime(0, 0, "pool.ntp.org", "time.nist.gov");

      Serial.print("Syncing time");
      time_t now;
      while ((now = time(nullptr)) < 100000) {
      Serial.print(".");
      delay(500);
      }
      Serial.println("\n✓ Time synced");

  /* =======================
     Initialize Firebase
     ======================= */
  Serial.println("\nInitializing Firebase...");
  
  // Konfigurasi Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  config.timeout.serverResponse = 10000;  // 10 detik
  
  // Atur buffer size
  fbdo.setBSSLBufferSize(4096, 1024);
  
  // Inisialisasi Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Tunggu koneksi Firebase
  delay(2000);
  
  // Test koneksi Firebase
  Serial.println("Testing Firebase connection...");
  
  if (Firebase.ready()) {
    firebaseReady = true;
    Serial.println("✓ Firebase Ready!");
    
    // Test write sederhana
    FirebaseJson testJson;
    testJson.set("test", "connected");
    testJson.set("timestamp", millis() / 1000);
    
    if (Firebase.setJSON(fbdo, "/test_connection", testJson)) {
      Serial.println("✓ Firebase Test Write Success!");
    } else {
      Serial.println("✗ Firebase Test Write Failed: " + fbdo.errorReason());
    }
  } else {
    Serial.println("✗ Firebase Not Ready!");
    Serial.println("Check your host and auth token");
  }

  Serial.println("\n=== 5 SENSOR MONITORING SYSTEM READY ===");
  Serial.println("=========================================");
}

unsigned long getUnixTimestamp() {
  time_t now;
  time(&now);
  return (unsigned long) now;
}

void loop() {
  unsigned long currentMillis = millis();
  
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    /* =======================
       PZEM Data
       ======================= */
    float voltage = pzem.voltage();
    float current = pzem.current();
    float power   = pzem.power();
    float energy  = pzem.energy();
    float freq    = pzem.frequency();
    float pf      = pzem.pf();

    if (isnan(voltage)) voltage = 0;
    if (isnan(current)) current = 0;
    if (isnan(power)) power = 0;

    String voltageAlert = (voltage < 200) ? "GREEN" :
                          (voltage <= 230) ? "YELLOW" : "RED";

    String pfAlert = (pf > 0.85) ? "GREEN" :
                     (pf >= 0.7) ? "YELLOW" : "RED";

    /* =======================
       MLX90614 Data
       ======================= */
    float tempAmbient = mlx.readAmbientTempC();
    float tempMotor   = mlx.readObjectTempC();

    String tempAlert = (tempMotor < 70) ? "GREEN" :
                       (tempMotor <= 85) ? "YELLOW" : "RED";

    bool hotspot = (tempMotor - tempAmbient) > 15;

    /* =======================
       DS18B20 Data
       ======================= */
    ds18b20.requestTemperatures();
    float tempBearing = ds18b20.getTempCByIndex(0);
    float deltaTemp   = tempBearing - tempAmbient;

    /* =======================
       Dust Sensor Data
       ======================= */
    digitalWrite(LED_PIN, LOW);
    delayMicroseconds(280);
    int adc = analogRead(DUST_PIN);
    delayMicroseconds(40);
    digitalWrite(LED_PIN, HIGH);
    delayMicroseconds(9680);

    float vDust = adc * (3.3 / 4095.0) * 3.0;
    float dust = (vDust - OFFSET_V) * 1000.0;
    if (dust < 0) dust = 0;

    String dustAlert = (dust < 50) ? "GREEN" :
                       (dust <= 100) ? "YELLOW" : "RED";

    float soilingLoss = min((dust / 300.0) * 100.0, 100.0);

    /* =======================
       MPU6050 Vibration Data
       ======================= */
    float sum = 0, sumSq = 0, peak = 0;

    for (int i = 0; i < SAMPLE_COUNT; i++) {
      int16_t ax, ay, az;
      mpu.getAcceleration(&ax, &ay, &az);

      float x = ax / 16384.0;
      float y = ay / 16384.0;
      float z = az / 16384.0;

      float res = abs(sqrt(x*x + y*y + z*z) - 1.0);
      sum += res;
      sumSq += res * res;
      if (res > peak) peak = res;

      delayMicroseconds(2000);
    }

    float rms_g = sqrt(sumSq / SAMPLE_COUNT);
    float rms_mm_s = rms_g * 9.81 * 1000.0;

    String vibAlert = (rms_mm_s < 2.8) ? "GREEN" :
                      (rms_mm_s <= 4.5) ? "YELLOW" : "RED";

    float unbalance = min((rms_mm_s / 6.0) * 100.0, 100.0);
    float bearingHealth = 100.0 - unbalance;

    /* =======================
       Serial Output
       ======================= */
    Serial.println("{");
    Serial.printf("\"voltage\": %.1f,\n", voltage);
    Serial.printf("\"current\": %.2f,\n", current);
    Serial.printf("\"power\": %.1f,\n", power);
    Serial.printf("\"energy\": %.2f,\n", energy);
    Serial.printf("\"frequency\": %.2f,\n", freq);
    Serial.printf("\"pf\": %.2f,\n", pf);
    Serial.printf("\"voltage_alert\": \"%s\",\n", voltageAlert.c_str());
    Serial.printf("\"pf_alert\": \"%s\",\n", pfAlert.c_str());

    Serial.printf("\"motor_temp\": %.2f,\n", tempMotor);
    Serial.printf("\"ambient_temp\": %.2f,\n", tempAmbient);
    Serial.printf("\"temp_alert\": \"%s\",\n", tempAlert.c_str());
    Serial.printf("\"hotspot\": %s,\n", hotspot ? "true" : "false");

    Serial.printf("\"bearing_temp\": %.2f,\n", tempBearing);
    Serial.printf("\"delta_temp\": %.2f,\n", deltaTemp);

    Serial.printf("\"dust\": %.1f,\n", dust);
    Serial.printf("\"dust_alert\": \"%s\",\n", dustAlert.c_str());
    Serial.printf("\"soiling_loss\": %.1f,\n", soilingLoss);

    Serial.printf("\"vibration_rms_mm_s\": %.2f,\n", rms_mm_s);
    Serial.printf("\"vibration_alert\": \"%s\",\n", vibAlert.c_str());
    Serial.printf("\"unbalance\": %.1f,\n", unbalance);
    Serial.printf("\"bearing_health\": %.1f\n", bearingHealth);
    Serial.println("}");
    Serial.println("========================================");

    /* =======================
       Send to Firebase
       ======================= */
    if (firebaseReady) {
      FirebaseJson json;
      
      // Electrical Data
      json.set("voltage", voltage);
      json.set("current", current);
      json.set("power", power);
      json.set("energy", energy);
      json.set("frequency", freq);
      json.set("pf", pf);
      json.set("voltage_alert", voltageAlert.c_str());
      json.set("pf_alert", pfAlert.c_str());
      
      // Temperature Data
      json.set("motor_temp", tempMotor);
      json.set("ambient_temp", tempAmbient);
      json.set("temp_alert", tempAlert.c_str());
      json.set("hotspot", hotspot);
      
      // Bearing Data
      json.set("bearing_temp", tempBearing);
      json.set("delta_temp", deltaTemp);
      
      // Dust Data
      json.set("dust", dust);
      json.set("dust_alert", dustAlert.c_str());
      json.set("soiling_loss", soilingLoss);
      
      // Vibration Data
      json.set("vibration_rms_mm_s", rms_mm_s);
      json.set("vibration_alert", vibAlert.c_str());
      json.set("unbalance", unbalance);
      json.set("bearing_health", bearingHealth);
      
      // Timestamp
      unsigned long timestamp = getUnixTimestamp();
      json.set("timestamp", timestamp);
      
      // Send to Firebase
      // ===== PATH DEFINITIONS =====
         String latestPath  = "/sensor_data/latest";
         String historyPath = "/sensor_data/history/" + String(timestamp);

         // ===== SEND TO LATEST (REALTIME DASHBOARD) =====
         bool latestOK = Firebase.setJSON(fbdo, latestPath, json);

         if (latestOK) {
         Serial.println("✓ Latest data updated");
         } else {
         Serial.println("✗ Latest update failed: " + fbdo.errorReason());
         }

         // ===== SEND TO HISTORY (LOGGING & ML) =====
         bool historyOK = Firebase.setJSON(fbdo, historyPath, json);

         if (historyOK) {
         Serial.println("✓ History data appended");
         } else {
         Serial.println("✗ History write failed: " + fbdo.errorReason());
         }

        
        // Coba reconnect jika error
        if (fbdo.httpCode() == 401) {
         Serial.println("Reconnecting to Firebase...");
         Firebase.begin(&config, &auth);
         delay(1000);
         }

      }
    } else {
      Serial.println("Firebase not ready, skipping upload");
    }
  }