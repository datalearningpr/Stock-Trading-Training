from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/stock/{ticker}")
def get_historical_data(ticker: str, start: str, end: str):
    session = requests.Session()
    session.verify = False
    stock = yf.Ticker(ticker, session=session)
    hist = stock.history(start=start, end=end)
    
    if hist.empty:
        return {"error": "No data found for the given date range or ticker."}
    
    result = []
    for date, row in hist.iterrows():
        formatted_date = date.strftime('%Y/%m/%d')
        result.append([
            formatted_date,
            row['Open'],
            row['High'],
            row['Low'],
            row['Close'],
            row['Volume']
        ])
    return result
