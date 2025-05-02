// This page displays the details of a particular poll and allows users to comment on it
// It is accessible from the main feed page by clicking on the title of the poll card
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStateContext } from '../../context/StateContext';
import PollFactoryABI from '../../contracts/PollFactoryABI.json';
import { getComments, addComment, toggleLike, getUserLikeStatus, getLikesCount, removeComment } from '../../backend/Database';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const contractAddress = "0x1A2B20B221B4BD2CD53fA7aC405C293E387E4582";

const PageWrapper = styled.div`
    padding: 5rem;
    max-width: 800px;
    margin: 0 auto;
`;

const CommentForm = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

// Textarea can be scaled and looks more like a traditional comment box
const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: rgb(48, 48, 48);
  color: rgb(192, 192, 192);
  border: none;
  border-radius: 8px;
  min-height: 100px;
  font-family: inherit;
`;

const CommentButton = styled.button`
  background-color: rgb(0, 153, 173);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: rgb(0, 188, 212);
  }
  
  &:disabled {
    background-color: rgb(100, 100, 100);
    cursor: not-allowed;
  }
`;

const CommentList = styled.div`
  margin-top: 2rem;
`;

const CommentItem = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgb(32, 32, 32);
  border-radius: 8px;
`;

const RemoveCommentButton = styled.button`
  background-color: rgb(255, 0, 0);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: rgb(255, 43, 43);
  }
`;

const Icon = styled.button`
  background: none;
  border: none;
  color: rgb(160, 160, 160);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  font-size: 0.9rem;

  &:hover {
    color: white;
  }
`;

export default function PollDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { walletAddress } = useStateContext();

  const [poll, setPoll] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If the id is not found, return
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
          // Convert the votes to an array of numbers
          votes: votes.map(v => v.toNumber())
        });

        // Get likes and comments from Firestore
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

  const handleCommentSubmit = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet to comment");
      return;
    }

    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    // State for when the comment is being submitted
    // This allows us to prevent the button from being clicked multiple times if they users spams
    setSubmitting(true);
    try {
      await addComment(id, walletAddress, newComment);
      const updatedComments = await getComments(id);
      setComments(updatedComments);
      setNewComment('');
      console.log("Comment added successfully");
      
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveComment = async (commentId) => {
    try {
      await removeComment(id, commentId);
      // Keep all comments where the id is not the commentId we are removing
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      alert("Removing comment failed. Please try again.");
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

      {poll.options.map((option, index) => (
        <div key={index}>
          <p>{option}: {poll.votes[index]} votes</p>
        </div>
      ))}

      <Icon onClick={handleLike}>
        {isLiked ? <FaHeart color="rgb(226, 85, 85)" /> : <FaRegHeart />}
        {likeCount}
      </Icon>

      <CommentForm>
        <h3>Add a Comment</h3>
        {!walletAddress ? (
          <p>Please connect your wallet to comment</p>
        ) : (
          <>
            <CommentTextarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              // Disable the textarea if the comment is being submitted
              disabled={submitting}
            />
            <CommentButton
              onClick={handleCommentSubmit}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Submitting...' : 'Post'}
            </CommentButton>
          </>
        )}
      </CommentForm>

      <CommentList>
        <h3>Comments ({comments.length})</h3>
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem key={comment.id}>
              <p><b>From:</b> {comment.author} {walletAddress && comment.author.toLowerCase() === walletAddress.toLowerCase() && '(You)'}</p>

              {/* Only display the remove button if the comment belongs to the current user */}
              {walletAddress && comment.author.toLowerCase() === walletAddress.toLowerCase() && (
                <RemoveCommentButton onClick={() => handleRemoveComment(comment.id)}>
                  Remove
                </RemoveCommentButton>
              )}

              <p>{comment.content}</p>
              <p>
                {/* Auto formats the date and time of the comment; if the comment just created, it will show "Just now" */}
                {comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
              </p>
            </CommentItem>
          ))
        ) : (
          <p>No comments yet</p>
        )}
      </CommentList>
    </PageWrapper>
  );
}