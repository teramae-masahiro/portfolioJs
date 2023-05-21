const amountInput = document.getElementById("amount");
const wordpressCheckbox = document.getElementById("wordpress");
const nextProjectCheckbox = document.getElementById("next_project");
const annualProjectCheckbox = document.getElementById("annual_project");
const firstTimeCheckbox = document.getElementById("first_time");
const resultSpan = document.getElementById("result");
const resultSpanWithTax = document.getElementById("resultWithTax");
const calcMessage = document.getElementById("calcMessage");

function zenkakuToHankaku(str) {
  return str.replace(/[０-９]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });
}

function animateValue(start, end, duration, element) {
  const range = end - start;
  const startTime = new Date().getTime();
  let currentValue = start;

  function updateValue() {
    const now = new Date().getTime();
    const progress = now - startTime;
    currentValue = Math.floor(start + (progress / duration) * range);
    if ((start < end && currentValue > end) || (start > end && currentValue < end)) {
      currentValue = end;
    }
    element.textContent = currentValue.toLocaleString();
    if (currentValue !== end) {
      requestAnimationFrame(updateValue);
    }
  }
  requestAnimationFrame(updateValue);
}

function calculate() {
  const amountStr = zenkakuToHankaku(amountInput.value);
  const amount = parseInt(amountStr, 10);
  const tax = 10;
  calcMessage.textContent = "";
  if (isNaN(amount) || amount === 0) {
    resultSpan.textContent = "0";
    resultSpanWithTax.textContent = "0";
    return;
  }

  let percentage = 70;
  percentage = Math.max(percentage, 0);

  if(!nextProjectCheckbox.disabled) {
    if(nextProjectCheckbox.checked) {
      percentage -= 10;
    }
  }
  if(!annualProjectCheckbox.disabled) {
    if(annualProjectCheckbox.checked) {
      percentage -= 20;
    }
  }
  if (firstTimeCheckbox.checked) {
    percentage -= 20;
  }

  let result, includeTax;
  if (wordpressCheckbox.checked) {
    result = Math.floor(amount * (percentage / 100) * 1.2);
    includeTax = Math.floor(result * (1 + tax / 100));
  } else {
    result = Math.floor(amount * (percentage / 100));
    includeTax = Math.floor(result * (1 + tax / 100));
  }
  let message;

  message = "";
  if (!nextProjectCheckbox.checked && !annualProjectCheckbox.checked) {
    message += "「継続のお約束」で更にお得に！";
  }
  if (nextProjectCheckbox.checked) {
    message += "年間のお約束が一番オトクです！";
  }
  if (annualProjectCheckbox.checked && firstTimeCheckbox.checked) {
    let nextTimePercentage = percentage + 20;
    let nextTimeResult;
    if (wordpressCheckbox.checked) {
        nextTimeResult = Math.floor(amount * (nextTimePercentage / 100) * 1.2);
    } else {
        nextTimeResult = Math.floor(amount * (nextTimePercentage / 100));
    }
    let nextTimeIncludeTax = Math.floor(nextTimeResult * (1 + tax / 100));
    message += `次回以降のお支払は${nextTimeIncludeTax}(税込み)円です`;
  }
  calcMessage.textContent = message;
  const currentResult = parseInt(resultSpan.textContent.replace(/,/g, ""), 10) || 0;
  const currentResultWithTax = parseInt(resultSpanWithTax.textContent.replace(/,/g, ""), 10) || 0;
  animateValue(currentResult, result, 500, resultSpan);
  animateValue(currentResultWithTax, includeTax, 500, resultSpanWithTax);
}

function updateCheckboxStatus() {
  if (annualProjectCheckbox.checked) {
    nextProjectCheckbox.disabled = true;
    nextProjectCheckbox.checked = false;
    nextProjectCheckbox.parentElement.classList.add('is-disabled');
  } else {
    nextProjectCheckbox.disabled = false;
    nextProjectCheckbox.parentElement.classList.remove('is-disabled');
  }

  if (nextProjectCheckbox.checked) {
    annualProjectCheckbox.disabled = true;
    annualProjectCheckbox.checked = false;
    annualProjectCheckbox.parentElement.classList.add('is-disabled');
  } else {
    annualProjectCheckbox.disabled = false;
    annualProjectCheckbox.parentElement.classList.remove('is-disabled');
  }
}

amountInput.addEventListener("input", calculate);
wordpressCheckbox.addEventListener("change", calculate);
firstTimeCheckbox.addEventListener("change", calculate);
nextProjectCheckbox.addEventListener("change", () => {
  updateCheckboxStatus();
  calculate();
});
annualProjectCheckbox.addEventListener('change', () => {
  updateCheckboxStatus();
  calculate();
});
