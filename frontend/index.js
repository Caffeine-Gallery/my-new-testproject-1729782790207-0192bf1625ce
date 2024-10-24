import { backend } from 'declarations/backend';

const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');
const clearBtn = document.getElementById('clear');
const equalsBtn = document.getElementById('equals');

let currentInput = '';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

buttons.forEach(button => {
    if (button !== clearBtn && button !== equalsBtn) {
        button.addEventListener('click', () => {
            handleInput(button.textContent);
        });
    }
});

clearBtn.addEventListener('click', clear);
equalsBtn.addEventListener('click', calculate);

function handleInput(value) {
    if (value >= '0' && value <= '9' || value === '.') {
        if (waitingForSecondOperand) {
            currentInput = value;
            waitingForSecondOperand = false;
        } else {
            currentInput = currentInput === '0' ? value : currentInput + value;
        }
    } else if (['+', '-', '*', '/'].includes(value)) {
        if (firstOperand === null) {
            firstOperand = parseFloat(currentInput);
        } else if (operator) {
            calculate();
        }
        operator = value;
        waitingForSecondOperand = true;
    }
    updateDisplay();
}

function updateDisplay() {
    display.value = currentInput;
}

function clear() {
    currentInput = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    updateDisplay();
}

async function calculate() {
    if (operator && !waitingForSecondOperand) {
        const secondOperand = parseFloat(currentInput);
        let result;

        try {
            switch (operator) {
                case '+':
                    result = await backend.add(firstOperand, secondOperand);
                    break;
                case '-':
                    result = await backend.subtract(firstOperand, secondOperand);
                    break;
                case '*':
                    result = await backend.multiply(firstOperand, secondOperand);
                    break;
                case '/':
                    if (secondOperand === 0) {
                        throw new Error('Division by zero');
                    }
                    const divisionResult = await backend.divide(firstOperand, secondOperand);
                    result = divisionResult ? divisionResult : 'Error';
                    break;
            }

            currentInput = result.toString();
            firstOperand = result;
            operator = null;
            waitingForSecondOperand = false;
            updateDisplay();
        } catch (error) {
            currentInput = 'Error';
            updateDisplay();
            console.error('Calculation error:', error);
        }
    }
}
