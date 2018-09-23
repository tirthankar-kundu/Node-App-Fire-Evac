const express = require("express");
const app = express();
const request = require("request");

app.get("/download", (req, res) => {
  res.download(__dirname + "/downloads/find3Client.apk");
});

app.get("/location", (req, res) => {
  // request("http://localhost:8005/api/v1/location/ibm_v3/tk1", function(
  //   error,
  //   response,
  //   body
  // ) {
  //   if (!error && response.statusCode == 200) {
  //     var dataObj = JSON.parse(body);
  //     console.log(dataObj.analysis.guesses);
  //     //console.log(dataObj);
  //     res.json(dataObj.analysis.guesses[0]);
  //   }
  // });
  res.json({ location: "p7", probability: 0.56 });
});

app.get("/locations", (req, res) => {
  request("http://localhost:8005/api/v1/locations/ibm_v3", function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      var dataObj = JSON.parse(body);
      //console.log(dataObj);
      var result = new Array();
      for (var item of dataObj.locations) {
        var resObj = new Object();
        resObj.name = item.device;
        resObj.location = item.prediction.location;
        result.push(resObj);
      }
      console.log("result", result);
      res.json(result);
    }
  });
});

http: app.listen(3000, () =>
  console.log("Example app listening on port 3000!")
);

app.get("/classify", (req, res) => {});
