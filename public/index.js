let transactions = [];
let myChart;

fetch("/api/transaction")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach((transaction) => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td id="dateBox">${transaction.date}</td>
      <td>${transaction.name}</td>
      <td>${transaction.timein}</td>
      <td>${transaction.timeout}</td>
      <td>${transaction.value}</td>
    `;
    console.log(
      "populating the table with " +
        transaction.timein +
        " and " +
        transaction.timeout
    );
    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map((t) => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map((t) => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Over Time",
          fill: true,
          backgroundColor: "#6666ff",
          data,
        },
      ],
    },
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let timeinEl = document.querySelector("#t-timein");
  let timeoutEl = document.querySelector("#t-timeout");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || timeinEl.value === "" || timeoutEl.value === "") {
    errorEl.textContent = "missing information";
    return;
  } else if (timeinEl.value >= timeoutEl.value) {
    errorEl.textContent =
      "timein must be before timeout, timeout must be after timein.";
    return;
  } else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    timein: timeinEl.value,
    timeout: timeoutEl.value,
    value: timeoutEl.value - timeinEl.value,
    date: new Date().toISOString(),
  };
  console.log(
    "the new record has a " + transaction.timein + " and " + transaction.timeout
  );

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // also send to server
  fetch(
    "/api/transaction",
    {
      method: "POST",
      body: JSON.stringify(transaction),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    },
    console.log("WOWZA " + JSON.stringify(transaction))
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      } else {
        // clear form
        nameEl.value = "";
        timeinEl.value = "";
        timeoutEl.value = "";
      }
    })
    .catch((err) => {
      // fetch failed, so save in indexed db
      saveRecord(transaction);
      // clear form
      nameEl.value = "";
      timeinEl.value = "";
      timeoutEl.value = "";
    });
}

document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true);
};

// document.querySelector("#sub-btn").onclick = function() {
//   sendTransaction(false);
// };
