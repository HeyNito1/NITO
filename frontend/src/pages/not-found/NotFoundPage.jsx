import { Link } from "react-router";
import Container from "@/components/ui/Container";

export default function NotFoundPage() {
  return (
    <Container className="py-[100px] min-h-[65vh]">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <Link className="text-link" to="/">
        Return to component review →
      </Link>
    </Container>
  );
}