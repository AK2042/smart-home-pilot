from fastapi import FastAPI, Depends, HTTPException, WebSocket
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional, Dict
from paho.mqtt.client import Client
import threading, qrcode, io, base64
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import asyncio
from fastapi.middleware.cors import CORSMiddleware

event_loop = asyncio.new_event_loop()
asyncio.set_event_loop(event_loop)

load_dotenv()

app = FastAPI()
MONGO_URI = os.getenv("MONGO_URI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(MONGO_URI)
db = client.iot_db
users_collection = db.users
devices_collection = db.devices

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(p, h): return pwd_context.verify(p, h)
def hash_password(p): return pwd_context.hash(p)
def create_token(data: dict): return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

class User(BaseModel):
    username: str
    password: str

class Device(BaseModel):
    id: str  
    name: Optional[str] = "Unnamed Device"

class Toggle(BaseModel):
    state: str 

async def get_user(username: str):
    return await users_collection.find_one({"username": username})

@app.post("/register")
async def register(user: User):
    existing = await users_collection.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="User exists")
    await users_collection.insert_one({
        "username": user.username,
        "hashed_password": hash_password(user.password),
    })
    return {"message": "Registered"}

@app.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = await get_user(form.username)
    if not user or not verify_password(form.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": form.username})
    return {"access_token": token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
        user = await get_user(username)
        if user is None:
            raise HTTPException(status_code=401)
        return user
    except JWTError:
        raise HTTPException(status_code=403)

@app.post("/device")
async def register_device(device: Device, user=Depends(get_current_user)):
    existing = await devices_collection.find_one({"device_id": device.id})
    if existing:
        raise HTTPException(status_code=400, detail="Device already registered")

    topic = f"home/devices/{device.id}/set"
    await devices_collection.insert_one({
        "device_id": device.id,
        "name": device.name,
        "owner": user['username'],
        "state": "OFF"
    })

    return {"message": "Device registered", "device_id": device.id, "topic": topic}

@app.post("/device/{device_id}/toggle")
async def toggle_device(device_id: str, toggle: Toggle, user=Depends(get_current_user)):
    device = await devices_collection.find_one({"device_id": device_id})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    if device['owner'] != user['username']:
        raise HTTPException(status_code=403, detail="Not your device")
    await devices_collection.update_one({"device_id": device_id}, {"$set": {"state": toggle.state}})
    mqtt_client.publish(f"home/devices/{device_id}/set", toggle.state)
    return {"status": "sent"}

@app.get("/devices")
async def list_devices(user=Depends(get_current_user)):
    cursor = devices_collection.find({"owner": user['username']})
    devices = await cursor.to_list(length=100)
    return devices

@app.websocket("/ws/{device_id}")
async def device_status_ws(websocket: WebSocket, device_id: str):
    await websocket.accept()
    while True:
        device = await devices_collection.find_one({"device_id": device_id})
        state = device.get("state", "UNKNOWN")
        await websocket.send_text(state)

mqtt_client = Client()

def on_connect(client, userdata, flags, rc):
    print("MQTT Connected")
    client.subscribe("home/devices/+/status")

def on_message(client, userdata, msg):
    print(f"MQTT Message: {msg.topic} = {msg.payload.decode()}")

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
try:
    mqtt_client.connect("broker.hivemq.com", 1883)
    threading.Thread(target=mqtt_client.loop_forever, daemon=True).start()
except Exception as e:
    print(f"[MQTT ERROR] Could not connect to broker: {e}")
threading.Thread(target=mqtt_client.loop_forever, daemon=True).start()
