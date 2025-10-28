import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "../../utils";
import { base44 } from "../../firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function MarketplaceRequestCard({ request }) {
  const queryClient = useQueryClient();
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return new Promise((resolve) => {
        const unsubscribe = firebaseClient.auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });
    },
    staleTime: Infinity,
  });

  // Check if current user has vouched for this request
  const { data: hasVouched } = useQuery({
    queryKey: ['vouchCheck', request.id, currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return false;
      const vouches = await firebaseClient.entities.Vouch.filter({
        gig_id: request.id,
        voucher_email: currentUser.email
      });
      return vouches.length > 0;
    },
    enabled: !!currentUser?.email,
  });

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: (status) => firebaseClient.entities.MarketplaceRequest.update(request.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplaceRequests']);
      setShowAcceptModal(false);
    },
  });

  // Create vouch mutation
  const vouchMutation = useMutation({
    mutationFn: (vouchData) => firebaseClient.entities.Vouch.create(vouchData),
    onSuccess: () => {
      queryClient.invalidateQueries(['vouchCheck', request.id, currentUser?.email]);
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate('accepted');
  };

  const handleVouch = async () => {
    if (!currentUser) return;
    
    // Check if user is a student who can vouch
    const todaysVouches = await firebaseClient.entities.Vouch.filter({
      voucher_email: currentUser.email,
      created_date: '>=', // This would need to be implemented properly
    });
    
    if (todaysVouches.length >= 3) {
      alert("You've reached your daily vouch limit of 3.");
      return;
    }
    
    vouchMutation.mutate({
      gig_id: request.id,
      voucher_email: currentUser.email,
      vouchee_email: currentUser.email === request.author_email ? request.responder_email : request.author_email,
      created_date: new Date().toISOString()
    });
  };

  const isMyPost = request.author_email === currentUser?.email;
  const isHelper = request.responder_email === currentUser?.email;
  const canAccept = isMyPost && request.status === 'open';
  const canVouch = currentUser && 
    (currentUser.email === request.author_email || currentUser.email === request.responder_email) && 
    request.status === 'completed' && 
    !hasVouched;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{request.subject}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            request.status === 'open' ? 'bg-green-100 text-green-800' :
            request.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
            request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {request.status}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-gray-700">{request.description}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {request.author_avatar_url ? (
                <img className="h-10 w-10 rounded-full" src={request.author_avatar_url} alt="" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              )}
            </div>
            <div className="ml-3">
              <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(request.author_email)}`)} className="text-sm font-medium text-gray-900 hover:underline">
                {request.author_name}
              </Link>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                {request.created_date ? format(new Date(request.created_date), "MMM d, yyyy") : "Unknown date"}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <DollarSign className="flex-shrink-0 mr-1 h-5 w-5 text-gray-400" />
            <span className="text-lg font-medium text-gray-900">${request.price}</span>
          </div>
        </div>

        {request.responder_name && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {request.responder_avatar_url ? (
                  <img className="h-8 w-8 rounded-full" src={request.responder_avatar_url} alt="" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Helper: {request.responder_name}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {canAccept && (
            <button
              onClick={() => setShowAcceptModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Accept Request
            </button>
          )}

          {isHelper && request.status === 'accepted' && (
            <button
              onClick={() => acceptMutation.mutate('completed')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Mark as Completed
            </button>
          )}

          {canVouch && (
            <button
              onClick={handleVouch}
              disabled={vouchMutation.isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {vouchMutation.isLoading ? "Vouching..." : "Vouch for Helper"}
            </button>
          )}

          {hasVouched && (
            <div className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-green-800">
              <CheckCircle className="mr-1.5 h-5 w-5 text-green-500" />
              You've vouched
            </div>
          )}
        </div>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Accept Request</h3>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to accept this request? This will assign you as the helper for this task.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleAccept}
                  disabled={acceptMutation.isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {acceptMutation.isLoading ? "Accepting..." : "Accept Request"}
                </button>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="mt-3 px-4 py-2 bg-white text-gray-800 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}