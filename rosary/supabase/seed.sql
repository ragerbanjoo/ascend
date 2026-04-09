-- ============================================================
-- SEED DATA — St. Juan Diego YAG
-- Run with service role or as superuser after migration
-- ============================================================

-- Global site settings
INSERT INTO sites (id, brand_name, tagline, phone_primary, phone_secondary, email, address, socials, primary_cta, footer_text, announcement_banner, meeting_time, leadership)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{"en":"St. Juan Diego Young Adult Group","es":"Grupo de Jóvenes Adultos San Juan Diego"}',
  '{"en":"Growing in faith, community, and service","es":"Creciendo en fe, comunidad y servicio"}',
  '509-678-4164',
  '509-678-4165',
  'info@stjuandiegoyoungadults.com',
  '{"en":"15800 Summitview Road, Cowiche, WA 98923","es":"15800 Summitview Road, Cowiche, WA 98923"}',
  '{}',
  '{"type":"call","value":"5096784164","label":{"en":"Call Us","es":"Llámanos"}}',
  '{"en":"© St. Juan Diego Young Adult Group. All rights reserved.","es":"© Grupo de Jóvenes Adultos San Juan Diego. Todos los derechos reservados."}',
  '{"enabled":false,"text":{"en":"","es":""},"link":""}',
  '{"en":"Mondays at 6:00 PM","es":"Lunes a las 6:00 PM"}',
  '{"en":"Gaby Gomez + team","es":"Gaby Gomez + equipo"}'
) ON CONFLICT (id) DO NOTHING;

-- Contact settings
INSERT INTO contact_settings (id, recipient_email, subject_template, success_message, fail_message, spam_toggles)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'info@stjuandiegoyoungadults.com',
  'New Contact Form Submission from {{name}}',
  '{"en":"Thank you for your message! We will get back to you soon.","es":"¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto."}',
  '{"en":"Something went wrong. Please try again later.","es":"Algo salió mal. Por favor intenta de nuevo más tarde."}',
  '{"captcha_enabled":false,"rate_limiting_enabled":false}'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PAGES
-- ============================================================

INSERT INTO pages (id, slug, nav_label, seo, og, "order", is_in_nav, status) VALUES
('10000000-0000-0000-0000-000000000001', 'home',
 '{"en":"Home","es":"Inicio"}',
 '{"title":{"en":"St. Juan Diego Young Adult Group","es":"Grupo de Jóvenes Adultos San Juan Diego"},"description":{"en":"Young Adult Group at St. Juan Diego Catholic Church, Cowiche, WA. Mondays at 6:00 PM.","es":"Grupo de Jóvenes Adultos en la Iglesia Católica San Juan Diego, Cowiche, WA. Lunes a las 6:00 PM."}}',
 '{"title":{"en":"St. Juan Diego Young Adult Group","es":"Grupo de Jóvenes Adultos San Juan Diego"},"description":{"en":"Growing in faith, community, and service.","es":"Creciendo en fe, comunidad y servicio."},"image":""}',
 1, true, 'published'),

('10000000-0000-0000-0000-000000000002', 'about',
 '{"en":"About","es":"Nosotros"}',
 '{"title":{"en":"About Us","es":"Nosotros"},"description":{"en":"Learn about St. Juan Diego Young Adult Group, our mission, and our community.","es":"Conoce al Grupo de Jóvenes Adultos San Juan Diego, nuestra misión y nuestra comunidad."}}',
 '{"title":{"en":"About Us","es":"Nosotros"},"description":{"en":"Learn about our young adult community.","es":"Conoce nuestra comunidad de jóvenes adultos."},"image":""}',
 2, true, 'published'),

('10000000-0000-0000-0000-000000000003', 'rosary',
 '{"en":"Rosary","es":"Rosario"}',
 '{"title":{"en":"Rosary","es":"Rosario"},"description":{"en":"Pray the Holy Rosary with our community.","es":"Reza el Santo Rosario con nuestra comunidad."}}',
 '{"title":{"en":"Rosary","es":"Rosario"},"description":{"en":"Pray the Holy Rosary with us.","es":"Reza el Santo Rosario con nosotros."},"image":""}',
 3, true, 'published'),

('10000000-0000-0000-0000-000000000004', 'reflections',
 '{"en":"Reflections","es":"Reflexiones"}',
 '{"title":{"en":"Reflections","es":"Reflexiones"},"description":{"en":"Faith reflections and meditations from our community.","es":"Reflexiones de fe y meditaciones de nuestra comunidad."}}',
 '{"title":{"en":"Reflections","es":"Reflexiones"},"description":{"en":"Read our community reflections.","es":"Lee las reflexiones de nuestra comunidad."},"image":""}',
 4, true, 'published'),

('10000000-0000-0000-0000-000000000005', 'donate',
 '{"en":"Donate","es":"Donar"}',
 '{"title":{"en":"Donate","es":"Donar"},"description":{"en":"Support the St. Juan Diego Young Adult Group with your generous donation.","es":"Apoya al Grupo de Jóvenes Adultos San Juan Diego con tu generosa donación."}}',
 '{"title":{"en":"Donate","es":"Donar"},"description":{"en":"Support our young adult ministry.","es":"Apoya nuestro ministerio de jóvenes adultos."},"image":""}',
 5, true, 'published'),

('10000000-0000-0000-0000-000000000006', 'contact',
 '{"en":"Contact","es":"Contacto"}',
 '{"title":{"en":"Contact Us","es":"Contáctanos"},"description":{"en":"Get in touch with St. Juan Diego Young Adult Group. We would love to hear from you!","es":"Ponte en contacto con el Grupo de Jóvenes Adultos San Juan Diego. ¡Nos encantaría saber de ti!"}}',
 '{"title":{"en":"Contact Us","es":"Contáctanos"},"description":{"en":"Reach out to us.","es":"Contáctanos."},"image":""}',
 6, true, 'published'),

('10000000-0000-0000-0000-000000000007', 'privacy',
 '{"en":"Privacy Policy","es":"Política de Privacidad"}',
 '{"title":{"en":"Privacy Policy","es":"Política de Privacidad"},"description":{"en":"Privacy policy for St. Juan Diego Young Adult Group.","es":"Política de privacidad del Grupo de Jóvenes Adultos San Juan Diego."}}',
 '{"title":{"en":"Privacy Policy","es":"Política de Privacidad"},"description":{"en":"Our privacy policy.","es":"Nuestra política de privacidad."},"image":""}',
 7, false, 'published'),

('10000000-0000-0000-0000-000000000008', 'terms',
 '{"en":"Terms of Service","es":"Términos de Servicio"}',
 '{"title":{"en":"Terms of Service","es":"Términos de Servicio"},"description":{"en":"Terms of service for St. Juan Diego Young Adult Group.","es":"Términos de servicio del Grupo de Jóvenes Adultos San Juan Diego."}}',
 '{"title":{"en":"Terms of Service","es":"Términos de Servicio"},"description":{"en":"Our terms of service.","es":"Nuestros términos de servicio."},"image":""}',
 8, false, 'published')

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SECTIONS for Home page
-- ============================================================
INSERT INTO sections (id, page_id, key, title, "order", variant) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'hero',
 '{"en":"Hero","es":"Principal"}', 1, 'hero'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'meeting_info',
 '{"en":"When & Where","es":"Cuándo y Dónde"}', 2, 'info_cards'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'cta',
 '{"en":"Call to Action","es":"Llamado a la Acción"}', 3, 'cta')
ON CONFLICT (page_id, key) DO NOTHING;

-- SECTIONS for About page
INSERT INTO sections (id, page_id, key, title, "order", variant) VALUES
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'intro',
 '{"en":"About Us","es":"Nosotros"}', 1, 'text'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'leadership',
 '{"en":"Our Leadership","es":"Nuestro Liderazgo"}', 2, 'text'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'location',
 '{"en":"Location & Contact","es":"Ubicación y Contacto"}', 3, 'contact_info')
ON CONFLICT (page_id, key) DO NOTHING;

-- SECTIONS for Contact page
INSERT INTO sections (id, page_id, key, title, "order", variant) VALUES
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', 'form',
 '{"en":"Contact Form","es":"Formulario de Contacto"}', 1, 'form'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000006', 'info',
 '{"en":"Contact Information","es":"Información de Contacto"}', 2, 'contact_info')
ON CONFLICT (page_id, key) DO NOTHING;

-- ============================================================
-- FIELDS for Home Hero
-- ============================================================
INSERT INTO fields (id, section_id, key, type, value) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'heading', 'text',
 '{"en":"St. Juan Diego Young Adult Group","es":"Grupo de Jóvenes Adultos San Juan Diego"}'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'subheading', 'text',
 '{"en":"Growing in faith, community, and service. Join us every Monday at 6:00 PM.","es":"Creciendo en fe, comunidad y servicio. Únete a nosotros cada lunes a las 6:00 PM."}'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'cta_primary_label', 'text',
 '{"en":"Join Us","es":"Únete"}'),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'cta_primary_link', 'link',
 '{"en":"/contact","es":"/contact"}'),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'cta_secondary_label', 'text',
 '{"en":"Learn More","es":"Más Información"}'),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'cta_secondary_link', 'link',
 '{"en":"/about","es":"/about"}')
ON CONFLICT (section_id, key) DO NOTHING;

-- FIELDS for Home Meeting Info
INSERT INTO fields (id, section_id, key, type, value) VALUES
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', 'heading', 'text',
 '{"en":"When & Where","es":"Cuándo y Dónde"}'),
('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', 'time', 'text',
 '{"en":"Mondays at 6:00 PM","es":"Lunes a las 6:00 PM"}'),
('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002', 'location_name', 'text',
 '{"en":"St. Juan Diego Catholic Church","es":"Iglesia Católica San Juan Diego"}'),
('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', 'location_city', 'text',
 '{"en":"Cowiche, WA","es":"Cowiche, WA"}'),
('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', 'phone', 'text',
 '{"en":"509-678-4164","es":"509-678-4164"}'),
('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', 'email', 'text',
 '{"en":"info@stjuandiegoyoungadults.com","es":"info@stjuandiegoyoungadults.com"}')
ON CONFLICT (section_id, key) DO NOTHING;

-- FIELDS for Home CTA
INSERT INTO fields (id, section_id, key, type, value) VALUES
('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000003', 'heading', 'text',
 '{"en":"Ready to Join?","es":"¿Listo para Unirte?"}'),
('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000003', 'description', 'text',
 '{"en":"We welcome all young adults looking to grow in their faith and build community.","es":"Damos la bienvenida a todos los jóvenes adultos que buscan crecer en su fe y construir comunidad."}'),
('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000003', 'cta_label', 'text',
 '{"en":"Get in Touch","es":"Contáctanos"}'),
('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000003', 'cta_link', 'link',
 '{"en":"/contact","es":"/contact"}')
ON CONFLICT (section_id, key) DO NOTHING;

-- FIELDS for About Intro
INSERT INTO fields (id, section_id, key, type, value) VALUES
('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000004', 'heading', 'text',
 '{"en":"About Us","es":"Nosotros"}'),
('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000004', 'paragraph_1', 'richtext',
 '{"en":"St. Juan Diego Young Adult Group is a faith-based community of young adults at St. Juan Diego Catholic Church in Cowiche, Washington. We meet every Monday at 6:00 PM to grow together in faith, fellowship, and service.","es":"El Grupo de Jóvenes Adultos San Juan Diego es una comunidad de fe de jóvenes adultos en la Iglesia Católica San Juan Diego en Cowiche, Washington. Nos reunimos cada lunes a las 6:00 PM para crecer juntos en fe, comunión y servicio."}'),
('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000004', 'paragraph_2', 'richtext',
 '{"en":"Led by Gaby Gomez and our dedicated team, we create a welcoming space for young adults to explore their faith, build meaningful relationships, and make a positive impact in our community.","es":"Liderados por Gaby Gomez y nuestro equipo dedicado, creamos un espacio acogedor para que los jóvenes adultos exploren su fe, construyan relaciones significativas y tengan un impacto positivo en nuestra comunidad."}')
ON CONFLICT (section_id, key) DO NOTHING;

-- FIELDS for About Leadership
INSERT INTO fields (id, section_id, key, type, value) VALUES
('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000005', 'heading', 'text',
 '{"en":"Our Leadership","es":"Nuestro Liderazgo"}'),
('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000005', 'description', 'text',
 '{"en":"Gaby Gomez + team","es":"Gaby Gomez + equipo"}')
ON CONFLICT (section_id, key) DO NOTHING;

-- FIELDS for About Location
INSERT INTO fields (id, section_id, key, type, value) VALUES
('30000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000006', 'heading', 'text',
 '{"en":"Location & Contact","es":"Ubicación y Contacto"}'),
('30000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000006', 'address', 'text',
 '{"en":"15800 Summitview Road, Cowiche, WA 98923","es":"15800 Summitview Road, Cowiche, WA 98923"}'),
('30000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000006', 'phone_primary', 'text',
 '{"en":"509-678-4164","es":"509-678-4164"}'),
('30000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000006', 'phone_secondary', 'text',
 '{"en":"509-678-4165","es":"509-678-4165"}'),
('30000000-0000-0000-0000-000000000026', '20000000-0000-0000-0000-000000000006', 'email', 'text',
 '{"en":"info@stjuandiegoyoungadults.com","es":"info@stjuandiegoyoungadults.com"}')
ON CONFLICT (section_id, key) DO NOTHING;

-- FIELDS for Contact form section
INSERT INTO fields (id, section_id, key, type, value) VALUES
('30000000-0000-0000-0000-000000000027', '20000000-0000-0000-0000-000000000007', 'heading', 'text',
 '{"en":"Contact Us","es":"Contáctanos"}'),
('30000000-0000-0000-0000-000000000028', '20000000-0000-0000-0000-000000000007', 'description', 'text',
 '{"en":"Have questions or want to get involved? Reach out to us!","es":"¿Tienes preguntas o quieres participar? ¡Contáctanos!"}')
ON CONFLICT (section_id, key) DO NOTHING;
