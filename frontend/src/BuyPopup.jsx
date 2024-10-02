import { useState } from 'react';
import PropTypes from 'prop-types';

const BuyPopup = ({ onBuy, onClose, maxUnits }) => {
  const [units, setUnits] = useState(1);

  const handleBuy = () => {
    onBuy(units);
  };

  const setFraction = (fraction) => {
    setUnits(Math.floor(maxUnits * fraction));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <h2 className="text-xl font-semibold mb-4">Buy Stocks</h2>
        <p className="mb-4">Max units you can buy: {maxUnits}</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => setFraction(1)} className="btn btn-secondary">All</button>
          <button onClick={() => setFraction(1/2)} className="btn btn-secondary">1/2</button>
          <button onClick={() => setFraction(1/3)} className="btn btn-secondary">1/3</button>
          <button onClick={() => setFraction(1/4)} className="btn btn-secondary">1/4</button>
        </div>
        <input
          type="number"
          min="1"
          max={maxUnits}
          value={units}
          onChange={(e) => setUnits(Math.min(parseInt(e.target.value), maxUnits))}
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="flex justify-between">
          <button onClick={handleBuy} className="btn btn-primary">Confirm</button>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};

BuyPopup.propTypes = {
  onBuy: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  maxUnits: PropTypes.number.isRequired,
};

export default BuyPopup;
