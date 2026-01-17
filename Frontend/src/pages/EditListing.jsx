import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    country: "",
    price: ""
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing listing
  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => {
        const l = res.data;
        setForm({
          title: l.title,
          description: l.description,
          location: l.location,
          country: l.country,
          price: l.price
        });
        setLoading(false);
      })
      .catch(()=> navigate("/notfound"));
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("listing[title]", form.title);
    formData.append("listing[description]", form.description);
    formData.append("listing[location]", form.location);
    formData.append("listing[country]", form.country);
    formData.append("listing[price]", form.price);

    // Only update image if new one selected
    if(image){
      formData.append("listing[image]", image);
    }

    await api.put(`/listings/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    navigate(`/listings/${id}`);
  };

  if(loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Listing</h2>

      <form onSubmit={handleSubmit} className="space-y-3">

        <input name="title" value={form.title}
          className="border p-2 w-full"
          onChange={handleChange} required/>

        <textarea name="description" value={form.description}
          className="border p-2 w-full"
          onChange={handleChange} required/>

        <input name="location" value={form.location}
          className="border p-2 w-full"
          onChange={handleChange} required/>

        <input name="country" value={form.country}
          className="border p-2 w-full"
          onChange={handleChange} required/>

        <input name="price" type="number" value={form.price}
          className="border p-2 w-full"
          onChange={handleChange} required/>

        <input type="file" onChange={(e)=>setImage(e.target.files[0])}/>

        <button className="bg-black text-white px-4 py-2 w-full">
          Update Listing
        </button>

      </form>
    </div>
  );
}
