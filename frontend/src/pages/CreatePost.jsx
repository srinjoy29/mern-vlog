import { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ImCross } from "react-icons/im";
import { UserContext } from "../context/UserContext";
import { URL } from "../url";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import quill styles
import "../App.css"; // import custom CSS for background color and other customizations

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState(""); // Post description will now be HTML content
  const [file, setFile] = useState(null);
  const { user } = useContext(UserContext); // Getting user from context
  const [cat, setCat] = useState("");
  const [cats, setCats] = useState([]);
  const navigate = useNavigate();

  const deleteCategory = (i) => {
    let updatedCats = [...cats];
    updatedCats.splice(i, 1); // Corrected to properly remove category
    setCats(updatedCats);
  };

  const addCategory = () => {
    if (cat.trim()) { // Add a check to ensure the category is not empty
      let updatedCats = [...cats];
      updatedCats.push(cat);
      setCat("");
      setCats(updatedCats);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You need to be logged in to create a post.");
      navigate("/login"); // Redirect user to login if not authenticated
      return;
    }

    const post = {
      title,
      desc, // Post description (HTML from ReactQuill)
      username: user.username,
      userId: user._id,
      categories: cats,
    };

    const token = localStorage.getItem("authToken"); // Assuming token is stored in localStorage

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("img", filename);
      data.append("file", file);
      post.photo = filename;

      try {
        await axios.post(URL + "/api/upload", data, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token for file upload
          },
        });
      } catch (err) {
        console.log("Error uploading image:", err);
      }
    }

    try {
      const res = await axios.post(URL + "/api/posts/create", post, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token when creating the post
        },
      });
      navigate("/posts/post/" + res.data._id); // Redirect to the newly created post
    } catch (err) {
      console.log("Error creating post:", err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="px-6 md:px-[200px] mt-8">
        <h1 className="font-bold md:text-2xl text-xl">Create a post</h1>
        <form className="w-full flex flex-col space-y-4 md:space-y-8 mt-4">
          <input
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="Enter post title"
            className="px-4 py-2 outline-none"
          />
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            className="px-4"
          />
          <div className="flex flex-col">
            <div className="flex items-center space-x-4 md:space-x-8">
              <input
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="px-4 py-2 outline-none"
                placeholder="Enter post category"
                type="text"
              />
              <div
                onClick={addCategory}
                className="bg-black text-white px-4 py-2 font-semibold cursor-pointer"
              >
                Add
              </div>
            </div>

            {/* Categories */}
            <div className="flex px-4 mt-3">
              {cats?.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-center items-center space-x-2 mr-4 bg-gray-200 px-2 py-1 rounded-md"
                >
                  <p>{c}</p>
                  <p
                    onClick={() => deleteCategory(i)}
                    className="text-white bg-black rounded-full cursor-pointer p-1 text-sm"
                  >
                    <ImCross />
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* React Quill Editor */}
          <ReactQuill
            value={desc}
            onChange={setDesc}
            modules={{
              toolbar: [
                [{ header: "1" }, { header: "2" }, { font: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["bold", "italic", "underline"],
                [{ align: [] }],
                ["link"],
                ["image"],
                [{ color: [] }, { background: [] }],
                ["code-block"], // Add the code-block option to the toolbar
              ],
              syntax: false, // Disable syntax highlighting
            }}
            placeholder="Enter post description"
          />
          <button
            onClick={handleCreate}
            className="bg-black w-full md:w-[20%] mx-auto text-white font-semibold px-4 py-2 md:text-xl text-lg"
          >
            Create
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePost;
