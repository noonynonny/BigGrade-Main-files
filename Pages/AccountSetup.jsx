
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Book, Shield, ArrowRight } from 'lucide-react';

export default function AccountSetup() {
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [credentials, setCredentials] = useState('');

    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me(),
    });

    const setupMutation = useMutation({
        mutationFn: async (data) => {
            // Update user
            await base44.auth.updateMe(data);
            
            // Add to public directory
            const updatedUser = await base44.auth.me();
            await base44.entities.PublicUserDirectory.create({
                user_email: updatedUser.email,
                user_id: updatedUser.id,
                full_name: updatedUser.full_name || updatedUser.email.split('@')[0],
                user_type: data.user_type,
                avatar_url: updatedUser.avatar_url || '',
                last_active: new Date().toISOString(),
                tutor_rating: 0,
                student_rating: 0,
                peer_points: 0,
                is_qualified_teacher: data.is_qualified_teacher || false,
                role: updatedUser.role
            });
        },
        onSuccess: () => {
            // Invalidate ALL relevant queries
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['directoryAllUsers'] });
            queryClient.invalidateQueries({ queryKey: ['publicLeaderboard'] });
            queryClient.invalidateQueries({ queryKey: ['allUsersDirectory'] });
            queryClient.invalidateQueries({ queryKey: ['allUsersForLeaderboard'] });
        }
    });

    // Check if current user is admin email
    React.useEffect(() => {
        const checkAdminStatus = async () => {
            if (currentUser && currentUser.email.toLowerCase() === 'arcanimater@gmail.com') {
                // Auto-setup as admin - no user type needed
                setupMutation.mutate({
                    is_setup_complete: true,
                    full_name: 'Site Administrator',
                    user_type: 'student' // Set a default but admin won't use it
                });
            }
        };
        checkAdminStatus();
    }, [currentUser]);

    const handleStudentSelect = () => {
        setupMutation.mutate({ 
            user_type: 'student',
            is_setup_complete: true
        });
    };

    const handleTutorSelect = () => {
        setSelectedType('tutor');
        setStep(2);
    };
    
    const handleTeacherSubmit = (e) => {
        e.preventDefault();
        setupMutation.mutate({
            user_type: 'tutor',
            is_qualified_teacher: true,
            teaching_credentials: credentials,
            is_setup_complete: true
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
            <div className="w-full max-w-2xl text-center">
                <h1 className="text-6xl font-black uppercase neon-text mb-4" style={{ color: 'var(--primary)' }}>
                    WELCOME TO BIGGRADE
                </h1>
                <p className="text-2xl font-bold text-white mb-4">
                    The ultimate platform for students and tutors to connect and learn together.
                </p>
                <p className="text-lg font-bold text-white mb-12 text-[var(--accent)]">
                    ⚠️ THIS CHOICE IS PERMANENT - CHOOSE CAREFULLY ⚠️
                </p>

                {step === 1 ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        <button onClick={handleStudentSelect} disabled={setupMutation.isPending} className="brutalist-card p-8 group hover:!bg-[var(--primary)] transition-all">
                            <Book className="w-24 h-24 mx-auto mb-6 text-black group-hover:text-white transition-colors" />
                            <h2 className="text-4xl font-black text-black uppercase group-hover:text-white transition-colors">I'm a Student</h2>
                            <p className="font-bold text-black mt-2 group-hover:text-white transition-colors">I'm here to learn, collaborate, and find expert help when I need it.</p>
                        </button>
                        <button onClick={handleTutorSelect} disabled={setupMutation.isPending} className="brutalist-card p-8 group hover:!bg-[var(--secondary)] transition-all">
                            <Shield className="w-24 h-24 mx-auto mb-6 text-black group-hover:text-white transition-colors" />
                            <h2 className="text-4xl font-black text-black uppercase group-hover:text-white transition-colors">I'm a Tutor</h2>
                            <p className="font-bold text-black mt-2 group-hover:text-white transition-colors">I'm here to share my knowledge and offer my expertise to others.</p>
                        </button>
                    </div>
                ) : (
                    <div className="brutalist-card p-8 text-left">
                        <h2 className="text-4xl font-black text-black uppercase mb-4">Tutor Setup</h2>
                        <p className="font-bold text-black mb-6">
                            Awesome! To finalize your tutor profile, please provide some information about your qualifications. This will be shown on your profile.
                        </p>
                        <form onSubmit={handleTeacherSubmit}>
                            <label className="block font-black text-black uppercase mb-2">Teaching Credentials *</label>
                            <textarea
                                value={credentials}
                                onChange={(e) => setCredentials(e.target.value)}
                                className="brutalist-input w-full px-4 py-3 font-bold h-32 resize-none"
                                placeholder="E.g., 'PhD in Mathematics from State University, 10+ years of teaching experience...'"
                                required
                            />
                            <button
                                type="submit"
                                disabled={setupMutation.isPending}
                                className="mt-6 brutalist-button bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] text-black w-full py-4 flex items-center justify-center gap-2"
                            >
                                {setupMutation.isPending ? "FINALIZING..." : "COMPLETE SETUP"} <ArrowRight className="w-5 h-5"/>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
