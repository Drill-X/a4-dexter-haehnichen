import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
//import "./App.css";
import "./main.css";

// returns a string representation of the number, capped at 8 digits of precision
// in order to avoid floating point nonsense
const formatNumber = function (num) {
  return ((num.toString().length < 9) ? num.toString() : num.toFixed(8));
}

const operatorToSymbol = function(operator) {
  if (operator === "plus") 
    return "+";
  else if (operator === "minus")
    return "−";
  else if (operator === "times")
    return "×";
  else if (operator === "divide")
    return "÷";
  else 
    return "error";
}

const HistoryEntry = operation => (
  <li class='history-entry'>
    {operatorToSymbol(operation.operator)} {formatNumber(operation.value)} = {formatNumber(operation.acc)}
  </li>
);

function App() {
  const operationForm = document.getElementById("operation-form");
  const accumulator = document.getElementById("accumulator");
  const historyTop = document.getElementById("history-list");

  const [count, setCount] = useState(0);
  const [operations, setOperations] = useState([]);

  const submitOperation = async function (event) {
    // react does something that makes this unnecessary
    event.preventDefault()

    // I pulled this way of handling data from 
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio
    const data = new FormData(operationForm);
    const json = { operator: data.get("operator"), value: Number.parseFloat(data.get("value")) };
    const body = JSON.stringify(json)

    const response = await fetch('/submit', {
      method: 'POST',
      body
    })

    const responseJson = await response.json()
    setOperations(responseJson)
  }

  useEffect(() => {
    // make sure to only do this once
    if (operations.length === 0) {
      fetch('/data')
        .then(response => response.json())
        .then(json => {
          setOperations(json)
        })

    }
  })

  return (
    <div className="App">
      <h1>Crowdsourced Number</h1>

      <main>
        <accumulator-display><small>Right now the number is: </small><strong id="accumulator">{(operations.length === 0) ? "Awaiting server data" : operations.at(-1).acc}</strong></accumulator-display>

        <h2>Change the number</h2>
        <form id="operation-form">
          <div>
            <input type="radio" id="operator-select-add" name="operator" defaultChecked required value="plus" />
            <label for="operator-select-add">+</label>

            <input type="radio" id="operator-select-sub" name="operator" value="minus" />
            <label for="operator-select-sub">−</label>

            <input type="radio" id="operator-select-mul" name="operator" value="times" />
            <label for="operator-select-mul">×</label>

            <input type="radio" id="operator-select-div" name="operator" value="divide" />
            <label for="operator-select-div">÷</label>
          </div>

          <input type="number" id="value-input" step="any" required name="value" />
          <button type="submit" onClick={e => submitOperation(e)}>submit</button>
        </form>

        <h2 id="history-header">History</h2>
        <ul id="history-list">
          {operations.toReversed().map((operation, i) => <HistoryEntry key={i} operator={operation.operator} value={operation.value} acc={operation.acc} />)}
        </ul>
      </main>
    </div>
  );
}

export default App;
