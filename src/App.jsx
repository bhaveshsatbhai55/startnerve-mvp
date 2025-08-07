import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- ICONS ---
const Icon = ({ name, className = "w-6 h-6" }) => {
    const icons = {
        course: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
        video: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>,
        ebook: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
        settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
        loader: <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
        check: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    };
    return <span className={className}>{icons[name] || ''}</span>;
};

// --- MARKETING SITE COMPONENT ---
const MarketingSite = ({ onLaunch }) => {
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

// --- EBOOK ENGINE COMPONENT ---
const EbookEngine = () => {
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    const [isLoadingOutline, setIsLoadingOutline] = useState(false);
    const [error, setError] = useState('');
    const [outlineData, setOutlineData] = useState(null);
    const [loadingLessonId, setLoadingLessonId] = useState(null);
    const [activeLessonContent, setActiveLessonContent] = useState({});

    const handleGenerateOutline = async () => {
        if (!topic || !audience) { setError("Please provide a topic and audience."); return; }
        setIsLoadingOutline(true); setError(''); setOutlineData(null); setActiveLessonContent({});
        try {
            const response = await fetch('http://127.0.0.1:5000/api/generate-outline', {
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

    const handleSelectLesson = async (module, lesson) => {
        const lessonId = `${module.module_title}-${lesson.lesson_title}`;
        if (activeLessonContent[lessonId]) return;
        setLoadingLessonId(lessonId); setError('');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/generate-lesson-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_title: outlineData.course_title,
                    module_title: module.module_title,
                    lesson_title: lesson.lesson_title,
                    learning_objective: lesson.learning_objective,
                }),
            });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'Failed to generate lesson content.'); }
            const data = await response.json();
            setActiveLessonContent(prev => ({ ...prev, [lessonId]: data.generated_content }));
        } catch (err) { setError(err.message); } 
        finally { setLoadingLessonId(null); }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">The eBook Engine</h1>
            <p className="text-gray-400 mb-8">Generate a professional course outline, then create content for each lesson on-demand.</p>
            
            {!outlineData && (
                <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">eBook Topic</label>
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., The Solo Founder's Guide to Marketing" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                        <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g., Aspiring entrepreneurs with no marketing budget" className="w-full bg-gray-700 border-gray-600 rounded-md p-2" />
                    </div>
                    <div className="text-right">
                        <button onClick={handleGenerateOutline} disabled={isLoadingOutline} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-md">
                            {isLoadingOutline ? "Generating Outline..." : "Generate Outline"}
                        </button>
                    </div>
                </div>
            )}
            
            {error && <div className="mt-4 text-red-400">{error}</div>}

            {outlineData && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{outlineData.course_title}</h2>
                    <p className="text-gray-400 mb-4">{outlineData.course_overview}</p>
                    <div className="space-y-4">
                        {outlineData.modules.map((module, modIndex) => (
                            <details key={modIndex} className="bg-gray-800/50 rounded-lg border border-gray-700">
                                <summary className="p-4 cursor-pointer font-semibold text-lg list-none flex justify-between items-center">{module.module_title}</summary>
                                <ul className="p-4 border-t border-gray-600 space-y-2">
                                    {module.lessons.map((lesson, lesIndex) => {
                                        const lessonId = `${module.module_title}-${lesson.lesson_title}`;
                                        const hasContent = !!activeLessonContent[lessonId];
                                        const isLoadingThisLesson = loadingLessonId === lessonId;
                                        return (
                                            <li key={lesIndex}>
                                                <button onClick={() => handleSelectLesson(module, lesson)} disabled={isLoadingThisLesson || hasContent} className="w-full text-left p-3 rounded-md hover:bg-gray-700 flex items-center justify-between">
                                                    <span>{lesson.lesson_title}</span>
                                                    {isLoadingThisLesson ? <Icon name="loader" /> : (hasContent ? <Icon name="check" className="text-green-400"/> : null)}
                                                </button>
                                                {hasContent && (
                                                    <div className="mt-2 p-4 bg-gray-900/50 rounded-md whitespace-pre-wrap font-mono text-sm text-gray-300">{activeLessonContent[lessonId]}</div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </details>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- VIRAL CONTENT ENGINE COMPONENT ---
const ViralContentEngine = ({ brandDNA }) => {
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
            const response = await fetch('http://127.0.0.1:5000/api/generate-viral-content', {
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
                        {isLoading ? <span className="flex items-center justify-center"><Icon name="loader" className="mr-2"/> Generating...</span> : "Generate Campaign-in-a-Box"}
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

// --- MAIN APPLICATION SHELL ---
const AppShell = () => {
    const [activeView, setActiveView] = useState('ebook_engine');
    const [brandDNA, setBrandDNA] = useState({ tone: 'Educational & Authoritative', audience: '', angle: '', cta: '' });

    // Note: Firebase functionality is simplified for this version to ensure it runs without real credentials.
    // In a full app, you would have a settings page and fetch/save brandDNA here.

    const NavLink = ({ viewName, icon, children }) => (
        <button onClick={() => setActiveView(viewName)} className={`flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${activeView === viewName ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            <Icon name={icon} />
            <span>{children}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <div className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700">
                <div className="mb-8"><h1 className="text-xl font-bold">StartNerveOS</h1></div>
                <nav className="flex-grow space-y-2">
                    <NavLink viewName="ebook_engine" icon="ebook">eBook Engine</NavLink>
                    <NavLink viewName="viral_engine" icon="video">Viral Content Engine</NavLink>
                </nav>
                <div><NavLink viewName="settings" icon="settings">Settings</NavLink></div>
            </div>
            <main className="flex-1 p-8 overflow-y-auto">
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
    
    // Bypassing Firebase for this build to ensure no credential errors.
    // This makes the app run in a local-only mode.
    const firebaseConfig = { apiKey: "YOUR_API_KEY" }; // Dummy config
    const isAuthReady = true; 

    // In a real app, the useEffect hook for Firebase initialization would go here.

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