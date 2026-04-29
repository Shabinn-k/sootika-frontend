import "./BrandShowcase.css";
import brandFallback from "../../assets/brandFallback.webp";


// BRAND DATA
const womenBrands = [
  { id: 1, name: "Zara", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg" },
  { id: 2, name: "H&M", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg" },
  { id: 3, name: "Mango", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Mango_%28new_logo%29.svg" },
  { id: 4, name: "Forever 21", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Forever_21_logo.svg" },
  { id: 5, name: "Levi's", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Levi%27s_logo.svg" },
  { id: 6, name: "Gucci", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Gucci_logo.svg" },
  { id: 7, name: "Chanel", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Chanel_logo_interlocking_cs.svg" },
  { id: 8, name: "Prada", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Prada_logo.svg" },
  { id: 9, name: "Nike", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
  { id: 10, name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
  { id: 11, name: "Calvin Klein", logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/Calvin_Klein_logo.svg" },
  { id: 12, name: "Tommy Hilfiger", logo: "https://upload.wikimedia.org/wikipedia/commons/8/88/Tommy_Hilfiger_Logo.svg" },
];

// duplicate list for seamless loop
const loopBrands = [...womenBrands, ...womenBrands];

const BrandShowcase = () => {
  return (
    <section className="brand-showcase-section">
      <h2 className="brand-showcase-title">
        Top Women’s Fashion Brands
      </h2>

      <div className="brand-loop-wrapper">
        <div className="brand-loop-track">
          {loopBrands.map((brand, index) => (
            <div
              className="brand-card"
              key={index}
            >
              <div className="brand-logo-container">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="brand-logo"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =brandFallback;
                  }}
                />
              </div>

              <h3 className="brand-name">{brand.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
