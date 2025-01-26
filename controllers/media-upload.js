const MediaUpload = require("../models/media-upload");

const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");

const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
  measurementId: process.env.MEASUREMENTID,
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

exports.uploadOneFile = async (req, res) => {
  try {
    // Generate unique file path with a full timestamp
    const dateTime = new Date().toISOString();
    const fileName = `${req.file.originalname.replace(/\s/g, "_")}_${dateTime}`;
    const storageRef = ref(storage, `files/${fileName}`);

    // Metadata with additional information
    const metaData = {
      contentType: req.file.mimetype,
      customMetadata: {
        // uploadedBy: req.query.userEmail, // Example of custom data
        fileSize: req.file.size.toString(),
      },
    };

    // Upload file to Firebase Storage
    const snapShot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metaData
    );

    // Get the download URL
    const downloadURL = await getDownloadURL(snapShot.ref);

    if (downloadURL) {
      const uploadToDB = await new MediaUpload({
        clientID: req.query.clientID,
        image: [{ imageURL: downloadURL, metaData }],
      });

      await uploadToDB
        .save(uploadToDB)
        .then((data) => {
          console.log("File successfully uploaded:", fileName);
          //   res.json(data);

          return res.send({
            message: "File uploaded successfully",
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).send({ message: "Not found" });
        });
    }
  } catch (err) {
    console.error("Error uploading file:", err.message);
    return res
      .status(500)
      .send({ error: "Failed to upload file", details: err.message });
  }
};

exports.getCustomerImages = async (req, res) => {
  try {
    if (!req.query.clientID) {
      res.status(400).json({ message: "Bad Request" });
      return;
    }

    //Index query to find from ascending order - for better performance and to avoid collection scan
    const clientMedia = await MediaUpload.find({
      clientID: req.query.clientID,
    });

    if (!clientMedia) {
      res.status(404).json({ message: "Client or media not found" });
    } else {
      res.json(clientMedia);
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message, status: "Internal Server Error" });
  }
};
