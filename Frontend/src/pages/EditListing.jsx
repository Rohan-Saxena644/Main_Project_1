import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const CATEGORIES = [
  { value: "mountains", label: "🏔️ Mountains" },
  { value: "arctic", label: "🌨️ Arctic" },
  { value: "farms", label: "🌾 Farms" },
  { value: "deserts", label: "🏜️ Deserts" },
  { value: "beaches", label: "🏖️ Beaches" },
  { value: "cities", label: "🏙️ Cities" },
  { value: "forests", label: "🌲 Forests" },
  { value: "lakes", label: "🏞️ Lakes" },
];

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    country: "",
    price: "",
    category: "cities",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => {
        const l = res.data.listing;
        setForm({
          title: l.title,
          description: l.description,
          location: l.location,
          country: l.country,
          price: l.price,
          category: l.category || "cities",
        });
        setExistingImages(l.images || []);
        setLoading(false);
      })
      .catch(() => navigate("/notfound"));
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteToggle = (filename, index) => {
    if (index === 0) return; // protect main photo
    setDeleteImages(prev =>
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("listing[title]", form.title);
      formData.append("listing[description]", form.description);
      formData.append("listing[location]", form.location);
      formData.append("listing[country]", form.country);
      formData.append("listing[price]", form.price);
      formData.append("listing[category]", form.category);

      newImages.forEach(img => formData.append("images", img));
      deleteImages.forEach(filename => formData.append("deleteImages", filename));
      existingImages.forEach(img => formData.append("imageOrder", img.filename));

      await api.put(`/listings/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate(`/listings/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update listing. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  const remainingSlots = 5 - existingImages.length + deleteImages.length;


  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

        {/* Header strip */}
        <div className="bg-black px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-extrabold tracking-tight">Edit Listing</h2>
            <p className="text-gray-400 text-sm mt-1">Update your property details and photos.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/listings/${id}`)}
            className="text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input name="title" value={form.title}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 text-sm transition"
              onChange={handleChange} required />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
            <textarea name="description" value={form.description} rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 text-sm transition resize-none"
              onChange={handleChange} required />
          </div>

          {/* Location + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location *</label>
              <input name="location" value={form.location}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 text-sm transition"
                onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country *</label>
              <input name="country" value={form.country}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 text-sm transition"
                onChange={handleChange} required />
            </div>
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price per night (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input name="price" type="number" min="0" value={form.price}
                  className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 text-sm transition"
                  onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 text-sm transition bg-white cursor-pointer">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Existing Photos */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Current Photos</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {existingImages.map((img, index) => (
                  <div key={img.filename} className={`relative group rounded-lg overflow-hidden aspect-square ${deleteImages.includes(img.filename) ? "opacity-40 ring-2 ring-red-400" : ""}`}>
                    <img src={img.url} alt={`photo-${index}`} className="w-full h-full object-cover" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                      {index !== 0 && (
                        <button type="button"
                          onClick={() => setExistingImages([existingImages[index], ...existingImages.filter((_, i) => i !== index)])}
                          className="text-[10px] bg-white text-black font-bold px-2 py-0.5 rounded w-full text-center">
                          Set Main
                        </button>
                      )}
                      {index !== 0 && (
                        <button type="button"
                          onClick={() => handleDeleteToggle(img.filename, index)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded w-full text-center ${deleteImages.includes(img.filename) ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                          {deleteImages.includes(img.filename) ? "Undo" : "Delete"}
                        </button>
                      )}
                    </div>
                    {/* Badges */}
                    {index === 0 && <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Cover</span>}
                    {deleteImages.includes(img.filename) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded -rotate-12">REMOVED</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Photos */}
          {remainingSlots > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1.5">
                Add Photos <span className="font-normal text-gray-400 text-xs">({remainingSlots} slot{remainingSlots !== 1 ? "s" : ""} remaining)</span>
              </p>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-6 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm text-gray-500">
                  {newImages.length > 0
                    ? <span className="font-semibold text-teal-600">{newImages.length} file{newImages.length > 1 ? "s" : ""} selected</span>
                    : <><span className="font-semibold text-teal-600">Click to upload</span> or drag and drop</>}
                </span>
                <input type="file" multiple accept="image/png,image/jpg,image/jpeg" className="hidden"
                  onChange={e => setNewImages(Array.from(e.target.files).slice(0, remainingSlots))} />
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={submitting}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : "Save Changes"}
          </button>

        </form>
      </div>
    </div>
  );
}
