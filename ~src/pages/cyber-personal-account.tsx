// /var/www/html/project9/pages/cyber-personal-account.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Brain, Database, Zap, Shield, Settings, 
  ChevronRight, ChevronDown, Cpu, Activity, Terminal, Wifi 
} from 'lucide-react';
import Link from 'next/link';
import getConfig from 'next/config';
import Head from 'next/head';
import type { MotionProps } from '../features/chat/types';

const { publicRuntimeConfig } = getConfig();

interface MenuItem {
  id: string;
  icon: React.FC<{ className?: string }>;
  label: string;
}

const menuItems: MenuItem[] = [
  { id: 'profile', icon: User, label: 'Neural Profile' },
  { id: 'skills', icon: Brain, label: 'Augmented Skills' },
  { id: 'inventory', icon: Database, label: 'Cyber Inventory' },
  { id: 'missions', icon: Zap, label: 'Active Missions' },
  { id: 'security', icon: Shield, label: 'Neural Security' },
  { id: 'settings', icon: Settings, label: 'System Config' }
];

const CyberPersonalAccount: React.FC = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [glitchEffect, setGlitchEffect] = useState<boolean>(false);
  const [expandedMission, setExpandedMission] = useState<number | null>(null);

  useEffect((): (() => void) => {
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 5000);

    return () => clearInterval(glitchInterval);
  }, []);

  const renderTabContent = (id: string): JSX.Element => {
    switch (id) {
      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Neural Profile: Agent X-273</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-green-400 mb-2">Biometric Data</h3>
                <p>Neural Sync: 98.7%</p>
                <p>Cybernetic Enhancements: 7</p>
                <p>Cognitive Function: Enhanced</p>
                <p>Physical Augmentation: Level 5</p>
                <p>Neuro-plasticity Index: 89.3%</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-green-400 mb-2">Simulation Stats</h3>
                <p>Time in Simulation: 2,734 hours</p>
                <p>Missions Completed: 89</p>
                <p>Reputation: Legendary</p>
                <p>Neural Credits: 15,750</p>
                <p>Achievement Points: 12,890</p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-green-400 mb-2">Recent Neural Activities</h3>
              <ul className="list-disc list-inside">
                <li>Completed advanced firewall bypass training</li>
                <li>Upgraded neural interface to v7.3</li>
                <li>Participated in virtual hacking tournament (Rank: 3rd)</li>
                <li>Initiated deep-dive simulation in Neon sector</li>
              </ul>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Augmented Skills Matrix</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Hacking', level: 92 },
                { name: 'Neural Interface', level: 88 },
                { name: 'Cybernetic Combat', level: 79 },
                { name: 'Data Mining', level: 85 },
                { name: 'AI Negotiation', level: 76 },
                { name: 'Quantum Decryption', level: 81 },
                { name: 'Nano-tech Manipulation', level: 72 },
                { name: 'Biometric Spoofing', level: 77 },
                { name: 'Virtual Architecture', level: 83 }
              ].map((skill) => (
                <div key={skill.name} className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-green-400 mb-2">{skill.name}</h3>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-cyan-600 h-2.5 rounded-full" 
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                  <p className="text-right mt-1 text-sm">{skill.level}%</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Cyber Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Neural Enhancer v3', description: 'Boosts cognitive processing by 35%', rarity: 'Rare' },
                { name: 'Quantum Encryption Key', description: 'Unbreakable encryption for secure data transfer', rarity: 'Legendary' },
                { name: 'Holographic Disguise Matrix', description: 'Projects realistic holographic disguises', rarity: 'Epic' },
                { name: 'Nano-bot Swarm', description: 'Microscopic robots for various tasks', rarity: 'Uncommon' },
                { name: 'Cybernetic Arm Upgrade', description: 'Enhanced strength and dexterity', rarity: 'Rare' },
                { name: 'AI Companion Chip', description: 'Advanced AI assistant for complex computations', rarity: 'Epic' }
              ].map((item) => (
                <div key={item.name} className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-green-400 mb-2">{item.name}</h3>
                  <p className="text-sm mb-2">{item.description}</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.rarity === 'Legendary' ? 'bg-yellow-600 text-yellow-100' :
                    item.rarity === 'Epic' ? 'bg-purple-600 text-purple-100' :
                    item.rarity === 'Rare' ? 'bg-blue-600 text-blue-100' :
                    'bg-gray-600 text-gray-100'
                  }`}>
                    {item.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'missions':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Active Missions</h2>
            {[
              { id: 1, name: 'Operation Neon Shadow', difficulty: 'High', reward: '5000 NC', description: 'Infiltrate the Arasaka mainframe and extract classified data on Project Silverhand.' },
              { id: 2, name: 'Ghost in the Machine', difficulty: 'Medium', reward: '3000 NC', description: 'Track down and neutralize a rogue AI that\'s causing havoc in the financial district.' },
              { id: 3, name: 'Cyber Heist', difficulty: 'Extreme', reward: '10000 NC', description: 'Break into the most secure vault in Neon and steal the prototype neuro-link enhancer.' }
            ].map((mission) => (
              <div key={mission.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}>
                  <h3 className="text-green-400">{mission.name}</h3>
                  {expandedMission === mission.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
                {expandedMission === mission.id && (
                  <div className="mt-2 space-y-2">
                    <p><span className="text-cyan-400">Difficulty:</span> {mission.difficulty}</p>
                    <p><span className="text-cyan-400">Reward:</span> {mission.reward}</p>
                    <p><span className="text-cyan-400">Description:</span> {mission.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Neural Security</h2>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-green-400 mb-2">Firewall Status</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-right mt-1">92% - Strong</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-green-400 mb-2">Recent Security Events</h3>
              <ul className="list-disc list-inside">
                <li>Blocked 17 unauthorized access attempts</li>
                <li>Quarantined 3 suspicious data packets</li>
                <li>Updated neural encryption protocols</li>
                <li>Performed deep scan of cybernetic implants</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-green-400 mb-2">Security Recommendations</h3>
              <ul className="list-disc list-inside">
                <li>Upgrade neural firewall to version 12.3</li>
                <li>Enable two-factor biometric authentication</li>
                <li>Schedule regular security audits of cybernetic enhancements</li>
              </ul>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">System Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-green-400 mb-2">Neural Interface Settings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sensory Input Gain</span>
                    <input type="range" min="0" max="100" defaultValue="75" className="w-1/2" />
                  </div>
                  <div className="flex justify-between">
                    <span>Cognitive Enhancement</span>
                    <input type="range" min="0" max="100" defaultValue="90" className="w-1/2" />
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Compression</span>
                    <input type="range" min="0" max="100" defaultValue="60" className="w-1/2" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-green-400 mb-2">Cybernetic Calibration</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Reflex Amplifier</span>
                    <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Night Vision</span>
                    <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Neural Link Overclock</span>
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-cyan-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-green-400 mb-2">System Maintenance</h3>
              <div className="space-y-2">
                <button className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded">
                  Run Diagnostic Scan
                </button>
                <button className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Update Neural Firmware
                </button>
                <button className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  Factory Reset (Use with caution)
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="text-cyan-400">Content for {id} is under development.</div>;
    }
  };

  const getButtonProps = (itemId: string): MotionProps => ({
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    onClick: () => setActiveTab(itemId)
  });

  return (
    <>
      <Head>
        <title>Personal Terminal | Neon Nexus</title>
        <link rel="icon" href={`${publicRuntimeConfig.basePath}/favicon.ico`} />
      </Head>
      <div className="min-h-screen bg-black text-gray-300 font-mono">
        <header className="relative z-10 flex items-center justify-between p-4 bg-black bg-opacity-70 border-b border-green-500 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-green-300 tracking-wider">Your Neon Nexus AI Account</h1>
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Brain className="text-purple-400" />
            </motion.div>
            <Link href="/">            
              <Cpu className="text-blue-400 animate-pulse" />
            </Link>
            <Link href="/console">
              <Terminal className="text-red-400" />
            </Link>
            <Link href="https://web.89281112.xyz/" title='Назад'>
              <Wifi className="text-green-400" />
            </Link>
          </div>
        </header>

        <div className="p-8">
          <div className={`relative ${glitchEffect ? 'animate-glitch' : ''}`}>
            <h1 className="text-4xl font-bold text-center mb-8 text-cyan-500">Neon Nexus: Personal Terminal</h1>
            {glitchEffect && (
              <div className="absolute inset-0 bg-red-500 opacity-10 animate-pulse"></div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-8">
            <div className="col-span-1 bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    {...getButtonProps(item.id)}
                    className={`w-full text-left p-2 rounded-md flex items-center space-x-2 ${
                      activeTab === item.id ? 'bg-cyan-900 text-cyan-300' : 'hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="col-span-3 bg-gray-900 rounded-lg p-6 border border-gray-700">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent(activeTab)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 right-4 flex space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Cpu className="text-cyan-500 w-6 h-6" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Activity className="text-green-500 w-6 h-6" />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CyberPersonalAccount;
