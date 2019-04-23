const fluent = require("fluent-ffmpeg");
const fs = require("fs");
const ipfsClient = require("ipfs-http-client");
const node = ipfsClient("ipfs.infura.io", "5001", { protocol: "https" });
const audioExtractor = require("audioextractormodule");

const compress = (input, output, sizeString) => {
  return new Promise((resolve, reject) => {
    fluent(input)
      .size(sizeString)
      .save(output)
      .on("error", err => reject(err))
      .on("end", () => {
        resolve(output);
      });
  });
};

const downloadFileFromIPFS = hash => {
  return new Promise((resolve, reject) => {
    node.get(hash, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files[0].content);
      }
    });
  });
};

module.exports = {
  downloadFile: (hash, filePath) => {
    return new Promise((resolve, reject) => {
      downloadFileFromIPFS(hash)
        .then(buffer => {
          console.log("Writing File");
          const writer = fs.createWriteStream(filePath);
          writer.write(buffer);
          writer.end();
          console.log("Wrote File");
          resolve();
        })
        .catch(err => reject(err));
    });
  },
  extractAudio: (inputFilePath, outputFilePath, cb) => {
    audioExtractor.extract(inputFilePath, outputFilePath, cb);
  },
  compress: async (inputFilePath, outputFolderPath) => {
    const promises = [];
    fs.mkdir(outputFolderPath, err => {
      return err;
    });
    for (let i = 25; i < 76; i += 25) {
      // ffmpeg
      promises.push(
        compress(
          inputFilePath,
          `${outputFolderPath}/${inputFilePath.replace(".mp4", "")}_${i}.mp4`,
          `${i}%`
        )
      );
    }
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(val => {
          resolve(val);
        })
        .catch(e => reject(e));
    });
  },
  addToIPFS: file => {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, buffer) => {
        if (err) {
          reject(err);
        }
        node.add(buffer, (err, files) => {
          if (err) {
            reject(err);
          }
          resolve(files[0].hash);
        });
      });
    });
  }
};
