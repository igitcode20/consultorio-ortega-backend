const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String }, // Imagen opcional para las publicaciones médicas
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array de IDs que reaccionaron con ❤️
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);