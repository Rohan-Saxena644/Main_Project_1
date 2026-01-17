import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username:"",
    email:"",
    password:""
  });

  const handleChange = (e)=>{
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
      const res = await api.post("/signup", form);
      login(res.data.user);
      navigate("/listings");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-sm mx-auto">
      <input name="username" placeholder="Username" className="border p-2 w-full"
        onChange={handleChange}/>
      <input name="email" placeholder="Email" className="border p-2 w-full mt-3"
        onChange={handleChange}/>
      <input type="password" name="password" placeholder="Password" className="border p-2 w-full mt-3"
        onChange={handleChange}/>
      <button className="bg-black text-white px-4 py-2 mt-4 w-full">
        Signup
      </button>
    </form>
  );
}
