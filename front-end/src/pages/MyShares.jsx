import React, { useEffect, useState } from "react";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import HeaderProfile from "../components/HeaderProfile";
import PostCard from "../components/PostCard";
import Messaging from "../components/Messaging";
import Sidebar from "../components/Sidebar";
import { postApi } from "../services/api";

const MyShares = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadShares = async () => {
    try {
      setLoading(true);
      const res = await postApi.getMyShares();
      const data = res.data?.data ?? [];
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, []);

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <NavbarLoggedIn />
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <HeaderProfile />
          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              <div className="space-y-6">
                {loading ? (
                  <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-[10px] font-black text-slate-400 tracking-[0.2em]">
                    Chargement de mes partages...
                  </div>
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <PostCard
                      key={item._id}
                      post={item.post}
                      sharedInfo={{ id: item._id, sharedAt: item.sharedAt }}
                      onRefresh={loadShares}
                    />
                  ))
                ) : (
                  <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                      Aucun partage pour le moment
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Messaging />
    </div>
  );
};

export default MyShares;
