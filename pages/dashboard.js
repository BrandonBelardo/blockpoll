import { useEffect, useState } from 'react';
import styled from 'styled-components';
import PollCard from '../components/PollCard';
import { ethers } from 'ethers';
import { useStateContext } from '../context/StateContext';
import PollFactoryABI from '../contracts/PollFactoryABI.json';
import { getComments, getLikesCount } from '../backend/Database';
import Link from 'next/link';

const contractAddress = "0x1A2B20B221B4BD2CD53fA7aC405C293E387E4582";

const DashboardWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  padding-top: 4rem;
`;

const Section = styled.div`
  margin-bottom: 3rem;
  width: 45%; // Adjust width for a two-column layout
`;

const SectionTitle = styled.h2`
  color:rgb(0, 188, 212);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Message = styled.p`
  color: rgb(192, 192, 192);
  font-size: 1rem;
  font-weight: 300;
`;

const CommentItem = styled.div`
  background-color: rgb(26, 26, 26);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgb(48, 48, 48);
`;

const CommentContent = styled.p`
  color: rgb(220, 220, 220);
  margin-bottom: 0.5rem;
`;

const CommentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgb(160, 160, 160);
`;

const PollLink = styled.a`
  color: rgb(0, 188, 212);
  &:hover {
    text-decoration: underline;
  }
`;

export default function Dashboard() {
  const [myPolls, setMyPolls] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { walletAddress } = useStateContext();

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    // Here, we fetch the user's data similarly to the index.js file
    const fetchUserData = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const pollContract = new ethers.Contract(
          contractAddress,
          PollFactoryABI,
          provider
        );

        const pollCount = await pollContract.pollCount();
        const userPolls = [];
        const allComments = [];



        for (let i = pollCount - 1; i >= 0; i--) {
          try {
            const [question, options] = await pollContract.getPoll(i);
            const votes = await pollContract.getVotes(i);

            const likes = await getLikesCount(i);
            const comments = await getComments(i);

            const poll = {
              id: i,
              question,
              options,
              votes: votes.map(v => v.toNumber()),
              comments: comments.length,
              initialLikes: likes
            };

            // Filters for comments that are made by the user, stores in userComments
            const userComments = comments.filter(
              comment => comment.author.toLowerCase() === walletAddress.toLowerCase()
            );

            userPolls.push(poll);

            if (userComments.length > 0) {
              userComments.forEach(comment => {
                allComments.push({
                  ...comment,
                  // Store the poll id and question for displaying later
                  pollId: i,
                  pollQuestion: question
                });
              });
            }
          } catch (error) {
            console.log(`Error processing poll ${i}:`, error);
          }
        }

        console.log(`Polls loaded: ${userPolls.length}`);

        // Sorts the comments by date (if b is newer than a, it will return a positive number and vice versa)
        allComments.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds;
          }
          return 0;
        });

        setMyComments(allComments);
        setMyPolls(userPolls);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
    // The use effect is dependant on walletAddress since it needs to rerun when the user connects their wallet
  }, [walletAddress]);

  return (
    <DashboardWrapper>
      {!walletAddress ? (
        <Message>Connect your MetaMask wallet to view your dashboard</Message>
      ) : (
        <>
          {/* My Polls Section (left column) */}
          <Section>
            <SectionTitle>My Polls</SectionTitle>
            {loading ? (
              <Message>Loading your polls...</Message>
            ) : myPolls.length > 0 ? (
              myPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  id={poll.id}
                  question={poll.question}
                  options={poll.options}
                  votes={poll.votes}
                  comments={poll.comments}
                  initialLikes={poll.initialLikes}
                />
              ))
            ) : (
              <Message>
                No polls created yet.
                <br /><br />
                <Link href="/create">
                  <PollLink>Create a poll</PollLink>
                </Link>
              </Message>
            )}
          </Section>

          {/* My Comments Section (right column) */}
          <Section>
            <SectionTitle>My Comments</SectionTitle>
            {loading ? (
              <Message>Loading your comments...</Message>
            ) : myComments.length > 0 ? (
              myComments.map((comment) => (
                <CommentItem key={comment.id}>
                  <CommentContent>{comment.content}</CommentContent>
                  <CommentMeta>
                    <span>
                      Poll: <Link href={`/polls/${comment.pollId}`}>
                        <PollLink>{comment.pollQuestion.substring(0, 30)}...</PollLink>
                      </Link>
                    </span>
                    <span>
                      {comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </span>
                  </CommentMeta>
                </CommentItem>
              ))
            ) : (
              <Message>
                No comments on polls yet.
                <br /><br />
                <Link href="/">
                  <PollLink>Browse polls</PollLink>
                </Link>
              </Message>
            )}
          </Section>
        </>
      )}
    </DashboardWrapper>
  );
}