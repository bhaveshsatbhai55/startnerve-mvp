import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './editor-styles.css';

// --- MODIFIED --- Define the API_URL using environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// --- ICONS ---
const Icon = ({ name, className = "w-6 h-6" }) => {
    // --- MODIFIED --- Added 'menu' icon
    const icons = {
        menu: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
        course: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
        video: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>,
        ebook: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
        settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
        loader: <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
        check: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
        upload: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
    };
    return <span className={className}>{icons[name] || ''}</span>;
};

// --- MARKETING SITE COMPONENT ---
const MarketingSite = ({ onLaunch }) => {
    // ... (This component is unchanged)
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Turn Your Idea Into a Digital Product. Instantly.</h1>
            <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">The AI-powered factory for side hustlers to build and sell digital products with zero code.</p>
            <div className="mt-16">
                <button onClick={onLaunch} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">Launch The Factory</button>
            </div>
        </div>
    );
};

// --- EBOOK EDITOR COMPONENT ---
const EbookEditor = React.memo(({ initialContent, onExport, onBack }) => {
    // ... (This component is unchanged)
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
const EbookEngine = () => {
    // ... (This component is unchanged)
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
            // --- MODIFIED --- Use the API_URL variable
            const response = await fetch(`${API_URL}/api/generate-outline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, audience }),
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
            // --- MODIFIED --- Use the API_URL variable
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
            // --- MODIFIED --- Use the API_URL variable
            const response = await fetch(`${API_URL}/api/generate-text-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outline: outlineData }),
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
            // --- MODIFIED --- Use the API_URL variable
            const response = await fetch(`${API_URL}/api/generate-full-ebook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    outline: outlineData,
                    font: selectedFont,
                    color: selectedColor,
                    coverImagePath: coverImagePath,
                    editedContent: editedContent,
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
            {!outlineData && (
                <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">eBook Topic</label>
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., The 1-Hour Content System" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                        <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g., Busy entrepreneurs" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" />
                    </div>
                    <div className="text-right">
                        <button onClick={handleGenerateOutline} disabled={isLoadingOutline} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-md">
                            {isLoadingOutline ? "Generating Outline..." : "Generate Outline"}
                        </button>
                    </div>
                </div>
            )}
            {error && <div className="mt-4 p-4 bg-red-900/50 text-red-300 rounded-lg">{error}</div>}
            {outlineData && (
                <div className="mt-8">
                    {currentView === 'edit' && ebookContent ? (
                        <EbookEditor 
                            initialContent={ebookContent}
                            onExport={handleExportPdf}
                            onBack={() => { setCurrentView('customize'); setEbookContent(null); }}
                        />
                    ) : (
                        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
                            {isGeneratingBook ? (
                                <div className="text-center py-4">
                                    <Icon name="loader" className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                                    <p className="text-lg text-white">{generationStatus}</p>
                                </div>
                            ) : generatedBookUrl ? (
                                <>
                                    <Icon name="check" className="w-12 h-12 mx-auto text-green-400 mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">{generationStatus}</h2>
                                    {/* --- MODIFIED --- Use the API_URL variable for the download link */}
                                    <a href={`${API_URL}${generatedBookUrl}`} download className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 px-8 rounded-md inline-block">
                                        Download Your E-book!
                                    </a>
                                </>
                            ) : (
                                <div className="w-full max-w-5xl mx-auto">
                                    <Icon name="check" className="w-12 h-12 mx-auto text-green-400 mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">Step 1 Complete: Outline Ready!</h2>
                                    <p className="text-gray-400 mb-8">Your e-book blueprint, "{outlineData.course_title}," is generated.</p>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4 text-left">Step 2: Customize Your E-book</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                                                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">Choose a Font</label>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                                    {fonts.map(font => (
                                                        <button key={font.value} onClick={() => setSelectedFont(font.value)} className={`p-3 text-center rounded-lg border-2 transition-all ${selectedFont === font.value ? 'border-purple-500 bg-purple-900/50' : 'border-gray-600 hover:border-purple-400'}`}>
                                                            <div className={`${font.family} text-3xl`}>Ag</div>
                                                            <div className="text-xs mt-1">{font.name}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">Choose a Background Color</label>
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {lightColors.map(color => (
                                                            <button key={color.value} onClick={() => setSelectedColor(color.value)} className={`h-12 w-full rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-purple-500 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'}`} style={{backgroundColor: color.value}} title={color.name}></button>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {darkColors.map(color => (
                                                            <button key={color.value} onClick={() => setSelectedColor(color.value)} className={`h-12 w-full rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-purple-500 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'}`} style={{backgroundColor: color.value}} title={color.name}></button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex flex-col items-center justify-center">
                                                <label className="block text-sm font-medium text-gray-300 mb-2 w-full text-left">Upload a Custom Cover (Optional)</label>
                                                <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleCoverImageChange} className="hidden" />
                                                <div onClick={() => fileInputRef.current.click()} className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800/50 transition-colors">
                                                    {coverPreview ? ( <img src={coverPreview} alt="Cover preview" className="max-h-full max-w-full object-contain rounded" /> ) : (
                                                        <>
                                                            <Icon name="upload" className="w-10 h-10 text-gray-400 mb-2" />
                                                            <p className="text-gray-400">Click to upload (JPG or PNG)</p>
                                                        </>
                                                    )}
                                                </div>
                                                {isUploading && <p className="mt-2 text-purple-400">Uploading...</p>}
                                                {coverImagePath && !isUploading && <p className="mt-2 text-green-400">Upload complete!</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4 mt-8">Step 3: Generate & Edit</h3>
                                    <button onClick={handleGenerateAndEdit} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 px-8 rounded-md animate-pulse">
                                        Generate & Edit E-book
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <details className="mt-6">
                        <summary className="cursor-pointer text-gray-400">View Generated Outline</summary>
                        <div className="mt-4 space-y-4">
                        {outlineData.modules.map((module, modIndex) => (
                            <div key={modIndex} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                <h4 className="font-bold">{module.module_title}</h4>
                                <ul className="list-disc list-inside pl-4 text-gray-300">
                                    {module.lessons.map((lesson, lesIndex) => (
                                        <li key={lesIndex}>{lesson.lesson_title}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
};

// --- VIRAL CONTENT ENGINE COMPONENT ---
const ViralContentEngine = ({ brandDNA }) => {
    // ... (This component is unchanged)
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
            // --- MODIFIED --- Use the API_URL variable
            const response = await fetch(`${API_URL}/api/generate-viral-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, brand_dna: brandDNA }),
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
            <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Video Topic</label>
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Why 99% of people are wrong about coffee" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" />
                </div>
                <div className="text-right">
                    <button onClick={handleGenerate} disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-md">
                        {isLoading ? <span className="flex items-center justify-center"><Icon name="loader" className="mr-2" /> Generating...</span> : "Generate Campaign-in-a-Box"}
                    </button>
                </div>
            </div>
            {error && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">{error}</div>}
            {isLoading && <div className="text-center py-12"><Icon name="loader" className="w-12 h-12 mx-auto text-purple-400" /></div>}
            {campaignPackage && (
                <div className="mt-8 space-y-6">
                    {campaignPackage.youtubeScript && <CampaignDisplayCard title="YouTube Short Script">{campaignPackage.youtubeScript}</CampaignDisplayCard>}
                    {campaignPackage.tiktokScript && <CampaignDisplayCard title="TikTok & Reels Script">{campaignPackage.tiktokScript}</CampaignDisplayCard>}
                    {campaignPackage.instagramCaption && <CampaignDisplayCard title="Instagram Caption">{campaignPackage.instagramCaption}</CampaignDisplayCard>}
                    {campaignPackage.hooks && <CampaignDisplayCard title="Hooks for X/Twitter & LinkedIn"><ul className="list-disc list-inside space-y-2">{campaignPackage.hooks.map((hook, i) => <li key={i}>{hook}</li>)}</ul></CampaignDisplayCard>}
                    {campaignPackage.titles && <CampaignDisplayCard title="YouTube Titles"><ul className="list-disc list-inside space-y-2">{campaignPackage.titles.map((title, i) => <li key={i}>{title}</li>)}</ul></CampaignDisplayCard>}
                    {campaignPackage.hashtags && <CampaignDisplayCard title="Hashtags">{campaignPackage.hashtags}</CampaignDisplayCard>}
                </div>
            )}
        </div>
    );
};


// --- MODIFIED --- AppShell now handles the collapsible sidebar logic correctly
const AppShell = () => {
    const [activeView, setActiveView] = useState('ebook_engine');
    const [brandDNA, setBrandDNA] = useState({ tone: 'Educational & Authoritative', audience: '', angle: '', cta: '' });
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const NavLink = ({ viewName, icon, children, isExpanded }) => (
        <button onClick={() => setActiveView(viewName)} className={`flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${activeView === viewName ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            <Icon name={icon} />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>{children}</span>
        </button>
    );

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
                <div>
                    <NavLink viewName="settings" icon="settings" isExpanded={isSidebarExpanded}>Settings</NavLink>
                </div>
            </div>
            <main className="relative z-10 flex-1 p-8 overflow-y-auto">
                {activeView === 'viral_engine' && <ViralContentEngine brandDNA={brandDNA} />}
                {activeView === 'ebook_engine' && <EbookEngine />}
                {activeView === 'settings' && <div><h1 className="text-3xl font-bold">Settings</h1><p>Brand DNA settings will go here.</p></div>}
            </main>
        </div>
    );
};


// --- TOP-LEVEL APP COMPONENT ---
export default function App() {
    const [view, setView] = useState('marketing');
    const isAuthReady = true;
    
    if (!isAuthReady) {
        return (
            <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
                <Icon name="loader" className="w-12 h-12 text-purple-400 mb-4" />
                <p>Initializing Factory...</p>
            </div>
        );
    }
    return (
        <div>
            {view === 'marketing' ? <MarketingSite onLaunch={() => setView('app')} /> : <AppShell />}
        </div>
    );
}
