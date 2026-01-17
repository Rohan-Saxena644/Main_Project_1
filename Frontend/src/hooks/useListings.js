import { useEffect, useState } from "react";
import api from "../api/api";

export default function useListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/listings")
      .then(res => setListings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return { listings, loading };
}
