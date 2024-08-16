'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import prisma from '../../../lib/prisma';

const UserDetailsPage = ({ params }) => {
  const router = useRouter();
  const { userID } = params;
  const [userDetails, setUserDetails] = useState(null);
  const [bids, setBids] = useState(null);
  const [thread, setThreads] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchingBids, setFetchingBids] = useState(false);
  const [fetchingThread, setFetchingThreads] = useState(false);
  const [confirmingBid, setConfirmingBid] = useState(null); // Track which bid is being confirmed
  const [confirmingThread, setconfirmingThread] = useState(null); 
  
  useEffect(() => {
    if (!userID) return;

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/admin/userDetails/${userID}`);
        const data = await response.json();
        if (response.ok) {
          setUserDetails(data.user);
          
          
        } else {
          setError('Failed to fetch user details');
        }
      } catch (error) {
        setError('An error occurred while fetching user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userID]);

  const handleFetchBids = async (userId) => {
    setFetchingBids(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/fetchBids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setThreads(data.bids.bids);
        console.log(data.bids)
      } else {
        setError(`Error fetching bids: ${data.error}`);
      }
    } catch (error) {
      setError('An error occurred while fetching bids.');
    } finally {
      setFetchingBids(false);
    }
  };

  const handleFetchThread = async (userProjectId) => {
    setFetchingThreads(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/fetchThread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProjectId }),
      });

      const data = await response.json();

      if (response.ok) {
        setThreads(data.threads.threads[0].id);
        console.log(data.threads)
        await prisma.user.update({
          where: { email: userDetails.email },
          data: { threadID: thread },
        })
      } else {
        setError(`Error fetching bids: ${data.error}`);
      }
    } catch (error) {
      setError('An error occurred while fetching threads.');
    } finally {
      setFetchingThreads(false);
    }
  };

  const handleConfirmBid = async (bidId) => {
    setConfirmingBid(bidId); // Set the current bid being confirmed
    setError('');

    try {
      const response = await fetch(`/api/admin/acceptBid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bidId }),
      });

      const data = await response.json();

      if (response.ok) {
        setBids(bids.map(bid => bid.id === bidId ? { ...bid, status: 'confirmed' } : bid));
        await prisma.user.update({
          where: { email: userDetails.email },
          data: { hasBid: true },
        })
      } else {
        setError(`Error confirming bid: ${data.error}`);
      }
    } catch (error) {
      setError('An error occurred while confirming the bid.');
    } finally {
      setConfirmingBid(null); // Clear the current bid being confirmed
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Details for {userID}</h1>

      {!userDetails.hasBid ? (
        <div>
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Project Status:</strong> {userDetails.hasProject ? 'Project Created' : 'No Project'}</p>

          {/* Button to fetch bids */}
          <button
            onClick={() => handleFetchBids(userDetails.projectId)}
            className="bg-indigo-600 text-white py-2 px-4 rounded mt-4 hover:bg-indigo-700 disabled:bg-gray-400"
            disabled={fetchingBids}
          >
            {fetchingBids ? 'Fetching Bids...' : 'Fetch Bids'}
          </button>
          {/* Display bids if available */}
          {bids && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">Bids:</h2>
              <ul>
                {bids.map((bid, index) => (
                  <li key={index} className="border-b py-2">
                    <p><strong>Bidder:</strong> {bid.bidder_id}</p>
                    <p><strong>Amount:</strong> ${bid.amount}</p>
                    <p><strong>Description:</strong> {bid.description}</p>
                    <p><strong>Reputation:</strong> {bid.score}</p>
                    <button
                      onClick={() => handleConfirmBid(bid.id)}
                      className="bg-green-600 text-white py-1 px-4 rounded mt-2 hover:bg-green-700 disabled:bg-gray-400"
                      disabled={confirmingBid === bid.id || bid.status === 'confirmed'}
                    >
                      {confirmingBid === bid.id ? 'Confirming...' : bid.status === 'confirmed' ? 'Confirmed' : 'Confirm Bid'}
                    </button>
                  </li>
                  
                  
                ))
                
                }
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p><strong>Name:</strong> {userDetails.name}</p>
          <button
                      onClick={() => handleFetchThread(userDetails.projectId)}
                      className="bg-green-600 text-white py-1 px-4 rounded mt-2 hover:bg-green-700 disabled:bg-gray-400"
                      disabled={confirmingThread === userDetails.id || userDetails.status === 'confirmed'}
                    >
                      {confirmingThread === userDetails.id ? 'Confirming...' : userDetails.status === 'confirmed' ? 'Confirmed' : 'Confirm Thread'}
                    </button>
                    <p><strong> Thread: </strong> {thread}</p>

        </div>
      
      )}

    </div>
  );
};

export default UserDetailsPage;
