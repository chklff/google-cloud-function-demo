
const {google} = require('googleapis');
const axios = require('axios');
const stream = require('stream');
const {promisify} = require('util');
const path = require('path');

const pipeline = promisify(stream.pipeline);

const keyFilename = path.join(__dirname, 'key.json'); // Make sure this path is correct

exports.uploadFileToDrive = async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFilename: keyFilename,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({version: 'v3', auth});

  const fileUrl = req.body.fileUrl; // Assuming the URL is sent in the request body
  const fileName = req.body.fileName; //'uploaded_file_name_here.mp4'; // Set the desired file name
  const folderId = req.body.filderId; //'132RJdlZuJQnzO7hf1nQdhcULUvdbQaa8'; // Folder ID where the file will be uploaded

  try {
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    });

    const fileMetadata = {
      name: fileName, // Or set your custom file name.
      parents: [folderId], // Specify the folder ID here
    };

    const media = {
      mimeType: response.headers['content-type'],
      body: response.data,
    };

    const createResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('File uploaded successfully. File ID:', createResponse.data.id);

    if (res && typeof res.status === 'function' && typeof res.send === 'function') {
      res.status(200).send( {fileId:`${createResponse.data.id}`, name: fileName });
    } else {
      console.error('Response object does not have the expected methods.');
      // Handle the case where res is not as expected. This might involve logging or invoking a fallback response mechanism.
    }
  } catch (error) {
    console.error('Error uploading file:', error);

    if (res && typeof res.status === 'function' && typeof res.send === 'function') {
      res.status(500).send(`Error uploading file: ${error.message}`);
    } else {
      console.error('Response object does not have the expected methods.');
      // Handle error when res is not as expected. This might involve logging or invoking a fallback error handling mechanism.
    }
  }
};

