from fastapi import FastAPI,HTTPException
from yfinance import WebSocket, Ticker
import threading
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
latest_data = {}
def is_valid_symbol(symbol: str) -> bool:
    try:
        ticker =Ticker(symbol)

        # Method 1: Check if 'shortName' exists in the info dict
        info = ticker.info
        if 'shortName' in info and info['shortName']:
            return True

        # Method 2: Try to fetch a small historical dataset
        hist = ticker.history(period="1d")
        if not hist.empty:
            return True

        return False
    except Exception as e:
        print(f"Validation error for {symbol}: {e}")
        return False
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def handle_msg(msg):
    global latest_data
    key = msg['id']
    latest_data[key] = msg
    latest_data.update(latest_data)

# WebSocket setup
ws = WebSocket(verbose=False)
ws.subscribe("AAPL")

def ws_listener():
    ws.listen(handle_msg)

@app.get("/")
def root():
    return {"message": "WebSocket is running. Check /ws/data for updates."}

@app.get("/subscribe/{symbol}")
def subscribe(symbol: str):
    if is_valid_symbol(symbol):
        ws.subscribe(symbol)
        return {"message": f"Subscribed to {symbol}"}
    else:
        raise HTTPException(status_code=400, detail=f"Invalid stock symbol: {symbol}")

@app.get("/unsubscribe/{symbol}")
def unsubscribe(symbol: str):
    ws.unsubscribe(symbol)
    return {"message": f"Unsubscribed from {symbol}"}

@app.get("/ws/data")
def get_ws_data():
    return {"data": latest_data}

# Start WebSocket in background thread before app
def start_ws():
    ws_thread = threading.Thread(target=ws_listener, daemon=True)
    ws_thread.start()

start_ws()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)