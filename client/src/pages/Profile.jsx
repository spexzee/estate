import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { IoEye, IoEyeOff } from "react-icons/io5";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdDelete, MdEdit } from 'react-icons/md';
export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [password, setPassword] = useState(false)

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(2);

  const dispatch = useDispatch();



  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input
          type='text'
          placeholder='Full Name'
          defaultValue={currentUser.firstname + ' ' + currentUser.lastname}
          disabled
          id='fullname'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='text'
          placeholder='Mobile Number'
          defaultValue={currentUser.phone}
          // disabled={!(currentUser.phone === '')}
          id='phone'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          id='email'
          disabled
          defaultValue={currentUser.email}
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <div className="relative">
          <input
            type={password ? 'password' : 'text'}
            placeholder='password'
            onChange={handleChange}
            id='password'
            className='border p-3 rounded-lg w-full'
          />
          {
            password ?
              (<span className="absolute inset-y-0 right-3 flex items-center">
                <IoEyeOff size={25} className='cursor-pointer' onClick={() => setPassword(!password)} />
              </span>) :
              (<span className="absolute inset-y-0 right-3 flex items-center">
                <IoEye size={25} className='cursor-pointer' onClick={() => setPassword(!password)} />
              </span>)
          }
        </div>
        <button
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
        {/* Todo : Add Toast Message */}
        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteUser}
          className='text-red-700 cursor-pointer'
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>

      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>
      {/* <button onClick={handleShowListings} className='text-green-700 w-full'>
        Show Listings
      </button> */}
      <button onClick={handleShowListings} className="border text-gray-50  duration-300 relative group cursor-pointer   overflow-hidden h-[3rem] w-[30.5rem] rounded-md bg-neutral-800 p-2  font-extrabold hover:bg-sky-700">
        <div className="absolute group-hover:-top-1 group-hover:-right-2 z-10 w-16 h-16 rounded-full group-hover:scale-150  duration-700 right-12 top-12 bg-yellow-500"></div>
        <div className="absolute group-hover:-top-1 group-hover:-right-2 z-10 w-12 h-12 rounded-full group-hover:scale-150  duration-700 right-20 -top-6 bg-orange-500"></div>
        <div className="absolute group-hover:-top-1 group-hover:-right-2 z-10 w-8 h-8   rounded-full group-hover:scale-150  duration-700 right-32 top-6 bg-pink-500"></div>
        <div className="absolute group-hover:-top-1 group-hover:-right-2 z-10 w-4 h-4   rounded-full group-hover:scale-150  duration-700 right-2 top-12 bg-red-600"></div>
        <p className="z-10 absolute bottom-2 left-2">Show listing</p>
      </button>

      <p className='text-red-700 mt-5'>
        {showListingsError ? 'Error showing listings' : ''}
      </p>


      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4 justify-center items-center'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>
            Your Listings
          </h1>
          {userListings.slice(start , end).map((listing) => (
            <div
              key={listing._id}
              className="max-w-sm rounded overflow-hidden shadow-lg"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                  className='w-full object-contain'
                />
              </Link>
              <div className="px-6 py-4">
              <Link
                className='text-slate-700 font-semibold  hover:underline truncate flex-1 md:w-1/2'
                to={`/listing/${listing._id}`}
              >
                <p className="font-bold text-xl mb-2">{listing.name}</p>
              </Link>
              <p className='text-gray-700 text-base'>
                {listing.description}
              </p>
              </div>

              <div className='flex flex-col item-center justify-center md:flex-row md:justify-end'>
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className='text-red-700 uppercase md:mr-2'
                >
                  <MdDelete size={23} />
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-700 uppercase'>
                    <MdEdit size={21} />
                  </button>
                </Link>
              </div>
            </div>
          ))}
          <div className='flex justify-center items-center mt-4'>
            <button onClick={()=>{
              setStart(start - 2)
              setEnd(end - 2)
            }} 
            disabled={start===0}
            className='text-blue-700 uppercase mr-2 bg-blue-200 hover:bg-blue-300 font-bold py-2 px-4 rounded'>
              Previous
            </button>


            <button onClick={()=>{
              setStart(start + 2)
              setEnd(end + 2)
            }} 
            disabled={end===userListings.length}
            className='text-blue-700 uppercase bg-blue-200 hover:bg-blue-300  font-bold py-2 px-4 rounded'>
              Next
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}
