"use client";

import React, { useState, useEffect } from 'react';
import MainStage from '../components/MainStage';
import IntelligenceSidebar from '../components/IntelligenceSidebar';
import { Activity } from 'lucide-react';

export default function Dashboard() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenarioId, setScenarioId] = useState('base_00');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch scenarios list
  useEffect(() => {
    fetch('http://localhost:8000/api/scenarios')
      .then(res => res.json())
      .then(d => {
        setScenarios(d);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch full data when scenario changes
  useEffect(() => {
    setLoading(true);
    
    // Simulate slight network delay for effect
    setTimeout(() => {
      Promise.all([
        fetch(`http://localhost:8000/api/scenarios/${scenarioId}`).then(res => res.json()),
        fetch(`http://localhost:8000/api/impact-chain?scenario_id=${scenarioId}`).then(res => res.json()),
        fetch(`http://localhost:8000/api/source-confidence`).then(res => res.json())
      ])
      .then(([scenarioData, chainData, confData]) => {
        setData({
          ...scenarioData,
          impact_chain: chainData,
          source_confidence: confData
        });
        
        if (scenarioData.scenario) {
           showToast(`Scenario Updated: ${scenarioData.scenario.name}`);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }, 400);

  }, [scenarioId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#030712] font-sans selection:bg-[#38BDF8]/30">
      
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-[#1F2937] bg-[#0B1117]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#38BDF8]" />
          <h1 className="text-sm font-bold tracking-widest uppercase text-white">Real Rails <span className="text-gray-500">| Intelligence</span></h1>
        </div>
        <div className="flex items-center gap-4">
          {data?.scenario && (
             <span className="text-xs font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-1 rounded border border-[#38BDF8]/20 hidden md:block">
               ACTIVE: {data.scenario.name}
             </span>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400 font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area - 70/30 Split */}
      <main className="flex-1 flex overflow-hidden">
        {/* Main Stage (70%) */}
        <div className="flex-[7] min-w-0 h-full relative">
          <MainStage data={data} loading={loading} />
        </div>

        {/* Intelligence Sidebar (30%) */}
        <div className="flex-[3] min-w-[320px] max-w-[450px] h-full z-10 shadow-[-8px_0_30px_rgba(0,0,0,0.5)]">
          <IntelligenceSidebar 
            scenarioId={scenarioId} 
            setScenarioId={setScenarioId} 
            data={data} 
            loading={loading}
            scenarios={scenarios}
          />
        </div>
      </main>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-toast">
          <div className="glassmorphism cyan-border-glow px-4 py-3 rounded shadow-2xl flex items-center gap-3">
            <Activity className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-sm text-white font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
