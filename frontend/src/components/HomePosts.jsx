/* eslint-disable react/prop-types */
import { IF } from '../url';

const HomePosts = ({ post }) => {
  const formatDescription = (desc) => {
    // Prevent HTML injection and show the description with its original formatting
    return { __html: desc };
  };

  return (
    <div className="w-full flex mt-8 space-x-4">
      {/* Left */}
      <div className="w-[35%] h-[200px] flex justify-center items-center">
        <img src={IF + post.photo} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Right */}
      <div className="flex flex-col w-[65%]">
        <h1 className="text-xl font-bold md:mb-2 mb-1 md:text-2xl">
          {post.title}
        </h1>

        <div className="flex mb-2 text-sm font-semibold text-gray-500 items-center justify-between md:mb-4">
          <p>@{post.username}</p>
          <div className="flex space-x-2 text-sm">
            <p>{new Date(post.updatedAt).toString().slice(0, 15)}</p>
            <p>{new Date(post.updatedAt).toString().slice(16, 24)}</p>
          </div>
        </div>

        {/* Render description with original HTML tags */}
        <p
          className="text-sm md:text-lg"
          dangerouslySetInnerHTML={formatDescription(post.desc.slice(0, 200) + ' ...')}
        />
      </div>
    </div>
  );
};

export default HomePosts;
