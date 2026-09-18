import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, Check, ChevronLeft, ChevronRight, Clock3, Instagram, MapPin, Menu, Phone, Star, X } from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type MenuCategory = 'Entradas' | 'Platos Fuertes' | 'Postres' | 'Bebidas';
type MenuItem = { name: string; description: string; price: string; category: MenuCategory; tags?: string[] };
type GalleryImage = { src: string; alt: string; caption: string; className?: string };

const menuItems: MenuItem[] = [
  { name: 'Tomate asado, stracciatella y piparra', description: 'Tomates de huerta, aceite de hoja de higuera y pan de masa madre tostado.', price: '12 €', category: 'Entradas', tags: ['vegetariano'] },
  { name: 'Gamba roja, maíz y ají amarillo', description: 'Gamba de lonja, crema de maíz dulce y una chispa de lima.', price: '18 €', category: 'Entradas', tags: ['sin gluten'] },
  { name: 'Berenjena ahumada, miso y almendra', description: 'Berenjena al fuego, miso blanco, hierbas frescas y almendra marcona.', price: '13 €', category: 'Entradas', tags: ['vegano', 'sin gluten'] },
  { name: 'Presa ibérica, mole de ciruela y hojas amargas', description: 'Presa de bellota, mole oscuro de ciruelas pasas y ensalada de temporada.', price: '26 €', category: 'Platos Fuertes' },
  { name: 'Merluza de anzuelo, pilpil de azafrán', description: 'Merluza del Cantábrico, patata nueva, hinojo y caldo de sus espinas.', price: '24 €', category: 'Platos Fuertes', tags: ['sin gluten'] },
  { name: 'Arroz meloso de setas y queso curado', description: 'Setas de bosque, arroz bomba, caldo vegetal y queso de oveja de Zamora.', price: '21 €', category: 'Platos Fuertes', tags: ['vegetariano'] },
  { name: 'Tarta tibia de chocolate y aceite de oliva', description: 'Chocolate 70%, sal marina, aceite temprano y helado de leche tostada.', price: '9 €', category: 'Postres', tags: ['vegetariano'] },
  { name: 'Pera al vino, yogur y tomillo limón', description: 'Pera conferencia, yogur de oveja y crujiente de almendra.', price: '8 €', category: 'Postres', tags: ['sin gluten'] },
  { name: 'Vermut de la casa', description: 'Vermut rojo, naranja amarga, aceituna y soda de romero.', price: '7 €', category: 'Bebidas' },
  { name: 'Blanco de parcela · D.O. Rueda', description: 'Fresco, salino y con final de fruta de hueso.', price: '6 €', category: 'Bebidas' },
];

const galleryImages: GalleryImage[] = [
  { src: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=88', alt: 'Mesa con platos de cocina de autor', caption: 'La mesa, sin prisa', className: 'tall' },
  { src: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=88', alt: 'Plato de verduras de temporada', caption: 'Huerta de proximidad' },
  { src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1600&q=88', alt: 'Interior cálido del restaurante', caption: 'La sala al caer la tarde', className: 'wide' },
  { src: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=1200&q=88', alt: 'Ingredientes frescos preparados', caption: 'Producto antes que artificio' },
  { src: 'https://images.unsplash.com/photo-1547592180-84fdf4f0ca9f?auto=format&fit=crop&w=1200&q=88', alt: 'Plato colorido con vegetales', caption: 'Color de temporada', className: 'tall' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=88', alt: 'Comensales compartiendo una mesa', caption: 'Aquí se viene a compartir', className: 'wide' },
];

const reviews = [
  { quote: 'Una cena que se queda contigo. Hay técnica, sí, pero sobre todo hay memoria y una alegría muy de aquí.', author: 'Clara M.', detail: 'La Guía Local · 5 visitas' },
  { quote: 'El tipo de sitio que recomendaría sin dudar: producto honesto, sala atenta y un menú que sabe conversar.', author: 'Javier R.', detail: 'Comensal habitual' },
  { quote: 'Pedimos casi todo al centro y cada plato tenía algo que descubrir. El arroz meloso es ya una pequeña obsesión.', author: 'Nuria P.', detail: 'Reseña verificada' },
  { quote: 'Cocina de autor sin solemnidad. Sales con la sensación de haber estado en casa de alguien que cocina extraordinariamente bien.', author: 'Tomás G.', detail: 'Mesa 14 · viernes' },
];

const downloadableMenu = `SABOR URBANO\nMenú de temporada\n\nEntradas\nTomate asado, stracciatella y piparra — 12 €\nGamba roja, maíz y ají amarillo — 18 €\n\nPlatos Fuertes\nPresa ibérica, mole de ciruela y hojas amargas — 26 €\nMerluza de anzuelo, pilpil de azafrán — 24 €\n\nPostres\nTarta tibia de chocolate y aceite de oliva — 9 €\n\nBebidas\nVermut de la casa — 7 €`;

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('Entradas');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reservationSent, setReservationSent] = useState(false);
  const [formError, setFormError] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  useEffect(() => {
    document.title = 'Sabor Urbano · Cocina de autor con alma local';
    const description = 'Sabor Urbano, restaurante de cocina de autor con alma local en el centro de Madrid. Reserva tu mesa y descubre nuestra carta de temporada.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    return () => { document.title = 'Sabor Urbano'; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setReviewIndex((current) => (current + 1) % reviews.length), 5800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredMenu = useMemo(
    () => menuItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  );
  const currentReview = reviews[reviewIndex];
  const navigateAndClose = () => setMobileMenuOpen(false);

  const handleReservation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setFormError('Revisa los campos marcados. Queremos tenerlo todo listo para tu llegada.');
      form.reportValidity();
      return;
    }
    setFormError('');
    setReservationSent(true);
  };

  const handleNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget.checkValidity()) setNewsletterSent(true);
  };

  return (
    <div className="site-shell">
      <header className={`nav-shell ${scrolled ? 'scrolled' : ''}`} data-testid="header-navigation">
        <div className="nav-inner">
          <a className="brand-mark" href="#inicio" onClick={navigateAndClose} data-testid="link-brand"><span>SABOR</span> URBANO</a>
          <nav className="nav-links" aria-label="Navegación principal">
            <a href="#historia" data-testid="link-nav-historia">Nuestra historia</a>
            <a href="#carta" data-testid="link-nav-carta">La carta</a>
            <a href="#galeria" data-testid="link-nav-galeria">Galería</a>
            <a href="#contacto" data-testid="link-nav-contacto">Contacto</a>
            <a className="nav-cta" href="#reservas" data-testid="link-nav-reservas">Reservar mesa</a>
          </nav>
          <button className="nav-toggle" type="button" aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)} data-testid="button-mobile-menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
          <a href="#historia" onClick={navigateAndClose} data-testid="link-mobile-historia">Nuestra historia</a>
          <a href="#carta" onClick={navigateAndClose} data-testid="link-mobile-carta">La carta</a>
          <a href="#galeria" onClick={navigateAndClose} data-testid="link-mobile-galeria">Galería</a>
          <a href="#reservas" onClick={navigateAndClose} data-testid="link-mobile-reservas">Reservar mesa</a>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio" data-testid="section-hero">
          <img className="hero-image" src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2200&q=90" alt="Sala de restaurante con luz cálida y mesas preparadas" fetchPriority="high" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-kicker reveal">Cocina de autor · Centro de Madrid</div>
            <h1 className="reveal delay-1">Donde la<br /><em>Tradición</em><br />se Reinventa</h1>
            <p className="hero-subtitle reveal delay-2">Cocina de autor con alma local</p>
            <div className="hero-actions reveal delay-2">
              <a className="button-gold" href="#reservas" data-testid="link-hero-reserve">Reservar una mesa <ArrowRight size={16} /></a>
              <a className="button-outline" href="#carta" data-testid="link-hero-menu">Descubrir la carta</a>
            </div>
            <div className="hero-note">Desliza para saborear <ArrowDown size={14} /></div>
          </div>
        </section>

        <section className="section-wrap section-pad" id="historia" data-testid="section-story">
          <div className="intro-grid">
            <div className="intro-copy">
              <div className="eyebrow"><span className="gold-rule" /> La casa</div>
              <h2>Lo local no es una tendencia.<br /><em>Es nuestro punto de partida.</em></h2>
              <p>En Sabor Urbano cocinamos la ciudad que habitamos: mercados que abren temprano, productores que conocen cada estación y recetas que viajan sin perder su acento. El resultado es una mesa contemporánea, cercana y un poco inesperada.</p>
              <div className="stats" aria-label="Cifras de Sabor Urbano">
                <div className="stat"><strong>2018</strong><span>Año de apertura</span></div>
                <div className="stat"><strong>34</strong><span>Productores cercanos</span></div>
                <div className="stat"><strong>4,9</strong><span>Valoración media</span></div>
              </div>
            </div>
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=88" loading="lazy" alt="Chef emplatando una creación en la cocina" />
              <span className="image-caption">Cocinar es escuchar primero</span>
            </div>
          </div>
        </section>

        <section className="dark-section section-pad" id="carta" data-testid="section-menu">
          <div className="section-wrap">
            <div className="menu-head">
              <div>
                <div className="eyebrow"><span className="gold-rule" /> La carta</div>
                <h2 className="section-title">Una carta que<br /><em>cambia contigo.</em></h2>
              </div>
              <p className="menu-intro">Pocas cosas, bien escogidas. Nuestra carta sigue el pulso del mercado y deja espacio para que el producto hable.</p>
            </div>
            <div className="category-tabs" role="tablist" aria-label="Categorías de la carta">
              {(['Entradas', 'Platos Fuertes', 'Postres', 'Bebidas'] as MenuCategory[]).map((category) => (
                <button className={`category-tab ${activeCategory === category ? 'active' : ''}`} type="button" role="tab" aria-selected={activeCategory === category} onClick={() => setActiveCategory(category)} key={category} data-testid={`button-category-${category.toLowerCase().replaceAll(' ', '-')}`}>
                  {category}
                </button>
              ))}
            </div>
            <div className="menu-list" role="tabpanel" data-testid="menu-items-list">
              {filteredMenu.map((item) => (
                <article className="menu-item" key={item.name} data-testid={`menu-item-${item.name.toLowerCase().replaceAll(' ', '-')}`}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    {item.tags && <div className="dietary" aria-label={`Etiquetas: ${item.tags.join(', ')}`}>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
                  </div>
                  <span className="menu-price">{item.price}</span>
                </article>
              ))}
            </div>
            <div className="menu-footer">
              <span className="menu-intro">Pregunta por las sugerencias del día y las opciones sin gluten.</span>
              <a className="text-link" href={`data:text/plain;charset=utf-8,${encodeURIComponent(downloadableMenu)}`} download="sabor-urbano-carta.txt" data-testid="link-download-menu">Descargar carta completa <ArrowRight size={15} /></a>
            </div>
          </div>
        </section>

        <section className="section-wrap section-pad" data-testid="section-chef-picks">
          <div className="menu-head">
            <div>
              <div className="eyebrow"><span className="gold-rule" /> La recomendación</div>
              <h2 className="section-title">Lo que sale<br /><em>de la cocina hoy.</em></h2>
            </div>
            <p className="menu-intro">Tres platos, tres gestos de nuestra cocina. Para pedir al centro y dejarse llevar.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1600&q=88" loading="lazy" alt="Plato de vegetales de temporada con salsa" /><div className="feature-overlay"><span className="feature-tag">De la huerta</span><h3>Berenjena al fuego, miso y almendra</h3><p>El humo justo. El verde siempre fresco.</p></div></article>
            <article className="feature-card"><img src="https://images.unsplash.com/photo-1547592180-84fdf4f0ca9f?auto=format&fit=crop&w=1200&q=88" loading="lazy" alt="Plato de temporada con colores intensos" /><div className="feature-overlay"><span className="feature-tag">Para compartir</span><h3>La cocina empieza en el centro de la mesa</h3><p>Y termina cuando alguien pide un poco más de pan.</p></div></article>
          </div>
        </section>

        <section className="dark-section section-pad" id="galeria" data-testid="section-gallery">
          <div className="section-wrap">
            <div className="menu-head">
              <div><div className="eyebrow"><span className="gold-rule" /> Desde la sala</div><h2 className="section-title">Una noche<br /><em>en imágenes.</em></h2></div>
              <a className="text-link" href="https://www.instagram.com/" target="_blank" rel="noreferrer" data-testid="link-instagram-gallery">Ver más en Instagram <ArrowRight size={15} /></a>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((image, index) => <div className={`gallery-cell ${image.className ?? ''}`} key={image.src}><img src={image.src} loading="lazy" alt={image.alt} /><button type="button" aria-label={`Abrir imagen: ${image.caption}`} onClick={() => setLightboxImage(image)} data-testid={`button-gallery-${index}`} /></div>)}
            </div>
          </div>
        </section>

        <section className="section-wrap section-pad" id="reservas" data-testid="section-reservation">
          <div className="reservation-grid">
            <div className="reservation-intro">
              <div className="eyebrow"><span className="gold-rule" /> La mesa es tuya</div>
              <h2 className="section-title">Haz sitio<br /><em>para lo bueno.</em></h2>
              <p>Cuéntanos cuándo vienes y prepararemos el resto. Guardamos tu mesa durante 15 minutos; si llegas tarde, llámanos y lo hablamos.</p>
              <div className="reservation-details">
                <div className="reservation-detail"><Clock3 size={17} /> Martes a sábado · 13:30–16:00 / 20:00–23:30</div>
                <div className="reservation-detail"><Phone size={17} /> <a href="tel:+34915550188" data-testid="link-reservation-phone">+34 915 550 188</a></div>
                <div className="reservation-detail"><MapPin size={17} /> Calle del Olmo, 18 · Madrid</div>
              </div>
            </div>
            {reservationSent ? <div className="confirm-state" data-testid="status-reservation-confirmation"><Check size={38} strokeWidth={1.5} /><h3>Tu mesa empieza aquí.</h3><p>Hemos recibido tu solicitud. Te llamaremos en breve para confirmar todos los detalles. Gracias por elegirnos.</p><a className="button-outline" href="tel:+34915550188" data-testid="link-call-restaurant">Llamar al restaurante</a></div> : (
              <form className="reservation-form" onSubmit={handleReservation} noValidate data-testid="form-reservation">
                <div className="form-row"><div className="field"><label htmlFor="reservation-date">Fecha</label><input id="reservation-date" name="date" type="date" required data-testid="input-reservation-date" /></div><div className="field"><label htmlFor="reservation-time">Hora</label><select id="reservation-time" name="time" required defaultValue="" data-testid="select-reservation-time"><option value="" disabled>Elige una hora</option><option>13:30</option><option>14:00</option><option>14:30</option><option>20:00</option><option>20:30</option><option>21:00</option><option>21:30</option><option>22:00</option></select></div></div>
                <div className="form-row"><div className="field"><label htmlFor="reservation-party">Personas</label><select id="reservation-party" name="party" required defaultValue="" data-testid="select-reservation-party"><option value="" disabled>¿Cuántos sois?</option><option>1 persona</option><option>2 personas</option><option>3 personas</option><option>4 personas</option><option>5 personas</option><option>6+ personas</option></select></div><div className="field"><label htmlFor="reservation-name">Nombre</label><input id="reservation-name" name="name" type="text" placeholder="Tu nombre" required minLength={2} data-testid="input-reservation-name" /></div></div>
                <div className="form-row"><div className="field"><label htmlFor="reservation-phone">Teléfono</label><input id="reservation-phone" name="phone" type="tel" placeholder="+34 600 000 000" required data-testid="input-reservation-phone" /></div><div className="field"><label htmlFor="reservation-email">Email</label><input id="reservation-email" name="email" type="email" placeholder="tu@email.com" required data-testid="input-reservation-email" /></div></div>
                <div className="field"><label htmlFor="reservation-notes">Notas para la cocina</label><textarea id="reservation-notes" name="notes" placeholder="Alergias, celebración, una mesa especial..." data-testid="textarea-reservation-notes" /></div>
                {formError && <div className="form-error" role="alert" data-testid="status-reservation-error">{formError}</div>}
                <button className="button-gold" type="submit" data-testid="button-submit-reservation">Solicitar reserva <ArrowRight size={16} /></button>
              </form>
            )}
          </div>
        </section>

        <section className="testimonial-section section-pad" data-testid="section-testimonials">
          <div className="section-wrap testimonial-wrap">
            <div><div className="eyebrow"><span className="gold-rule" /> Lo que se llevan</div><h2 className="section-title">La mejor parte<br /><em>la cuentan ellos.</em></h2><a className="text-link" href="https://www.google.com/maps" target="_blank" rel="noreferrer" data-testid="link-review-us">Déjanos tu reseña <ArrowRight size={15} /></a></div>
            <div><div className="review-score">Excelente · 4,9 sobre 5</div><div className="stars" aria-label="5 estrellas">{[0, 1, 2, 3, 4].map((star) => <Star size={18} fill="currentColor" key={star} />)}</div><blockquote className="review-quote" data-testid="text-current-review">“{currentReview.quote}”</blockquote><div className="review-author"><span className="review-avatar">{currentReview.author.charAt(0)}</span><div><strong>{currentReview.author}</strong><span>{currentReview.detail}</span></div></div><div className="carousel-controls"><button type="button" aria-label="Reseña anterior" onClick={() => setReviewIndex((reviewIndex - 1 + reviews.length) % reviews.length)} data-testid="button-review-previous"><ChevronLeft size={18} /></button><button type="button" aria-label="Siguiente reseña" onClick={() => setReviewIndex((reviewIndex + 1) % reviews.length)} data-testid="button-review-next"><ChevronRight size={18} /></button></div></div>
          </div>
        </section>

        <section className="section-wrap section-pad" id="contacto" data-testid="section-contact">
          <div className="contact-grid">
            <div className="contact-copy"><div className="eyebrow"><span className="gold-rule" /> Encuéntranos</div><h2 className="section-title">Ven a vernos<br /><em>al centro.</em></h2><p>En una calle tranquila, a dos pasos de Tirso de Molina. Ven caminando, en metro o con hambre. Lo demás lo ponemos nosotros.</p><div className="contact-list"><div><strong>Dirección</strong><span>Calle del Olmo, 18 · 28012 Madrid</span></div><div><strong>Horarios</strong><span>Martes–sábado · 13:30–16:00 y 20:00–23:30</span></div><div><strong>Contacto</strong><a href="tel:+34915550188" data-testid="link-contact-phone">+34 915 550 188</a><a href="mailto:hola@saborurbano.es" data-testid="link-contact-email">hola@saborurbano.es</a></div></div></div>
            <iframe className="map-frame" title="Mapa de Sabor Urbano en Madrid" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-3.708%2C40.408%2C-3.698%2C40.414&amp;layer=mapnik&amp;marker=40.411%2C-3.703" data-testid="map-restaurant" />
          </div>
        </section>

        <section className="newsletter section-pad" data-testid="section-newsletter">
          <div className="section-wrap newsletter-inner"><div><div className="eyebrow" style={{ color: 'var(--gold)' }}><span className="gold-rule" /> La sobremesa</div><h2>Una carta en tu correo.</h2><p>Noticias de la casa, productores invitados y alguna mesa libre de última hora. Sin ruido.</p></div><div>{newsletterSent ? <div className="newsletter-feedback" role="status" data-testid="status-newsletter-success">Listo. Te esperamos en la próxima sobremesa.</div> : <form className="newsletter-form" onSubmit={handleNewsletter} data-testid="form-newsletter"><input type="email" required aria-label="Tu correo electrónico" placeholder="Tu correo electrónico" data-testid="input-newsletter-email" /><button type="submit" aria-label="Suscribirme" data-testid="button-newsletter-submit"><ArrowRight size={21} /></button></form>}</div></div>
        </section>
      </main>

      <footer className="footer" data-testid="footer-site">
        <div className="section-wrap"><div className="footer-grid"><div className="footer-brand"><a className="brand-mark" href="#inicio" data-testid="link-footer-brand"><span>SABOR</span> URBANO</a><p>Una casa de cocina de autor con alma local, en el centro de Madrid.</p></div><div><h3>Explora</h3><ul><li><a href="#historia" data-testid="link-footer-historia">Nuestra historia</a></li><li><a href="#carta" data-testid="link-footer-carta">La carta</a></li><li><a href="#galeria" data-testid="link-footer-galeria">Galería</a></li></ul></div><div><h3>Visítanos</h3><ul><li><a href="#reservas" data-testid="link-footer-reservas">Reservar mesa</a></li><li><a href="tel:+34915550188" data-testid="link-footer-phone">+34 915 550 188</a></li><li><a href="mailto:hola@saborurbano.es" data-testid="link-footer-email">hola@saborurbano.es</a></li></ul></div><div><h3>En la red</h3><div className="socials"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" data-testid="link-social-instagram"><Instagram size={16} /></a><a href="https://www.google.com/maps" target="_blank" rel="noreferrer" aria-label="Google Maps" data-testid="link-social-maps"><MapPin size={16} /></a></div><h3 style={{ marginTop: '1.8rem' }}>Pagos</h3><div className="payments" aria-label="Métodos de pago"><span>VISA</span><span>MC</span><span>AMEX</span><span>EFECTIVO</span></div></div></div><div className="footer-bottom"><span>© 2024 Sabor Urbano. Hecho con apetito.</span><span>Alérgenos: pregunta siempre a nuestro equipo.</span></div></div>
      </footer>

      <div className={`lightbox ${lightboxImage ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Vista ampliada de galería" onClick={() => setLightboxImage(null)} data-testid="dialog-lightbox">
        {lightboxImage && <figure onClick={(event) => event.stopPropagation()}><img src={lightboxImage.src} alt={lightboxImage.alt} /><figcaption>{lightboxImage.caption}</figcaption></figure>}
        <button className="lightbox-close" type="button" aria-label="Cerrar imagen" onClick={() => setLightboxImage(null)} data-testid="button-close-lightbox"><X size={20} /></button>
      </div>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;