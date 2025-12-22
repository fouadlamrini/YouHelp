const Post = require("../models/Post");

module.exports = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    
    if (req.user.role === "admin") {
      return next();
    }

    
    if (post.author.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({ message: "Access denied" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
