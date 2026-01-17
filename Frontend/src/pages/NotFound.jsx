import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-lg mt-3">Page not found</p>
      <Link 
        to="/"
        className="text-blue-500 underline mt-4 inline-block"
      >
        Go Home
      </Link>
    </div>
  );
}
