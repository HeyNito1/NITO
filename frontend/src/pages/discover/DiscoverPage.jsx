import "./discover.css";
import { Link, useParams } from "react-router";
import Container from "@/components/ui/Container";
import { navigation } from "@/data/navigation";
export default function DiscoverPage() {
  const { slug } = useParams();
  const item = navigation
    .flatMap((menu) => menu.groups.flatMap((group) => group.items))
    .find((link) => link.href === `/discover/${slug}`);
  const title =
    item?.label.replace(" ↗", "") ||
    slug
      .split("-")
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(" ");
  return (
    <Container className="destination-page">
      <p className="eyebrow">NITO</p>
      <h1>{title}</h1>
      <p>
        This page is coming soon. Explore the homepage while we build the rest
        of NITO.
      </p>
      <Link className="button button--explore" to="/">
        Back to NITO <span aria-hidden="true">↗</span>
      </Link>
    </Container>
  );
}

