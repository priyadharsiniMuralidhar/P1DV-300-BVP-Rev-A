// server.js
// where your node app starts

// init project
const express = require("express");

const fetch = require("node-fetch");

const app = express();

// set the view engine to ejs with html file extension
app.engine("html", require("ejs").renderFile);

//needed for fetch calls
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// http://expressjs.com/en/starter/static-files.html
// Static pages provided by application

app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
// Starting point for application
app.get("/", function (request, response) {
  var companyId = process.env.DAVINCI_COMPANY_ID;
  var flowURL = process.env.DAVINCI_FLOW_URL;
  console.log(companyId);

  response.render("index.html", {
    companyId: companyId,
    flowURL: flowURL,
  });
});

// example of calling DaVinci flow as API.
// Calls the flow and then returns the returned data back to calling page
app.post("/fetchJackpotData", function (request, response) {
  const apiURL =
    process.env.DAVINCI_API_URL +
    "v1/company/" +
    process.env.DAVINCI_COMPANY_ID +
    "/policy/" +
    request.body.policyId +
    "/start";

  console.log("Flow URL: " + apiURL);

  var requestOptions = {
    method: "POST",
    headers: {
      "X-SK-API-KEY": process.env.DAVINCI_API_KEY,
      "Content-Type": "application/json",
    },
    redirect: "follow",
  };

  //*** Call Jackpot flow to receieve country specific jackpot ***/
  fetch(apiURL, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      var jsonData = JSON.parse(result);
      if (
        jsonData.additionalProperties &&
        (jsonData.additionalProperties.httpStatusCode === 200 || jsonData.additionalProperties.httpStatusCode === 0)
      ) {
        result = jsonData.additionalProperties;
        console.log(result);
        response.send(result);
      } else {
        console.log("Error retriving jackpot data!");
      }
    })
    .catch((error) => console.log("error", error));
});

// Fetch the DaVinci token used by the loadwidget process
app.get("/fetchDaVinciToken", function (request, response) {
  const apiURL =
    process.env.DAVINCI_API_URL +
    "v1/company/" +
    process.env.DAVINCI_COMPANY_ID +
    "/sdktoken";

  // const skGetTokenUrl = tokenURL + "/v1/company/" + companyId + "/sdktoken";

  console.log("Flow URL: " + apiURL);

  var requestOptions = {
    method: "GET",
    headers: {
      "X-SK-API-KEY": process.env.DAVINCI_API_KEY,
    },
    redirect: "follow",
  };

  //*** Call DaVinci API to Get Token flow to access token ***/
  fetch(apiURL, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      response.send(result);
    })
    .catch((error) => console.log("error", error));

  //   response.send(resp);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);

  // Log some basic variables, verify server side code working when looking at log
  // Values set when variables defined

  console.log("DaVinci API URL: " + process.env.DAVINCI_API_URL);
  console.log("DaVInci Flow URL: " + process.env.DAVINCI_FLOW_URL);
});
