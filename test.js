let compressor = require("./index");

const hash = "QmNgpcGFhE1ypCtHaYbPi4yDrzoVtVrYymKDZTfK2N4Dot";
const timestamp = Date.now();
const filePath = `file_${timestamp}.mp4`;
const outputPath = `output_${timestamp}`;
const audioOutputFile = `${outputPath}/audio_file.mp3`;
compressor
  .downloadFile(hash, filePath)
  .then(() => {
    compressor
      .compress(filePath, outputPath)
      .then(files => {
        files.forEach(file => {
          compressor
            .addToIPFS(file)
            .then(hash => {
              console.log(hash);
            })
            .catch(e => console.log(e));
        });
      })
      .catch(e => console.log(e));
    compressor.extractAudio(filePath, audioOutputFile, () => {
      compressor
        .addToIPFS(audioOutputFile)
        .then(hash => console.log(hash))
        .catch(e => console.log(e));
    });
  })
  .catch(e => console.log(e));
