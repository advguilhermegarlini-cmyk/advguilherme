
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Menu,
  X,
  ArrowRight,
  FileText,
  Building2,
  Scale,
  ChevronDown,
  Baby
} from 'lucide-react';

// --- Logo Component ---
const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c5a059" />
        <stop offset="100%" stopColor="#e2c996" />
      </linearGradient>
    </defs>
    {/* Scales */}
    <g transform="translate(60, 50)">
      <path d="M0 20L-20 40L20 40Z" stroke="url(#logoGold)" strokeWidth="2" fill="none" />
      <rect x="-35" y="40" width="20" height="30" stroke="url(#logoGold)" strokeWidth="2" fill="none" />
      <rect x="15" y="40" width="20" height="30" stroke="url(#logoGold)" strokeWidth="2" fill="none" />
    </g>
    {/* Book */}
    <g transform="translate(130, 50)">
      <path d="M0 0L-8 5L-8 35L0 30L8 35L8 5Z" stroke="url(#logoGold)" strokeWidth="2" fill="none" />
      <line x1="-8" y1="15" x2="8" y2="15" stroke="url(#logoGold)" strokeWidth="1" />
    </g>
    {/* Plant */}
    <g transform="translate(150, 30)">
      <path d="M0 30C-5 15 -8 5 -8 0M0 30C5 15 8 5 8 0" stroke="url(#logoGold)" strokeWidth="2" fill="none" />
      <circle cx="-5" cy="22" r="3" fill="url(#logoGold)" opacity="0.7" />
      <circle cx="5" cy="20" r="3" fill="#7cb342" opacity="0.7" />
    </g>
    {/* Laurel Wreath */}
    <path d="M30 160Q50 140 70 160M30 160Q50 180 70 160" stroke="url(#logoGold)" strokeWidth="2" fill="none" opacity="0.8" />
    <circle cx="50" cy="160" r="45" stroke="url(#logoGold)" strokeWidth="1" fill="none" opacity="0.3" />
  </svg>
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
    { name: 'Atuação', href: '#atuacao' },
    { name: 'Salário Maternidade', href: '#maternidade' },
    { name: 'Contato', href: '#contato' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <div className="flex flex-col">
            <span className="text-lg tracking-[0.15em] font-light leading-none text-gray-800 uppercase">GUILHERME GARLINI</span>
            <span className="text-[10px] tracking-[0.3em] text-gold mt-1 uppercase font-medium">Advocacia Especializada</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {menuItems.map((item) => (
            <a key={item.name} href={item.href} className="text-[11px] uppercase tracking-widest hover:text-gold transition-colors font-medium text-gray-600">
              {item.name}
            </a>
          ))}
          <a href="https://wa.me/5566999562660" className="text-[11px] uppercase tracking-widest border-b border-gold pb-1 hover:opacity-70 transition-all font-semibold text-gold">
            Sinop / MT
          </a>
        </div>

        <button className="lg:hidden text-gray-800" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-100 flex flex-col p-8 gap-6 shadow-xl lg:hidden">
          {menuItems.map((item) => (
            <a key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="text-sm uppercase tracking-widest text-gray-800 font-light">
              {item.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section id="inicio" className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden bg-soft text-center">
    <div className="absolute top-0 right-0 w-1/3 h-screen bg-white opacity-40 hidden lg:block"></div>
    <div className="max-w-6xl mx-auto w-full relative z-10">
      <span className="text-gold tracking-[0.4em] uppercase text-[10px] mb-8 inline-block font-bold">
        OAB/MT 35967
      </span>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-8 text-gray-900">
        Assessoria Jurídica em <br />
        <span className="italic serif">Sinop e Região.</span>
      </h1>
      <p className="max-w-2xl mx-auto text-gray-500 text-lg font-light leading-relaxed mb-12">
        Atuação técnica e humanizada em Direito Previdenciário e Condominial, focada na segurança jurídica e na efetivação de direitos fundamentais.
      </p>
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
        <a href="#contato" className="bg-gold text-white px-10 py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#b59461] transition-all shadow-lg hover:shadow-gold/20">
          Agendar Consulta
        </a>
        <a href="#atuacao" className="text-xs uppercase tracking-[0.2em] flex items-center gap-3 group text-gray-800 font-medium">
          Ver Especialidades <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform text-gold" />
        </a>
      </div>
    </div>
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30">
      <div className="w-[1px] h-16 bg-gold"></div>
    </div>
  </section>
);

// Fix: Using React.FC to ensure that standard props like 'key' are correctly handled by TypeScript in JSX when mapping lists.
const AccordionItem: React.FC<{ 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onClick: () => void; 
}> = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-gray-100 py-6 last:border-0 group">
    <button 
      onClick={onClick}
      className="w-full flex justify-between items-center text-left gap-6 focus:outline-none"
    >
      <span className={`text-lg md:text-xl font-light transition-colors duration-300 ${isOpen ? 'text-gold' : 'text-gray-800 group-hover:text-gold'}`}>
        {question}
      </span>
      <ChevronDown size={20} className={`text-gold transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
      <p className="text-gray-500 font-light leading-relaxed text-lg pb-4">
        {answer}
      </p>
    </div>
  </div>
);

const MaternitySection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Como funciona o pagamento do salário maternidade",
      answer: "O salário maternidade é pago pela empresa no caso das empregadas com carteira assinada, havendo posterior reembolso pelo INSS. Para as demais seguradas, como contribuintes individuais, seguradas facultativas, MEIs e desempregadas, o pagamento é feito diretamente pelo INSS."
    },
    {
      question: "Qual é o valor do salário maternidade por mês",
      answer: "O valor mensal do salário maternidade varia de acordo com a categoria da segurada. Para empregadas com carteira assinada, corresponde ao salário integral. Para autônomas, MEIs e seguradas facultativas, o valor é calculado pela média das últimas 12 contribuições. Já para as seguradas especiais, o benefício equivale a um salário mínimo."
    },
    {
      question: "Quem tem direito ao auxílio maternidade",
      answer: "Têm direito ao auxílio maternidade todas as seguradas do INSS, incluindo empregadas com carteira assinada, autônomas, MEIs, seguradas facultativas, trabalhadoras rurais enquadradas como seguradas especiais e também as desempregadas que ainda se encontrem no período de graça."
    },
    {
      question: "Homens podem receber salário maternidade",
      answer: "Sim. Os homens podem receber salário maternidade nos casos de adoção, guarda judicial ou falecimento da mãe, desde que sejam segurados do INSS e detenham a responsabilidade legal pela criança."
    },
    {
      question: "Casais homossexuais têm direito ao salário maternidade",
      answer: "Sim. Casais homoafetivos têm direito ao salário maternidade nos casos de adoção ou guarda judicial. O benefício será concedido a apenas um dos responsáveis, desde que este possua qualidade de segurado do INSS."
    },
    {
      question: "É possível receber mais de um salário maternidade ao mesmo tempo",
      answer: "Sim, desde que a segurada possua dois vínculos formais de contribuição ao INSS simultaneamente, como ocorre quando há dois empregos com carteira assinada. A ocorrência de parto múltiplo ou a adoção de mais de uma criança não gera direito a mais de um benefício."
    },
    {
      question: "Quantos meses é necessário contribuir para ter direito ao auxílio maternidade",
      answer: "Atualmente, basta uma única contribuição válida para que a segurada tenha direito ao auxílio maternidade, desde que mantenha a qualidade de segurada no momento do evento."
    }
  ];

  return (
    <section id="maternidade" className="py-32 bg-soft border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <Baby size={48} className="text-gold mb-8 opacity-40" strokeWidth={1} />
              <span className="text-gold tracking-[0.3em] uppercase text-[10px] mb-6 block font-bold">Guia Informativo</span>
              <h2 className="text-4xl md:text-5xl font-light mb-8 leading-tight text-gray-900">Salário Maternidade</h2>
              <p className="text-gray-500 font-light leading-relaxed text-lg mb-10">
                Informações essenciais sobre um dos benefícios mais importantes da seguridade social. Entenda seus direitos e como acessá-los.
              </p>
              <div className="p-8 border border-gold/10 bg-white shadow-sm">
                <p className="text-xs uppercase tracking-widest text-gold font-bold mb-4">Dúvida Específica?</p>
                <p className="text-sm text-gray-500 mb-6 font-light">Se você tem um caso particular ou negativa do INSS, clique abaixo.</p>
                <a href="https://wa.me/5566999562660" className="text-[10px] uppercase tracking-widest text-gold hover:opacity-70 font-bold flex items-center gap-2">
                  Falar com o Especialista <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <div className="bg-white p-8 md:p-12 shadow-2xl border border-gray-50">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
    }
  ];

  return (
    <section id="atuacao" className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">Expertise Profissional</h2>
            <p className="text-gray-500 font-light leading-relaxed">
              Atuação pautada pela ética e transparência em demandas administrativas e judiciais.
            </p>
          </div>
          <div className="h-[1px] flex-grow bg-gray-100 mx-12 hidden md:block mb-6"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {areas.map((area, i) => (
            <div key={i} className="flex flex-col p-10 lg:p-14 border border-gray-50 bg-soft/30 hover:bg-white hover:shadow-2xl transition-all duration-700 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Scale size={150} />
              </div>
              {area.icon}
              <h3 className="text-3xl font-light mb-6 group-hover:text-gold transition-colors text-gray-800">{area.title}</h3>
              <p className="text-gray-500 font-light leading-relaxed mb-10 text-lg">{area.desc}</p>
              <div className="grid grid-cols-1 gap-4 mb-10 relative z-10">
                {area.services.map((service, si) => (
                  <div key={si} className="flex items-center gap-4 text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold/40"></div>
                    {service}
                  </div>
                ))}
              </div>
              <div className="mt-auto w-full h-[1px] bg-gray-100 group-hover:bg-gold transition-all duration-500"></div>
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
    <section id="sobre" className="py-32 bg-soft">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="lg:w-1/2">
            <div className="relative group mx-auto max-w-sm lg:max-w-none">
              <div className="absolute -inset-4 border border-gold/20 translate-x-4 translate-y-4 -z-10 transition-transform duration-700"></div>
              <div className="aspect-[3/4] bg-white p-3 shadow-2xl overflow-hidden">
                {!imgError ? (
                  <img 
                    src={imgSrc}
                    alt="Dr. Guilherme Garlini"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    style={{ objectPosition: 'center top' }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-center px-6">
                      <p className="text-sm mb-2">Adicione sua foto em:</p>
                      <p className="text-xs font-mono bg-white px-3 py-2 rounded">public/images/guilherme.jpg</p>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        <div className="lg:w-1/2">
          <span className="text-gold tracking-[0.3em] uppercase text-[10px] mb-6 block font-bold text-center lg:text-left">Conheça o Advogado</span>
          <h2 className="text-4xl md:text-5xl font-light mb-10 leading-tight text-gray-900 text-center lg:text-left">Guilherme Garlini</h2>
          <div className="space-y-8 text-gray-600 font-light leading-loose text-lg text-center lg:text-left">
            <p>
              Sou <strong>Guilherme Garlini</strong>, advogado regularmente inscrito na OAB, formado em Direito no ano de 2018, com sólida atuação em Sinop, Mato Grosso.
            </p>
            <p>
              Meu trabalho é pautado pela ética, transparência e compromisso inabalável com resultados, oferecendo um atendimento personalizado e técnico, sempre alinhado à legislação vigente e às melhores estratégias jurídicas para cada caso.
            </p>
            <p>
              Com experiência na condução de pedidos administrativos e ações judicials, busco soluções seguras e eficientes, adequadas à realidade de cada cliente, seja no amparo ao segurado do INSS ou no suporte à gestão condominial de Sinop e região.
            </p>
            <div className="pt-8 border-t border-gray-200 grid grid-cols-2 gap-6">
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
  <section id="contato" className="py-32 bg-white">
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-24">
        <div className="lg:w-1/3">
          <h2 className="text-4xl font-light mb-12 text-gray-900">Contato Profissional</h2>
          <div className="space-y-12">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold mb-6 font-bold">Informações de Contato</p>
              <div className="space-y-6">
                <a href="mailto:advguilhermegarlini@gmail.com" className="text-lg font-light hover:text-gold transition-colors flex items-center gap-4 text-gray-700">
                  <Mail size={20} strokeWidth={1} className="text-gold" /> advguilhermegarlini@gmail.com
                </a>
                <a href="tel:66999562660" className="text-lg font-light hover:text-gold transition-colors flex items-center gap-4 text-gray-700">
                  <Phone size={20} strokeWidth={1} className="text-gold" /> (66) 99956-2660
                </a>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold mb-6 font-bold">Atendimento</p>
              <div className="flex items-start gap-4">
                <MapPin size={20} strokeWidth={1} className="mt-1 text-gold" />
                <p className="text-lg font-light leading-relaxed text-gray-700">
                  Sinop, Mato Grosso <br />
                  <span className="text-sm text-gray-400 italic">Atendimento presencial e online para todo o estado</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-2/3">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10" onSubmit={e => e.preventDefault()}>
            <div className="border-b border-gray-100 pb-3">
              <input type="text" placeholder="Nome completo" className="w-full bg-transparent outline-none font-light py-2 text-lg focus:placeholder-transparent transition-all" />
            </div>
            <div className="border-b border-gray-100 pb-3">
              <input type="email" placeholder="E-mail" className="w-full bg-transparent outline-none font-light py-2 text-lg focus:placeholder-transparent transition-all" />
            </div>
            <div className="md:col-span-2 border-b border-gray-100 pb-3">
              <select className="w-full bg-transparent outline-none font-light py-2 text-lg text-gray-400 focus:text-gray-900 transition-all">
                <option value="">Selecione o assunto</option>
                <option value="maternidade">Salário Maternidade</option>
                <option value="previdenciario">Outros Benefícios INSS</option>
                <option value="condominial">Direito Condominial</option>
                <option value="outro">Outros Assuntos</option>
              </select>
            </div>
            <div className="md:col-span-2 border-b border-gray-100 pb-3">
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
  <footer className="py-24 border-t border-gray-100 bg-white">
    <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
      <Logo className="w-16 h-16 mb-10 opacity-40" />
      <div className="mb-10">
        <span className="text-2xl tracking-[0.25em] font-light block mb-3 uppercase text-gray-800">GUILHERME GARLINI</span>
        <span className="text-[11px] tracking-[0.4em] text-gray-400 uppercase font-bold">OAB/MT 35967 | Especialista</span>
      </div>
      <div className="flex gap-10 mb-16">
        {['Instagram', 'LinkedIn', 'WhatsApp'].map(social => (
          <a key={social} href="#" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-gold transition-colors font-bold">{social}</a>
        ))}
      </div>
      <div className="text-[10px] text-gray-300 font-light tracking-widest uppercase leading-relaxed">
        © {new Date().getFullYear()} Guilherme Garlini Advocacia. <br /> 
        Sinop - Mato Grosso | Atendimento em todo o Brasil.
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen selection:bg-gold/20 selection:text-gold bg-white antialiased">
      <Navbar />
      <main>
        <Hero />
        <About />
        <PracticeAreas />
        <MaternitySection />
        <Contact />
      </main>
      <Footer />
      
      {/* Subtle Floating Contact Button */}
      <a 
        href="https://wa.me/5566999562660"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-10 right-10 z-50 bg-white text-gold border border-gray-100 p-5 rounded-full shadow-2xl hover:shadow-gold/20 hover:-translate-y-2 transition-all group"
        title="Falar com Dr. Guilherme"
      >
        <Phone size={22} className="group-hover:scale-110 transition-transform" />
      </a>
    </div>
  );
};

export default App;
