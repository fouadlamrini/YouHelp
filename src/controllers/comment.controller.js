const Comment = require("../models/Comment");
const Post = require("../models/Post");

class CommentController {
  /**
   * Crée un commentaire pour un post (ou une réponse si parentComment fourni).
   * Règles : les users avec role "connected" ne peuvent pas créer de commentaire.
   */
  async createComment(req, res) {
    try {
      const { postId } = req.params;
      const { content, parentComment } = req.body;

      // Validation basique
      if (!content || !content.trim()) {
        return res
          .status(400)
          .json({ message: "Le contenu du commentaire est requis" });
      }

      // Vérifier que le post existe
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post non trouvé" });

      // Vérifier rôle (middleware requireRole est recommandé, mais double-check ici)
      if (req.user && req.user.role === "connected") {
        return res.status(403).json({
          message:
            "Accès restreint : demandez l'accès à un administrateur pour commenter",
        });
      }

      // Traiter les fichiers envoyés (si multipart/form-data)
      const mediaFiles = (req.files || []).map((file) => {
        let type = "file";
        if (file.mimetype.startsWith("image")) type = "image";
        else if (file.mimetype.startsWith("video")) type = "video";
        else if (file.mimetype === "application/pdf") type = "pdf";
        else if (file.mimetype.includes("word")) type = "doc";
        return { url: `/uploads/${file.filename}`, type };
      });

      // Créer le commentaire avec éventuels médias
      const comment = await Comment.create({
        content: content.trim(),
        author: req.user.id,
        post: postId,
        parentComment: parentComment || null,
        media: mediaFiles,
      });

      // Si c'est un commentaire racine, on l'ajoute au tableau post.comments pour suivi
      if (!parentComment) {
        post.comments = post.comments || [];
        post.comments.push(comment._id);
        await post.save();
      }

      // Retourner le commentaire créé (simple)
      const populated = await Comment.findById(comment._id).populate(
        "author",
        "name email"
      );
      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  /**
   * Récupère tous les commentaires d'un post et construit une structure imbriquée
   * Trie les commentaires (et leurs réponses) par nombre de likes décroissant.
   * Lecture autorisée à tous (même `connected`).
   */
  async getCommentsByPost(req, res) {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post non trouvé" });

      // Récupère tous les commentaires liés à ce post
      const comments = await Comment.find({ post: postId }).populate(
        "author",
        "name email"
      );

      // Construire map id->comment et initialiser children
      const map = {};
      comments.forEach((c) => {
        map[c._id.toString()] = { ...c.toObject(), replies: [] };
      });

      const roots = [];
      comments.forEach((c) => {
        const id = c._id.toString();
        if (c.parentComment) {
          const parentId = c.parentComment.toString();
          if (map[parentId]) {
            map[parentId].replies.push(map[id]);
          } else {
            // si parent manquant, traiter comme racine
            roots.push(map[id]);
          }
        } else {
          roots.push(map[id]);
        }
      });

      // Fonction pour trier récursivement par likes
      const sortRecursive = (arr) => {
        arr.forEach((item) => {
          if (!item.likes) item.likes = [];
          if (item.replies && item.replies.length) sortRecursive(item.replies);
        });
        arr.sort(
          (a, b) =>
            (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0)
        );
      };

      sortRecursive(roots);

      return res.json({ success: true, data: roots });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  /**
   * Toggle like pour un commentaire : si l'utilisateur a déjà liké, on enlève le like, sinon on l'ajoute.
   * Les users `connected` ne peuvent pas liker.
   */
  async toggleLike(req, res) {
    try {
      const { id } = req.params; // id du commentaire

      if (req.user && req.user.role === "connected") {
        return res.status(403).json({
          message:
            "Accès restreint : demandez l'accès à un administrateur pour liker",
        });
      }

      const comment = await Comment.findById(id);
      if (!comment)
        return res.status(404).json({ message: "Commentaire non trouvé" });

      const userId = req.user.id;
      const alreadyLiked =
        comment.likes && comment.likes.some((u) => u.toString() === userId);

      if (alreadyLiked) {
        comment.likes = comment.likes.filter((u) => u.toString() !== userId);
        await comment.save();
        return res.json({
          success: true,
          message: "Like retiré",
          totalLikes: comment.likes.length,
        });
      }

      comment.likes = comment.likes || [];
      comment.likes.push(userId);
      await comment.save();
      return res.json({
        success: true,
        message: "Commentaire liké",
        totalLikes: comment.likes.length,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = new CommentController();
