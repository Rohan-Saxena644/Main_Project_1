import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function NewListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    country: "",
    price: ""
  });

  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Must match your backend schema
      formData.append("listing[title]", form.title);
      formData.append("listing[description]", form.description);
      formData.append("listing[location]", form.location);
      formData.append("listing[country]", form.country);
      formData.append("listing[price]", form.price);

      formData.append("listing[image]", image);

      await api.post("/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/listings");
    } catch {
      setError("Failed to create listing");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Listing</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="title" placeholder="Title"
          className="border p-2 w-full"
          onChange={handleChange} required />

        <textarea name="description" placeholder="Description"
          className="border p-2 w-full"
          onChange={handleChange} required />

        <input name="location" placeholder="Location"
          className="border p-2 w-full"
          onChange={handleChange} required />

        <input name="country" placeholder="Country"
          className="border p-2 w-full"
          onChange={handleChange} required />

        <input name="price" type="number" placeholder="Price"
          className="border p-2 w-full"
          onChange={handleChange} required />

        <input type="file"
          onChange={(e)=>setImage(e.target.files[0])}
          required />

        <button className="bg-black text-white px-4 py-2 w-full">
          Create Listing
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}
