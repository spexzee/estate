import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { IoEye, IoEyeOff } from 'react-icons/io5';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(false)
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData)
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='text'
          placeholder='First Name'
          className='border p-3 rounded-lg'
          id='firstname'
          onChange={handleChange}
        />
        <input
          type='text'
          placeholder='Last Name'
          className='border p-3 rounded-lg'
          id='lastname'
          onChange={handleChange}
        />
        <input
          type='text'
          placeholder='Phone Number'
          className='border p-3 rounded-lg'
          id='phone'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          className='border p-3 rounded-lg'
          id='email'
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
            <IoEyeOff size={25} className='cursor-pointer' onClick={()=>setPassword(!password)} />
            </span>):
            (<span className="absolute inset-y-0 right-3 flex items-center">
            <IoEye size={25} className='cursor-pointer' onClick={()=>setPassword(!password)} />
            </span>)
          }
        </div>

        <button
          disabled={loading}
          className='bg-green-700 text-white p-3 rounded-lg uppercase hover:opacity-85 disabled:opacity-60'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth/>
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  );
}
