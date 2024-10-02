import { useState, useEffect } from "react";
import StockChart from "./StockChart";

import symbols from "./symbols";
import BuyPopup from "./BuyPopup";
import SellPopup from "./SellPopup";

function getTwoYearLater(dateStr) {
  const date = new Date(dateStr);
  date.setFullYear(date.getFullYear() + 2);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRandomStartDate() {
  const year = Math.floor(Math.random() * (2022 - 2000)) + 2000;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0"); // Ensures a valid day
  return `${year}-${month}-${day}`;
}

function getRandomSymbol() {
  const randomIndex = Math.floor(Math.random() * symbols.length);
  return symbols[randomIndex];
}

function App() {
  const [data, setData] = useState({ labels: [], prices: [] });
  const [fullData, setFullData] = useState({ labels: [], prices: [] });
  const [units, setUnits] = useState(0);
  const [value, setValue] = useState(0);
  const [capital, setCapital] = useState(100000);
  const initialDataCount = 200; // Number of initial data points to display
  const [showBuyPopup, setShowBuyPopup] = useState(false);
  const [showSellPopup, setShowSellPopup] = useState(false);
  const [buyPoints, setBuyPoints] = useState([]);
  const [sellPoints, setSellPoints] = useState([]);
  const [selectedButton, setSelectedButton] = useState("All"); // Initialize selectedButton state
  const [sliceCount, setSliceCount] = useState(fullData.prices.length); // Initialize sliceCount

  const updateDataSlice = (button) => {
    let newSliceCount;
    if (button === "All") {
      newSliceCount = currentIndex; // Show all data up to currentIndex
    } else if (button === "200") {
      newSliceCount = Math.min(200, currentIndex); // Show last 200 ticks
    } else if (button === "300") {
      newSliceCount = Math.min(300, currentIndex); // Show last 300 ticks
    }
    setSliceCount(newSliceCount);
    setData({
      labels: fullData.labels.slice(currentIndex - newSliceCount, currentIndex),
      prices: fullData.prices.slice(currentIndex - newSliceCount, currentIndex),
    });
  };

  const buy = (unitsToBuy) => {
    const currentPrice = data.prices[currentIndex - 1].c;
    const totalCost = currentPrice * unitsToBuy;
    if (capital >= totalCost) {
      setUnits((prevUnits) => prevUnits + unitsToBuy);
      setCapital((prevCapital) => prevCapital - totalCost);
      setValue((units + unitsToBuy) * currentPrice);
      setBuyPoints((prevPoints) => [
        ...prevPoints,
        [data.labels[currentIndex - 1], currentPrice],
      ]);
    }
    setShowBuyPopup(false);
  };

  const openBuyPopup = () => {
    setShowBuyPopup(true);
  };

  const sell = (unitsToSell) => {
    if (units >= unitsToSell) {
      const currentPrice = data.prices[currentIndex - 1].c;
      setUnits((prevUnits) => {
        const newUnits = prevUnits - unitsToSell;
        setValue(newUnits * currentPrice);
        return newUnits;
      });
      setCapital((prevCapital) => prevCapital + currentPrice * unitsToSell);
      setSellPoints((prevPoints) => [
        ...prevPoints,
        [data.labels[currentIndex - 1], currentPrice],
      ]);
    }
    setShowSellPopup(false);
  };

  const openSellPopup = () => {
    setShowSellPopup(true);
  };

  const [currentIndex, setCurrentIndex] = useState(initialDataCount);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const symbol = getRandomSymbol();
        const startDate = getRandomStartDate();
        const endDate = getTwoYearLater(startDate);
        const response = await fetch(
          `http://localhost:8000/stock/${symbol}?start=${startDate}&end=${endDate}`
        );
        const result = await response.json();

        const labels = result.map((item) => item[0]);
        const prices = result.map((item) => ({
          x: item[0],
          o: item[1],
          h: item[2],
          l: item[3],
          c: item[4],
          v: item[5],
        }));

        setFullData({
          labels: labels,
          prices: prices,
        });
        setData({
          labels: labels.slice(0, initialDataCount),
          prices: prices.slice(0, initialDataCount),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleNext = () => {
    // console.log("Current Index:", currentIndex);
    // console.log("Data:", data);
    if (currentIndex < fullData.prices.length) {
      setData((prevData) => {
        const newLabels = [...prevData.labels, fullData.labels[currentIndex]];
        const newPrices = [...prevData.prices, fullData.prices[currentIndex]];
        return { labels: newLabels, prices: newPrices };
      });
      setCurrentIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    if (fullData.prices.length > 0) {
      const currentPrice = fullData.prices[currentIndex - 1].c;
      setValue(units * currentPrice);
    }
  }, [data, units, currentIndex]);

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    updateDataSlice(button);
  };

  const totalAsset = capital + value;
  return (
    <div className="flex w-full h-screen bg-gray-100 p-4">
      <div className="flex-1 h-full overflow-hidden flex-grow">
        {" "}
        {/* Added flex-grow */}
        <StockChart
          data={{
            // labels: data.labels.slice(-sliceCount),
            // prices: data.prices.slice(-sliceCount),
            labels: data.labels,
            prices: data.prices,
          }}
          buyPoints={buyPoints}
          sellPoints={sellPoints}
        />
      </div>
      <div className="w-64 flex-shrink-0 ml-4 p-4 bg-white rounded-lg shadow-md flex flex-col justify-between h-full overflow-y-auto">
        <h1 className="text-center mb-4">Trading Training App</h1>
        <div>
          <h2 className="text-left">Numbers of ticks showed:</h2>
          <div className="flex justify-between mt-4 space-x-2">
            <button
              className={`btn flex-1 ${
                selectedButton === "All" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => handleButtonClick("All")}
            >
              All
            </button>
            <button
              className={`btn flex-1 ${
                selectedButton === "200" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => handleButtonClick("200")}
            >
              200
            </button>
            <button
              className={`btn flex-1 ${
                selectedButton === "300" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => handleButtonClick("300")}
            >
              300
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
            <span className="font-semibold text-gray-700">Return:</span>
            <span className="text-blue-600">
              {totalAsset === 100000
                ? "0.00"
                : (((totalAsset - 100000) / 100000) * 100).toFixed(2)}
              %
            </span>
          </div>
          <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total Asset:</span>
            <span className="text-blue-600">{totalAsset.toFixed(2)}</span>
          </div>
          <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
            <span className="font-semibold text-gray-700">Capital:</span>
            <span className="text-blue-600">{capital.toFixed(2)}</span>
          </div>
          <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
            <span className="font-semibold text-gray-700">Units:</span>
            <span className="text-blue-600">{units}</span>
          </div>
          <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
            <span className="font-semibold text-gray-700">Value:</span>
            <span className="text-blue-600">{value.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between mt-4 space-x-2">
          <button onClick={handleNext} className="btn btn-primary flex-1">
            Next
          </button>
          <button onClick={openBuyPopup} className="btn btn-secondary flex-1">
            Buy
          </button>
          <button
            onClick={openSellPopup}
            disabled={units === 0}
            className="btn btn-secondary flex-1 disabled:opacity-50"
          >
            Sell
          </button>
        </div>
      </div>
      {showBuyPopup && (
        <BuyPopup
          onBuy={buy}
          onClose={() => setShowBuyPopup(false)}
          maxUnits={Math.floor(capital / data.prices[currentIndex - 1].c)}
        />
      )}
      {showSellPopup && (
        <SellPopup
          onSell={sell}
          onClose={() => setShowSellPopup(false)}
          maxUnits={units}
        />
      )}
    </div>
  );
}

export default App;
