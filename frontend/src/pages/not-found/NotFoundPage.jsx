import "./not-found.css";
import { Link } from "react-router";
import Container from "@/components/ui/Container";
export default function NotFoundPage() {
  return (
    <Container className="not-found-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <Link className="text-link" to="/">
        Return to component review →
      </Link>
    </Container>
  );
}

