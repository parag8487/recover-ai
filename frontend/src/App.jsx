import React, { useState, useEffect } from 'react';
import useStore from './store/useStore';
import Login from './components/Login';
import MemoryTab from './components/memory/MemoryTab';
import TopNav from './components/layout/TopNav';
import Sidebar from './components/layout/Sidebar';

function App() {
    const [activeTab, setActiveTab] = useState('memory');
    const { user, setupInterceptors, addAlert } = useStore();

    useEffect(() => {
        setupInterceptors(addAlert);
        useStore.getState().loadSession();
    }, []);

    useEffect(() => {
        if (user) {
            useStore.getState().initSocket(user.id);
        }
    }, [user]);

    if (!user) {
        return <Login />;
    }

    return (
        <div className="min-h-screen bg-background text-text-primary p-6 font-sans relative transition-colors duration-500">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]"></div>
            </div>

            <div className="max-w-[1600px] mx-auto relative z-10">
                <TopNav />

                <div className="grid grid-cols-12 gap-8">
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    <main className="col-span-9 space-y-6">
                        {activeTab === 'memory' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full">
                                <MemoryTab />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default App;
