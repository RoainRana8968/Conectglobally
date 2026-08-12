// module.exports.placeorder = async (req, res) => {
//     try {
//         let { id } = req.params;
//         let object = await productobj.findById(id);

//         if (!object) {
//             return res.status(404).json({ message: "product notfound" });
//         }

//         return res.status(200).json({
//             message: "product object found",
//             success: true,
//             obj: object
//         });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: "something went wrong", error: err.message });
//     }
// }