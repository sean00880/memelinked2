"use client";

import React, { useState, useEffect, useCallback } from "react";
import SidebarAd from "../../components/SideBarAd";
import Post from "../../components/Post";
import TrendingBar from "../../components/TrendingBar";
import GetLinked from "../../components/GetLinked";
import CreatePost from "../../components/CreatePost";
import { supabase } from "../../utils/supaBaseClient";
import { useAuthContext } from "../../context/AuthContext";

interface PostData {
  id: string;
  profile_id: string;
  content: string;
  media_links: string[]; // Aligned with Post and CreatePost logic
  timestamp: string;
  likes: number;
  dislikes: number;
  boosts: number;
  reshares: number;
  comments_count: number;
}

export default function FeedPage() {
  const { activeProfile } = useAuthContext();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, profile_id, content, media_links, timestamp, likes, dislikes, boosts, reshares, comments_count, profile:profiles(id, display_name, username, profile_image, membership_tier)"
        )
        .is("parent_id", null) // Fetch only top-level posts
        .order("timestamp", { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", (error as Error).message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = async () => {
    await fetchPosts(); // Refetch posts after creating a new one
  };

  return (
    <div className="feed-page min-h-screen bg-light-background text-white font-sans">
      {/* Trending Bar */}
      <TrendingBar isDarkMode={true} />

      <div className="flex">
        {/* Left Ad Sidebar */}
        <SidebarAd position="left" />

        {/* Main Content - Posts & Right Sections */}
        <div className="flex-grow mx-2 grid grid-cols-12 gap-4">
          {/* Main Post Feed (8 columns) */}
          <div className="col-span-8">
            {/* CreatePost Component */}
            <CreatePost onPostCreated={handlePostCreated} />

            {/* Posts Feed */}
            {loading ? (
              <div className="text-center text-gray-400">Loading posts...</div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <Post key={post.id} post={post} isDarkMode={true} />
              ))
            ) : (
              <div className="text-center text-gray-400">No posts available.</div>
            )}
          </div>

          {/* Right Section with GetLinked and Explore Links (4 columns) */}
          <div className="col-span-4 p-4 border rounded-lg">
            <GetLinked />
            <h3 className="text-lg font-bold mb-2">Explore</h3>
            <ul>
              <li>
                <a href="#" className="text-[gold] hover:underline">
                  Trending Hashtags
                </a>
              </li>
              <li>
                <a href="#" className="text-[gold] hover:underline">
                  Follow Influencers
                </a>
              </li>
              <li>
                <a href="#" className="text-[gold] hover:underline">
                  Latest News
                </a>
              </li>
              <li>
                <a href="#" className="text-[gold] hover:underline">
                  Crypto Tips
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
