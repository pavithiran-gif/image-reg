const readline = require("readline");
const { spawn } = require("child_process");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const urls = [];
const objectNames = JSON.parse(fs.readFileSync('objectNames.json'));

function processNextUrl(receivedData, outputFile) {
  if (urls.length === 0) {
    // All URLs have been processed, so write the received data to the JSON file
    fs.writeFile(outputFile, JSON.stringify(receivedData), (err) => {
      if (err) throw err;
      console.log(`Data saved to ${outputFile}`);
      fs.readFile("./data.json", (err, data) => {
        if (err) throw err;
      
        const receivedData = JSON.parse(data);
        const approvedImages = [];
        const deniedImages = [];
      
        for (const imagePredictions of receivedData) {
          let isApproved = true;
          const animalNames = [];
      
          for (const prediction of imagePredictions) {
            const animalName = prediction[0];
            const confidenceScore = parseFloat(prediction[1]);
            if (objectNames.includes(animalName) || confidenceScore < 0.5) {
              // Ignore images containing a person or with low confidence score
              isApproved = false;
              break;    
            }
            animalNames.push(animalName);
          }

          if (isApproved && animalNames.length > 0) {
            // approvedImages.push(animalNames);
            // approvedImages.push([animalNames, imagePredictions]);
            approvedImages.push(animalNames.map(name => [name, imagePredictions.find(pred => pred[0] === name)[1]]));

          } else {
            deniedImages.push(imagePredictions);
          }
        }
      
        console.log("Approved images:", approvedImages);
        console.log("Denied images:", deniedImages);
      rl.close();
    });
    });
    return;
  }

  const url = urls.shift();
  console.log(`Processing URL: ${url}`);

  const pythonProcess = spawn("python", ["urlimg.py", url]);

  pythonProcess.stdout.on("data", (row) => {
    const rowData = row.toString().trim().split("\r\n");
    const subarrays = rowData.map((item) => {
      const keyValue = item.split(":");
      return [keyValue[0].trim(), keyValue[1].trim()];
    });
    receivedData.push(subarrays);
    console.log(`Received data: ${subarrays}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    processNextUrl(receivedData, outputFile);
  });
}

rl.question("Enter URLs (separated by commas): ", (input) => {
  urls.push(...input.split(","));
  const receivedData = [];
  const outputFile = "./data.json";
  processNextUrl(receivedData, outputFile);
});


//   processNextUrl();
// });
