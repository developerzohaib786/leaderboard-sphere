'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../components/NavbarComponent';

const chatRooms = [
    {
        id: 'general-room',
        title: 'General Room',
        description: 'A casual space for general discussions, questions, and connecting with the community.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        color: 'from-lime-400 to-green-500',
        href: '/chat-community/general-room',
    },
    {
        id: 'github-issues-room',
        title: 'GitHub Issues Room',
        description: 'Discuss GitHub issues, bug reports, and collaborate on open source problem solving.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
        ),
        color: 'from-purple-400 to-pink-500',
        href: '/chat-community/github-issues-room',
    },
    {
        id: 'gsoc-org-discussion-room',
        title: 'GSOC Org Discussion Room',
        description: 'Connect with mentors and students to discuss Google Summer of Code organizations and projects.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx={9} cy={7} r={4} />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        color: 'from-blue-400 to-cyan-500',
        href: '/chat-community/gsoc-org-discussion-room',
    },
    {
        id: 'project-showcase-room',
        title: 'Project Showcase Room',
        description: 'Share your projects, get feedback, and discover amazing work from the community.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <rect x={2} y={3} width={20} height={14} rx={2} ry={2} />
                <line x1={8} y1={21} x2={16} y2={21} />
                <line x1={12} y1={17} x2={12} y2={21} />
            </svg>
        ),
        color: 'from-orange-400 to-red-500',
        href: '/chat-community/project-showcase-room',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

export default function ChatCommunityPage() {
    return (
        <section className="min-h-screen bg-black text-white">
            <Navbar />

            {/* Hero Section */}
            <div className="pt-12 pb-16 px-4 lg:px-16">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                            Chat <span className="text-lime-400">Community</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                            Join our vibrant community spaces. Connect, collaborate, and share ideas with developers worldwide.
                        </p>
                    </motion.div>

                    {/* Chat Rooms Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
                    >
                        {chatRooms.map((room) => (
                            <motion.div
                                key={room.id}
                                variants={cardVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link href={room.href}>
                                    <div className="group relative bg-neutral-900/70 backdrop-blur border border-white/15 rounded-2xl p-6 h-full overflow-hidden transition-all duration-300 hover:border-lime-400/50 hover:shadow-xl hover:shadow-lime-400/10">
                                        {/* Gradient Overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${room.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                        {/* Content */}
                                        <div className="relative z-10">
                                            {/* Icon */}
                                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${room.color} mb-4 text-black`}>
                                                {room.icon}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-2xl font-bold mb-3 group-hover:text-lime-400 transition-colors duration-300">
                                                {room.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-400 mb-4 leading-relaxed">
                                                {room.description}
                                            </p>

                                            {/* Enter Button */}
                                            <div className="flex items-center gap-2 text-lime-400 font-medium group-hover:gap-4 transition-all duration-300">
                                                <span>Enter Room</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width={20}
                                                    height={20}
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="transition-transform group-hover:translate-x-1"
                                                >
                                                    <line x1={5} y1={12} x2={19} y2={12} />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Corner Decoration */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 rounded-full blur-3xl group-hover:bg-lime-400/10 transition-all duration-300 -translate-y-16 translate-x-16" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Additional Info Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-16 text-center"
                    >
                        <div className="bg-neutral-900/70 backdrop-blur border border-white/15 rounded-2xl p-8 max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold mb-4">Community Guidelines</h2>
                            <p className="text-gray-400 mb-4">
                                Our chat community thrives on respect, collaboration, and shared learning.
                                Please be kind, helpful, and constructive in all interactions.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-2 h-2 bg-lime-400 rounded-full" />
                                    <span>Real-time messaging</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-2 h-2 bg-lime-400 rounded-full" />
                                    <span>Active community</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-2 h-2 bg-lime-400 rounded-full" />
                                    <span>Open discussions</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
