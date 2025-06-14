#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

String deviceId = "dev" + String(ESP.getChipId());
String topicSet = "home/devices/" + deviceId + "/set";
String topicStatus = "home/devices/" + deviceId + "/status";

const int ledPin = D1;
const int buttonPin = D2;
bool ledState = false;

void setup_wifi() {
  delay(100);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("WiFi connected");
  Serial.println("IP: " + WiFi.localIP().toString());
}

void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (int i = 0; i < length; i++) msg += (char)payload[i];

  if (String(topic) == topicSet) {
    ledState = (msg == "ON");
    digitalWrite(ledPin, ledState ? HIGH : LOW);
    client.publish(topicStatus.c_str(), ledState ? "ON" : "OFF");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect(deviceId.c_str())) {
      Serial.println("connected");
      client.subscribe(topicSet.c_str());
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  Serial.println("Scan this QR to register:");
  Serial.println(topicSet);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  static bool lastBtn = HIGH;
  bool btn = digitalRead(buttonPin);
  if (btn == LOW && lastBtn == HIGH) {
    ledState = !ledState;
    digitalWrite(ledPin, ledState ? HIGH : LOW);
    client.publish(topicStatus.c_str(), ledState ? "ON" : "OFF");
    delay(300);
  }
  lastBtn = btn;
}
