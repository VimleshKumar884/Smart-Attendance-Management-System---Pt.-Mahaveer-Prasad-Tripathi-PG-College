import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  UserCheck, 
  Users, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  BookMarked, 
  Award,
  CheckCircle2,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const adminStaff = [
    { name: 'डा. मनीष चतुर्वेदी', role: 'अध्यक्ष', sub: 'मांडवी ग्रुप ऑफ़ एजुकेशन' },
    { name: 'ई. ऋषभ चतुर्वेदी', role: 'प्रबंधक', sub: 'महावीर प्रसाद त्रिपाठी पी. जी. कॉलेज' },
    { name: 'डा. सुनील कुमार दुबे', role: 'प्राचार्य', sub: 'M.A, JRF, B.Ed, PhD (BHU)' },
    { name: 'डा. आई. के. मिश्रा', role: 'उपनिदेशक', sub: 'MA (Eco, Pol Sci), PhD (RU)' },
    { name: 'प्रदीप द्विवेदी', role: 'पुस्तकालध्यक्ष', sub: 'B.Lib (VBSPU)' },
    { name: 'सुनीत द्विवेदी', role: 'सम्पत्ति अधिकारी', sub: 'स्नातक (VBSPU)' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary selection:text-white">
      
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-slate-900 text-white py-2 px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Phone size={14} className="text-accent" /> +91-9916749943</span>
            <span className="flex items-center gap-2"><Mail size={14} className="text-accent" /> info@pmptm.com</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-accent transition-colors">Alumni Form</a>
            <span className="text-slate-700">|</span>
            <span className="text-white/60 italic lowercase font-medium capitalize">Mirzapur, Uttar Pradesh</span>
          </div>
        </div>
      </div>

      {/* 2. INSTITUTIONAL HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg border-2 border-slate-100">
              <GraduationCap size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-none tracking-tight">PT. MPT PG COLLEGE</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Vijaypur, Mirzapur</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
            {['Home', 'About Us', 'Admissions', 'Gallery', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                {item}
              </a>
            ))}
          </nav>

          <Link to="/login" className="bg-primary text-white px-6 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-primary-dark transition-all active:scale-95">
            Portal Login
          </Link>
        </div>
      </header>

      {/* 3. HERO / PORTAL SELECTION */}
      <section className="relative py-20 lg:py-32 bg-slate-50 border-b border-slate-200 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-24"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              Digital Attendance Management
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Empowering <br/>Education Through <br/>
              <span className="text-primary italic underline decoration-accent decoration-4 underline-offset-8">Accountability.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
              Welcome to Pt Mahaveer Prasad Tripathi PG College. A place with deep traditions focused on creating brighter futures. Access your dedicated portal below.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/login" className="flex-1 bg-white border-2 border-slate-200 p-8 rounded-2xl hover:border-primary hover:shadow-xl transition-all group text-center sm:text-left">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
                <h4 className="text-xl font-black text-slate-800">Student Portal</h4>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Login via Roll No & DOB</p>
              </Link>
              <Link to="/login" className="flex-1 bg-white border-2 border-slate-200 p-8 rounded-2xl hover:border-primary hover:shadow-xl transition-all group text-center sm:text-left">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <UserCheck size={24} />
                </div>
                <h4 className="text-xl font-black text-slate-800">Faculty Portal</h4>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Official Email Access</p>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative z-20 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1523050853064-dbad350e0170?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
                alt="College" 
                className="w-full h-[550px] object-cover"
              />
            </div>
            {/* Quote Overlay */}
            <div className="absolute -bottom-10 -left-10 z-30 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 max-w-sm">
               <p className="text-slate-800 font-bold italic leading-relaxed">
                 "ज्ञानार्थ महाविद्यालय में प्रवेश लें, सेवार्थ जीवन के कर्म क्षेत्र में उतरें।"
               </p>
               <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-4">College Mission Statement</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT US SECTION (Hindi Content) */}
      <section id="about-us" className="py-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-4">
              <h3 className="text-primary text-xs font-black uppercase tracking-[0.3em]">Our Legacy</h3>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">महाविद्यालय का परिचय एवं उद्देश्य</h2>
            </div>
            
            <div className="space-y-6 text-slate-600 font-medium leading-loose text-lg">
              <p>
                पंo महावीर प्रसाद त्रिपाठी पी जी कॉलेज विजयपुर मिर्ज़ापुर की प्रेरक संस्था माँ मंडावी शिक्षा सेवा संस्थान ने सन 2008 में कला संकाय में इस उद्देश्य से इस कॉलेज की स्थापना की अंचल के दलित अल्पसंख्यक व गरीब छात्र छात्राये रोजगारपरक और उपयोगी शिक्षा मिल सके।
              </p>
              <p>
                सन 2008 से जो शिक्षा की विकास यात्रा महाविद्यालय की आरम्भ हुई वह 2020 तक B.Sc संकाय BCA संकाय B.Ed संकाय व MA तक पहुच चुकी है। महाविद्यालय मे शरीरिक स्वाथ्य व मानसिक स्वाथ्य को ध्यान में रखते हुए योग का कैम्प खेल कूद सांस्कृतिक कार्यक्रम जन जागरूकता रैली शैक्षणिक भ्रमण आदि का संचालन समय समय पर आयोजित होते रहते है।
              </p>
              <p>
                महाविद्यालय में अत्याधुनिक विज्ञान व कम्प्यूटर की प्रयोगशालये भी है जहाँ योग्य अध्यापको के द्वारा प्रयोग कराये जाते है। महाविद्यालय के सम्पूर्ण प्रांगण में वाई फाई की सुविधा है साथ मे आधुनिक कंप्यूटर की लैब भी है।
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-8">
               <div className="flex gap-4">
                  <div className="bg-emerald-50 text-emerald-600 p-3 h-fit rounded-xl border border-emerald-100"><CheckCircle2 size={24} /></div>
                  <div>
                    <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Scholarships</h5>
                    <p className="text-sm text-slate-500 font-medium">गरीब छात्र छात्राओं के लिए संस्थान व शासकीय छात्रवित्ति योजना।</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="bg-blue-50 text-primary p-3 h-fit rounded-xl border border-blue-100"><BookMarked size={24} /></div>
                  <div>
                    <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Library & Wi-Fi</h5>
                    <p className="text-sm text-slate-500 font-medium">सुसंगत पुस्तको की पुस्तकालय और सम्पूर्ण प्रांगण में वाई फाई की सुविधा।</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-3xl text-white space-y-8 relative overflow-hidden">
             <Globe className="absolute top-0 right-0 w-64 h-64 text-white opacity-5 -mr-24 -mt-24" />
             <div className="relative z-10 space-y-6">
                <h4 className="text-2xl font-black">Institution Stats</h4>
                <div className="space-y-8">
                  <StatItem label="Established" value="2008" />
                  <StatItem label="Course Offerings" value="UG & PG" />
                  <StatItem label="Accreditation" value="Govt. Recognized" />
                  <StatItem label="Faculty Count" value="45+" />
                </div>
                <div className="pt-8 border-t border-white/10">
                   <p className="text-xs font-bold text-white/50 leading-relaxed uppercase tracking-widest">Vijaypur, Mirzapur, <br/>Uttar Pradesh - 231303</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. ADMINISTRATION SECTION */}
      <section className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h3 className="text-primary text-xs font-black uppercase tracking-[0.3em]">Leadership</h3>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Our Administration</h2>
            <div className="w-20 h-1.5 bg-accent mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminStaff.map((staff, idx) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={idx} 
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-primary transition-all"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Building2 size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 leading-tight">{staff.name}</h4>
                  <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">{staff.role}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{staff.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT & FOOTER */}
      <footer id="contact" className="bg-slate-900 text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 mb-20 border-b border-white/10 pb-20">
          <div className="space-y-8">
             <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <h4 className="text-xl font-black tracking-tight uppercase leading-none">PT. MPT <br/>PG COLLEGE</h4>
             </div>
             <p className="text-white/50 font-medium leading-relaxed italic">
               Best Post Graduate Institute in Vijaypur, Mirzapur. Creating brighter futures through tradition and talent.
             </p>
          </div>

          <div className="space-y-8">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Contact Information</h5>
            <div className="space-y-6">
               <div className="flex items-start gap-4">
                  <MapPin className="text-white/30 shrink-0" size={20} />
                  <p className="text-sm font-bold leading-relaxed text-white/80">Vijaypur, Mirzapur, Uttar Pradesh</p>
               </div>
               <div className="flex items-center gap-4">
                  <Mail className="text-white/30 shrink-0" size={20} />
                  <p className="text-sm font-bold text-white/80">info.pmptm@gmail.com</p>
               </div>
               <div className="flex items-center gap-4">
                  <Phone className="text-white/30 shrink-0" size={20} />
                  <p className="text-sm font-bold text-white/80">+91-9916749943</p>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Institutional Links</h5>
            <nav className="grid grid-cols-2 gap-4 text-xs font-black uppercase tracking-widest text-white/50">
               <a href="#" className="hover:text-white transition-colors">Admissions</a>
               <a href="#" className="hover:text-white transition-colors">Events</a>
               <a href="#" className="hover:text-white transition-colors">Gallery</a>
               <a href="#" className="hover:text-white transition-colors">Timetable</a>
            </nav>
            <div className="pt-4">
               <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted Portal</span>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">
             All Rights Reserved © 2026 Pt. Mahaveer Prasad Tripathi PG College
           </p>
           <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/20">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Term of Service</a>
           </div>
        </div>
      </footer>

    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="flex justify-between items-end border-b border-white/10 pb-2">
    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</p>
    <p className="text-lg font-black text-white">{value}</p>
  </div>
);

export default LandingPage;