import { useNavigate } from "react-router-dom";
import "./About.css";

const sections = [
  {
    title: "Our Story",
    text: `Sootika was born from a vision to craft clothing that feels as exceptional
    as it looks. We focus on premium fabrics, detailed craftsmanship, and
    designs that blend simplicity with luxury. Every piece is made to feel
    personal, refined, and effortlessly timeless.`,
  },
  {
    title: "What We Stand For",
    text: `We believe luxury is not loud — it’s felt in the details.
    From fabric selection to final stitching, every step represents our
    commitment to quality. Our goal is to create pieces that elevate your
    everyday experiences in a subtle yet meaningful way.`,
  },
  {
    title: "The Sootika Experience",
    text: `Whether it’s the precision of our tailoring or the softness of our
    premium materials, each product is designed to be a long-lasting part of
    your wardrobe. With Sootika, you don’t just wear fashion — you feel it.`,
  },
  {
    title: "Craftsmanship That Defines Us",
    text: `Every Sootika piece goes through a journey of thoughtful creation.
    From hand-selected fabrics to precisely measured cuts, our artisans
    bring decades of expertise into every stitch. True luxury is crafted
    slowly, intentionally, and with immense care.`,
  },
  {
    title: "The Materials We Choose",
    text: `Our fabrics are sourced from trusted mills known for their purity,
    softness, and durability. From ultra-fine cotton to organic linen and
    premium blends, each collection is tested for comfort, breathability,
    and long-lasting wear.`,
  },
  {
    title: "A Sustainable Vision",
    text: `At Sootika, luxury and responsibility go hand in hand.
    We focus on conscious fashion, ethical production, and designs that last.
    Our vision is to create clothing that respects both your wardrobe and
    the world we live in.`,
  },
  {
    title: "Designed for the Modern Minimalist",
    text: `Every collection celebrates clean silhouettes, neutral palettes,
    and subtle detailing — understated luxury that never goes out of style.
    Sootika elevates your presence quietly yet confidently.`,
  },
  {
    title: "Why Sootika",
    text: `Because fashion is personal. It reflects who you are and how you
    choose to show up in the world. Our mission is to create clothing that
    inspires confidence, comfort, and timeless elegance.`,
  },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <main className="about-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Go Back
      </button>

      <header className="about-hero">
        <h1 className="about-title">Sootika</h1>
        <p className="about-subtitle">
          Premium • Luxury • Timeless Elegance
        </p>
      </header>

      {sections.map((section, index) => (
        <section className="about-content" key={index}>
          <h2 className="section-heading">{section.title}</h2>
          <p className="section-text">{section.text}</p>
        </section>
      ))}
    </main>
  );
};

export default About;
