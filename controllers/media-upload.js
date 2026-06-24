const MediaUpload = require("../models/media-upload");
const { success, error, notFound, badRequest } = require("../utilities/response");

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
    const dateTime = new Date().toISOString();
    const fileName = `${req.file.originalname.replace(/\s/g, "_")}_${dateTime}`;
    const storageRef = ref(storage, `files/${fileName}`);

    const metaData = {
      contentType: req.file.mimetype,
      customMetadata: {
        fileSize: req.file.size.toString(),
      },
    };

    const snapShot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metaData
    );

    const downloadURL = await getDownloadURL(snapShot.ref);

    if (downloadURL) {
      const uploadToDB = new MediaUpload({
        clientID: req.query.clientID,
        image: [{ imageURL: downloadURL, metaData }],
      });

      const data = await uploadToDB.save();
      return success(res, {
        name: req.file.originalname,
        type: req.file.mimetype,
        downloadURL,
      }, "File uploaded successfully");
    }
  } catch (err) {
    console.error("Error uploading file:", err.message);
    return error(res, "Failed to upload file");
  }
};

exports.getCustomerImages = async (req, res) => {
  try {
    if (!req.query.clientID) {
      return badRequest(res, "Bad Request");
    }

    const clientMedia = await MediaUpload.find({
      clientID: req.query.clientID,
    });

    if (!clientMedia) {
      return notFound(res, "Client or media not found");
    }

    return success(res, clientMedia);
  } catch (err) {
    return error(res, err.message);
  }
};
