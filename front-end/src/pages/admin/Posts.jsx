import { useState, useEffect } from "react";
import api from "../../services/api";

export default function PostsDashboard({ user }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    subCategory: "",
    tags: "",
    media: null,
  });

  // ===== FETCH DATA =====
  const fetchPosts = async () => {
    try {
      const res = await api.get("/post");
      setPosts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setPosts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data.data || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await api.get("/subcategory");
      setSubCategories(res.data.data || []);
    } catch (err) {
      setSubCategories([]);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchSubCategories();
  }, []);

  // ===== HANDLE INPUT =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewPost({ ...newPost, media: e.target.files });
  };

  // ===== ADD POST =====
  const handleAddPost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("content", newPost.content);
      formData.append("category", newPost.category);
      formData.append("subCategory", newPost.subCategory);
      formData.append("tags", newPost.tags);
      if (newPost.media) {
        for (let i = 0; i < newPost.media.length; i++) {
          formData.append("media", newPost.media[i]);
        }
      }

      await api.post("/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewPost({ title: "", content: "", category: "", subCategory: "", tags: "", media: null });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  // ===== DELETE POST =====
  const deletePost = async (postId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/post/${postId}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  // ===== TOGGLE REACTION / SHARE / FAVORITE =====
  const toggleReaction = async (id) => { try { await api.post(`/post/${id}/reaction`); fetchPosts(); } catch(e){console.error(e);} };
  const toggleShare = async (id) => { try { await api.post(`/post/${id}/share`); fetchPosts(); } catch(e){console.error(e);} };
  const toggleFavorite = async (id, isFav) => { try { if(isFav) await api.delete("/favorites",{data:{contentType:"post",contentId:id}}); else await api.post("/favorites",{contentType:"post",contentId:id}); fetchPosts(); } catch(e){console.error(e);} };

  return (
    <div className="max-w-5xl mx-auto p-4 pt-24">
      {/* ADD POST FORM */}
      <form onSubmit={handleAddPost} className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Add Post</h2>
        <input name="title" value={newPost.title} onChange={handleChange} placeholder="Title" className="w-full border px-4 py-2 rounded mb-3"/>
        <textarea name="content" value={newPost.content} onChange={handleChange} placeholder="Content" className="w-full border px-4 py-2 rounded mb-3"/>
        <select name="category" value={newPost.category} onChange={handleChange} className="w-full border px-4 py-2 rounded mb-3">
          <option value="">Select Category</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <select name="subCategory" value={newPost.subCategory} onChange={handleChange} className="w-full border px-4 py-2 rounded mb-3">
          <option value="">Select SubCategory</option>
          {subCategories.filter(sc => sc.category?.name === newPost.category).map(sc => <option key={sc._id} value={sc.name}>{sc.name}</option>)}
        </select>
        <input name="tags" value={newPost.tags} onChange={handleChange} placeholder="Tags (#react #vite)" className="w-full border px-4 py-2 rounded mb-3"/>
        <input type="file" multiple onChange={handleFileChange} className="mb-3"/>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Post</button>
      </form>

      {/* POSTS LIST */}
      {posts.map(post => {
        const tagsArray = Array.isArray(post.tags) ? post.tags : [];
        const fullUrl = (url) => `http://localhost:3000${url}`;
        const isFavorite = user?.id && post.favorites?.some(f=>f.user===user.id);
        const hasReacted = user?.id && post.Reaction?.includes(user.id);
        const isAuthor = post.author?._id === user?.id;

        return (
          <div key={post._id} className="bg-white p-6 rounded-xl shadow mb-6 relative">
            {isAuthor && <button onClick={()=>deletePost(post._id)} className="absolute top-4 right-4 px-2 py-1 border rounded">Delete</button>}
            <h3 className="font-bold text-lg">{post.title}</h3>
            <p>{post.content}</p>

            {/* TAGS */}
            {tagsArray.length>0 && <div className="mt-2 flex gap-2 flex-wrap">{tagsArray.map((t,i)=><span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">#{t}</span>)}</div>}

            {/* MEDIA */}
            {post.media?.length>0 && <div className="mt-4 flex flex-wrap gap-4">
              {post.media.map((m,i)=>{
                if(m.type==="image") return <img key={i} src={fullUrl(m.url)} alt="media" className="w-32 h-32 object-cover rounded"/>;
                if(m.type==="video") return <video key={i} controls className="w-32 h-32 rounded"><source src={fullUrl(m.url)} type="video/mp4"/></video>;
                return <a key={i} href={fullUrl(m.url)} target="_blank" rel="noopener noreferrer">File {i+1}</a>;
              })}
            </div>}

            {/* ACTIONS */}
            <div className="flex gap-4 mt-3">
              <button onClick={()=>toggleReaction(post._id)}>{hasReacted ? "❓ (Reacted)" : "❓"}</button>
              <button onClick={()=>toggleShare(post._id)}>🔄 {post.shareCount||0}</button>
              <button onClick={()=>toggleFavorite(post._id,isFavorite)}>{isFavorite?"❤️":"🤍"}</button>
              <button>💬</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
