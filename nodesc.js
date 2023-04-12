const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const urls = [];
const data = [];

function processNextUrl() {
  if (urls.length === 0) {
    // All URLs have been processed, so display the data
    console.log(data);
    rl.close();
    return;
  }

  const url = urls.shift();
  console.log(`Processing URL: ${url}`);

  const pythonProcess = spawn('python', ['urlimg.py', url]);

  // pythonProcess.stdout.on('data', (row) => {
  //   // const rowData = row.toString().trim().split(',');
  //   let rowData = row.toString().trim().split(',');
  //   rowData = rowData.map((item) => {
  //     return item.replace(/\+/g, ',');
  //   });
  //   data.push(rowData);
  //   console.log(`Received data: ${rowData}`);
  // });

  pythonProcess.stdout.on('data', (row) => {
    const rowData = row.toString().trim().split('\r\n');
    const subarrays = rowData.map(item => {
      const keyValue = item.split(':');
      return [keyValue[0].trim(), keyValue[1].trim()];
    });
    data.push(subarrays);
    console.log(`Received data: ${subarrays}`);
  });


  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    processNextUrl();
  });
}

rl.question('Enter URLs (separated by commas): ', (input) => {
  urls.push(...input.split(','));

  processNextUrl();
});
