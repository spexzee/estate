import React from 'react'
import { useSelector } from 'react-redux'


const Card = () => {
    const { currentUser, loading, error } = useSelector((state) => state.user);
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
        <img className="w-full" src='' alt="Card image cap" />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">Card title</div>
          <p className="text-gray-700 text-base">
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </p>
        </div>
        <div className="px-6 pt-4 pb-2">
          <a
            href="#"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go somewhere
          </a>
        </div>
      </div>
  )
}

export default Card