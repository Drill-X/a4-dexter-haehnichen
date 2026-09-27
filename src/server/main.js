import express from "express";
import ViteExpress from "vite-express";

const app = express();

const port = 3000;

// helper class for the log of operations
class Operation {
  constructor(operator, value, acc) {
    this.operator = operator; //operator used for this operation
    this.value = value; //value used for this operation
    this.acc = acc; //the value of the accumulator after the operation was applied
  }
}

var accumulator = 0;
var operationLog = [new Operation("plus", 0, 0)];

app.get("/data", (req, res) => {
    res.writeHead(200, "OK", { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(operationLog))
  });

app.post("/submit", (req, res) => handleOperationSubmit(req, res))

const handleOperationSubmit = function (request, response) {
  let dataString = ''

  request.on('data', function (data) {
    dataString += data
  })

  request.on('end', function () {
    let input;
    try {
      input = JSON.parse(dataString)
    } catch {
      sendValidationError(response, "Invalid JSON");
    }
    // validate operator is add subtract multiply or divide
    if (!(["plus", "minus", "times", "divide"].includes(input.operator))) {
      sendValidationError(response, "Unsupported operation");
      return;
    }

    // validate value is a real number
    // the null part is because https://wtfjs.com/wtfs/2013-04-28-isfinite-null-is-true
    if (!Number.isFinite(input.value) || input.value === null) {
      sendValidationError(response, "Value is not a number");
      return;
    }

    // simulate perfoming the operation
    var canary = accumulator;
    if (input.operator === "plus")
      canary += input.value;
    else if (input.operator === "minus")
      canary -= input.value;
    else if (input.operator === "times")
      canary *= input.value;
    else if (input.operator === "divide") {
      if (input.value === 0) {
        sendValidationError(response, "Attempted to divide by zero")
        return;
      } else {
        canary /= input.value;
      }
    }

    // see if doing the operation breaks the accumulator
    // in some novel way that gets past the previous validations
    if (!Number.isFinite(canary) || input.value === null) {
      sendValidationError(response, "Unknown error");
      return;
    }

    // do the operation for real and add it to the log
    accumulator = canary
    operationLog.push(new Operation(input.operator, input.value, accumulator))


    response.writeHead(200, "OK", { 'Content-Type': 'text/plain' })
    response.end(JSON.stringify(operationLog))
  })
}

const sendValidationError = function (response, errorMessage) {
  response.writeHead(422, "Unprocessable Content", { 'Content-Type': 'text/plain' });
  response.end(errorMessage);
}

ViteExpress.listen(app, process.env.PORT || port, () =>
  console.log("Server is listening on port 3000..."),
);
