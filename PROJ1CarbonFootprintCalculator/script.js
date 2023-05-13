window.onload = function() {
  // Get form and results elements
  const carbonForm = document.getElementById('carbon-form');
  const carbonResults = document.getElementById('carbon-results');
  const resultsTable = document.getElementById('resultsTable');
  
  // don't show any results until the form is submitted
  carbonResults.style.display = 'none'
  
  const transportationResult = document.getElementById('transportationResult')
  const electricityResult = document.getElementById('electricityResult')
  const gasResult = document.getElementById('gasResult')
  
  let API_KEY = '3mcAuUti4rehWo2poWg9Og'
  
  // 35a59281-c4e0-4340-9ec9-f58ed4ca7435
  // 5f543ecf-60b2-4054-a02f-1557fe840dba (Fiat 500 2013)

  resArray = []
  if (localStorage.getItem('resArray')) {
    resArray = JSON.parse(localStorage.getItem("resArray"));
  }
  // append results to table
  for (r of resArray) {
    resultsTable.insertRow()
    for (let c of r) {
      let cell = resultsTable.rows[resultsTable.rows.length - 1].insertCell()
      cell.textContent = c
    }
  }

  // add action to clear button
  clearButton = document.getElementById('clear')
  clearButton.addEventListener("click", (e) => {
    resultsTable.innerHTML = ''
    localStorage.setItem("resArray", "")
  })
  
  let templates = {
    'transportation': ' km driven per week',
    'electricity': ' kWh per month of electricity consumption',
    'gas': ' therms per month of natural gas consumption',
    'diet': ' servings of meat consumed per week',
  }
  
  // Listen for form submission
  carbonForm.addEventListener('submit', function(event) {
    event.preventDefault(); // prevent form submission
    
    // Get form input values
    const transportationInput = document.getElementById('transportation').value;
    const electricityInput = document.getElementById('electricity').value;
    const naturalGasInput = document.getElementById('natural-gas').value;
    
    // set up result object
    results = {}
    
    transportationPromise = fetch(`https://www.carboninterface.com/api/v1/estimates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    body: JSON.stringify({
      "type": "vehicle",
      "distance_unit": "km",
      "distance_value": transportationInput,
      "vehicle_model_id": "5f543ecf-60b2-4054-a02f-1557fe840dba",
    }),
  }).then( r => r.json() ).then(
    decoded => {
      results['transportation'] = decoded.data.attributes.carbon_kg
      transportationResult.innerHTML = `${decoded.data.attributes.carbon_kg} kg - ${transportationInput} ${templates.transportation}`
    }
    ).catch(e => {
      console.log(e)
    })
    
    electricityPromise = fetch(`https://www.carboninterface.com/api/v1/estimates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    body: JSON.stringify({
      "type": "electricity",
      "electricity_unit": "mwh",
      "electricity_value": 30,
      "country": "us",
      "state": "ny"
    })
  }
  )
  .then(r => r.json()) // parse response data as JSON
  .then(decoded => {
    results['electricity'] = decoded.data.attributes.carbon_kg
    electricityResult.innerHTML = `${decoded.data.attributes.carbon_kg} kg - ${electricityInput} ${templates.electricity}`
    
    // get 
  })
  .catch(error => {
    console.error('Error:', error);
  });
  
  gasPromise = fetch(`https://www.carboninterface.com/api/v1/estimates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    body: JSON.stringify({
      "type": "fuel_combustion",
      "fuel_source_type": "dfo",
      "fuel_source_unit": "btu",
      "fuel_source_value": naturalGasInput,
    })
  }
  )
  .then(r => r.json()) // parse response data as JSON
  .then(decoded => {
    results['gas'] = decoded.data.attributes.carbon_kg
    gasResult.innerHTML = `${decoded.data.attributes.carbon_kg} kg - ${naturalGasInput} ${templates.gas}`    
  })
  .catch(error => {
    console.error('Error:', error);
  });

  Promise.all([gasPromise, electricityPromise, transportationPromise]).then(responses => {
    // show the results
    carbonResults.style.display = 'block'
    carbonFootprint = Math.trunc(Object.values(results).reduce((a,c)=>a+c,0))
    carbonTotal.innerHTML = `Your carbon footprint is ${carbonFootprint} tons per year.`

    resArray = []
    resultsTable.innerHTML = ''
    if (localStorage.getItem('resArray')) {
      resArray = JSON.parse(localStorage.getItem("resArray"));
      resArray.push([new Date().toUTCString(), results.transportation, results.electricity, results.gas])
      localStorage.setItem("resArray", JSON.stringify(resArray))
    }
    else {
      resArray.push([new Date().toUTCString(), results.transportation, results.electricity, results.gas])
      localStorage.setItem("resArray", JSON.stringify(resArray))
    }

    // append results to table  
    for (r of resArray) {
      resultsTable.insertRow()
      for (let c of r) {
        let cell = resultsTable.rows[resultsTable.rows.length - 1].insertCell()
        cell.textContent = c
      }
    }
  }).catch(e => {
    console.log(e)
  })
});
}