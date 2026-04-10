import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

const images = [
  { src: gallery1, alt: "Aerial view of mela grounds" },
  { src: gallery2, alt: "Handicraft stall display" },
  { src: gallery3, alt: "Food stalls at the mela" },
  { src: gallery4, alt: "Cultural dance performance" },
];

const GallerySection = () => (
  <section id="gallery" className="py-20 bg-background">
    <div className="container">
      <div className="text-center mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Gallery</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
          Previous Mela Highlights
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative rounded-2xl overflow-hidden group aspect-[4/3]">
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              width={800}
              height={600}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300 flex items-end p-4">
              <span className="text-cream text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {img.alt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default GallerySection;
