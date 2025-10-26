
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Video, CheckCircle, Clock, Lock, DollarSign, AlertTriangle, XCircle, MessageSquare, WifiOff, Award } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function SessionChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const gigId = urlParams.get('gig');
  const [message, setMessage] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(null);
  const [canEndSession, setCanEndSession] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: gig, refetch: refetchGig } = useQuery({
    queryKey: ['sessionGig', gigId],
    queryFn: async () => {
      const gigs = await base44.entities.MarketplaceRequest.filter({ id: gigId });
      return gigs[0];
    },
    enabled: !!gigId,
    refetchInterval: 2000,
    staleTime: 1000,
  });

  // CRITICAL: Get helper's user type to determine session rules
  // Session type is determined by WHO ACCEPTS:
  // - Student accepts → Peer session
  // - Tutor accepts → Tutor session
  const { data: helperUser } = useQuery({
    queryKey: ['helperUser', gig?.responder_email],
    queryFn: async () => {
      if (!gig?.responder_email) return null;
      console.log("🔍 Fetching helper (responder) user type for:", gig.responder_email);
      const users = await base44.entities.User.filter({ email: gig.responder_email });
      if (users && users.length > 0) {
        console.log("✅ Helper is a:", users[0].user_type);
        return users[0];
      }
      console.log("❌ Helper user not found");
      return null;
    },
    enabled: !!gig?.responder_email,
    refetchInterval: 3000, // Keep checking
    staleTime: 1000,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['sessionMessages', gigId],
    queryFn: () => base44.entities.SessionChat.filter({ gig_id: gigId }, 'created_date', 100),
    enabled: !!gigId,
    refetchInterval: 1000,
    staleTime: 500,
    initialData: [],
  });

  // Determine session rules based on WHO ACCEPTED (helper/responder type)
  // CRITICAL: Session type = responder's user_type
  const isPeerSession = helperUser?.user_type === 'student'; // Student accepted = peer session
  const isTutorSession = helperUser?.user_type === 'tutor';  // Tutor accepted = tutor session
  
  // TIMING RULES: 30 seconds to leave, 3 minutes to vouch (for ALL sessions)
  const minMinutesToEnd = 0.5; // 30 seconds = 0.5 minutes
  const minMinutesToVouch = 3; // 3 minutes for ALL sessions

  console.log("📊 SESSION TYPE DETERMINATION:");
  console.log("   Responder (helper) email:", gig?.responder_email);
  console.log("   Responder (helper) type:", helperUser?.user_type);
  console.log("   → Is Peer Session:", isPeerSession);
  console.log("   → Is Tutor Session:", isTutorSession);
  console.log("   Request help_from:", gig?.help_from);

  // 40-SECOND PAYMENT TIMER for paid sessions (only tutors, not peers)
  useEffect(() => {
    // Payment flow ONLY for TUTOR sessions that are marked as paid
    if (gig?.status === 'in_session' && 
        gig?.link_confirmed && 
        gig?.compensation_type === 'paid' &&
        !gig?.payment_instructions_sent &&
        isTutorSession && // ONLY tutors handle paid sessions
        user?.email === gig?.responder_email) {
      
      const interval = setInterval(() => {
        const now = Date.now();
        const startTime = new Date(gig.session_start_time).getTime();
        const elapsed = now - startTime;
        const fortySeconds = 40 * 1000;
        const remaining = Math.max(0, fortySeconds - elapsed);
        
        setPaymentTimer(remaining);
        
        // Show payment modal after 40 seconds
        if (remaining === 0) {
          setShowPaymentModal(true);
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setPaymentTimer(null);
      setShowPaymentModal(false);
    }
  }, [gig?.status, gig?.link_confirmed, gig?.compensation_type, gig?.payment_instructions_sent, user?.email, gig?.responder_email, gig?.session_start_time, isTutorSession]);

  // COUNTDOWN TIMER - 30 seconds to end (same for all)
  useEffect(() => {
    if (gig?.status === 'in_session' && gig?.session_start_time && gig?.link_confirmed) {
      const interval = setInterval(() => {
        const now = Date.now();
        const startTime = new Date(gig.session_start_time).getTime();
        const elapsed = now - startTime;
        const minTime = minMinutesToEnd * 60 * 1000;
        const remaining = Math.max(0, minTime - elapsed);
        
        setSessionTimeRemaining(remaining);
        
        // Enable end session button after minimum time
        if (remaining === 0 && !canEndSession) {
          setCanEndSession(true);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gig?.status, gig?.session_start_time, gig?.link_confirmed, canEndSession, minMinutesToEnd]);

  // Check if other party ended the session
  useEffect(() => {
    if (gig?.status === 'completed' && gig?.session_ended_by_email && gig?.session_ended_by_email !== user?.email) {
      alert(`📢 ${gig.session_ended_by_name} has ended the session!`);
    }
  }, [gig?.status, gig?.session_ended_by_email, gig?.session_ended_by_name, user?.email]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.SessionChat.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionMessages', gigId] });
      setMessage("");
    },
  });

  const sendMeetingLinkMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.MarketplaceRequest.update(gigId, {
        meeting_link: meetingLink,
        status: 'in_session',
        session_start_time: new Date().toISOString(),
        link_confirmed: false
      });
      
      await base44.entities.SessionChat.create({
        gig_id: gigId,
        sender_email: 'system',
        sender_name: 'System',
        message: `📹 Meeting link shared! Student, please confirm you received it.`,
        message_type: 'system'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionGig', gigId] });
      queryClient.invalidateQueries({ queryKey: ['sessionMessages', gigId] });
      setMeetingLink("");
    },
  });

  const confirmLinkMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.MarketplaceRequest.update(gigId, {
        link_confirmed: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionGig', gigId] });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const sessionEndTime = new Date().toISOString();
      const sessionStartTime = new Date(gig.session_start_time).getTime();
      const sessionEndTimeMs = new Date(sessionEndTime).getTime();
      const durationMinutes = Math.floor((sessionEndTimeMs - sessionStartTime) / 60000);
      
      await base44.entities.MarketplaceRequest.update(gigId, {
        status: 'completed',
        session_end_time: sessionEndTime,
        session_duration_minutes: durationMinutes,
        session_ended_by_email: user.email,
        session_ended_by_name: user.full_name
      });
      
      await base44.entities.SessionChat.create({
        gig_id: gigId,
        sender_email: 'system',
        sender_name: 'System',
        message: `✅ ${user.full_name} ended the session after ${durationMinutes} minutes! ${durationMinutes >= minMinutesToVouch ? 'You can now vouch if you enjoyed the session!' : `Session was too short for vouching (needs ${minMinutesToVouch}+ min).`}`,
        message_type: 'system'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionGig', gigId] });
      queryClient.invalidateQueries({ queryKey: ['sessionMessages', gigId] });
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
    },
  });

  const sendPaymentInstructionsMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.MarketplaceRequest.update(gigId, {
        payment_instructions: paymentInstructions,
        payment_instructions_sent: true
      });
      
      await base44.entities.SessionChat.create({
        gig_id: gigId,
        sender_email: 'system',
        sender_name: 'System',
        message: `💰 ${user.full_name} sent payment instructions to ${gig.author_name}.`,
        message_type: 'system'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionGig', gigId] });
      queryClient.invalidateQueries({ queryKey: ['sessionMessages', gigId] });
      setShowPaymentModal(false);
      setPaymentInstructions("");
    },
  });

  const studentPaidMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.MarketplaceRequest.update(gigId, {
        student_paid: true
      });
      
      await base44.entities.SessionChat.create({
        gig_id: gigId,
        sender_email: 'system',
        sender_name: 'System',
        message: `✅ ${user.full_name} confirmed payment sent! Waiting for ${gig.responder_name} to confirm receipt.`,
        message_type: 'system'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionGig', gigId] });
      queryClient.invalidateQueries({ queryKey: ['sessionMessages', gigId] });
    },
  });

  const tutorConfirmedPaymentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.MarketplaceRequest.update(gigId, {
        tutor_confirmed_payment: true
      });
      
      await base44.entities.SessionChat.create({
        gig_id: gigId,
        sender_email: 'system',
        sender_name: 'System',
        message: `💵 ${user.full_name} confirmed payment received! Session can now proceed normally.`,
        message_type: 'system'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionGig', gigId] });
      queryClient.invalidateQueries({ queryKey: ['sessionMessages', gigId] });
    },
  });

  // Check if current user has already vouched
  const { data: vouchData } = useQuery({
    queryKey: ['vouchStatus', gigId, user?.email],
    queryFn: () => base44.entities.Vouch.filter({ gig_id: gigId, voucher_email: user?.email }),
    enabled: !!user?.email && gig?.status === 'completed'
  });

  const hasVouched = vouchData && vouchData.length > 0;

  // Vouch mutation with STRICT daily limit and consistent 5-point rewards
  const handleVouchMutation = useMutation({
    mutationFn: async () => {
      // RESTRICTION 1: Check session duration (3 minutes for ALL sessions)
      if (!gig.session_duration_minutes || gig.session_duration_minutes < minMinutesToVouch) {
        throw new Error(`❌ Cannot vouch: Session must be at least ${minMinutesToVouch} minutes long.`);
      }
      
      // RESTRICTION 2: Check daily vouch limit (1 per day TOTAL)
      const today = new Date().toISOString().split('T')[0];
      const todaysVouches = await base44.entities.Vouch.filter({ 
        voucher_email: user.email,
        vouch_date: today
      });
      
      if (todaysVouches.length > 0) {
        throw new Error("❌ You've already vouched someone today. Come back tomorrow!");
      }
      
      // RESTRICTION 3: Peer session - only student can vouch peer
      if (isPeerSession) {
        const isStudent = user.email === gig.author_email;
        const isPeerHelper = user.email === gig.responder_email;
        
        if (isPeerHelper) {
          throw new Error("❌ Peer helpers cannot vouch students. Only students can vouch their peer helpers!");
        }
        
        if (!isStudent) {
          throw new Error("❌ Invalid vouch scenario.");
        }
      }
      
      const helper = await base44.entities.User.filter({ email: gig.responder_email });
      const student = await base44.entities.User.filter({ email: gig.author_email });
      
      if (!helper || helper.length === 0 || !student || student.length === 0) {
        throw new Error("User not found");
      }
      
      const helperUserData = helper[0];
      const studentUser = student[0];
      const isVoucherStudent = user.user_type === 'student' && user.email === gig.author_email;
      const isVoucherTutor = user.user_type === 'tutor' && user.email === gig.responder_email;
      
      let vouchType = '';
      const pointsToAdd = 5; // ALWAYS 5 POINTS
      let voucheeEmail = '';
      let voucheeName = '';
      
      console.log("🎖️ Vouch attempt:", {
        isPeerSession,
        isTutorSession,
        helperType: helperUserData.user_type,
        voucherType: user.user_type,
        isVoucherStudent,
        isVoucherTutor
      });
      
      // Student vouching for helper
      if (isVoucherStudent) {
        voucheeEmail = gig.responder_email;
        voucheeName = gig.responder_name;
        
        if (helperUserData.user_type === 'tutor') {
          // Student → Tutor = tutor_rating
          vouchType = 'tutor_rating';
          console.log("✅ Student vouching tutor: +5 tutor_rating");
          await base44.entities.User.update(helperUserData.id, { 
            tutor_rating: (helperUserData.tutor_rating || 0) + pointsToAdd 
          });
          
          // Update PublicUserDirectory
          const publicUsers = await base44.entities.PublicUserDirectory.filter({ user_email: helperUserData.email });
          if (publicUsers.length > 0) {
            await base44.entities.PublicUserDirectory.update(publicUsers[0].id, { 
              tutor_rating: (helperUserData.tutor_rating || 0) + pointsToAdd 
            });
          }
        } else if (helperUserData.user_type === 'student') {
          // Student → Peer = peer_points
          vouchType = 'peer_points';
          console.log("✅ Student vouching peer: +5 peer_points");
          await base44.entities.User.update(helperUserData.id, { 
            peer_points: (helperUserData.peer_points || 0) + pointsToAdd 
          });
          
          // Update PublicUserDirectory
          const publicUsers = await base44.entities.PublicUserDirectory.filter({ user_email: helperUserData.email });
          if (publicUsers.length > 0) {
            await base44.entities.PublicUserDirectory.update(publicUsers[0].id, { 
              peer_points: (helperUserData.peer_points || 0) + pointsToAdd 
            });
          }
        }
      }
      
      // Tutor vouching for student
      if (isVoucherTutor) {
        voucheeEmail = gig.author_email;
        voucheeName = gig.author_name;
        
        // Tutor → Student = student_rating
        vouchType = 'student_rating';
        console.log("✅ Tutor vouching student: +5 student_rating");
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

      if (!voucheeEmail || !vouchType) {
        throw new Error("Invalid vouch scenario or user types.");
      }
      
      // Create vouch record
      return base44.entities.Vouch.create({
        gig_id: gigId,
        voucher_email: user.email,
        vouchee_email: voucheeEmail,
        vouch_type: vouchType,
        vouch_date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchStatus'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersDirectory'] });
      queryClient.invalidateQueries({ queryKey: ['publicLeaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['directoryAllUsers'] });
      alert(`✅ Vouch successful! +5 points awarded!`);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    sendMessageMutation.mutate({
      gig_id: gigId,
      sender_email: user.email,
      sender_name: user.full_name,
      message: message.trim()
    });
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!gig) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#00D9FF] border-t-[#FF0080] rounded-full animate-spin"></div>
      </div>
    );
  }

  const isHelper = gig.responder_email === user?.email;
  const isStudent = gig.author_email === user?.email;
  const otherUser = isHelper ? gig.author_name : gig.responder_name;
  const canLeave = gig.status === 'completed' || gig.status === 'cancelled';

  // Derived payment status variables
  const isPaidSession = gig?.compensation_type === 'paid' && isTutorSession; // Only tutors can have paid sessions
  const paymentComplete = gig?.student_paid && gig?.tutor_confirmed_payment;
  // Session can proceed normally if it's not a paid session, or if it is a paid session and payment is complete
  const canProceedWithSession = !isPaidSession || paymentComplete;

  // Determine if current user can vouch
  const canShowVouchButton = () => {
    if (isPeerSession) {
      // Only student can vouch peer
      return isStudent;
    } else {
      // Tutor session: both can vouch
      return true;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Session Type Indicator */}
      <div className="brutalist-card p-4 bg-gradient-to-r from-[#FF0080] to-[#B026FF]">
        <p className="font-black text-2xl text-white text-center uppercase">
          {isPeerSession && "🤝 PEER-TO-PEER SESSION"}
          {isTutorSession && "🎓 PROFESSIONAL TUTOR SESSION"}
          {!isPeerSession && !isTutorSession && "⏳ DETECTING SESSION TYPE..."}
        </p>
        {helperUser && (
          <p className="font-bold text-lg text-white text-center mt-1">
            Helper: {gig.responder_name} ({helperUser.user_type.toUpperCase()})
          </p>
        )}
      </div>

      {/* Payment Modal - Tutor sends instructions after 40 seconds */}
      {showPaymentModal && user?.email === gig?.responder_email && isPaidSession && !gig?.payment_instructions_sent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="brutalist-card p-8 max-w-lg w-full">
            <h3 className="text-3xl font-black text-black uppercase mb-4">💰 PAYMENT REQUIRED</h3>
            <p className="font-bold text-black mb-4">
              This is a PAID session. Please provide payment instructions to {otherUser}.
            </p>
            <p className="text-sm font-bold text-gray-600 mb-4">
              Price agreed: {gig.offered_price}
            </p>
            <textarea
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              placeholder="e.g., Venmo: @username, PayPal: email@example.com, Cash App: $username"
              className="brutalist-input w-full px-4 py-3 font-bold h-32 resize-none mb-4"
            />
            <button
              onClick={() => sendPaymentInstructionsMutation.mutate()}
              disabled={!paymentInstructions.trim() || sendPaymentInstructionsMutation.isPending}
              className="brutalist-button bg-[#00FF41] text-black w-full py-3"
            >
              {sendPaymentInstructionsMutation.isPending ? 'SENDING...' : 'SEND PAYMENT INSTRUCTIONS'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Timer - Show tutor countdown to payment instructions */}
      {paymentTimer !== null && paymentTimer > 0 && user?.email === gig?.responder_email && gig?.status === 'in_session' && isPaidSession && !gig?.payment_instructions_sent && (
        <div className="brutalist-card p-6 bg-[#FFE500]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-black" />
              <div>
                <h3 className="text-2xl font-black text-black uppercase">PAYMENT INSTRUCTIONS REQUIRED</h3>
                <p className="font-bold text-black">
                  You'll need to provide payment details in: {formatTime(paymentTimer)}
                </p>
              </div>
            </div>
            <div className="text-6xl font-black text-black">
              {formatTime(paymentTimer)}
            </div>
          </div>
        </div>
      )}

      {/* Payment Instructions - Student receives them */}
      {gig?.payment_instructions_sent && !paymentComplete && gig?.status === 'in_session' && isPaidSession && (
        <div className="brutalist-card p-8 bg-[#FFB627]">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-10 h-10 text-black" />
            <h3 className="text-3xl font-black text-black uppercase">💰 PAYMENT REQUIRED</h3>
          </div>
          
          <div className="p-4 bg-white border-3 border-black mb-4">
            <p className="font-black text-black text-lg mb-2">Amount: {gig.offered_price}</p>
            <p className="font-bold text-black text-lg">Payment Instructions:</p>
            <p className="font-bold text-black text-xl mt-2 whitespace-pre-wrap">{gig.payment_instructions}</p>
          </div>

          {isStudent && !gig.student_paid && (
            <button
              onClick={() => studentPaidMutation.mutate()}
              disabled={studentPaidMutation.isPending}
              className="brutalist-button bg-[#00FF41] text-black w-full py-4 mb-2"
            >
              {studentPaidMutation.isPending ? 'CONFIRMING...' : '✅ I HAVE PAID'}
            </button>
          )}

          {gig.student_paid && isHelper && !gig.tutor_confirmed_payment && (
            <div className="space-y-3">
              <div className="p-4 bg-[#00D9FF] border-3 border-black text-center">
                <p className="font-black text-black text-lg">⏳ STUDENT CLAIMS PAYMENT SENT</p>
                <p className="font-bold text-black mt-2">Please confirm you received the payment</p>
              </div>
              <button
                onClick={() => tutorConfirmedPaymentMutation.mutate()}
                disabled={tutorConfirmedPaymentMutation.isPending}
                className="brutalist-button bg-[#00FF41] text-black w-full py-4"
              >
                {tutorConfirmedPaymentMutation.isPending ? 'CONFIRMING...' : '💵 CONFIRM PAYMENT RECEIVED'}
              </button>
            </div>
          )}

          {gig.student_paid && isStudent && !gig.tutor_confirmed_payment && (
            <div className="p-4 bg-[#00D9FF] border-3 border-black text-center">
              <p className="font-black text-black text-lg">⏳ WAITING FOR TUTOR TO CONFIRM</p>
              <p className="font-bold text-black mt-2">Your tutor will confirm receipt shortly...</p>
            </div>
          )}

          {paymentComplete && (
            <div className="p-4 bg-[#00FF41] border-3 border-black text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-black" />
              <p className="font-black text-black text-2xl uppercase">✅ PAYMENT CONFIRMED!</p>
              <p className="font-bold text-black mt-2">Session can now proceed normally</p>
            </div>
          )}
        </div>
      )}

      {/* Session Timer */}
      {sessionTimeRemaining !== null && gig.status === 'in_session' && canProceedWithSession && (
        <div className={`brutalist-card p-6 ${sessionTimeRemaining > 0 ? 'bg-[#FFE500]' : 'bg-[#00FF41]'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 text-black" />
              <div>
                <h3 className="text-2xl font-black text-black uppercase">
                  {sessionTimeRemaining > 0 ? `SESSION TIMER (${isPeerSession ? 'PEER' : 'TUTOR'})` : "✅ CAN END SESSION!"}
                </h3>
                <p className="font-bold text-black">
                  {sessionTimeRemaining > 0 
                    ? `Time until you can end: ${formatTime(sessionTimeRemaining)} (Need 30s)` 
                    : `You can now end! Stay ${minMinutesToVouch}+ min to vouch.`}
                </p>
              </div>
            </div>
            <div className="text-6xl font-black text-black">
              {sessionTimeRemaining > 0 ? formatTime(sessionTimeRemaining) : "✓"}
            </div>
          </div>
        </div>
      )}

      {/* Lockdown Warning with END SESSION button */}
      {!canLeave && gig.status === 'in_session' && canProceedWithSession && (
        <div className="brutalist-card p-6 bg-[#FF0080] relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Lock className="w-10 h-10 text-white" />
              <div>
                <h3 className="text-2xl font-black text-white uppercase">🔒 SESSION ACTIVE</h3>
                <p className="font-bold text-white">You must use END SESSION button to exit!</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!canEndSession) {
                  alert(`⏱️ You must wait 30 seconds before ending the session!`);
                  return;
                }
                if (window.confirm(`Are you sure you want to end this session? ${gig.session_duration_minutes >= minMinutesToVouch ? 'You will be able to vouch.' : `The session must be ${minMinutesToVouch}+ min for vouching.`}`)) {
                  endSessionMutation.mutate();
                }
              }}
              disabled={endSessionMutation.isPending}
              className={`brutalist-button px-6 py-3 text-xl font-black ${
                canEndSession 
                  ? 'bg-[#00FF41] text-black border-black' 
                  : 'bg-gray-500 text-gray-300 border-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              {endSessionMutation.isPending ? 'ENDING...' : canEndSession ? '✅ END SESSION' : `⏱️ WAIT 30s`}
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="brutalist-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-black uppercase">{gig.title}</h2>
            <p className="text-lg font-bold text-gray-600">
              Session with {otherUser} • {isPeerSession ? '🤝 PEER SESSION' : isTutorSession ? '🎓 TUTOR SESSION' : '❓ SESSION'}
            </p>
          </div>
        </div>
      </div>

      {/* Phase 1: Waiting for Meeting Link */}
      {!gig.meeting_link && isHelper && (
        <div className="brutalist-card p-8 bg-[#FFE500]">
          <div className="flex items-center gap-3 mb-4">
            <Video className="w-8 h-8 text-black" />
            <h3 className="text-2xl font-black text-black uppercase">STEP 1: SHARE MEETING LINK</h3>
          </div>
          <p className="font-bold text-black mb-4">
            Provide a Google Meet or Zoom link to start the session with {otherUser}.
          </p>
          <div className="space-y-3">
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="brutalist-input w-full px-4 py-3 font-bold"
            />
            <button
              onClick={() => sendMeetingLinkMutation.mutate()}
              disabled={!meetingLink.trim() || sendMeetingLinkMutation.isPending}
              className="brutalist-button bg-black text-white w-full py-3"
            >
              {sendMeetingLinkMutation.isPending ? "SENDING..." : "SHARE LINK & START SESSION"}
            </button>
          </div>
        </div>
      )}

      {!gig.meeting_link && isStudent && (
        <div className="brutalist-card p-8 bg-white text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-black animate-pulse" />
          <h3 className="text-2xl font-black text-black uppercase">WAITING FOR MEETING LINK</h3>
          <p className="font-bold text-gray-600 mt-2">
            {otherUser} will share a video call link shortly to start the session...
          </p>
        </div>
      )}

      {/* Phase 2: Meeting Link Shared - Student Confirmation */}
      {gig.meeting_link && !gig.link_confirmed && (
        <div className="brutalist-card p-8 bg-[#00D9FF]">
          <div className="flex items-center gap-3 mb-4">
            <Video className="w-8 h-8 text-black" />
            <h3 className="text-2xl font-black text-black uppercase">MEETING LINK SHARED</h3>
          </div>
          <div className="p-4 bg-white border-3 border-black mb-4">
            <a
              href={gig.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-black underline break-all text-lg hover:text-[#FF0080]"
            >
              {gig.meeting_link}
            </a>
          </div>
          {isStudent ? (
            <>
              <p className="font-bold text-black mb-4">
                Click the link and confirm below to start the timer.
              </p>
              <button
                onClick={() => confirmLinkMutation.mutate()}
                disabled={confirmLinkMutation.isPending}
                className="brutalist-button bg-gradient-to-r from-[#00FF41] to-[#FFE500] text-black w-full py-4 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                {confirmLinkMutation.isPending ? "CONFIRMING..." : "✅ I RECEIVED THE LINK"}
              </button>
            </>
          ) : (
            <div className="text-center p-4 bg-white border-3 border-black">
              <p className="font-black text-black uppercase">⏱️ Waiting for {otherUser} to confirm...</p>
            </div>
          )}
        </div>
      )}

      {/* Completion Message with Optional Vouch */}
      {gig.status === 'completed' && (
        <div className="space-y-6">
          <div className="brutalist-card p-8 bg-gradient-to-r from-[#00FF41] to-[#00D9FF] text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-black" />
            <h3 className="text-4xl font-black text-black uppercase mb-2">SESSION COMPLETE!</h3>
            {gig.session_ended_by_name && (
              <p className="text-xl font-bold text-black mb-2">
                Ended by: {gig.session_ended_by_name}
              </p>
            )}
            <p className="text-xl font-bold text-black">
              Duration: {gig.session_duration_minutes} minutes
            </p>
            <p className="text-lg font-bold text-black mt-2">
              Session Type: {isPeerSession ? '🤝 PEER-TO-PEER' : isTutorSession ? '🎓 TUTOR SESSION' : '❓ SESSION'}
            </p>
          </div>

          {/* Vouch Section */}
          {gig.session_duration_minutes >= minMinutesToVouch ? (
            <div className="brutalist-card p-8 bg-white">
              <h3 className="text-3xl font-black text-black uppercase text-center mb-6">
                ⭐ DID YOU ENJOY THIS SESSION? ⭐
              </h3>
              
              {hasVouched ? (
                <div className="text-center p-6 bg-[#00FF41] border-3 border-black">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-black" />
                  <p className="text-2xl font-black text-black uppercase">✅ YOU VOUCHED FOR {otherUser.toUpperCase()}</p>
                  <p className="text-lg font-bold text-black mt-2">+5 points awarded!</p>
                </div>
              ) : canShowVouchButton() ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-100 border-3 border-black">
                    <p className="text-lg font-bold text-black">
                      {isPeerSession 
                        ? `If ${gig.responder_name} provided excellent peer help, vouch for them to give +5 peer points!`
                        : isHelper 
                          ? `If ${gig.author_name} was a great student, vouch for them to give +5 points!` 
                          : `If ${gig.responder_name} provided excellent help, vouch for them to give +5 points!`}
                    </p>
                    <p className="text-sm font-bold text-gray-600 mt-2">
                      (Optional - only vouch if you genuinely enjoyed the session. Limit: 1 vouch per day)
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleVouchMutation.mutate()}
                      disabled={handleVouchMutation.isPending}
                      className="brutalist-button bg-gradient-to-r from-[#FFE500] to-[#FFB627] text-black py-4 flex items-center justify-center gap-2"
                    >
                      <Award className="w-6 h-6" />
                      {handleVouchMutation.isPending ? 'VOUCHING...' : `⭐ VOUCH FOR ${otherUser.toUpperCase()}`}
                    </button>
                    
                    <Link
                      to={createPageUrl('MyGigs')}
                      className="brutalist-button bg-white text-black py-4 flex items-center justify-center gap-2"
                    >
                      SKIP & GO TO MY GIGS
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-100 border-3 border-black">
                  <p className="text-xl font-black text-black uppercase">
                    {isPeerSession ? "⚠️ ONLY STUDENTS CAN VOUCH PEER HELPERS" : "YOU CANNOT VOUCH IN THIS SESSION"}
                  </p>
                  <p className="text-md font-bold text-gray-600 mt-2">
                    {isPeerSession && isHelper && "Peer helpers cannot vouch students back. This is one-way vouching."}
                  </p>
                  <Link
                    to={createPageUrl('MyGigs')}
                    className="brutalist-button bg-[#00D9FF] text-black px-8 py-3 mt-4 inline-flex items-center gap-2"
                  >
                    GO TO MY GIGS
                  </Link>
                </div>
              )}

              {hasVouched && (
                <div className="mt-6 text-center">
                  <Link
                    to={createPageUrl('MyGigs')}
                    className="brutalist-button bg-[#00D9FF] text-black px-8 py-3 inline-flex items-center gap-2"
                  >
                    GO TO MY GIGS
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="brutalist-card p-8 bg-gray-200 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-black" />
              <h3 className="text-2xl font-black text-black uppercase mb-2">
                ⏱️ SESSION TOO SHORT
              </h3>
              <p className="text-lg font-bold text-black">
                Sessions must be at least {minMinutesToVouch} minutes to earn vouching privileges.
              </p>
              <p className="text-md font-bold text-gray-600 mt-2">
                Duration: {gig.session_duration_minutes} minutes ({isPeerSession ? '🤝 Peer Session' : '🎓 Tutor Session'})
              </p>
              <Link
                to={createPageUrl('MyGigs')}
                className="brutalist-button bg-[#00D9FF] text-black px-8 py-3 mt-6 inline-flex items-center gap-2"
              >
                GO TO MY GIGS
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Messages - Only show if session is active AND can proceed with payment */}
      {gig.status === 'in_session' && canProceedWithSession && (
        <div className="brutalist-card p-6 h-[400px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-3 border-black border-t-[#00FF41] rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-black text-black uppercase">SESSION CHAT</p>
                <p className="font-bold text-gray-600 mt-2">Messages will appear here</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_email === user?.email;
                const isSystem = msg.message_type === 'system';
                
                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center">
                      <div className="inline-block p-3 bg-[#FFE500] border-3 border-black">
                        <p className="font-black text-black text-sm">{msg.message}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] p-4 border-3 border-black ${
                        isMe ? 'bg-gradient-to-r from-[#00D9FF] to-[#00FF41]' : 'bg-white'
                      }`}
                      style={{
                        boxShadow: isMe ? '4px 4px 0 0 #000' : '-4px 4px 0 0 #000'
                      }}
                    >
                      <p className="text-xs font-black text-gray-700 mb-1">{msg.sender_name}</p>
                      <p className="font-bold text-black break-words">{msg.message}</p>
                      <p className="text-xs font-bold text-gray-700 mt-2">
                        {format(new Date(msg.created_date), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="TYPE YOUR MESSAGE..."
              className="brutalist-input flex-1 px-4 py-3 font-bold"
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="brutalist-button bg-gradient-to-r from-[#FF0080] to-[#B026FF] text-white px-6 py-3"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
