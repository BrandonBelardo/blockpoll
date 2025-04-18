import styled from 'styled-components';
import { useState } from 'react';
import Link from 'next/link';
import { FaRegCommentDots, FaHeart, FaRegHeart } from 'react-icons/fa';

const Card = styled.div`
  background-color: #1a1a1a;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 600px;
  color: #fff;
  border: 1px solid #333;
  transition: background-color 0.2s ease;

  &:hover {
    background-color:rgb(73, 73, 73);
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

const Icon = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  font-size: 0.9rem;

  &:hover {
    color: #fff;
  }
`;

const Question = styled.a`
    display: block;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const Option = styled.button`
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background-color: #2a2a2a;
  color: #ccc;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;

  &:hover {
    background-color: #3a3a3a;
  }
`;

export default function PollCard({ question, options, id, comments = 0, initialLikes = 0 }) {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(initialLikes);
  
    const handleLike = () => {
      setLiked(!liked);
      setLikes(prev => liked ? prev - 1 : prev + 1);
    };
  
    return (
      <Card>
        <Link href={`/polls/${id}`} passHref>
          <Question>{question}</Question>
        </Link>
  
        {options.map((option, key) => (
          <Option key={key}>{option}</Option>
        ))}
  
        <Footer>
          <Link href={`/polls/${id}`} passHref>
            <Icon as="a">
              <FaRegCommentDots />
              {comments}
            </Icon>
          </Link>
  
          <Icon onClick={handleLike}>
            {liked ? <FaHeart color="#e25555" /> : <FaRegHeart />}
            {likes}
          </Icon>
        </Footer>
      </Card>
    );
  }
