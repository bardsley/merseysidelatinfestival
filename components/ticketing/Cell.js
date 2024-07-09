import React from 'react';
import './Ticketing.css';
const Cell = ({ option, isSelected, onSelect, studentDiscount }) => {
  const { name, cost, studentCost, isAvailable } = option;

  return (
    <td 
      className={`cell ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
      onClick={isAvailable ? onSelect : null}
    >
      {isAvailable && (
        <>
          <div className="cell-title">{name}</div>
          <div className="cell-cost">£{studentDiscount ? studentCost : cost}</div>
          <div className="cell-description">Description</div>
        </>
      )}
    </td>
  );
};

export default Cell;
