import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, User, ArrowUp } from 'lucide-react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import PageTransition from '../components/layout/PageTransition';

const Leaderboard = () => {
    // Mock data for now as efficient user aggregation in NoSQL requires cloud functions 
    // or a dedicated 'users' collection with counters updated on write.
    // In a real production app, we would fetch this from the /users endpoint sorted by points.
    const [users, setUsers] = useState([
        { id: 1, name: "Sarah Jenkins", points: 1250, reports: 12, votes: 45, badges: ["Green Guardian", "Top Scout"], avatar: null },
        { id: 2, name: "David Chen", points: 980, reports: 8, votes: 120, badges: ["Community Voice"], avatar: null },
        { id: 3, name: "Priya Sharma", points: 845, reports: 15, votes: 20, badges: ["Rapid Reporter"], avatar: null },
        { id: 4, name: "Mike Ross", points: 720, reports: 5, votes: 80, badges: [], avatar: null },
        { id: 5, name: "Emma Watson", points: 650, reports: 6, votes: 40, badges: [], avatar: null },
    ]);

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-display">GreenPulse Leaderboard</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Celebrating our top contributors who are making a real difference. Earn Green Credits by reporting issues and voting on community proposals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Top 3 Cards */}
                        <div className="md:col-start-2 order-first md:order-none">
                            <Card className="p-6 border-t-8 border-yellow-400 bg-gradient-to-b from-yellow-50 to-white relative overflow-visible transform md:-translate-y-4">
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-gray-500 border-2 border-yellow-200">
                                        {users[0].avatar ? <img src={users[0].avatar} alt="" className="w-full h-full rounded-full" /> : users[0].name.charAt(0)}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{users[0].name}</h3>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className="text-yellow-600 font-bold">{users[0].points} GC</span>
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">#1</span>
                                    </div>
                                    <div className="mt-4 flex justify-center gap-2">
                                        {users[0].badges.map((b, i) => (
                                            <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">{b}</span>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="md:mt-4">
                            <Card className="p-6 border-t-4 border-gray-300 relative">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white shadow">
                                        <span className="font-bold text-white">2</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-gray-400">
                                        {users[1].name.charAt(0)}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{users[1].name}</h3>
                                    <div className="text-primary-600 font-bold">{users[1].points} GC</div>
                                </div>
                            </Card>
                        </div>

                        <div className="md:mt-4">
                            <Card className="p-6 border-t-4 border-orange-400 relative">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center border-2 border-white shadow">
                                        <span className="font-bold text-white">3</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-gray-400">
                                        {users[2].name.charAt(0)}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{users[2].name}</h3>
                                    <div className="text-primary-600 font-bold">{users[2].points} GC</div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reports</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Votes</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Points (GC)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {index < 3 ? (
                                                        <Medal className={`w-5 h-5 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`} />
                                                    ) : (
                                                        <span className="text-gray-500 font-medium ml-1">#{index + 1}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold mr-3">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.reports}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.votes}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span className="text-sm font-bold text-primary-600">{user.points}</span>
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </Container>
            </div>
        </PageTransition>
    );
};

export default Leaderboard;
