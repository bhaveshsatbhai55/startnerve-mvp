import React, { useState, useEffect, useRef } from 'react';
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
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './editor-styles.css';

// --- IMPORTANT ---
// Your Firebase config is included.
const firebaseConfig = {
  apiKey: "AIzaSyAeEeKTzToDngHfhgWM50T3gQETcrPmMEw",
  authDomain: "startnerve-37cd3.firebaseapp.com",
  projectId: "startnerve-37cd3",
  storageBucket: "startnerve-37cd3.appspot.com",
  messagingSenderId: "220139293313",
  appId: "1:220139293313:web:d31b2edbf02b75819b9b80",
  measurementId: "G-GMM684MVDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// --- ICONS ---
const Icon = ({ name, className = "w-6 h-6" }) => {
    const icons = {
        menu: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
        google: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-5.067 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l-2.347 2.347c-.96-.96-2.267-2.347-3.56-2.347-2.933 0-5.36 2.347-5.36 5.36s2.427 5.36 5.36 5.36c3.32 0 4.787-2.653 5.067-4.133H12.48z"/></svg>,
        video: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>,
        ebook: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
        settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
        loader: <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
        check: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
        upload: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
        logout: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
    };
    return <span className={className}>{icons[name] || ''}</span>;
};

// --- NEW: ANIMATED BACKGROUND COMPONENT ---
const AnimatedBackground = ({ children }) => (
    <div className="relative min-h-screen w-full bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10">
            {children}
        </div>
    </div>
);

// --- NEW: MARKETING PAGE COMPONENT ---
const MarketingPage = ({ onLaunch }) => {
    return (
        <AnimatedBackground>
            <div className="text-white font-sans">
                {/* Hero Section */}
                <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Stop Writing. Start Selling.</h1>
                    <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">The only AI that creates your ebook and the social media posts to sell it in under 10 minutes.</p>
                    <div className="mt-16">
                        <button onClick={onLaunch} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">Launch The Factory</button>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="py-20 px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">How It Works in 3 Simple Steps</h2>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10 text-center">
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <div className="text-purple-400 text-5xl font-bold mb-4">1</div>
                            <h3 className="text-xl font-semibold mb-2">Enter Your Idea</h3>
                            <p className="text-gray-400">Provide a topic and target audience for your digital product.</p>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <div className="text-pink-400 text-5xl font-bold mb-4">2</div>
                            <h3 className="text-xl font-semibold mb-2">Generate & Customize</h3>
                            <p className="text-gray-400">Our AI builds your ebook and marketing content. You customize the look and feel.</p>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <div className="text-blue-400 text-5xl font-bold mb-4">3</div>
                            <h3 className="text-xl font-semibold mb-2">Launch & Sell</h3>
                            <p className="text-gray-400">Download your final PDF and use the generated content to promote it.</p>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-20 px-4">
                     <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">An Entire Factory at Your Fingertips</h2>
                     <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
                            <Icon name="ebook" className="w-12 h-12 text-purple-400 mb-4" />
                            <h3 className="text-2xl font-bold mb-3">The eBook Engine</h3>
                            <p className="text-gray-400">Go from a single idea to a fully-formatted, professionally written ebook complete with chapters, lessons, and AI-sourced images. Perfect for lead magnets or your first digital product.</p>
                        </div>
                         <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
                            <Icon name="video" className="w-12 h-12 text-pink-400 mb-4" />
                            <h3 className="text-2xl font-bold mb-3">The Viral Content Engine</h3>
                            <p className="text-gray-400">Don't just build the product, build the hype. Generate a complete multi-platform marketing campaign, including scripts for Reels/Shorts, hooks for Twitter, and engaging captions.</p>
                        </div>
                     </div>
                </div>
                 {/* Final CTA Section */}
                <div className="py-20 px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Build?</h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">Stop dreaming about your side hustle and start building it. Your first digital product is minutes away.</p>
                    <button onClick={onLaunch} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">Get Started for Free</button>
                </div>
            </div>
        </AnimatedBackground>
    );
};


// --- AUTHENTICATION PAGE COMPONENT ---
const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
            setIsLoading(false);
        }
    };

    return (
        <AnimatedBackground>
            <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                    <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Welcome Back</h1>
                    <p className="text-gray-400 text-center mb-8">Sign in or create an account to launch the factory.</p>
                    
                    <form className="space-y-4">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            className="w-full bg-gray-700/50 border-gray-600 rounded-md p-3 text-white focus:ring-purple-500 focus:border-purple-500" 
                        />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                            className="w-full bg-gray-700/50 border-gray-600 rounded-md p-3 text-white focus:ring-purple-500 focus:border-purple-500" 
                        />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <div className="flex space-x-4 pt-2">
                            <button onClick={handleLogin} disabled={isLoading} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-md transition-colors">
                                {isLoading ? <Icon name="loader" className="mx-auto" /> : 'Login'}
                            </button>
                            <button onClick={handleSignUp} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-md transition-all">
                                {isLoading ? <Icon name="loader" className="mx-auto" /> : 'Sign Up'}
                            </button>
                        </div>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-700"></div>
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

// --- EBOOK EDITOR COMPONENT ---
const EbookEditor = React.memo(({ initialContent, onExport, onBack, user }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);
    const handleContentChange = (html) => {
        const updatedContent = [...content];
        updatedContent[activeLessonIndex].content = html;
        setContent(updatedContent);
    };
    const handleExport = () => {
        setIsExporting(true);
        onExport(content);
    };
    const activeLesson = content[activeLessonIndex];
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Step 3: Edit Your E-book</h2>
                    <p className="text-gray-400">Click a chapter on the left to edit its content.</p>
                </div>
                <div>
                    <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">Back to Customize</button>
                    <button onClick={handleExport} disabled={isExporting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">
                        {isExporting ? 'Exporting...' : 'Export as PDF'}
                    </button>
                </div>
            </div>
            <div className="flex -mx-3" style={{ minHeight: '600px' }}>
                <div className="w-1/3 px-3 h-full">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 h-full overflow-y-auto" style={{maxHeight: '600px'}}>
                        <h3 className="font-bold text-lg mb-2 text-white">Chapters</h3>
                        <ul className="space-y-1">
                            {content.map((item, index) => (
                                <li key={index}>
                                    <button onClick={() => setActiveLessonIndex(index)} className={`w-full text-left p-3 rounded transition-colors text-sm ${activeLessonIndex === index ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                        <span className="font-bold block">{item.module_title}</span>
                                        <span className="block opacity-80">{item.lesson_title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="w-2/3 px-3 h-full">
                    <ReactQuill 
                        theme="snow" 
                        value={activeLesson.content} 
                        onChange={handleContentChange}
                        className="h-full"
                        modules={{
                            toolbar: [
                                [{ 'header': [2, 3, 4, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{'list': 'ordered'}, {'list': 'bullet'}],
                                ['link'], ['clean']
                            ],
                        }}
                    />
                </div>
            </div>
        </div>
    );
});

// --- EBOOK ENGINE COMPONENT ---
const EbookEngine = ({ user }) => {
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    const [isLoadingOutline, setIsLoadingOutline] = useState(false);
    const [error, setError] = useState('');
    const [outlineData, setOutlineData] = useState(null);
    const [isGeneratingBook, setIsGeneratingBook] = useState(false);
    const [generatedBookUrl, setGeneratedBookUrl] = useState(null);
    const [generationStatus, setGenerationStatus] = useState('');
    const [selectedFont, setSelectedFont] = useState('roboto');
    const [selectedColor, setSelectedColor] = useState('#FFFFFF');
    const [coverImagePath, setCoverImagePath] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [ebookContent, setEbookContent] = useState(null);
    const [currentView, setCurrentView] = useState('customize');

    const lightColors = [
        { name: 'White', value: '#FFFFFF' }, { name: 'Cream', value: '#F5F5DC' }, { name: 'Light Gray', value: '#E5E7EB' },
        { name: 'Pale Blue', value: '#D6EAF8' }, { name: 'Mint', value: '#D1FAE5' }, { name: 'Linen', value: '#FAF0E6' },
    ];
    const darkColors = [
        { name: 'Charcoal', value: '#36454F' }, { name: 'Navy', value: '#000080' }, { name: 'Bottle Green', value: '#006A4E' },
        { name: 'Plum', value: '#4D0F28' }, { name: 'Maroon', value: '#800000' }, { name: 'Black', value: '#000000' }
    ];
    const fonts = [
        { name: 'Roboto', value: 'roboto', family: 'font-sans' }, { name: 'Merriweather', value: 'merriweather', family: 'font-serif' },
        { name: 'Montserrat', value: 'montserrat', family: 'font-sans font-bold' }, { name: 'Lato', value: 'lato', family: 'font-sans' },
        { name: 'Lora', value: 'lora', family: 'font-serif' }, { name: 'Playfair Display', value: 'playfair', family: 'font-serif' },
        { name: 'Oswald', value: 'oswald', family: 'font-sans' }, { name: 'Source Sans Pro', value: 'source_sans_pro', family: 'font-sans' },
        { name: 'PT Serif', value: 'pt_serif', family: 'font-serif' }, { name: 'Nunito', value: 'nunito', family: 'font-sans' },
    ];

    const handleGenerateOutline = async () => {
        if (!topic || !audience) { setError("Please provide a topic and audience."); return; }
        setIsLoadingOutline(true); setError(''); setOutlineData(null); setGeneratedBookUrl(null);
        setCoverPreview(null); setCoverImagePath(null); setCurrentView('customize'); setEbookContent(null);
        if(fileInputRef.current) { fileInputRef.current.value = ""; }
        try {
            const response = await fetch(`${API_URL}/api/generate-outline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, audience, uid: user.uid }),
            });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'Failed to generate outline.'); }
            const data = await response.json();
            setOutlineData(data);
        } catch (err) { setError(err.message); }
        finally { setIsLoadingOutline(false); }
    };

    const handleCoverImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCoverPreview(URL.createObjectURL(file));
        setIsUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('coverImage', file);
        try {
            const response = await fetch(`${API_URL}/api/upload-cover`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to upload cover.');
            }
            const data = await response.json();
            setCoverImagePath(data.filePath);
        } catch (err) {
            setError(err.message);
            setCoverPreview(null);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleGenerateAndEdit = async () => {
        if (!outlineData) { setError("Please provide an outline first."); return; }
        setIsGeneratingBook(true); setGeneratedBookUrl(null); setError('');
        setGenerationStatus('Generating draft content for editor...');
        try {
            const response = await fetch(`${API_URL}/api/generate-text-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outline: outlineData, uid: user.uid }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate content.');
            }
            const data = await response.json();
            setEbookContent(data.ebook_content);
            setCurrentView('edit');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGeneratingBook(false);
        }
    };

    const handleExportPdf = async (editedContent) => {
        setIsGeneratingBook(true); setGeneratedBookUrl(null); setError('');
        setGenerationStatus('Assembling your final PDF...');
        try {
            const response = await fetch(`${API_URL}/api/generate-full-ebook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    outline: outlineData,
                    font: selectedFont,
                    color: selectedColor,
                    coverImagePath: coverImagePath,
                    editedContent: editedContent,
                    uid: user.uid
                }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate the e-book.');
            }
            const data = await response.json();
            setGeneratedBookUrl(data.download_url);
            setGenerationStatus('Your e-book is ready!');
            setCurrentView('customize');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGeneratingBook(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">The eBook Engine</h1>
            <p className="text-gray-400 mb-8">Generate a professional course outline, then build and edit the complete e-book.</p>
            {!outlineData && ( <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700"> <div> <label className="block text-sm font-medium text-gray-300 mb-2">eBook Topic</label> <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., The 1-Hour Content System" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" /> </div> <div> <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label> <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g., Busy entrepreneurs" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" /> </div> <div className="text-right"> <button onClick={handleGenerateOutline} disabled={isLoadingOutline} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-md"> {isLoadingOutline ? "Generating Outline..." : "Generate Outline"} </button> </div> </div> )} {error && <div className="mt-4 p-4 bg-red-900/50 text-red-300 rounded-lg">{error}</div>} {outlineData && ( <div className="mt-8"> {currentView === 'edit' && ebookContent ? ( <EbookEditor initialContent={ebookContent} onExport={handleExportPdf} onBack={() => { setCurrentView('customize'); setEbookContent(null); }} user={user} /> ) : ( <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center"> {isGeneratingBook ? ( <div className="text-center py-4"> <Icon name="loader" className="w-12 h-12 mx-auto text-purple-400 mb-4" /> <p className="text-lg text-white">{generationStatus}</p> </div> ) : generatedBookUrl ? ( <> <Icon name="check" className="w-12 h-12 mx-auto text-green-400 mb-4" /> <h2 className="text-2xl font-bold text-white mb-2">{generationStatus}</h2> <a href={`${API_URL}${generatedBookUrl}`} download className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 px-8 rounded-md inline-block"> Download Your E-book! </a> </> ) : ( <div className="w-full max-w-5xl mx-auto"> <Icon name="check" className="w-12 h-12 mx-auto text-green-400 mb-4" /> <h2 className="text-2xl font-bold text-white mb-2">Step 1 Complete: Outline Ready!</h2> <p className="text-gray-400 mb-8">Your e-book blueprint, "{outlineData.course_title}," is generated.</p> <div> <h3 className="text-xl font-bold text-white mb-4 text-left">Step 2: Customize Your E-book</h3> <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700"> <label className="block text-sm font-medium text-gray-300 mb-2 text-left">Choose a Font</label> <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"> {fonts.map(font => ( <button key={font.value} onClick={() => setSelectedFont(font.value)} className={`p-3 text-center rounded-lg border-2 transition-all ${selectedFont === font.value ? 'border-purple-500 bg-purple-900/50' : 'border-gray-600 hover:border-purple-400'}`}> <div className={`${font.family} text-3xl`}>Ag</div> <div className="text-xs mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{font.name}</div> </button> ))} </div> <label className="block text-sm font-medium text-gray-300 mb-2 text-left">Choose a Background Color</label> <div className="space-y-3"> <div className="grid grid-cols-6 gap-2"> {lightColors.map(color => ( <button key={color.value} onClick={() => setSelectedColor(color.value)} className={`h-12 w-full rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-purple-500 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'}`} style={{backgroundColor: color.value}} title={color.name}></button> ))} </div> <div className="grid grid-cols-6 gap-2"> {darkColors.map(color => ( <button key={color.value} onClick={() => setSelectedColor(color.value)} className={`h-12 w-full rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-purple-500 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'}`} style={{backgroundColor: color.value}} title={color.name}></button> ))} </div> </div> </div> <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex flex-col items-center justify-center"> <label className="block text-sm font-medium text-gray-300 mb-2 w-full text-left">Upload a Custom Cover (Optional)</label> <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleCoverImageChange} className="hidden" /> <div onClick={() => fileInputRef.current.click()} className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800/50 transition-colors"> {coverPreview ? ( <img src={coverPreview} alt="Cover preview" className="max-h-full max-w-full object-contain rounded" /> ) : ( <> <Icon name="upload" className="w-10 h-10 text-gray-400 mb-2" /> <p className="text-gray-400">Click to upload (JPG or PNG)</p> </> )} </div> {isUploading && <p className="mt-2 text-purple-400">Uploading...</p>} {coverImagePath && !isUploading && <p className="mt-2 text-green-400">Upload complete!</p>} </div> </div> </div> <h3 className="text-xl font-bold text-white mb-4 mt-8">Step 3: Generate & Edit</h3> <button onClick={handleGenerateAndEdit} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 px-8 rounded-md animate-pulse"> Generate & Edit E-book </button> </div> )} </div> )} <details className="mt-6"> <summary className="cursor-pointer text-gray-400">View Generated Outline</summary> <div className="mt-4 space-y-4"> {outlineData.modules.map((module, modIndex) => ( <div key={modIndex} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"> <h4 className="font-bold">{module.module_title}</h4> <ul className="list-disc list-inside pl-4 text-gray-300"> {module.lessons.map((lesson, lesIndex) => ( <li key={lesIndex}>{lesson.lesson_title}</li> ))} </ul> </div> ))} </div> </details> </div> )}
        </div>
    );
};

// --- VIRAL CONTENT ENGINE COMPONENT ---
const ViralContentEngine = ({ user, brandDNA }) => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [campaignPackage, setCampaignPackage] = useState(null);
    
    const parseCampaignPackage = (responseText) => {
        const result = {};
        const orderedDelimiters = [
            { key: 'youtubeScript', delimiter: '---YOUTUBE_SCRIPT---' },
            { key: 'tiktokScript', delimiter: '---TIKTOK_REELS_SCRIPT---' },
            { key: 'instagramCaption', delimiter: '---INSTAGRAM_CAPTION---' },
            { key: 'hooks', delimiter: '---HOOKS---' },
            { key: 'titles', delimiter: '---TITLES---' },
            { key: 'hashtags', delimiter: '---HASHTAGS---' }
        ];
        let remainingText = responseText;
        for (let i = 0; i < orderedDelimiters.length; i++) {
            const startDelimiter = orderedDelimiters[i].delimiter;
            const endDelimiter = (i + 1 < orderedDelimiters.length) ? orderedDelimiters[i+1].delimiter : null;
            const startIndex = remainingText.indexOf(startDelimiter);
            if (startIndex === -1) continue;
            const contentStartIndex = startIndex + startDelimiter.length;
            const endIndex = endDelimiter ? remainingText.indexOf(endDelimiter, contentStartIndex) : remainingText.length;
            let content = remainingText.substring(contentStartIndex, endIndex).trim();
            if (orderedDelimiters[i].key === 'hooks' || orderedDelimiters[i].key === 'titles') {
                result[orderedDelimiters[i].key] = content.split('\n').filter(line => line.trim() !== '');
            } else {
                result[orderedDelimiters[i].key] = content;
            }
        }
        return result;
    };

    const handleGenerate = async () => {
        if (!topic) { setError("Please enter a video topic."); return; }
        setError(''); setIsLoading(true); setCampaignPackage(null);
        try {
            const response = await fetch(`${API_URL}/api/generate-viral-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, brand_dna: brandDNA, uid: user.uid }),
            });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'Failed to generate campaign.'); }
            const data = await response.json();
            const parsedPackage = parseCampaignPackage(data.campaign_package);
            setCampaignPackage(parsedPackage);
        } catch (err) { setError(err.message); }
        finally { setIsLoading(false); }
    };

    const CampaignDisplayCard = ({ title, children }) => (
        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-purple-300 mb-4">{title}</h3>
            <div className="text-gray-300 whitespace-pre-wrap font-mono text-sm">{children}</div>
        </div>
    );
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">The Viral Content Engine</h1>
            <p className="text-gray-400 mb-8">Enter one idea. Get a complete, multi-platform content campaign in your unique brand voice.</p>
            <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700"> <div> <label className="block text-sm font-medium text-gray-300 mb-2">Video Topic</label> <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Why 99% of people are wrong about coffee" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" /> </div> <div className="text-right"> <button onClick={handleGenerate} disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-md"> {isLoading ? <span className="flex items-center justify-center"><Icon name="loader" className="mr-2" /> Generating...</span> : "Generate Campaign-in-a-Box"} </button> </div> </div> {error && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">{error}</div>} {isLoading && <div className="text-center py-12"><Icon name="loader" className="w-12 h-12 mx-auto text-purple-400" /></div>} {campaignPackage && ( <div className="mt-8 space-y-6"> {campaignPackage.youtubeScript && <CampaignDisplayCard title="YouTube Short Script">{campaignPackage.youtubeScript}</CampaignDisplayCard>} {campaignPackage.tiktokScript && <CampaignDisplayCard title="TikTok & Reels Script">{campaignPackage.tiktokScript}</CampaignDisplayCard>} {campaignPackage.instagramCaption && <CampaignDisplayCard title="Instagram Caption">{campaignPackage.instagramCaption}</CampaignDisplayCard>} {campaignPackage.hooks && <CampaignDisplayCard title="Hooks for X/Twitter & LinkedIn"><ul className="list-disc list-inside space-y-2">{campaignPackage.hooks.map((hook, i) => <li key={i}>{hook}</li>)}</ul></CampaignDisplayCard>} {campaignPackage.titles && <CampaignDisplayCard title="YouTube Titles"><ul className="list-disc list-inside space-y-2">{campaignPackage.titles.map((title, i) => <li key={i}>{title}</li>)}</ul></CampaignDisplayCard>} {campaignPackage.hashtags && <CampaignDisplayCard title="Hashtags">{campaignPackage.hashtags}</CampaignDisplayCard>} </div> )}
        </div>
    );
};


// --- AppShell ---
const AppShell = ({ user }) => {
    const [activeView, setActiveView] = useState('ebook_engine');
    const [brandDNA, setBrandDNA] = useState({ tone: 'Educational & Authoritative', audience: '', angle: '', cta: '' });
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [credits, setCredits] = useState({ ebook: 0, script: 0 });

    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setCredits(doc.data());
                }
            });
            return () => unsubscribe();
        }
    }, [user]);

    const NavLink = ({ viewName, icon, children, isExpanded }) => (
        <button onClick={() => setActiveView(viewName)} className={`flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${activeView === viewName ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            <Icon name={icon} />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>{children}</span>
        </button>
    );
    
    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <div className={`relative z-20 bg-gray-800 p-4 flex flex-col border-r border-gray-700 transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-20'}`}>
                <div className="flex items-center justify-between mb-8">
                    <h1 className={`text-xl font-bold transition-opacity duration-200 whitespace-nowrap ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>StartNerveOS</h1>
                    <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-1 text-gray-400 hover:text-white">
                        <Icon name="menu" />
                    </button>
                </div>
                <nav className="flex-grow space-y-2">
                    <NavLink viewName="ebook_engine" icon="ebook" isExpanded={isSidebarExpanded}>eBook Engine</NavLink>
                    <NavLink viewName="viral_engine" icon="video" isExpanded={isSidebarExpanded}>Viral Content Engine</NavLink>
                </nav>
                
                <div className={`border-t border-gray-700 pt-4 transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="px-3 mb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credits</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-300">
                            <p>Ebook Credits: {credits.ebook}</p>
                            <p>Script Credits: {credits.script}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-2">
                    <p className={`text-xs text-gray-400 px-3 truncate transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>{user.email}</p>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 text-left px-3 py-2.5 text-gray-300 hover:bg-red-800/50 rounded-lg mt-1">
                        <Icon name="logout" />
                        <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>Logout</span>
                    </button>
                </div>
            </div>
            <main className="relative z-10 flex-1 p-8 overflow-y-auto">
                {activeView === 'viral_engine' && <ViralContentEngine user={user} brandDNA={brandDNA} />}
                {activeView === 'ebook_engine' && <EbookEngine user={user} />}
                {activeView === 'settings' && <div><h1 className="text-3xl font-bold">Settings</h1><p>Brand DNA settings will go here.</p></div>}
            </main>
        </div>
    );
};


// --- TOP-LEVEL APP COMPONENT ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('marketing'); // 'marketing', 'auth', 'app'

    useEffect(() => {
        const ensureUserDocument = async (currentUser) => {
            if (currentUser) {
                // Call the backend to create the user document.
                // This is safe to call every time, as the backend will only create it if it doesn't exist.
                try {
                    await fetch(`${API_URL}/api/create-user`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: currentUser.uid }),
                    });
                } catch (err) {
                    console.error("Failed to ensure user document on backend:", err);
                }
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setView('app');
                ensureUserDocument(currentUser); // Ensure document exists on login
            } else {
                setUser(null);
                setView('marketing');
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
                <Icon name="loader" className="w-12 h-12 text-purple-400 mb-4" />
                <p>Initializing Factory...</p>
            </div>
        );
    }

    if (view === 'marketing') {
        return <MarketingPage onLaunch={() => setView('auth')} />;
    }
    
    if (view === 'auth') {
        return <AuthPage />;
    }

    if (view === 'app' && user) {
        return <AppShell user={user} />;
    }

    // Fallback to auth page if something is weird
    return <AuthPage />;
}
