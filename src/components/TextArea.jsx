import React from 'react'

const TextArea = () => {

    
   return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-gray-100">
      <div className="w-[80%] max-w-md flex flex-col items-center">
        {/* Textarea section */}
        <div className="w-full">
          <textarea
            name="name"
            id="name"
            placeholder="Enter your text here..."
            className="w-full h-40 p-3 border-2 border-gray-400 rounded-lg resize-none focus:outline-none focus:border-gray-600"
          ></textarea>
        </div>

        {/* Button section */}
        <div className="mt-4">
          <button className="px-6 py-2 bg-green-400  text-white rounded-lg  transition  hover:bg-green-700 cursor-pointer">
            Generate
          </button>
        </div>
      </div>
    </div>
  );



}

export default TextArea