import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Mail, Award, MapPin, Edit2, Save, X, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authAPI.getProfile();
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    location: data.location || ''
                });
            } catch (error) {
                console.error("Failed to load profile", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            const updated = await authAPI.updateProfile(formData);
            setProfile(updated);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </main>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="secondary" className="flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-red-600">
                                <X className="w-4 h-4" /> Cancel
                            </Button>
                            <Button onClick={handleSave} className="flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 p-6 text-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-12 h-12 text-green-600" />
                        </div>

                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="text-xl font-bold text-center border-b-2 border-green-500 focus:outline-none w-full mb-2"
                                placeholder="Your Name"
                            />
                        ) : (
                            <h2 className="text-xl font-bold">{profile.name}</h2>
                        )}

                        <p className="text-gray-500 mb-4">{profile.email}</p>

                        <div className="flex justify-center gap-2">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1">
                                <Award className="w-3 h-3" /> Gold Contributor
                            </span>
                        </div>
                    </Card>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 bg-blue-50">
                                <p className="text-gray-600 text-sm">Reports Submitted</p>
                                <p className="text-2xl font-bold text-blue-600">{profile.reportsSubmitted || 0}</p>
                            </Card>
                            <Card className="p-4 bg-green-50">
                                <p className="text-gray-600 text-sm">Eco Points Earned</p>
                                <p className="text-2xl font-bold text-green-600">{profile.points || 0}</p>
                            </Card>
                        </div>

                        <Card className="p-6">
                            <h3 className="font-bold mb-4">Account Settings</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4" /> Join Date</span>
                                    <span>{profile.memberSince}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4" /> Primary Location</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="text-right border-b border-gray-300 focus:border-green-500 focus:outline-none"
                                            placeholder="e.g. Downtown"
                                        />
                                    ) : (
                                        <span>{profile.location}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-gray-600 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</span>
                                    <span className="text-gray-500">{profile.email}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}