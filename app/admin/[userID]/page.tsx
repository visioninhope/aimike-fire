'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const UserDetailsPage = ({ params }) => {
  const router = useRouter();
  const { userID } = params;
  const [userDetails, setUserDetails] = useState(null);
  const [bids, setBids] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchingBids, setFetchingBids] = useState(false);

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
        setBids(data.bids.bids);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Details for {userID}</h1>
      {userDetails ? (
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
                    <p><strong>Bidder:</strong> {bid.bidderId}</p>
                    <p><strong>Amount:</strong> ${bid.amount}</p>
                    <p><strong>Description:</strong> {bid.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>No details available for this user.</p>
      )}
    </div>
  );
};

export default UserDetailsPage;