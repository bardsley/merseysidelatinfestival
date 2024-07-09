import React from 'react';

const DiscountMessage = ({ message }) => (
  <div className="discount-message">
    {message && message.split(', ').map((msg, idx) => (
      <div key={idx}>
        <h3>{msg}</h3>
      </div>
    ))}
  </div>
);

export default DiscountMessage;
