import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Reusable label + input wrapper
function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 text-sm transition";

export default function NewListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", location: "", country: "", price: "", category: "cities",
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("listing[title]", form.title);
      fd.append("listing[description]", form.description);
      fd.append("listing[location]", form.location);
      fd.append("listing[country]", form.country);
      fd.append("listing[price]", form.price);
      fd.append("listing[category]", form.category);
      images.forEach(img => fd.append("images", img));
      await api.post("/listings", fd, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/listings");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create listing.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

        {/* Header strip */}
        <div className="bg-black px-8 py-6">
          <h2 className="text-white text-2xl font-extrabold tracking-tight">Add New Listing</h2>
          <p className="text-gray-400 text-sm mt-1">Fill in the details below to publish your stay.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <Field label="Title *">
            <input name="title" placeholder="e.g. Cozy beachfront villa" onChange={handleChange} required className={inputCls} />
          </Field>

          {/* Description */}
          <Field label="Description *">
            <textarea name="description" placeholder="Tell guests what makes this place special..." rows={4}
              onChange={handleChange} required className={`${inputCls} resize-none`} />
          </Field>

          {/* Location + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location *">
              <input name="location" placeholder="e.g. Goa" onChange={handleChange} required className={inputCls} />
            </Field>
            <Field label="Country *">
              <input name="country" placeholder="e.g. India" onChange={handleChange} required className={inputCls} />
            </Field>
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Price per night (₹) *">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input name="price" type="number" min="0" placeholder="2500"
                  onChange={handleChange} required className={`${inputCls} pl-7`} />
              </div>
            </Field>
            <Field label="Category">
              <select name="category" value={form.category} onChange={handleChange} className={`${inputCls} bg-white cursor-pointer`}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Photos */}
          <Field label="Photos *" hint="Upload up to 5 images. The first one will be the cover photo.">
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm text-gray-500">
                {images.length > 0 ? (
                  <span className="font-semibold text-teal-600">{images.length} file{images.length > 1 ? "s" : ""} selected</span>
                ) : (
                  <><span className="font-semibold text-teal-600">Click to upload</span> or drag and drop</>
                )}
              </span>
              <input type="file" multiple accept="image/png,image/jpg,image/jpeg" className="hidden"
                required onChange={e => setImages(Array.from(e.target.files).slice(0, 5))} />
            </label>
          </Field>

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
                Publishing...
              </>
            ) : "Publish Listing"}
          </button>

        </form>
      </div>
    </div>
  );
}