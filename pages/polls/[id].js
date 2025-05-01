import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStateContext } from '../../context/StateContext';
import PollFactoryABI from '../../contracts/PollFactoryABI.json';
import { getComments, toggleLike, getUserLikeStatus, getLikesCount } from '../../backend/Database';

const contractAddress = "0x1A2B20B221B4BD2CD53fA7aC405C293E387E4582";

const PageWrapper = styled.div`
    padding: 5rem;
    max-width: 800px;
    margin: 0 auto;
`;

export default function PollDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { walletAddress } = useStateContext();
  
  const [poll, setPoll] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPollData = async () => {
      try {
        // Get poll data from blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const pollContract = new ethers.Contract(
          contractAddress,
          PollFactoryABI,
          provider
        );
        
        const [question, options] = await pollContract.getPoll(id);
        const votes = await pollContract.getVotes(id);
        
        setPoll({
          id,
          question,
          options,
          votes: votes.map(v => v.toNumber())
        });
        
        // Get social data from Firestore
        const pollComments = await getComments(id);
        setComments(pollComments);
        
        const likes = await getLikesCount(id);
        setLikeCount(likes);
        
        if (walletAddress) {
          const userLiked = await getUserLikeStatus(id, walletAddress);
          setIsLiked(userLiked);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching poll:", error);
        setLoading(false);
      }
    };

    fetchPollData();
  }, [id, walletAddress]);

  const handleLike = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet to like polls");
      return;
    }
    
    try {
      const newLikeStatus = await toggleLike(id, walletAddress);
      setIsLiked(newLikeStatus);
      
      const newCount = await getLikesCount(id);
      setLikeCount(newCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <h2>Loading poll...</h2>
      </PageWrapper>
    );
  }

  if (!poll) {
    return (
      <PageWrapper>
        <h2>Poll not found</h2>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1>{poll.question}</h1>
      
      {/* Display options and votes */}
      {poll.options.map((option, index) => (
        <div key={index}>
          <p>{option}: {poll.votes[index]} votes</p>
        </div>
      ))}
      
      {/* Like button */}
      <button onClick={handleLike}>
        {isLiked ? 'Unlike' : 'Like'} ({likeCount})
      </button>
      
      {/* Comments section - will build this later */}
      <h3>Comments ({comments.length})</h3>
      {comments.length > 0 ? (
        comments.map(comment => (
          <div key={comment.id}>
            <p>From: {comment.author.slice(0,6)}...{comment.author.slice(-4)}</p>
            <p>{comment.content}</p>
          </div>
        ))
      ) : (
        <p>No comments yet</p>
      )}
    </PageWrapper>
  );
}