import { Link } from "react-router";
import Container from "@/components/ui/Container";
import Wordmark from "@/components/brand/Wordmark";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import { useNotice } from "@/context/NoticeContext";
import { footerGroups, legalLinks, socialLinks } from "@/data/footer";
export default function Footer() {
  const { notify } = useNotice();
  return (
    <footer className="site-footer">
      <Container className="footer-main min-[1201px]:gap-x-[clamp(64px,5.56vw,100px)]!">
        <div className="footer-brand">
          <Link to="/#hero" aria-label="NITO home">
            <Wordmark illustrated />
          </Link>
          <p className="text-left! leading-[1.4]!">
            NITO : Neural Intelligence Trans-human Omniscience.
            It is an AI system designed to go beyond just conversation.
          </p>
        </div>
        <nav className="footer-navigation" aria-label="Footer navigation">
          {footerGroups.map((group, index) => (
            <ul key={index}>
              {group.map((item) => (
                <li key={item.label}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          ))}
        </nav>
        <div className="footer-updates">
          <div className="social-links">
            {socialLinks.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-label={`NITO on ${item.label}`}
                onClick={() =>
                  notify(
                    `The official NITO ${item.label} profile has not been configured.`,
                  )
                }
              >
                <img
                  src={`/assets/icons/${item.id}.svg`}
                  width="20"
                  height="20"
                  alt=""
                />
              </button>
            ))}
          </div>
          <NewsletterForm />
        </div>
      </Container>
      <div className="footer-legal">
        <Container>
          <nav aria-label="Legal navigation">
            {legalLinks.map((label) => (
              <Link
                key={label}
                to={`/discover/${label.toLowerCase().replaceAll(" ", "-")}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <p>© 2026-27 By NITO</p>
        </Container>
      </div>
    </footer>
  );
}
