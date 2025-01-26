exports.useDataBase = (db) => {
  db.mongoose
    .connect(db.url ?? process.env.MONGO_URI)
    .then(() => {
      console.log("Connection established with database");
    })
    .catch((err) => {
      if (err) {
        console.log("Database connection error!", err);
        process.exit();
      }
    });
};
