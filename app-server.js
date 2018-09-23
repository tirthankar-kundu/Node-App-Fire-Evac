const express = require("express");
const multer = require("multer");
const app = express();
const path = require("path");
const request = require("request");
const VisualRecognitionV3 = require("watson-developer-cloud/visual-recognition/v3");
const fs = require("fs");
const visualRecognition = new VisualRecognitionV3({
  url: "https://gateway.watsonplatform.net/visual-recognition/api",
  version: "2018-03-19",
  iam_apikey: "cmMv2Gc54kkZZG3KzGWh_oz-1J0QziEHkqHh-PoPeZ_X"
});

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

var classifier_ids = ["DefaultCustomModel_1436071585"]; //["DefaultCustomModel_1426182763"];
var threshold = 0.6;
app.use("/js", express.static(path.join(__dirname, "assets")));

const upload = multer({
  dest: "./upload/"
});

app.get("/download", (req, res) => {
  res.download(__dirname + "/downloads/find3Client.apk");
});

app.get("/classify", (req, res) => {
  //logger.log("info", "A request was received");
  res.sendfile("index.html");
});

app.post(
  "/upload",
  upload.single("file" /* name attribute of <file> element in your form */),
  (req, res) => {
    const tempPath = req.file.path;
    const targetPath = path.join(
      __dirname,
      "./upload/" + req.file.originalname
    );

    if (
      path.extname(req.file.originalname).toLowerCase() === ".png" ||
      path.extname(req.file.originalname).toLowerCase() === ".mp4" ||
      path.extname(req.file.originalname).toLowerCase() === ".jpg" ||
      path.extname(req.file.originalname).toLowerCase() === ".jpeg"
    ) {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);
        var images_file = fs.createReadStream(
          "./upload/" + req.file.originalname
        );
        var params = {
          images_file: images_file,
          classifier_ids: classifier_ids,
          threshold: threshold
        };

        visualRecognition.classify(params, function(err, response) {
          if (err) {
            console.log(err);
            res
              .status(403)
              .contentType("text/plain")
              .end("Error occured");
          } else {
            var classify = response.images[0].classifiers[0].classes;
            res.json(classify);
          }
        });
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png or .jpg or .jpeg files are allowed!");
      });
    }
  }
);

app.get("/location", (req, res) => {
  request("http://localhost:8005/api/v1/location/ibm_v3/tk1", function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      var dataObj = JSON.parse(body);
      console.log(dataObj.analysis.guesses);
      res.json(dataObj.analysis.guesses[0]);
    }
  });
  //res.json({ location: "entry", probability: 0.56 });
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
  // console.log("called");
  // var result = new Array();
  // for (var i = 0; i < 10; i++) {
  //   var resObj = new Object();
  //   resObj.name = "tk" + i;
  //   resObj.location = "p" + getRandomArbitrary(1, 7);
  //   result.push(resObj);
  // }
  // res.json(result);
});
function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pdf.html");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
