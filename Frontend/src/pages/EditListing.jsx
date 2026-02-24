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
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Listing</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="title" value={form.title}
          className="border p-2 w-full"
          onChange={handleChange} required />

        <textarea name="description" value={form.description}
          className="border p-2 w-full"
          onChange={handleChange} required />

        <input name="location" value={form.location}
          className="border p-2 w-full"
          onChange={handleChange} required />

        <input name="country" value={form.country}
          className="border p-2 w-full"
          onChange={handleChange} required />

        <input name="price" type="number" value={form.price}
          className="border p-2 w-full"
          onChange={handleChange} required />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border p-2 w-full bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Current Photos:</p>
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((img, index) => (
                <div key={img.filename} className="relative">
                  <img
                    src={img.url}
                    alt={`listing-${index}`}
                    className={`w-full h-24 object-cover rounded ${deleteImages.includes(img.filename) ? "opacity-30" : ""
                      }`}
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-black text-white text-[10px] px-1 rounded">
                      Main
                    </span>
                  )}
                  {index !== 0 && (
                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const reordered = [
                            existingImages[index],
                            ...existingImages.filter((_, i) => i !== index)
                          ];
                          setExistingImages(reordered);
                        }}
                        className="bg-blue-500 text-white text-[10px] px-1 rounded"
                      >
                        ★ Main
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteToggle(img.filename, index)}
                        className={`text-xs px-1 rounded ${deleteImages.includes(img.filename)
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          }`}
                      >
                        {deleteImages.includes(img.filename) ? "Undo" : "✕"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        {remainingSlots > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">
              Add more photos ({remainingSlots} slot{remainingSlots !== 1 ? "s" : ""} remaining):
            </p>
            <input
              type="file"
              multiple
              accept="image/png, image/jpg, image/jpeg"
              onChange={(e) => {
                const selected = Array.from(e.target.files).slice(0, remainingSlots);
                setNewImages(selected);
              }}
            />
            {newImages.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{newImages.length} new image(s) selected</p>
            )}
          </div>
        )}

        <button
          disabled={submitting}
          className="bg-black text-white px-4 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Updating..." : "Update Listing"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}