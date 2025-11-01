import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  collection,
  query,
  onSnapshot as onCollectionSnapshot,
  addDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

// ---------- Firebase config ----------
const firebaseConfig = {
  apiKey: "AIzaSyAeEeKTzToDngHfhgWM50T3gQETcrPmMEw",
  authDomain: "startnerve-37cd3.firebaseapp.com",
  projectId: "startnerve-37cd3",
  storageBucket: "startnerve-37cd3.appspot.com",
  messagingSenderId: "220139293313",
  appId: "1:220139293313:web:d31b2edbf02b75819b9b80",
  measurementId: "G-GMM684MVDW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- Backend base URL (Smart) ----------
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:5000' 
    : 'https://api.startnerve.in';

// ---------- Helper Components & Functions ----------
const Icon = ({ name, className = "w-6 h-6" }) => {
  const icons = {
    menu: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>,
    google: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-5.067 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l-2.347 2.347c-.96-.96-2.267-2.347-3.56-2.347-2.933 0-5.36 2.347-5.36 5.36s2.427 5.36 5.36 5.36c3.32 0 4.787-2.653 5.067-4.133H12.48z" /></svg>,
    video: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>,
    ebook: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>,
    library: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v18" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M10 13H8" /><path d="M10 17H8" /></svg>,
    loader: <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    upload: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
  };
  return <span className={className}>{icons[name] || ''}</span>;
};

const isColorDark = (hexColor) => {
    if (!hexColor) return false;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
};

// ---------- UI Shell Components ----------
const AnimatedBackground = ({ children }) => (
  <div className="relative min-h-screen w-full bg-gray-900 overflow-hidden">
    <div className="absolute inset-0 z-0">
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

const MarketingPage = ({ onLaunch }) => (
  <AnimatedBackground>
    <div className="text-white font-sans">
      {/* --- ACT I: THE HERO SECTION --- */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Stop Creating Content. Start Generating Clients.
        </h1>
        <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            StartNerve is the one-click system that turns your expertise into a lead magnet and automatically builds the marketing campaign to sell it. Stop wasting time. Start filling your pipeline.
        </p>
        <div className="mt-16">
          <button onClick={onLaunch} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
            Launch The Factory - Your First Ebook is Free
          </button>
        </div>
      </div>

      {/* --- ACT II: THE CLIENT ACQUISITION SYSTEM --- */}
      <div className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">The StartNerve Client Acquisition System</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-16">We've turned a 40-hour process into a 3-step, automated workflow. You provide the expertise. We build the machine that gets you clients.</p>
            <div className="grid md:grid-cols-3 gap-10 text-left">
                <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
                    <div className="text-purple-400 text-5xl font-bold mb-4">1</div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">We Package Your Expertise</h3>
                    <p className="text-gray-400">You provide your core ideas. Our AI acts as your personal ghostwriter, instantly building your ultimate, high-converting lead magnet—a professionally designed ebook.</p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
                    <div className="text-pink-400 text-5xl font-bold mb-4">2</div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">We Build Your Marketing Machine</h3>
                    <p className="text-gray-400">With one click, Project Domino analyzes your new ebook and auto-generates a complete marketing campaign of viral video scripts, captions, and hooks based on your unique content.</p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
                    <div className="text-blue-400 text-5xl font-bold mb-4">3</div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">You Get Qualified Leads</h3>
                    <p className="text-gray-400">The campaign drives potential clients into your inbox and onto your calendar. You get back to doing the work you love.</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* --- ACT III: THE "WHO IT'S FOR" KILL ZONE --- */}
      <div className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for the Expert Who's Tired of Being a Content Creator</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-16">Our system is designed for high-value professionals who know their time is better spent with clients, not fighting with content creation tools.</p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
                    <h3 className="text-2xl font-semibold mb-3 text-purple-400">The Consultant & Advisor</h3>
                    <p className="text-gray-400">You have a proven framework that gets results, but it's trapped in your head. StartNerve packages it into a powerful lead magnet that attracts your next big contract.</p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
                    <h3 className="text-2xl font-semibold mb-3 text-pink-400">The Business Coach</h3>
                    <p className="text-gray-400">You know you need to "build in public," but you're tired of the daily content grind. StartNerve turns your philosophy into an ebook and a month's worth of marketing content, so you can focus on coaching, not posting.</p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
                    <h3 className="text-2xl font-semibold mb-3 text-blue-400">The Agency Owner</h3>
                    <p className="text-gray-400">Your agency needs a consistent flow of qualified leads. Stop relying on referrals. StartNerve builds the automated lead generation assets that fill your pipeline and establish your authority.</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- ACT IV: THE FOUNDER'S STORY (FORGING SOCIAL PROOF) --- */}
      <div className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Obsession: The Founder's Story</h2>
            <div className="text-lg text-gray-400 space-y-6 mx-auto max-w-2xl text-left">
                <p>
                    StartNerve wasn't born in a boardroom. It was forged in the fire of a single, frustrating realization: the world doesn't need another AI writer.
                </p>
                <p>
                    As a student and builder, I saw brilliant experts—coaches, consultants, founders—drowning in the "content grind." They were spending hundreds of hours on low-value tasks, trying to turn their genius into leads. Their greatest asset, their expertise, was trapped.
                </p>
                <p className="font-bold text-white">
                    I became obsessed with a single question: What if we could build a machine that did the 90% of grunt work, so the expert could focus on the 10% of genius?
                </p>
                <p>
                    That obsession led to Project Domino—our system that doesn't just create content, but builds an entire client acquisition machine. This isn't a tool. It's the weapon I wish I had. It's the system built for the one-man army who needs to win.
                </p>
            </div>
        </div>
      </div>

      {/* --- FINAL CTA --- */}
      <div className="py-20 px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Stop Wasting Time?</h2>
          <p className="text-lg text-gray-400 mt-2 mb-8">Generate your first lead magnet now. It's free.</p>
          <button onClick={onLaunch} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
            Generate My First Lead Magnet
          </button>
      </div>

      {/* --- FOOTER --- */}
      <div className="text-center py-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">© 2025 StartNerve • Built in Pune • A One-Man Army Production</p>
      </div>
    </div>
  </AnimatedBackground>
);

const AuthPage = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action) => {
    setIsLoading(true); setError('');
    if (action === createUserWithEmailAndPassword && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }
    try { await action(auth, email, password); } 
    catch (err) { setError(String(err.message).replace('Firebase: ', '')); } 
    finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true); setError('');
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } 
    catch (err) { setError(String(err.message).replace('Firebase: ', '')); } 
    finally { setIsLoading(false); }
  };

  return (
    <AnimatedBackground>
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans">
        <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-white">&larr; Back to Home</button>
        <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Launch Your First Product
          </h1>
          <p className="text-gray-400 text-center mb-8">Sign in or create an account. No credit card required.</p>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-gray-700/50 border-gray-600 rounded-md p-3 text-white focus:ring-purple-500 focus:border-purple-500" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-700/50 border-gray-600 rounded-md p-3 text-white focus:ring-purple-500 focus:border-purple-500" />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex space-x-4 pt-2">
              <button onClick={() => handleAction(signInWithEmailAndPassword)} disabled={isLoading} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-md transition-colors">
                {isLoading ? <Icon name="loader" /> : 'Login'}
              </button>
              <button onClick={() => handleAction(createUserWithEmailAndPassword)} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-md transition-all">
                {isLoading ? <Icon name="loader" /> : 'Sign Up'}
              </button>
            </div>
          </form>
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-700"></div><span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span><div className="flex-grow border-t border-gray-700"></div>
          </div>
          <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center bg-white text-gray-800 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition-colors">
            <Icon name="google" className="w-5 h-5 mr-3" />
            Sign in with Google
          </button>
        </div>
      </div>
    </AnimatedBackground>
  );
};

const OnboardingWizard = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswer = (key, value) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    if (step < 3) setStep(step + 1);
    else finishOnboarding(newAnswers);
  };

  const finishOnboarding = async (finalAnswers) => {
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { onboarding: finalAnswers }).catch(async () => {
        await setDoc(userRef, { onboarding: finalAnswers }, { merge: true });
      });
      onComplete(finalAnswers);
    } catch (err) { console.error('Failed to save onboarding data:', err); setIsLoading(false); }
  };

  const ProgressIndicator = ({ currentStep }) => ( <div className="flex space-x-2"> {[1, 2, 3].map((s) => ( <div key={s} className={`w-3 h-3 rounded-full ${currentStep >= s ? 'bg-purple-500' : 'bg-gray-600'}`}></div> ))} </div> );
  const OnboardingButton = ({ text, onClick }) => ( <button onClick={onClick} className="w-full text-lg text-left p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-purple-900/50 hover:border-purple-500 transition-all duration-300"> {text} </button> );

  return (
    <AnimatedBackground>
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans text-center">
        {isLoading ? ( <Icon name="loader" className="w-12 h-12" /> ) : (
          <>
            {step === 1 && ( <div> <h1 className="text-3xl font-bold mb-4">What’s your #1 goal in the next 30 days?</h1> <div className="space-y-4 w-full max-w-md"> <OnboardingButton text="Sell my first ebook" onClick={() => handleAnswer('goal', 'Sell my first ebook')} /> <OnboardingButton text="Grow my audience" onClick={() => handleAnswer('goal', 'Grow my audience')} /> <OnboardingButton text="Package my expert method" onClick={() => handleAnswer('goal', 'Package my expert method')} /> </div> </div> )}
            {step === 2 && ( <div> <h1 className="text-3xl font-bold mb-4">Who are you trying to reach?</h1> <div className="space-y-4 w-full max-w-md"> <OnboardingButton text="Students" onClick={() => handleAnswer('audience', 'Students')} /> <OnboardingButton text="Working professionals" onClick={() => handleAnswer('audience', 'Working professionals')} /> <OnboardingButton text="Business owners" onClick={() => handleAnswer('audience', 'Business owners')} /> </div> </div> )}
            {step === 3 && ( <div> <h1 className="text-3xl font-bold mb-4">How do you want to use your content?</h1> <div className="space-y-4 w-full max-w-md"> <OnboardingButton text="Sell as a paid product" onClick={() => handleAnswer('monetization', 'Sell as a paid product')} /> <OnboardingButton text="Use as a lead magnet" onClick={() => handleAnswer('monetization', 'Use as a lead magnet')} /> <OnboardingButton text="Share for free to build brand" onClick={() => handleAnswer('monetization', 'Share for free to build brand')} /> </div> </div> )}
            <div className="absolute bottom-10"> <ProgressIndicator currentStep={step} /> </div>
          </>
        )}
      </div>
    </AnimatedBackground>
  );
};


// ---------- Core Engine Components (Fully Upgraded & Restored) ----------

const EbookPreview = ({ outline, content, font, color, coverImagePath, onBack, onExport, isLoading, apiURL }) => {
    const textColor = isColorDark(color) ? 'text-gray-200' : 'text-gray-800';
    const headingColor = isColorDark(color) ? 'text-white' : 'text-black';
    const renderHTML = (htmlString) => ({ __html: htmlString });

    const fontStyles = { roboto: "'Roboto', sans-serif", merriweather: "'Merriweather', serif", montserrat: "'Montserrat', sans-serif", lato: "'Lato', sans-serif", lora: "'Lora', serif", playfair: "'Playfair Display', serif", oswald: "'Oswald', sans-serif", source_sans_pro: "'Source Sans Pro', sans-serif", pt_serif: "'PT Serif', serif", nunito: "'Nunito', sans-serif" };
    const selectedFontFamily = fontStyles[font] || fontStyles['roboto'];

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <div> <h2 className="text-2xl font-bold text-white">Step 3: Preview Your Product</h2> <p className="text-gray-400">This is a live preview of your final ebook. Review and export.</p> </div>
                <div> <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">← Back to Customize</button> <button onClick={onExport} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md"> {isLoading ? 'Exporting...' : 'Export Final PDF'} </button> </div>
            </div>
            <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 bg-gray-900 rounded-lg">
                <div className="p-8 shadow-2xl rounded-sm aspect-[1/1.414] overflow-y-auto" style={{ backgroundColor: color, fontFamily: selectedFontFamily }}>
                    <div className={`text-center flex flex-col items-center justify-center h-full ${headingColor}`}>
                        {coverImagePath ? ( <img src={`${apiURL}${coverImagePath}`} alt="Ebook Cover" className="max-h-full max-w-full object-contain rounded-md" /> ) : ( <h1 className="text-4xl font-bold">{outline.course_title || "Your Ebook Title"}</h1> )}
                    </div>
                    {content && content.slice(0, 3).map((lesson, index) => (
                        <div key={index} className="mt-8" style={{ pageBreakBefore: 'always' }}>
                            <h2 className={`text-2xl font-bold mb-4 ${headingColor}`}>{lesson.lesson_title}</h2>
                            <div className={`prose prose-sm sm:prose max-w-none ${textColor}`} dangerouslySetInnerHTML={renderHTML(lesson.content)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const EbookEngine = ({ user, userData, onProjectCreated, apiURL, onCampaignGenerated, isPremiumUser }) => {
    const [topic, setTopic] = useState(sessionStorage.getItem('ebook_topic') || '');
    const [audience, setAudience] = useState(sessionStorage.getItem('ebook_audience') || userData?.onboarding?.audience || '');
    const [framework, setFramework] = useState('');
    const [caseStudy, setCaseStudy] = useState('');
    const [actionItems, setActionItems] = useState('');
    const [showOptional, setShowOptional] = useState(false);
    const [selectedFont, setSelectedFont] = useState('roboto');
    const [selectedColor, setSelectedColor] = useState('#FFFFFF');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [softError, setSoftError] = useState(''); // <-- The new resilient error state
    const [statusText, setStatusText] = useState('');
    const [outlineData, setOutlineData] = useState(null);
    const [ebookContent, setEbookContent] = useState(null);
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);

    const fonts = [ { name: 'Roboto', value: 'roboto', family: "'Roboto', sans-serif" }, { name: 'Merriw...', value: 'merriweather', family: "'Merriweather', serif" }, { name: 'Montse...', value: 'montserrat', family: "'Montserrat', sans-serif" }, { name: 'Lato', value: 'lato', family: "'Lato', sans-serif" }, { name: 'Lora', value: 'lora', family: "'Lora', serif" }, { name: 'Playfair...', value: 'playfair', family: "'Playfair Display', serif" }, { name: 'Oswald', value: 'oswald', family: "'Oswald', sans-serif" }, { name: 'Source ...', value: 'source_sans_pro', family: "'Source Sans Pro', sans-serif" }, { name: 'PT Serif', value: 'pt_serif', family: "'PT Serif', serif" }, { name: 'Nunito', value: 'nunito', family: "'Nunito', sans-serif" }, ];
    const lightColors = ['#FFFFFF', '#F8F7F4', '#EBEBEB', '#D6EAF8', '#D1FAE5', '#FEFCE8', '#FFF7ED', '#FCE7F3'];
    const darkColors = ['#111827', '#1F2937', '#4B5563', '#0C4A6E', '#14532D', '#365314', '#581C87', '#701A75'];
    
    useEffect(() => {
        sessionStorage.setItem('ebook_topic', topic);
        sessionStorage.setItem('ebook_audience', audience);
    }, [topic, audience]);
    
    const getAuthHeader = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return {};
        const token = await currentUser.getIdToken(true);
        return { Authorization: `Bearer ${token}` };
    };

    const handleGenerateDraft = async () => {
        if (!topic || !audience) { setError("Topic and Audience are required."); return; }
        setIsLoading(true); setError(''); setStatusText('Analyzing your core idea...');
        setTimeout(() => setStatusText('Architecting your 7-module structure...'), 2000);
        setTimeout(() => setStatusText('Defining learning objectives...'), 4000);
        try {
            const headers = { 'Content-Type': 'application/json', ...(await getAuthHeader()) };
            const response = await fetch(`${apiURL}/api/generate-outline`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ topic, audience, framework, caseStudy, actionItems, uid: user.uid, goal: userData?.onboarding?.goal, monetization: userData?.onboarding?.monetization })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate outline.');
            const data = await response.json();
            setOutlineData(data);
            setStep(2);
        } catch (err) { setError(err.message); } 
        finally { setIsLoading(false); setStatusText(''); }
    };

    const handleGenerateContentForPreview = async () => {
        setIsLoading(true); 
        setError(''); 
        setSoftError(''); // Clear previous soft errors
        
        setStatusText('Activating the AI Ghostwriter...');
        setTimeout(() => setStatusText('Writing your chapters...'), 2000);
        setTimeout(() => setStatusText('Sourcing relevant, high-quality images...'), 4500);
        
        let uploadedCoverPath = null;
        
        if (coverImageFile) {
            try {
                setStatusText('Uploading custom cover...');
                const formData = new FormData();
                formData.append('coverImage', coverImageFile);
                
                const uploadRes = await fetch(`${apiURL}/api/upload-cover`, { 
                    method: 'POST', 
                    body: formData 
                });

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json();
                    throw new Error(errorData.error || 'Cover image upload failed. Continuing without it.');
                }
                
                uploadedCoverPath = (await uploadRes.json()).filePath;

            } catch (err) {
                setSoftError(err.message);
                uploadedCoverPath = null; 
            }
        }

        try {
            setStatusText('Generating AI content...');
            const contentRes = await fetch(`${apiURL}/api/generate-text-content`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ outline: outlineData, uid: user.uid }), 
            });
            if (!contentRes.ok) {
                const errorData = await contentRes.json();
                throw new Error(errorData.error || 'Failed to generate ebook content.');
            }
            const contentData = await contentRes.json();
            
            setEbookContent(contentData.ebook_content);
            setOutlineData(prev => ({...prev, uploadedCoverPath }));
            setStep(3);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setStatusText('');
        }
    };
    
    const handleExport = async () => {
        setIsLoading(true);
        setError('');
        setStatusText('Generating executive summary...');
        setTimeout(() => setStatusText('Designing your title page...'), 2000);
        setTimeout(() => setStatusText('Assembling the final, print-ready PDF...'), 4000);
    
        try {
            const headers = { 'Content-Type': 'application/json', ...(await getAuthHeader()) };
            const response = await fetch(`${apiURL}/api/generate-full-ebook`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    outline: outlineData,
                    editedContent: ebookContent,
                    font: selectedFont,
                    color: selectedColor,
                    coverImagePath: outlineData.uploadedCoverPath,
                    uid: user.uid
                })
            });
    
            if (!response.ok) {
                throw new Error((await response.json()).error || 'Failed to assemble the final ebook.');
            }
    
            const data = await response.json();
            const downloadUrl = `${apiURL}${data.download_url}`;
            
            setGeneratedPdfUrl(downloadUrl);
            setCurrentProjectId(data.projectId);
            
            if (onProjectCreated) {
                onProjectCreated({
                    title: outlineData?.course_title || topic,
                    downloadUrl,
                });
            }
            
            setStep(4);
    
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setIsLoading(false);
            setStatusText('');
        }
    };

    const handleGenerateCampaign = async () => {
        if (!currentProjectId) { setError("A project ID is missing. Cannot generate campaign."); return; }
        setIsGeneratingCampaign(true);
        setError('');
        setStatusText('Analyzing your core expertise...');
        setTimeout(() => setStatusText('Extracting viral concepts...'), 1500);
        setTimeout(() => setStatusText('Directing your marketing campaign...'), 3000);
        try {
            const headers = { 'Content-Type': 'application/json', ...(await getAuthHeader()) };
            const response = await fetch(`${apiURL}/api/projects/${currentProjectId}/generate-campaign`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ uid: user.uid })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate campaign from project.');
            const data = await response.json();
            if(onCampaignGenerated) {
                onCampaignGenerated({ scripts: data.campaign_package, projectId: currentProjectId }, true); // Pass true to trigger modal
            }
        } catch (err) { setError(err.message); } 
        finally { setIsGeneratingCampaign(false); setStatusText(''); }
    };

    const resetEngine = () => {
        setTopic(''); setAudience(userData?.onboarding?.audience || ''); setFramework(''); setCaseStudy(''); setActionItems('');
        setSelectedFont('roboto'); setSelectedColor('#FFFFFF'); setCoverImageFile(null); setCoverPreview(null);
        setStep(1); setIsLoading(false); setError(''); setStatusText('');
        setOutlineData(null); setEbookContent(null); setGeneratedPdfUrl(null); setCurrentProjectId(null);
        sessionStorage.removeItem('ebook_topic'); sessionStorage.removeItem('ebook_audience');
    };

    if (isLoading) { return <div className="text-center p-8"><Icon name="loader" className="w-12 h-12 mx-auto text-purple-400" /><p className="mt-4 text-white">{statusText}</p></div>; }
    
    if (error) { 
        return ( 
            <div className="p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-700"> 
                <p className="font-bold">A Critical Error Occurred</p> 
                <p className="text-sm mt-1">{error}</p> 
                <button onClick={resetEngine} className="text-sm underline mt-3 font-bold">Click here to start over.</button> 
            </div> 
        ); 
    }
    
    if (step === 4) { 
        return ( 
            <div className="text-center">
                <h1 className="text-4xl font-bold text-green-400 mb-4">Step 4: Product Ready!</h1>
                <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 max-w-md mx-auto space-y-4">
                    <a href={generatedPdfUrl} download disabled={!generatedPdfUrl} className={`block w-full p-3 rounded font-bold transition-colors ${generatedPdfUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'}`}>
                        {generatedPdfUrl ? 'Download Your PDF' : 'Preparing Download...'}
                    </a>
                    <button 
                        onClick={isPremiumUser ? handleGenerateCampaign : () => { alert("Upgrade to unlock Project Domino!"); }}
                        disabled={isGeneratingCampaign || !currentProjectId}
                        className={`block w-full p-3 rounded font-bold transition-colors ${currentProjectId && isPremiumUser ? 'bg-purple-600 hover:bg-purple-700 animate-pulse' : 'bg-gray-600 cursor-not-allowed'}`}
                    >
                        {isPremiumUser 
                            ? (isGeneratingCampaign ? statusText || 'Building Campaign...' : 'Build My Lead Generation Campaign →') 
                            : 'Upgrade to Unlock Project Domino'
                        }
                    </button> 
                </div>
                <button onClick={resetEngine} className="mt-8 text-gray-400 hover:underline">Start a New Project</button>
            </div>
        ); 
    }
    
    if (step === 3) { return ( <EbookPreview outline={outlineData} content={ebookContent} font={selectedFont} color={selectedColor} coverImagePath={outlineData.uploadedCoverPath} onBack={() => setStep(2)} onExport={handleExport} isLoading={isLoading} apiURL={apiURL} /> ); }

    if (step === 2) {
        return (
            <div>
                {softError && (
                    <div className="mb-4 p-3 bg-yellow-900/50 text-yellow-200 rounded-lg border border-yellow-700">
                        <p className="font-bold">A non-critical error occurred:</p>
                        <p className="text-sm">{softError}</p>
                    </div>
                )}
                <h2 className="text-2xl font-bold text-white">Step 1 Complete: Outline Ready!</h2>
                <p className="text-gray-400 mb-6">Your e-book blueprint, "{outlineData.course_title}," is generated.</p>
                <div className="space-y-8">
                    <h3 className="text-xl font-bold text-white">Step 2: Customize Your E-book</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Choose a Font</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {fonts.slice(0, isPremiumUser ? fonts.length : 2).map(font => ( 
                                        <button key={font.value} onClick={() => setSelectedFont(font.value)} className={`p-2 text-center rounded-lg border-2 transition-all ${selectedFont === font.value ? 'border-purple-500 bg-purple-900/50' : 'border-gray-600 bg-gray-800/50 hover:border-purple-400'}`}> 
                                            <div className="text-3xl" style={{ fontFamily: font.family }}>Ag</div> 
                                            <div className="text-xs mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{font.name}</div> 
                                        </button> 
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Choose a Background Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {lightColors.slice(0, isPremiumUser ? lightColors.length : 4).map(color => ( <button key={color} onClick={() => setSelectedColor(color)} className={`h-10 w-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-purple-500 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'}`} style={{backgroundColor: color}} title={color}></button> ))}
                                    {isPremiumUser && darkColors.map(color => ( <button key={color} onClick={() => setSelectedColor(color)} className={`h-10 w-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-purple-500 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'}`} style={{backgroundColor: color}} title={color}></button> ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Upload a Custom Cover (Optional)</label>
                            <div className="h-full">
                                 <input type="file" accept="image/png, image/jpeg" className="hidden" id="cover-upload" onChange={e => { setCoverImageFile(e.target.files[0]); setCoverPreview(URL.createObjectURL(e.target.files[0])); }} />
                                 <label htmlFor="cover-upload" className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-800/50 transition-colors">
                                    {coverPreview ? <img src={coverPreview} alt="preview" className="max-h-48 object-contain"/> : <div className="text-center"><Icon name="upload" className="mx-auto text-gray-400 w-10 h-10"/> <p className="mt-2 text-sm text-gray-400">Click to upload (JPG or PNG)</p></div>}
                                 </label>
                             </div>
                        </div>
                    </div>
                    <div className="text-center pt-4">
                        <h3 className="text-xl font-bold text-white mb-4">Step 3: Generate & Preview</h3>
                        <button onClick={handleGenerateContentForPreview} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 px-8 rounded-md animate-pulse">
                            Generate & Preview E-book
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // Default: Step 1 (InputStep from your original code)
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="text-center lg:text-left">
                    <h2 className="text-2xl font-bold text-white">Step 1: Define Your Product</h2>
                    <p className="text-gray-400">You bring the idea. We’ll turn it into a formatted, sellable ebook.</p>
                </div>
                <div className="relative">
                    <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ebook Topic (required)" className="w-full bg-gray-700 p-2 rounded pr-10" />
                    {!topic && (
                         <span className="absolute top-1/2 right-3 transform -translate-y-1/2 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                        </span>
                    )}
                </div>
                <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Target Audience (required)" className="w-full bg-gray-700 p-2 rounded" />
                <div>
                    <button onClick={() => setShowOptional(!showOptional)} className="text-sm text-gray-300 underline mb-2">
                        {showOptional ? 'Hide optional fields' : '+ Add more expert context (optional)'}
                    </button>
                    {showOptional && (
                         isPremiumUser ? (
                            <div className="space-y-3">
                                <textarea rows="3" value={framework} onChange={e => setFramework(e.target.value)} placeholder="Your Unique Framework (e.g., The A.C.E. Method)" className="w-full bg-gray-700 p-2 rounded" />
                                <textarea rows="3" value={caseStudy} onChange={e => setCaseStudy(e.target.value)} placeholder="A Core Case Study / Story" className="w-full bg-gray-700 p-2 rounded" />
                                <textarea rows="3" value={actionItems} onChange={e => setActionItems(e.target.value)} placeholder="3-5 Critical Action Items" className="w-full bg-gray-700 p-2 rounded" />
                            </div>
                        ) : (
                            <div className="p-4 mt-2 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-200 text-center">
                                <p className="font-bold">This is a Premium Feature</p>
                                <p className="text-sm">Upgrade to inject your unique expertise into the AI.</p>
                            </div>
                        )
                    )}
                </div>
                <button onClick={handleGenerateDraft} disabled={isLoading} className="w-full bg-purple-600 font-bold p-3 rounded">
                    {isLoading ? 'Building...' : 'Build My First Draft →'}
                </button>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
                <h3 className="font-bold text-white mb-4">Payoff Preview</h3>
                <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                    <div className="aspect-[3/4] bg-gray-800 rounded-md flex flex-col p-6 shadow-lg">
                        <h4 className="text-2xl font-bold text-white break-words">{topic || "Your Title Here"}</h4>
                        <p className="text-sm text-gray-400 mt-2">By You</p>
                        <div className="flex-grow mt-6 space-y-2">
                            <div className="bg-gray-600 h-2 w-3/4 rounded-full"></div>
                            <div className="bg-gray-600 h-2 w-full rounded-full"></div>
                            <div className="bg-gray-600 h-2 w-1/2 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ViralContentEngine = ({ user, userData, apiURL, initialCampaignData, isPremiumUser }) => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [campaignPackage, setCampaignPackage] = useState(initialCampaignData || null);
    const [feedbackSent, setFeedbackSent] = useState(false);

    useEffect(() => {
        if (initialCampaignData) {
            setCampaignPackage(initialCampaignData);
            setFeedbackSent(false); 
        }
    }, [initialCampaignData]);
    
    const getAuthHeader = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return {};
        const token = await currentUser.getIdToken(true);
        return { Authorization: `Bearer ${token}` };
    };

    const handleGenerate = async () => {
        if (!topic) { setError("Please enter a video topic."); return; }
        setError(''); setIsLoading(true); setCampaignPackage(null);
        try {
            const headers = { 'Content-Type': 'application/json', ...(await getAuthHeader()) };
            const response = await fetch(`${apiURL}/api/generate-viral-content`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ topic, uid: user.uid }),
            });
            
            const data = await response.json();
            if (!response.ok) { 
                throw new Error(data.error || 'Failed to generate campaign.'); 
            }
            setCampaignPackage({ scripts: data.campaign_package, projectId: null }); // projectId is null for campaigns from topic

        } catch (err) { 
            setError(err.message); 
        } finally { 
            setIsLoading(false); 
        }
    };

    const handleFeedback = async (success) => {
        const projectId = campaignPackage?.projectId;
        if (!projectId) return; 

        setFeedbackSent(true);
        try {
            const headers = { 'Content-Type': 'application/json', ...(await getAuthHeader()) };
            await fetch(`${apiURL}/api/projects/${projectId}/feedback`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ uid: user.uid, success }),
            });
        } catch (err) {
            console.error("Failed to send feedback:", err);
        }
    };

    const CampaignDisplayCard = ({ title, script }) => (
        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700 space-y-4">
            <h3 className="text-xl font-bold text-pink-400 capitalize">{script.angle || title.replace('_', ' ')}</h3>
            {isPremiumUser && script.hook_psychology && ( <div> <h4 className="font-semibold text-gray-400 text-sm mb-1">Hook Psychology</h4> <p className="text-purple-300 text-sm italic">"{script.hook_psychology}"</p> </div> )}
            <div> <h4 className="font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">Hook</h4> <p className="text-gray-300 italic">"{script.hook}"</p> </div>
            <div> <h4 className="font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">Body</h4> <p className="text-gray-300 whitespace-pre-wrap">{script.body}</p> </div>
            <div> <h4 className="font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">Call to Action</h4> <p className="text-purple-300 font-bold">{script.cta}</p> </div>
            <div> <h4 className="font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">Caption</h4> <p className="text-gray-300 whitespace-pre-wrap">{script.caption}</p> </div>
            <div> <h4 className="font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">Hashtags</h4> <p className="text-gray-400 text-sm">{Array.isArray(script.hashtags) ? script.hashtags.join(' ') : script.hashtags}</p> </div>
        </div>
    );
    
    const FeedbackModule = () => {
        if (feedbackSent) {
            return (
                <div className="mt-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-center">
                    <p className="font-bold">Thank you! Your feedback makes our AI smarter.</p>
                </div>
            );
        }

        return (
            <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg text-center">
                <p className="font-bold text-white mb-3">Did this campaign generate new leads for you?</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => handleFeedback(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">
                        ✅ Yes, it worked!
                    </button>
                    <button onClick={() => handleFeedback(false)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md">
                        ❌ Not yet.
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">The Viral Script Engine</h1>
            <p className="text-gray-400 mb-8">Generate unique, ready-to-shoot viral campaigns for any topic, or see the ones generated from your ebook.</p>
            
            {!initialCampaignData && (
                <div className="space-y-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700"> 
                    <div> 
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Video Topic</label> 
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Why 99% of people are wrong about coffee" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" /> 
                    </div> 
                    <div className="text-right"> 
                        <button onClick={handleGenerate} disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-md"> 
                            {isLoading && !campaignPackage ? <span className="flex items-center justify-center"><Icon name="loader" className="mr-2" /> Generating...</span> : "Generate New Campaign"} 
                        </button> 
                    </div> 
                </div> 
            )}
            
            {error && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">{error}</div>} 
            {isLoading && <div className="text-center py-12"><Icon name="loader" className="w-12 h-12 mx-auto text-purple-400" /></div>}
            
            {campaignPackage && campaignPackage.scripts && Object.keys(campaignPackage.scripts).length > 0 && (
                <div className="mt-8 space-y-8">
                    <h2 className="text-2xl font-bold text-center text-pink-400">Your Viral Campaigns are Ready!</h2>
                    
                    {campaignPackage.projectId && <FeedbackModule />}

                    <div className="space-y-6">
                        {Object.entries(campaignPackage.scripts).map(([key, script]) => (
                            <CampaignDisplayCard key={key} title={key} script={script} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Library = ({ projects }) => (
  <div>
    <h1 className="text-3xl font-bold text-white mb-2">Your Products</h1>
    {projects && projects.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <img src={project.coverUrl || `https://placehold.co/300x400/1a202c/e2e8f0?text=${encodeURIComponent(project.title)}`} alt="Ebook Cover" className="rounded-lg mb-4 aspect-[3/4] object-cover" />
            <h3 className="font-bold text-white truncate">{project.title}</h3>
            <p className="text-sm text-gray-400">{project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : ''}</p>
            <a href={`${API_URL}${project.downloadUrl}`} download className="mt-4 block w-full bg-blue-600 text-center p-2 rounded font-bold hover:bg-blue-700">Download</a>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 text-center">
        <h2 className="text-2xl font-bold text-gray-500">Your shelf is empty.</h2>
        <p className="text-gray-400 mt-4">Launch your first ebook to see it here.</p>
      </div>
    )}
  </div>
);

const PricingPage = ({ user, onBack, apiURL }) => {
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const mockPlan = { id: "plan_in_basic", name: "Creator Pack", price: 99900, currency: "INR", symbol: "₹", credits: { ebook: 5, script: 15 } };
        setPlan(mockPlan);
        setIsLoading(false);
    }, []);
    
    const handlePurchase = async () => {
        setIsLoading(true); setError('');
        try {
            const orderRes = await fetch(`${apiURL}/api/create-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: plan.id }), });
            if(!orderRes.ok) throw new Error('Could not create payment order.');
            const order = await orderRes.json();
            const options = {
                key: "rzp_live_REc3nlY3803Cnu",
                amount: order.amount, currency: order.currency, name: "StartNerve",
                description: plan.name, order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`${apiURL}/api/verify-payment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature, planId: plan.id, uid: user.uid }), });
                        if(!verifyRes.ok) throw new Error('Payment verification failed.');
                        alert('Payment Successful! Your credits have been added.');
                        onBack();
                    } catch (err) { setError('Payment verification failed. Please contact support.'); }
                },
                prefill: { email: user.email, },
                theme: { color: "#8B5CF6" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) { setError(err.message); } 
        finally { setIsLoading(false); }
    };
    
    return ( <AnimatedBackground> <div className="min-h-screen text-white flex flex-col items-center justify-center p-4"> <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-white">&larr; Back to Dashboard</button> <h1 className="text-4xl font-bold uppercase tracking-wider mb-4">Buy Credits</h1> <p className="text-gray-400 max-w-xl text-center mb-12">Top up your account to continue creating without interruption.</p> {isLoading && !plan && <Icon name="loader" className="w-12 h-12" />} {error && <p className="text-red-400">{error}</p>} {plan && ( <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 w-full max-w-sm flex flex-col"> <h2 className="text-2xl font-bold uppercase text-purple-400">{plan.name}</h2> <div className="my-6"> <span className="text-6xl font-bold">{plan.symbol}{plan.price / 100}</span> <span className="text-gray-400"> / one-time</span> </div> <ul className="space-y-3 text-gray-300 text-left mb-8 flex-grow"> <li className="flex items-center"><Icon name="check" className="text-green-400 mr-3" /> {plan.credits.ebook} Ebook Credits</li> <li className="flex items-center"><Icon name="check" className="text-green-400 mr-3" /> {plan.credits.script} Script Credits</li> </ul> <button onClick={handlePurchase} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-md"> {isLoading ? 'Processing...' : 'Buy Now'} </button> </div> )} </div> </AnimatedBackground> );
};

// ---------- App Shell ----------
const AppShell = ({ user, userData, projects, onProjectCreated, apiURL }) => {
  const [activeView, setActiveView] = useState('ebook_engine');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const credits = userData?.credits || { ebook: 0, script: 0 };
 // --- THIS IS THE NEW, SCALABLE GOD MODE LIST ---
const GOD_MODE_UIDS = [
    "zwEOyHBB7kSuqfgJggy2cYRfqtE2", // Your UID
    "dxKU07wOvXdpApOOU8kMwC80A7I2",         // Arnav's UID
    "UPxmvuxYWRcwYGEOQQ7WbiaCn9q1",          // Rohan's UID
    "uIyz2mWW8iSsStvo6qccBg0aEhM2"        // Anwesha's UID
];

const isPremiumUser = userData?.subscription_status === 'active' || GOD_MODE_UIDS.includes(user.uid);

  const handleCampaignGenerated = (data, showModal) => {
    setCampaignData(data);
    if(showModal) {
      setShowSuccessModal(true);
    } else {
      setActiveView('viral_engine');
    }
  };

  const viewCampaign = () => {
    setShowSuccessModal(false);
    setActiveView('viral_engine');
  }

  const NavLink = ({ viewName, icon, children }) => (
    <button onClick={() => {setActiveView(viewName); setIsMobileMenuOpen(false);}} className={`flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${activeView === viewName ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
      <Icon name={icon} />
      <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100 md:opacity-100' : 'opacity-0 md:opacity-100'}`}>{children}</span>
    </button>
  );

  if (activeView === 'pricing') {
      return <PricingPage user={user} onBack={() => setActiveView('ebook_engine')} apiURL={apiURL} />
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
        {showSuccessModal && (
            <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center max-w-lg">
                    <Icon name="check" className="w-16 h-16 mx-auto text-green-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white">Success! Your Lead Generation Campaign is Ready.</h2>
                    <p className="text-gray-400 mt-2 mb-6">We've analyzed your ebook and architected a complete campaign to attract your ideal customer.</p>
                    <button onClick={viewCampaign} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-md">
                        View My Campaign →
                    </button>
                </div>
            </div>
        )}
        <div className="md:hidden absolute top-4 left-4 z-30">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md bg-gray-800/50 text-white">
                <Icon name="menu" />
            </button>
        </div>
      <div className={`fixed md:relative z-20 bg-gray-800 h-full p-4 flex flex-col border-r border-gray-700 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isSidebarExpanded ? 'w-64' : 'md:w-20'}`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-xl font-bold transition-opacity duration-200 whitespace-nowrap ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>StartNerveOS</h1>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="hidden md:block p-1 text-gray-400 hover:text-white"><Icon name="menu" /></button>
        </div>
        <nav className="flex-grow space-y-2">
          <NavLink viewName="ebook_engine" icon="ebook">eBook Engine</NavLink>
          <NavLink viewName="viral_engine" icon="video">Viral Script Engine</NavLink>
          <NavLink viewName="library" icon="library">Creator’s Library</NavLink>
        </nav>
        
        <div className={`border-t border-gray-700 pt-4 transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credits</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-300">
              <p>Ebook Credits: {userData.credits.ebook}</p>
              <p>Script Credits: {userData.credits.script}</p>
            </div>
            <button onClick={() => setActiveView('pricing')} className="mt-2 w-full text-sm bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md">
              Buy Credits
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-2">
          <p className={`text-xs text-gray-400 px-3 truncate transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>{user.email}</p>
          <button onClick={() => signOut(auth)} className="w-full flex items-center space-x-3 text-left px-3 py-2.5 text-gray-300 hover:bg-red-800/50 rounded-lg mt-1">
            <Icon name="logout" />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>Logout</span>
          </button>
        </div>
      </div>
      <main className="relative z-10 flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        {activeView === 'viral_engine' && <ViralContentEngine user={user} userData={userData} apiURL={apiURL} initialCampaignData={campaignData} isPremiumUser={isPremiumUser} />}
        {activeView === 'ebook_engine' && <EbookEngine user={user} userData={userData} onProjectCreated={onProjectCreated} apiURL={apiURL} onCampaignGenerated={handleCampaignGenerated} isPremiumUser={isPremiumUser} />}
        {activeView === 'library' && <Library projects={projects} />}
      </main>
    </div>
  );
};

// ---------- Top-level App ----------
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('marketing');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      let unsubUser, unsubProjects;
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);

        unsubUser = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const normalized = { id: docSnap.id, credits: data.credits ? data.credits : { ebook: 5, script: 10 }, onboarding: data.onboarding || null, subscription_status: data.subscription_status || 'free' };
            setUserData(normalized);
            if (normalized.onboarding) setView('app');
            else setView('onboarding');
          } else {
            const defaultData = { credits: { ebook: 5, script: 10 }, onboarding: null, subscription_status: 'free' };
            setDoc(userDocRef, defaultData).then(() => {
              setUserData({ id: currentUser.uid, ...defaultData });
              setView('onboarding');
            });
          }
          setIsLoading(false);
        });

        const projectsColRef = collection(db, `users/${currentUser.uid}/projects`);
        const q = query(projectsColRef, orderBy('createdAt', 'desc'));
        unsubProjects = onCollectionSnapshot(q, (querySnapshot) => {
          const arr = [];
          querySnapshot.forEach((p) => { arr.push({ id: p.id, ...p.data() }); });
          setProjects(arr);
        });

      } else {
        setUser(null); setUserData(null); setProjects([]);
        setView('marketing'); setIsLoading(false);
      }
      
      return () => { if (unsubUser) unsubUser(); if (unsubProjects) unsubProjects(); };
    });

    return () => unsubscribeAuth();
  }, []);

  const handleOnboardingComplete = (onboardingData) => {
    setUserData(prev => ({ ...prev, onboarding: onboardingData }));
    setView('app');
  };
  
  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
        <Icon name="loader" className="w-12 h-12 text-purple-400 mb-4" />
        <p>Initializing Factory...</p>
      </div>
    );
  }

  if (view === 'marketing') return <MarketingPage onLaunch={() => setView('auth')} />;
  if (view === 'auth') return <AuthPage onBack={() => setView('marketing')} />;
  if (view === 'onboarding' && user) return <OnboardingWizard user={user} onComplete={handleOnboardingComplete} />;
  if (view === 'app' && user && userData) return <AppShell user={user} userData={userData} projects={projects} onProjectCreated={handleProjectCreated} apiURL={API_URL} />;

  return <MarketingPage onLaunch={() => setView('auth')} />;
}

