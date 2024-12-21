import { useNavigate, useParams } from "react-router-dom";
import Comment from "../components/Comment";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { BiEdit } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import axios from "axios";
import { URL, IF } from "../url";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import Loader from "../components/Loader";


const PostDetails = () => {
  const postId = useParams().id;
  const [post, setPost] = useState({});
  const { user } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);
  const [summary, setSummary] = useState(""); // State for summary
  const navigate = useNavigate();

  // Fetch the post details
  const fetchPost = async () => {
    try {
      const res = await axios.get(`${URL}/api/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.error("Error fetching post:", err);
    }
  };

  // Handle deleting the post
  const handleDeletePost = async () => {
    try {
      await axios.delete(`${URL}/api/posts/${postId}`, { withCredentials: true });
      navigate("/");
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  // Fetch comments for the post
  const fetchPostComments = async () => {
    setLoader(true);
    try {
      const res = await axios.get(`${URL}/api/comments/post/${postId}`);
      setComments(res.data);
      setLoader(false);
    } catch (err) {
      setLoader(false);
      console.error("Error fetching comments:", err);
    }
  };

  // Handle posting a comment
  const postComment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${URL}/api/comments/create`,
        { comment: comment, author: user.username, postId: postId, userId: user._id },
        { withCredentials: true }
      );
      setComment(""); // Clear the input field after posting
      fetchPostComments(); // Refresh the comments
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  // Summarize the post using an API (replace with your AI summarization API)
  const summarizePost = async () => {
    try {
      const res = await axios.post(`${URL}/api/summarize`, { text: post.desc });
      setSummary(res.data.summary); // Set the summary from the response
    } catch (err) {
      console.error("Error summarizing post:", err);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchPostComments();
  }, [postId]);

  return (
    <div>
      <Navbar />
      {loader ? (
        <div className="h-[80vh] flex justify-center items-center w-full">
          <Loader />
        </div>
      ) : (
        <div className="px-8 md:px-[200px] mt-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black md:text-3xl">{post.title}</h1>
            {user?._id === post?.userId && (
              <div className="flex items-center justify-center space-x-2">
                <p className="cursor-pointer" onClick={() => navigate(`/edit/${postId}`)}>
                  <BiEdit />
                </p>
                <p className="cursor-pointer" onClick={handleDeletePost}>
                  <MdDelete />
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 md:mt-4">
            <p>@{post.username}</p>
            <div className="flex space-x-2">
              <p>{new Date(post.updatedAt).toLocaleDateString()}</p>
              <p>{new Date(post.updatedAt).toLocaleTimeString()}</p>
            </div>
          </div>

          <img src={`${IF}${post.photo}`} className="w-full mx-auto mt-8" alt="" />
          
          {/* Render post content with rich formatting */}
          <div className="mx-auto mt-8">
  {post.desc && (
    <div
      className="post-desc"
      dangerouslySetInnerHTML={{
        __html: `
          <style>
            .post-desc pre {
              background-color:rgb(13, 25, 51); /* Light blue background */
              padding: 10px;
              border-radius: 5px;
              font-family: 'Courier New', monospace;
              color: white;
              white-space: pre-wrap;
              overflow-x: auto;
            }
            .post-desc pre code {
              display: block;
              color: #333;
            }
          </style>
          ${post.desc}
        `
      }}
    />
  )}
</div>


          {/* AI Summarizer Button */}
          <button onClick={summarizePost} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
            Generate Summary
          </button>

          {/* Display Summary */}
          {summary ? (
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold text-lg">Summary:</h3>
              <p>{summary}</p>
            </div>
          ) : (
            <p className="mt-6 text-gray-500">No summary available.</p>
          )}

          <div className="flex items-center mt-8 space-x-4 font-semibold">
            <p>Categories:</p>
            <div className="flex justify-center items-center space-x-2">
              {post.categories?.map((c, i) => (
                <div key={i} className="bg-gray-300 rounded-lg px-3 py-1">{c}</div>
              ))}
            </div>
          </div>

          <div className="flex flex-col mt-4">
            <h3 className="mt-6 mb-4 font-semibold">Comments:</h3>
            {comments?.map((c) => (
              <Comment key={c._id} c={c} post={post} />
            ))}
          </div>

          {/* Write a comment */}
          <div className="w-full flex flex-col mt-4 md:flex-row mb-4">
  <input
    onChange={(e) => setComment(e.target.value)}
    value={comment}
    type="text"
    placeholder="Write a comment"
    className="md:w-[80%] outline-none py-2 px-4 mt-4 md:mt-0"
  />
  <button
    onClick={postComment}
    className="bg-pink-700 text-sm text-white px-2 py-2 md:w-[20%] mt-4 md:mt-0"
  >
    Add Comment
  </button>
</div>

        </div>
      )}
      
    </div>
  );
};

export default PostDetails;
