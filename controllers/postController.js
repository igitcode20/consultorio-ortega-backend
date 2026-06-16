const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        let imageBase64 = "";

        if (req.file) {
            imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        const newPost = await Post.create({ title, content, image: imageBase64 });
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Publicación no encontrada' });

        const index = post.likes.indexOf(req.user.id);
        if (index === -1) {
            post.likes.push(req.user.id); 
        } else {
            post.likes.splice(index, 1); 
        }

        await post.save();
        res.json({ totalLikes: post.likes.length, hasLiked: index === -1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ message: 'Publicación no encontrada' });
        res.json({ message: 'Publicación eliminada del muro' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};