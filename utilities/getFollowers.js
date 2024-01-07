// exports.getFollowers = async (req, res) => {
//     const id = req.query.id;
//     var condition = id ? { $regex: new RegExp(id), $options: "i" } : {};

//     await User.find(condition)
//       .then((data) => {
//         const followers = data.map((element) => element);
//         res.json(followers);
//       })
//       .catch((err) =>
//         res.status(500).json({ message: err.message ?? "Internal Server Error" })
//       );
// }
