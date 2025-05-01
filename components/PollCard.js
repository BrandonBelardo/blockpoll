import styled from 'styled-components';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaRegCommentDots, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useStateContext } from "../context/StateContext";
import { toggleLike, getUserLikeStatus, getLikesCount, getComments } from '../backend/Database';

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

export default function PollCard({ question, options, id, comments = 0, initialLikes = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [selectedOption, setSelectedOption] = useState(null);
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
    
    loadLikeData();
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

  const handleOptionClick = (index) => {
    setSelectedOption(index);
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
        >
          {option}
        </Option>
      ))}

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