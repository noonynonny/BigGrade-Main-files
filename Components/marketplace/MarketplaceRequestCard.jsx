
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, HelpCircle, GraduationCap, Users, Globe, Zap, Check, X, MessageSquare, Award } from "lucide-react";
import { format } from "date-fns";

export default function MarketplaceRequestCard({ request, currentUser, isMyGigsView }) {
  const queryClient = useQueryClient();

  // Check if current user has already vouched
  const { data: vouchData } = useQuery({
    queryKey: ['vouchStatus', request.id, currentUser?.email],
    queryFn: () => base44.entities.Vouch.filter({ gig_id: request.id, voucher_email: currentUser?.email }),
    enabled: !!currentUser?.email && request.status === 'completed'
  });

  const hasVouched = vouchData && vouchData.length > 0;

  const handleAccept = useMutation({
    mutationFn: async () => {
      // FORCE START SESSION - NO CHECKS
      const updateData = {
        status: 'in_session',
        responder_email: currentUser.email,
        responder_name: currentUser.full_name,
        session_start_time: new Date().toISOString(),
        session_force_started: true
      };

      await base44.entities.MarketplaceRequest.update(request.id, updateData);
      
      // Send notification to student to join session immediately
      await base44.entities.SessionNotification.create({
        gig_id: request.id,
        recipient_email: request.author_email,
        notification_type: 'tutor_accepted',
        message: `${currentUser.full_name} accepted your request! Join the session NOW!`,
        redirect_to_session: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
      
      // Redirect helper to session chat immediately
      window.location.href = createPageUrl(`SessionChat?gig=${request.id}`);
    },
    onError: (error) => {
      alert(`❌ ${error.message}`);
    }
  });

  const handleStatusUpdate = useMutation({
    mutationFn: (status) => base44.entities.MarketplaceRequest.update(request.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
    },
  });
  
  // Vouch system with STRICT restrictions
  const handleVouch = useMutation({
    mutationFn: async () => {
      // RESTRICTION 1: Check session duration (must be >= 10 minutes)
      if (!request.session_duration_minutes || request.session_duration_minutes < 10) {
        throw new Error("❌ Cannot vouch: Session must be at least 10 minutes long.");
      }
      
      // RESTRICTION 2: Check daily vouch limit (1 per day TOTAL)
      const today = new Date().toISOString().split('T')[0];
      const todaysVouches = await base44.entities.Vouch.filter({ 
        voucher_email: currentUser.email,
        vouch_date: today
      });
      
      if (todaysVouches.length > 0) {
        throw new Error("❌ You've already vouched someone today. Come back tomorrow!");
      }
      
      const helper = await base44.entities.User.filter({ email: request.responder_email });
      const student = await base44.entities.User.filter({ email: request.author_email });
      
      if (!helper || helper.length === 0 || !student || student.length === 0) {
        throw new Error("User not found");
      }
      
      const helperUser = helper[0];
      const studentUser = student[0];
      const isVoucherStudent = currentUser.user_type === 'student';
      const isVoucherTutor = currentUser.user_type === 'tutor';
      
      let vouchType = '';
      const pointsToAdd = 5; // ALWAYS 5 POINTS
      
      // Student vouching for helper
      if (isVoucherStudent && currentUser.email === request.author_email) {
        if (helperUser.user_type === 'tutor') {
          vouchType = 'tutor_rating';
          await base44.entities.User.update(helperUser.id, { 
            tutor_rating: (helperUser.tutor_rating || 0) + pointsToAdd 
          });
          
          // Update PublicUserDirectory
          const publicUsers = await base44.entities.PublicUserDirectory.filter({ user_email: helperUser.email });
          if (publicUsers.length > 0) {
            await base44.entities.PublicUserDirectory.update(publicUsers[0].id, { 
              tutor_rating: (helperUser.tutor_rating || 0) + pointsToAdd 
            });
          }
        } else if (helperUser.user_type === 'student') {
          vouchType = 'peer_points';
          await base44.entities.User.update(helperUser.id, { 
            peer_points: (helperUser.peer_points || 0) + pointsToAdd 
          });
          
          // Update PublicUserDirectory
          const publicUsers = await base44.entities.PublicUserDirectory.filter({ user_email: helperUser.email });
          if (publicUsers.length > 0) {
            await base44.entities.PublicUserDirectory.update(publicUsers[0].id, { 
              peer_points: (helperUser.peer_points || 0) + pointsToAdd 
            });
          }
        }
      }
      
      // Tutor vouching for student
      if (isVoucherTutor && currentUser.email === request.responder_email) {
        vouchType = 'student_rating';
        await base44.entities.User.update(studentUser.id, { 
          student_rating: (studentUser.student_rating || 0) + pointsToAdd 
        });
        
        // Update PublicUserDirectory
        const publicUsers = await base44.entities.PublicUserDirectory.filter({ user_email: studentUser.email });
        if (publicUsers.length > 0) {
          await base44.entities.PublicUserDirectory.update(publicUsers[0].id, { 
            student_rating: (studentUser.student_rating || 0) + pointsToAdd 
          });
        }
      }
      
      return base44.entities.Vouch.create({
        gig_id: request.id,
        voucher_email: currentUser.email,
        vouchee_email: currentUser.email === request.author_email ? request.responder_email : request.author_email,
        vouch_type: vouchType,
        vouch_date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchStatus'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] }); // Added
      queryClient.invalidateQueries({ queryKey: ['allUsersDirectory'] }); // Added
      queryClient.invalidateQueries({ queryKey: ['allUsersForLeaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['publicLeaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['directoryAllUsers'] });
      alert('✅ Vouch successful! +5 points awarded!');
    },
    onError: (error) => {
      alert(error.message); // Changed to display error.message directly
    }
  });

  const isMyPost = request.author_email === currentUser?.email;
  const canAccept = !isMyPost && request.status === 'open';
  const isAcceptedByMe = request.responder_email === currentUser?.email;

  const typeConfig = {
    seeking_help: { icon: HelpCircle, text: "NEEDS HELP", bg: "bg-[#FF0080]" },
  };
  
  const TypeIcon = typeConfig[request.request_type].icon;

  // Vouch button logic - STRICT CONDITIONS (10 minutes now)
  const canVouch = request.status === 'completed' && 
                   !hasVouched && 
                   (isMyPost || isAcceptedByMe) && 
                   request.session_duration_minutes >= 10;
  
  let vouchButtonText = "VOUCH";
  let canShowVouchButton = false;
  
  if (isMyPost && currentUser?.user_type === 'student') {
    vouchButtonText = "VOUCH FOR HELPER (+5 PTS)";
    canShowVouchButton = true;
  } else if (isAcceptedByMe && currentUser?.user_type === 'tutor') {
    vouchButtonText = "VOUCH FOR STUDENT (+5 PTS)";
    canShowVouchButton = true;
  }

  return (
    <div className={`brutalist-card p-6 flex flex-col justify-between ${request.status !== 'open' ? 'bg-gray-200' : 'bg-white'}`}>
      <div>
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 border-3 border-black font-black text-xs uppercase text-white ${typeConfig[request.request_type].bg}`}>
            <TypeIcon className="w-4 h-4" />
            {typeConfig[request.request_type].text}
          </div>
          <div className={`px-3 py-1 border-3 border-black font-black text-xs uppercase ${
            request.compensation_type === 'free' ? 'bg-[#00FF41] text-black' : 
            request.compensation_type === 'paid' ? 'bg-[#FFE500] text-black' : 
            'bg-gray-300 text-black'
          }`}>
            {request.compensation_type}
            {request.compensation_type === 'paid' && request.offered_price && (
              <span className="ml-1">- {request.offered_price}</span>
            )}
          </div>
        </div>
        
        {request.help_from && (
          <div className={`flex items-center gap-2 px-3 py-1 border-2 border-black font-black text-xs uppercase mb-3 ${
            request.help_from === 'tutor' ? 'bg-[#B026FF]' : 
            request.help_from === 'student' ? 'bg-[#00D9FF]' : 
            'bg-[#00FF41]'
          } text-white`}>
            {request.help_from === 'tutor' && <GraduationCap className="w-4 h-4" />}
            {request.help_from === 'student' && <Users className="w-4 h-4" />}
            {request.help_from === 'anyone' && <Globe className="w-4 h-4" />}
            {request.help_from.toUpperCase()}
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-4">
          <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(request.author_email)}`)}>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF0080] to-[#B026FF] rounded-full border-3 border-black flex items-center justify-center overflow-hidden">
                {request.author_avatar_url ? <img src={request.author_avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-white" />}
            </div>
          </Link>
          <div>
            <h4 className="font-black text-black uppercase">{request.author_name}</h4>
            <p className="text-xs font-bold text-gray-500">{format(new Date(request.created_date), "MMM d, yyyy")}</p>
          </div>
        </div>

        <h3 className="text-xl font-black text-black uppercase mb-2">{request.title}</h3>
        <p className="text-sm font-bold text-black mb-4">{request.description}</p>
        <div className="px-3 py-1 bg-black text-white border-2 border-white font-black text-sm uppercase w-fit">{request.subject}</div>
      </div>
      
      <div className="pt-4 border-t-4 border-black mt-4">
        {canAccept && (
          <button 
            onClick={() => handleAccept.mutate()} 
            disabled={handleAccept.isPending} 
            className="brutalist-button bg-gradient-to-r from-[#00FF41] to-[#00D9FF] text-black w-full flex items-center justify-center gap-2 py-3"
          >
            <Zap className="w-5 h-5"/> {handleAccept.isPending ? 'STARTING...' : '⚡ START SESSION NOW'}
          </button>
        )}
        
        {request.status === 'in_session' && (isMyPost || isAcceptedByMe) && (
          <Link 
            to={createPageUrl(`SessionChat?gig=${request.id}`)}
            className="brutalist-button bg-gradient-to-r from-[#FF0080] to-[#B026FF] text-white w-full flex items-center justify-center gap-2 py-3"
          >
            <MessageSquare className="w-5 h-5"/> 🔒 REJOIN SESSION
          </Link>
        )}

        {request.status === 'awaiting_payment' && (isMyPost || isAcceptedByMe) && (
          <Link 
            to={createPageUrl(`SessionChat?gig=${request.id}`)}
            className="brutalist-button bg-gradient-to-r from-[#FFE500] to-[#FFB627] text-black w-full flex items-center justify-center gap-2 py-3"
          >
            <MessageSquare className="w-5 h-5"/> 💰 COMPLETE PAYMENT
          </Link>
        )}

        {isMyPost && request.status === 'open' && (
          <button onClick={() => handleStatusUpdate.mutate('cancelled')} className="brutalist-button bg-gray-500 text-white w-full flex items-center justify-center gap-2 py-3 mt-2">
            <X className="w-5 h-5"/> CANCEL POST
          </button>
        )}

        {/* Vouch Button - Only show if ALL conditions met */}
        {canVouch && canShowVouchButton && (
            <button onClick={() => handleVouch.mutate()} disabled={handleVouch.isPending} className="mt-2 brutalist-button bg-gradient-to-r from-[#FFE500] to-[#FFB627] text-black w-full flex items-center justify-center gap-2 py-3">
                <Award className="w-5 h-5"/> {handleVouch.isPending ? 'VOUCHING...' : vouchButtonText}
            </button>
        )}
        
        {/* Session Too Short Warning */}
        {request.status === 'completed' && request.session_duration_minutes < 10 && (isMyPost || isAcceptedByMe) && (
            <div className="mt-2 text-center p-2 border-3 border-black bg-gray-300">
                <p className="font-black text-xs text-black uppercase">⏱️ SESSION TOO SHORT FOR VOUCHING (NEEDS 10+ MIN)</p>
                <p className="font-bold text-xs text-gray-600 mt-1">Duration: {request.session_duration_minutes} minutes</p>
            </div>
        )}
        
        {/* Already Vouched */}
        {hasVouched && request.status === 'completed' && (
            <div className="mt-2 text-center p-2 border-3 border-black bg-[#00FF41]"><p className="font-black text-sm text-black uppercase flex items-center justify-center gap-2"><Check className="w-5 h-5"/> VOUCHED ✓</p></div>
        )}

        {request.status === 'completed' && !isMyPost && !isAcceptedByMe && (
            <div className="text-center p-2 border-3 border-black bg-[#00FF41]">
                <p className="font-black text-sm text-black uppercase flex items-center justify-center gap-2"><Check className="w-5 h-5"/> GIG COMPLETED</p>
            </div>
        )}
        
        {request.status === 'cancelled' && (
            <div className="text-center p-2 border-3 border-black bg-gray-400">
                <p className="font-black text-sm text-black uppercase">CANCELLED</p>
            </div>
        )}
      </div>
    </div>
  );
}
