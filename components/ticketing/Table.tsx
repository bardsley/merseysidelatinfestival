'use client'
import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import DiscountMessage from './DiscountMessage';
// import './Ticketing.css';

const initialOptions = {
  Friday: [
    { name: 'Party', cost: 15, studentCost: 10, isAvailable: true },
    { name: 'Classes', cost: 0, studentCost: 0, isAvailable: false },
    { name: 'Dinner', cost: 0, studentCost: 0, isAvailable: false },
  ],
  Saturday: [
    { name: 'Party', cost: 22, studentCost: 15, isAvailable: true },
    { name: 'Classes', cost: 55, studentCost: 45, isAvailable: true },
    { name: 'Dinner', cost: 40, studentCost: 40, isAvailable: true },
  ],
  Sunday: [
    { name: 'Party', cost: 15, studentCost: 10, isAvailable: true },
    { name: 'Classes', cost: 55, studentCost: 45, isAvailable: true },
    { name: 'Dinner', cost: 0, studentCost: 0, isAvailable: false },
  ],
};

const predefinedPrices = {
  'Friday Pass': 15,
  'Saturday Pass': 95,
  'Sunday Pass': 59,
  'Class Pass': 95,
  'Dine and Dance Pass': 60,
  'Party Pass': 45,
  'Full Pass': 125,
};

const predefinedStudentPrices = {
  'Saturday Pass': 85,
  'Sunday Pass': 50,
  'Class Pass': 85,
  'Dine and Dance Pass': 55,
  'Party Pass': 35,
  'Full Pass': 110,
};

const allowedCombinationSums = [
  ['Sunday Pass', 'Saturday Pass'],
  ['Party Pass', 'Class Pass'],
  ['Class Pass', 'Dine and Dance Pass'],
];

const Table = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [discountMessages, setDiscountMessages] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [studentDiscount, setStudentDiscount] = useState(false);
  const [studentDiscountMessage, setStudentDiscountMessage] = useState('');

  const handleCellSelect = (day, option) => {
    const key = `${day}-${option.name}`;
    setSelectedOptions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleColumnSelect = (day) => {
    const dayOptions = initialOptions[day];
    const dayKeys = dayOptions
      .filter((option) => option.isAvailable)
      .map((option) => `${day}-${option.name}`);
    const allSelected = dayKeys.every((key) => selectedOptions.includes(key));

    setSelectedOptions((prev) =>
      allSelected ? prev.filter((item) => !dayKeys.includes(item)) : [...prev, ...dayKeys]
    );
  };

  const handleRowSelect = (rowName) => {
    const rowKeys = Object.keys(initialOptions).flatMap((day) =>
      initialOptions[day]
        .filter((option) => option.name === rowName && option.isAvailable)
        .map((option) => `${day}-${option.name}`)
    );
    const allSelected = rowKeys.every((key) => selectedOptions.includes(key));

    setSelectedOptions((prev) =>
      allSelected ? prev.filter((item) => !rowKeys.includes(item)) : [...prev, ...rowKeys]
    );
  };

  const handleFullPassToggle = () => {
    const allKeys = Object.keys(initialOptions).flatMap((day) =>
      initialOptions[day]
        .filter((option) => option.isAvailable)
        .map((option) => `${day}-${option.name}`)
    );
    const allSelected = allKeys.every((key) => selectedOptions.includes(key));

    setSelectedOptions(allSelected ? [] : allKeys);
  };

  const handleStudentDiscountToggle = () => {
    setStudentDiscount((prev) => !prev);
  };

  const calculateTotalCost = () => {
    // const selectedCombinationMessages = [];
    let cost = 0;

    const checkCombination = (combination) => {
      return combination.criteria.every((key) => selectedOptions.includes(key));
    };

    const combinations = [
      {
        message: 'Saturday Pass',
        criteria: ['Saturday-Classes', 'Saturday-Dinner', 'Saturday-Party'],
      },
      {
        message: 'Sunday Pass',
        criteria: ['Sunday-Classes', 'Sunday-Party'],
      },
      {
        message: 'Class Pass',
        criteria: ['Saturday-Classes', 'Sunday-Classes'],
      },
      {
        message: 'Dine and Dance Pass',
        criteria: ['Saturday-Dinner', 'Saturday-Party'],
      },
      {
        message: 'Party Pass',
        criteria: ['Friday-Party', 'Saturday-Party', 'Sunday-Party'],
      },
      {
        message: 'Full Pass',
        criteria: [
          'Friday-Party', 'Saturday-Classes', 'Saturday-Dinner', 'Saturday-Party', 'Sunday-Classes', 'Sunday-Party',
        ],
      },
    ];

    const matchedCombinations = combinations.filter(checkCombination);
    console.log(matchedCombinations)
    let matchedCombinationMessages = matchedCombinations.map(combo => combo.message);

    // Handle Full Pass exclusion logic
    if (matchedCombinationMessages.includes('Full Pass')) {
      console.log("Offered full pass")
      matchedCombinationMessages = ['Full Pass'];
      cost = studentDiscount ? predefinedStudentPrices['Full Pass'] : predefinedPrices['Full Pass'];
      setDiscountMessages(matchedCombinationMessages);
      setTotalCost(cost);
      return;
    }

    // Handle Saturday Pass and Dine and Dance Pass conflict
    if (matchedCombinationMessages.includes('Saturday Pass') && matchedCombinationMessages.includes('Dine and Dance Pass')) {
      console.log("Offered Dine and Dance Pass")
      matchedCombinationMessages = matchedCombinationMessages.filter(msg => msg !== 'Dine and Dance Pass');
    }

    // Minimize individual selections
    if (matchedCombinationMessages.length > 1) {
      const allowedCombinations = allowedCombinationSums.filter(
        allowedCombo => allowedCombo.every(combo => matchedCombinationMessages.includes(combo))
      );
      console.log("Allowed:",allowedCombinations)

      if (allowedCombinations.length > 0) {
        const combinationItemCounts = matchedCombinations.reduce((acc, combo) => {
          acc[combo.message] = combo.criteria.length;
          return acc;
        }, {});

        const bestCombination = allowedCombinations.reduce((prev, curr) => {
          const prevCount = prev.reduce((acc, msg) => acc + (combinationItemCounts[msg] || 0), 0);
          const currCount = curr.reduce((acc, msg) => acc + (combinationItemCounts[msg] || 0), 0);
          return currCount < prevCount ? curr : prev;
        });
        console.log("Matched 1:",matchedCombinationMessages)
        matchedCombinationMessages = bestCombination;
      } else {
        console.log("Matched 2:",matchedCombinationMessages)
        // matchedCombinationMessages = [matchedCombinationMessages[0]]; 
      }
    }

    matchedCombinationMessages.forEach((message) => {
      cost += studentDiscount
        ? predefinedStudentPrices[message]
        : predefinedPrices[message];
    });

    const selectedCombinationKeys = matchedCombinations.flatMap(combo => combo.criteria);

    const remainingKeys = selectedOptions.filter(
      (key) => !selectedCombinationKeys.includes(key)
    );

    remainingKeys.forEach((key) => {
      const [day, optionName] = key.split('-');
      const option = initialOptions[day].find((opt) => opt.name === optionName);
      cost += studentDiscount ? option.studentCost : option.cost;
    });

    setDiscountMessages(matchedCombinationMessages);
    setTotalCost(cost);
  };

  useEffect(() => {
    calculateTotalCost();
    setStudentDiscountMessage(studentDiscount ? "Student prices require you provide a valid student ID on the day of the event." : "");
  }, [selectedOptions, studentDiscount]);

  const allSelected = selectedOptions.length === 6
  const toggleFullPassCss = allSelected ?  'bg-chillired-700' : 'bg-chillired-300 border border-chillired-700';
  return (
    <div className="table-container  w-full max-w-6xl mx-auto">
      <h1 className='text-3xl font-bold mt-6'>Ticket and pass options</h1>
      <h2>Select the element&apos;s you want from the weekend and we&apos;ll calculate the best price</h2>
      <table className="option-table table-auto border-collapse border-b border-chillired-300 ">
        <thead>
          <tr>
            <th>
            <button onClick={handleFullPassToggle} 
              className={`${toggleFullPassCss} rounded-md px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-chillired-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chillired-600`}
            >Full Pass</button>
            </th>
            {Object.keys(initialOptions).map((day) => {
              return (<th key={day} className='px-24 py-6'>
                {day}
              </th>
              )})}
          </tr>
          <tr>
            <th className='border border-chillired-300'>Full  Day</th>
            {Object.keys(initialOptions).map((day) => {
              const isSelected = day == 'Saturday' && selectedOptions.includes(`${day}-Classes`) && selectedOptions.includes(`${day}-Party`) && selectedOptions.includes(`${day}-Dinner`) ? true
                  : day == 'Sunday' && selectedOptions.includes(`${day}-Classes`) && selectedOptions.includes(`${day}-Party`) ? true
                    : false
              return (<th key={day} className='py-6 border border-chillired-300'>
                { day != 'Friday' ? <Cell
                  key={`${day}-full`}
                  option={{ name: `${day}-Pass`, cost: predefinedPrices[`${day} Pass`], studentCost: predefinedStudentPrices[`${day} Pass`], isAvailable: true }}
                  isSelected={isSelected}
                  onSelect={() => handleColumnSelect(day)}  
                  studentDiscount={studentDiscount}             
                /> : <>N/A</>}
              </th>
              )})}
          </tr>
        </thead>
        <tbody>
          {['Party', 'Classes', 'Dinner'].map((row, rowIndex) => (
            <tr key={row}>
              <th className="rowSelector border border-chillired-300 py-6 px-24 " onClick={() => handleRowSelect(row)}>{row}</th>

              {Object.keys(initialOptions).map((day) => (
                <td className='border border-chillired-300 py-6' key={`${day}-${row}`}>
                <Cell
                  option={initialOptions[day][rowIndex]}
                  isSelected={selectedOptions.includes(`${day}-${row}`)}
                  onSelect={() => handleCellSelect(day, initialOptions[day][rowIndex])}
                  studentDiscount={studentDiscount}
                />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <caption className='caption-bottom pt-3'>
          If you&apos;re a student we offer a  
          <button
            className={`student-discount-toggle ${studentDiscount ? 'active' : ''} inline pl-1 underline`}
            onClick={handleStudentDiscountToggle}
          >
            student discount
          </button>
          {studentDiscount && (
            <div className="student-discount-message">
              {studentDiscountMessage}
            </div>
          )}
        </caption>
      </table>
      <DiscountMessage message={discountMessages.join(', ')} />
      <div className="total-cost">
        Total Cost: ${totalCost}
      </div>
      <button className="checkout-button" onClick={() => console.log('Checkout', selectedOptions)}>
        Checkout
      </button>
      <div className="debug-selected-items">
        {selectedOptions.join(', ')}
      </div>
    </div>
  );
};

export default Table; 