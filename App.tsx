
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Menu,
  X,
  FileText,
  Building2,
  Scale,
  MessageCircle
} from 'lucide-react';
import CalculadorasSection from './features/calculadoras/ui/CalculadorasSection';

// --- Logo Component ---
const LOGO_SRC = "/images/Logo.png.png";

const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img
    src={LOGO_SRC}
    alt="Guilherme Garlini Advogados"
    className={`object-contain h-auto w-auto ${className}`}
    loading="eager"
    decoding="async"
  />
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Início', href: '#inicio' },
    { name: 'Sobre', href: '#sobre' },
    { name: 'Calculadoras Jurídicas', href: '#calculadoras' },
    { name: 'Atuação', href: '#atuacao' },

    { name: 'Contato', href: '#contato' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#161b22]/95 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Logo className={`transition-all duration-500 ease-out ${scrolled ? 'h-16 w-auto max-w-[200px]' : 'h-28 w-auto max-w-[360px]'}`} />
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {menuItems.map((item) => (
            <a key={item.name} href={item.href} className="text-[11px] uppercase tracking-widest hover:text-gold transition-colors font-medium text-[#c9d1d9]">
              {item.name}
            </a>
          ))}
          <a href="https://wa.me/5566999562660" className="text-[11px] uppercase tracking-widest border-b border-gold pb-1 hover:opacity-70 transition-all font-semibold text-gold">
            Sinop / MT
          </a>
        </div>

        <button className="lg:hidden text-[#f0f6fc]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#161b22] border-t border-[#30363d] flex flex-col p-8 gap-6 shadow-xl lg:hidden">
          {menuItems.map((item) => (
            <a key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="text-sm uppercase tracking-widest text-[#f0f6fc] font-light">
              {item.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section id="inicio" className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden bg-[#0d1117] text-center">

    <div className="max-w-6xl mx-auto w-full relative z-10">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-8 text-[#f0f6fc]">
        Assessoria Jurídica em <br />
        <span className="italic serif">Sinop e Região.</span>
      </h1>
    </div>
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30">
      <div className="w-[1px] h-16 bg-gold"></div>
    </div>
  </section>
);

const PracticeAreas = () => {
  const areas = [
    { 
      title: 'Direito Previdenciário', 
      desc: 'Assessoria completa a segurados do INSS, com foco na garantia e efetivação de benefícios através de análise técnica rigorosa.',
      icon: <FileText className="text-gold mb-6" size={28} strokeWidth={1} />,
      services: [
        'Aposentadorias (Idade, Tempo e Especial)',
        'Auxílio-doença e Incapacidade',
        'Pensão por morte',
        'Revisão de benefícios',
        'Planejamento previdenciário'
      ]
    },
    { 
      title: 'Direito Condominial', 
      desc: 'Suporte especializado para síndicos, administradoras e condomínios em Sinop e região, garantindo uma gestão eficiente.',
      icon: <Building2 className="text-gold mb-6" size={28} strokeWidth={1} />,
      services: [
        'Prevenção e mediação de conflitos',
        'Cobrança de inadimplências',
        'Análise e elaboração de contratos',
        'Suporte jurídico administrativo',
        'Assessoria em Assembleias',
        'Gestão de riscos jurídicos'
      ]
    },
    { 
      title: 'Direito do Agronegócio', 
      desc: 'Assessoria estratégica para produtores rurais e empresas do agro, com foco em segurança jurídica, contratos bem estruturados e prevenção de litígios que travam a operação.',
      icon: <Scale className="text-gold mb-6" size={28} strokeWidth={1} />,
      services: [
        'Contratos agrários e parcerias rurais',
        'Compra e venda de insumos e produção',
        'Regularização e gestão de riscos jurídicos',
        'Cobranças, garantias e inadimplência',
        'Estratégia jurídica para crescimento sustentável'
      ]
    },
    { 
      title: 'Direito Civil', 
      desc: 'Atuação em conflitos e contratos civis, priorizando soluções práticas e seguras para pessoas e empresas.',
      icon: <FileText className="text-gold mb-6" size={28} strokeWidth={1} />,
      services: [
        'Contratos e obrigações',
        'Responsabilidade civil',
        'Cobranças e indenizações',
        'Negociações e acordos'
      ]
    },
    { 
      title: 'Direito Penal', 
      desc: 'Defesa técnica e estratégica em todas as fases do processo, com foco em garantias e resultados.',
      icon: <Scale className="text-gold mb-6" size={28} strokeWidth={1} />,
      services: [
        'Acompanhamento em flagrantes',
        'Inquéritos e processos',
        'Medidas cautelares',
        'Recursos e sustentações'
      ]
    },
    { 
      title: 'Direito Ambiental', 
      desc: 'Assessoria preventiva e contenciosa para regularidade ambiental e mitigação de riscos.',
      icon: <Building2 className="text-gold mb-6" size={28} strokeWidth={1} />,
      services: [
        'Licenciamento ambiental',
        'Defesas administrativas',
        'Autos de infração',
        'Regularização e conformidade'
      ]
    }
  ];

  return (
    <section id="atuacao" className="py-32 bg-[#161b22]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-[#f0f6fc]">Atuação</h2>
            <p className="text-[#8b949e] font-light leading-relaxed">
              Atuação pautada pela ética e transparência em demandas administrativas e judiciais.
            </p>
          </div>
          <div className="h-[1px] flex-grow bg-[#30363d] mx-12 hidden md:block mb-6"></div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, i) => (
            <div
              key={i}
              className="flex flex-col p-8 border border-[#30363d] bg-[#0d1117]/50 hover:bg-[#161b22] hover:shadow-2xl transition-all duration-700 group relative overflow-hidden min-h-[380px]"
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                <Scale size={120} />
              </div>
              {area.icon}
              <h3 className="text-2xl font-light mb-4 group-hover:text-gold transition-colors text-[#f0f6fc] leading-snug">
                {area.title}
              </h3>
              <p className="text-[#9aa3ad] font-light leading-relaxed text-sm">{area.desc}</p>
              <div className="grid grid-cols-1 gap-3 mt-6 mb-8 relative z-10 text-xs">
                {area.services.map((service, si) => (
                  <div key={si} className="flex items-start gap-3 text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold/40"></div>
                    {service}
                  </div>
                ))}
              </div>
              <div className="mt-auto w-full h-[1px] bg-[#30363d] group-hover:bg-gold transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  // Try to load real image, fallback to placeholder
  const [imgSrc, setImgSrc] = React.useState('/images/guilherme.jpg');
  const [imgError, setImgError] = React.useState(false);

  return (
    <section id="sobre" className="py-32 bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="lg:w-1/2">
            <div className="relative group mx-auto max-w-sm lg:max-w-none">
              <div className="absolute -inset-4 border border-gold/20 translate-x-4 translate-y-4 -z-10 transition-transform duration-700"></div>
              <div className="aspect-[3/4] bg-[#161b22] p-3 shadow-2xl overflow-hidden">
                {!imgError ? (
                  <img 
                    src={imgSrc}
                    alt="Dr. Guilherme Garlini"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    style={{ objectPosition: 'center top' }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0d1117] to-[#161b22] flex items-center justify-center">
                    <span className="text-[#8b949e] text-center px-6">
                      <p className="text-sm mb-2">Adicione sua foto em:</p>
                      <p className="text-xs font-mono bg-[#161b22] px-3 py-2 rounded">public/images/guilherme.jpg</p>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        <div className="lg:w-1/2">
          <span className="text-gold tracking-[0.3em] uppercase text-[10px] mb-6 block font-bold text-center lg:text-left">Conheça o Advogado</span>
          <h2 className="text-4xl md:text-5xl font-light mb-10 leading-tight text-[#f0f6fc] text-center lg:text-left">Guilherme Garlini</h2>
          <div className="space-y-8 text-[#c9d1d9] font-light leading-loose text-lg text-center lg:text-left">
            <p>
              Sou <strong>Guilherme Garlini</strong>, advogado regularmente inscrito na OAB, formado em Direito no ano de 2018, com sólida atuação em Sinop, Mato Grosso.
            </p>
            <p>
              Meu trabalho é pautado pela ética, transparência e compromisso inabalável com resultados, oferecendo um atendimento personalizado e técnico, sempre alinhado à legislação vigente e às melhores estratégias jurídicas para cada caso.
            </p>
            <p>
              Com experiência na condução de pedidos administrativos e ações judiciais, busco soluções seguras e eficientes, adequadas à realidade de cada cliente, seja no amparo ao segurado do INSS ou no suporte à gestão condominial de Sinop e região.
            </p>
            <div className="pt-6 border-t border-[#30363d] text-sm text-[#8b949e] space-y-2">
              <p><strong className="text-[#f0f6fc]">OAB/MT:</strong> 35967</p>
              <p><strong className="text-[#f0f6fc]">E-mail:</strong> advguilhermegarlini@gmail.com</p>
              <p><strong className="text-[#f0f6fc]">Contato:</strong> (66) 99956-2660</p>
            </div>
            <div className="pt-8 border-t border-[#30363d] grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 text-gold text-[10px] uppercase tracking-widest font-bold">
                <CheckCircle2 size={16} />
                <span>Ética e Sigilo</span>
              </div>
              <div className="flex items-center gap-3 text-gold text-[10px] uppercase tracking-widest font-bold">
                <CheckCircle2 size={16} />
                <span>Atendimento Regional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

const Contact = () => (
  <section id="contato" className="py-32 bg-[#161b22]">
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-24">
        <div className="lg:w-1/3">
          <h2 className="text-4xl font-light mb-12 text-[#f0f6fc]">Contato Profissional</h2>
          <div className="space-y-12">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold mb-6 font-bold">Informações de Contato</p>
              <div className="space-y-6">
                <a href="mailto:advguilhermegarlini@gmail.com" className="text-lg font-light hover:text-gold transition-colors flex items-center gap-4 text-[#c9d1d9]">
                  <Mail size={20} strokeWidth={1} className="text-gold" /> advguilhermegarlini@gmail.com
                </a>
                <a href="https://wa.me/5566999562660" className="text-lg font-light hover:text-gold transition-colors flex items-center gap-4 text-[#c9d1d9]">
                  <MessageCircle size={20} strokeWidth={1} className="text-gold" /> (66) 99956-2660
                </a>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold mb-6 font-bold">Atendimento</p>
              <div className="flex items-start gap-4">
                <MapPin size={20} strokeWidth={1} className="mt-1 text-gold" />
                <p className="text-lg font-light leading-relaxed text-[#c9d1d9]">
                  Sinop, Mato Grosso <br />
                  <span className="text-sm text-[#8b949e] italic">Atendimento presencial e online para todo o estado</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-2/3">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10" onSubmit={e => e.preventDefault()}>
            <div className="border-b border-[#30363d] pb-3">
              <input type="text" placeholder="Nome completo" className="w-full bg-transparent outline-none font-light py-2 text-lg focus:placeholder-transparent transition-all" />
            </div>
            <div className="border-b border-[#30363d] pb-3">
              <input type="email" placeholder="E-mail" className="w-full bg-transparent outline-none font-light py-2 text-lg focus:placeholder-transparent transition-all" />
            </div>
            <div className="md:col-span-2 border-b border-[#30363d] pb-3">
              <select className="w-full bg-transparent outline-none font-light py-2 text-lg text-[#8b949e] focus:text-[#f0f6fc] transition-all">
                <option value="">Selecione o assunto</option>
                <option value="previdenciario">Outros Benefícios INSS</option>
                <option value="condominial">Direito Condominial</option>
                <option value="outro">Outros Assuntos</option>
              </select>
            </div>
            <div className="md:col-span-2 border-b border-[#30363d] pb-3">
              <textarea placeholder="Como posso auxiliá-lo juridicamente?" rows={3} className="w-full bg-transparent outline-none font-light py-2 text-lg resize-none focus:placeholder-transparent transition-all"></textarea>
            </div>
            <div className="md:col-span-2 pt-6">
              <button className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-6 hover:bg-gold hover:text-white transition-all w-full sm:w-auto font-bold shadow-lg hover:shadow-gold/20">
                Enviar Mensagem
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-24 border-t border-[#30363d] bg-[#161b22]">
    <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
      <Logo className="w-16 h-16 mb-10" />
      <div className="mb-10">
        <span className="text-2xl tracking-[0.25em] font-light block mb-3 uppercase text-[#f0f6fc]">GUILHERME GARLINI</span>
        <span className="text-[11px] tracking-[0.4em] text-[#8b949e] uppercase font-bold">OAB/MT 35967</span>
      </div>
      <div className="flex gap-10 mb-16">
        {['Instagram', 'LinkedIn', 'WhatsApp'].map(social => (
          <a key={social} href="#" className="text-[10px] uppercase tracking-widest text-[#8b949e] hover:text-gold transition-colors font-bold">{social}</a>
        ))}
      </div>
      <div className="text-[10px] text-[#6e7681] font-light tracking-widest uppercase leading-relaxed">
        Â© {new Date().getFullYear()} Guilherme Garlini Advocacia. <br /> 
        Sinop - Mato Grosso | Atendimento em todo o Brasil.
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen selection:bg-gold/20 selection:text-gold bg-[#0d1117] antialiased">
      <Navbar />
      <main>
        <Hero />
        <About />
        <CalculadorasSection />
        <PracticeAreas />
        <Contact />
      </main>
      <Footer />
      
      {/* Subtle Floating Contact Button */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-center">
        <a
          href="https://wa.me/5566999562660"
          target="_blank"
          rel="noreferrer"
          className="whatsapp-blink w-20 h-20 rounded-full shadow-2xl hover:shadow-gold/20 hover:-translate-y-2 transition-all"
          title="Falar com Dr. Guilherme"
        >
          <img
            src="/images/whats.png"
            alt="WhatsApp"
            className="w-full h-full object-contain scale-[2.2]"
            loading="eager"
            decoding="async"
          />
        </a>
        <span className="mt-2 text-[10px] uppercase tracking-widest text-gold">24h</span>
      </div>
    </div>
  );
};

export default App;


