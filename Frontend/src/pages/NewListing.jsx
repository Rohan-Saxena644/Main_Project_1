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
  const [submitting, setSubmitting] = useState(false); // ← Add this

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true); // ← Lock the button

    try {
      const formData = new FormData();
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create listing. Please try again.");
      setSubmitting(false); // ← Only unlock on failure
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
          onChange={(e) => setImage(e.target.files[0])}
          required />

        <button
          disabled={submitting}
          className="bg-black text-white px-4 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating..." : "Create Listing"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}