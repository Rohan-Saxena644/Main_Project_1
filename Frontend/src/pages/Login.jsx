import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // const handleSubmit = async (e)=>{
  //   e.preventDefault();

  //   try {
  //     const res = await api.post("/login", { username, password });

  //     // Save user in auth context
  //     login(res.data.user);

  //     navigate("/listings");
  //   } 
  //   catch {
  //     setError("Invalid credentials");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate("/listings");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-sm mx-auto">
      <input className="border p-2 w-full" placeholder="Username"
        onChange={e=>setUsername(e.target.value)}/>
      
      <input className="border p-2 w-full mt-3" type="password" placeholder="Password"
        onChange={e=>setPassword(e.target.value)}/>
      
      <button className="bg-black text-white px-4 py-2 mt-4 w-full">
        Login
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
