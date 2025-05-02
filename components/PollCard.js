import styled from 'styled-components';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaRegCommentDots, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useStateContext } from "../context/StateContext";
import { toggleLike, getUserLikeStatus, getLikesCount, getComments } from '../backend/Database';
import { ethers } from 'ethers';
import PollFactoryABI from '../contracts/PollFactoryABI.json';

const contractAddress = "0x1A2B20B221B4BD2CD53fA7aC405C293E387E4582";

const Card = styled.div`
  background-color:rgb(26, 26, 26);
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 600px;
  color: white;
  border: 1px solid rgb(48, 48, 48);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgb(31, 31, 31);
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: rgb(160, 160, 160);
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    color: white;
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

const Question = styled.div`
  display: block;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  cursor: pointer;
`;

const Option = styled.button`
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background-color: ${({ $isSelected }) => ($isSelected ? 'rgb(0, 145, 164)' : 'rgb(42, 42, 42)')};
  color: ${({ $isSelected }) => ($isSelected ? 'rgb(240, 240, 240)' : 'rgb(192, 192, 192)')};
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;

  &:hover {
    background-color: ${({ $isSelected }) => ($isSelected ? 'rgb(0, 119, 134)' : 'rgb(58, 58, 58)')};
  }
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  color: ${({ isLiked }) => (isLiked ? 'rgb(226, 85, 85)' : 'rgb(160, 160, 160)')};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  font-size: 0.9rem;

  &:hover {
    color: ${({ isLiked }) => (isLiked ? 'rgb(226, 85, 85)' : 'white')};
  }
`;

const VoteCount = styled.span`
  font-size: 0.85rem;
  color: rgb(160, 160, 160);
  margin-left: 0.5rem;
`;

const VoteButton = styled.button`
  background-color: rgb(0, 145, 164);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  margin-top: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgb(0, 119, 134);
  }
  
  &:disabled {
    background-color: rgb(60, 60, 60);
    color: rgb(160, 160, 160);
    cursor: not-allowed;
  }
`;

const VoteStatus = styled.p`
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: ${({ $success }) => ($success ? 'rgb(75, 181, 67)' : 'rgb(226, 85, 85)')};
`;

export default function PollCard({ question, options, id, comments = 0, initialLikes = 0, votes = [] }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votesCounts, setVotesCounts] = useState(votes);
  const [isVoting, setIsVoting] = useState(false);
  const [voteStatus, setVoteStatus] = useState(null);
  const { walletAddress } = useStateContext();
  
  useEffect(() => {
    const loadLikeData = async () => {
      try {
        if (walletAddress) {
          const userLiked = await getUserLikeStatus(id, walletAddress);
          setLiked(userLiked);
        }
        
        const count = await getLikesCount(id);
        if (typeof count === 'number') {
          setLikes(count);
        }
      } catch (error) {
        console.warn("Failed to load like data:", error);
        // if data fails to load, get initial likes
        setLikes(initialLikes);
      }
    };
    
    const checkVotingStatus = async () => {
      if (!walletAddress) return;
      
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const pollContract = new ethers.Contract(
          contractAddress,
          PollFactoryABI,
          provider
        );
        
        // Check if the user has already voted on this poll
        try {
          const response = await pollContract.getVotes(id);
          setVotesCounts(response.map(vote => parseInt(vote)));
          
          // By calling the vote function, we can check if the user has already voted
          try {
            const signer = provider.getSigner();
            const pollContractWithSigner = pollContract.connect(signer);
            await pollContractWithSigner.callStatic.vote(id, 0);
            setHasVoted(false);
          } catch (error) {
            if (error.message.includes("You already voted")) {
              setHasVoted(true);
            }
          }
        } catch (error) {
          console.warn("Error checking if user has voted:", error);
        }
      } catch (error) {
        console.warn("Failed to check voting status:", error);
      }
    };
    
    loadLikeData();
    checkVotingStatus();
  }, [id, walletAddress, initialLikes]);
  
  const handleLike = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet to like polls");
      return;
    }
    
    try {
      const newLikeStatus = await toggleLike(id, walletAddress);
      setLiked(newLikeStatus);
      const newCount = await getLikesCount(id);
      if (typeof newCount === 'number') {
        setLikes(newCount);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
    }
  };

  // For toggling the selected option
  const handleOptionClick = (index) => {
    if (selectedOption === index) {
      setSelectedOption(null);
    } else {
      setSelectedOption(index);
    }
  };
  
  const submitVote = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet to vote");
      return;
    }
    
    if (selectedOption === null) {
      alert("Please select an option to vote");
      return;
    }
    
    if (hasVoted) {
      alert("You have already voted on this poll");
      return;
    }
    
    setIsVoting(true);
    setVoteStatus(null);
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const pollContract = new ethers.Contract(
        contractAddress,
        PollFactoryABI,
        signer
      );
      
      // Vote on the poll
      
      const voteResponse = await pollContract.vote(id, selectedOption);
      await voteResponse.wait();
      
      // Update the UI to reflect the vote
      setHasVoted(true);
      
      // Update vote counts
      const updatedVotes = await pollContract.getVotes(id);
      setVotesCounts(updatedVotes.map(vote => parseInt(vote)));
      
      setVoteStatus({ success: true, message: "Your vote has been recorded!" });
    } catch (error) {
      console.error("Error voting:", error);
      setVoteStatus({ success: false, message: error.message.includes("You already voted") 
        ? "You have already voted on this poll" 
        : "Failed to vote. Please try again." });
    } finally {
      setIsVoting(false);
    }
  };
  
  // Format vote count text to be singular or plural dynamically
  const formatVoteCount = (count) => {
    return `${count} ${count === 1 ? 'vote' : 'votes'}`;
  };

  return (
    <Card>
      <Link href={`/polls/${id}`}>
        <Question>{question}</Question>
      </Link>

      {options.map((option, key) => (
        <Option
          key={key}
          $isSelected={selectedOption === key}
          onClick={() => handleOptionClick(key)}
          disabled={hasVoted || isVoting}
        >
          {option}
          {hasVoted && votesCounts && votesCounts[key] !== undefined && (
            <VoteCount>({formatVoteCount(votesCounts[key])})</VoteCount>
          )}
        </Option>
      ))}
      
      {!hasVoted && walletAddress && (
        <VoteButton 
          onClick={submitVote} 
          disabled={selectedOption === null || isVoting}
        >
          {isVoting ? "Voting..." : "Submit Vote"}
        </VoteButton>
      )}
      
      {voteStatus && (
        <VoteStatus $success={voteStatus.success}>
          {voteStatus.message}
        </VoteStatus>
      )}

      <Footer>
        <Link href={`/polls/${id}`} passHref>
          <IconContainer>
            <FaRegCommentDots />
            {comments}
          </IconContainer>
        </Link>

        <Icon onClick={handleLike}>
          {liked ? <FaHeart color="rgb(226, 85, 85)" /> : <FaRegHeart />}
          {likes}
        </Icon>
      </Footer>
    </Card>
  );
}