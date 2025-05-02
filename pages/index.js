// This page is the main page that displays all the polls
// Both the logo and the explore button link to this page
import { useEffect, useState } from "react";
import PollCard from "@/components/PollCard";
import styled from "styled-components";
import { ethers } from "ethers";
import { useStateContext } from "../context/StateContext";
import PollFactoryABI from "../contracts/PollFactoryABI.json";
import { getLikesCount, getComments, getBlacklistedPolls } from '../backend/Database';

const contractAddress = "0x1A2B20B221B4BD2CD53fA7aC405C293E387E4582";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const PageSubHeader = styled.h3`
  color: white;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const FeedWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 1rem;
`;

const FeedColumn = styled.div`
  width: 100%;
  max-width: 600px;
`;

const Message = styled.p`
  color: rgb(192, 192, 192);
  font-size: 1rem;
  text-align: center;
  padding: 2rem;
`;

export default function Home() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blacklistedPolls, setBlacklistedPolls] = useState(null);
  const { walletAddress } = useStateContext();

  // Fetch the blacklisted polls first
  useEffect(() => {
    const fetchBlacklistedPolls = async () => {
      try {
        const blacklisted = await getBlacklistedPolls();
        console.log("Blacklisted polls:", blacklisted);
        setBlacklistedPolls(blacklisted);
      } catch (error) {
        console.error("Error fetching blacklisted polls:", error);
        setBlacklistedPolls([]);
      }
    };

    fetchBlacklistedPolls();
  }, []);

  // Then fetch the polls excluding the blacklisted ones
  useEffect(() => {
    if (blacklistedPolls === null) {
      return; // Wait until blacklisted polls are loaded
    }
    
    const fetchPolls = async () => {
      if (!window.ethereum) {
        console.error("MetaMask not detected");
        setLoading(false);
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const pollContract = new ethers.Contract(
          contractAddress,
          PollFactoryABI,
          provider
        );

        const pollCount = await pollContract.pollCount();
        const pollsArray = [];
        console.log(`Total polls loaded: ${pollCount}`);

        // Use reverse order to show newest first
        console.log(`Fetching polls from ${pollCount - 1} to 0`);
        for (let i = pollCount - 1; i >= 0; i--) {
          if (blacklistedPolls.includes(i.toString())) continue;

          try {
            // We use the blockchain to get the poll data and firestore for likes and comments
            const [question, options] = await pollContract.getPoll(i);
            const votes = await pollContract.getVotes(i);
            
            const likes = await getLikesCount(i);
            const commentsList = await getComments(i);
            
            pollsArray.push({
              id: i,
              question,
              options,
              votes: votes.map(v => v.toNumber()),
              comments: commentsList.length,
              initialLikes: likes
            });
          } catch (error) {
            console.log(`Error fetching poll ${i}:`, error);
          }
        }
        console.log(`Polls loaded: ${pollsArray.length}`);
        setPolls(pollsArray);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch polls:", err);
        setLoading(false);
      }
    };

    fetchPolls();
  }, [blacklistedPolls]);

  return (
    <PageContainer>
      <PageHeader>Poll Feed</PageHeader>
      { !walletAddress && (
        <PageSubHeader>
          Connect your Metamask wallet to vote on and create polls.
        </PageSubHeader>
      )}
      <FeedWrapper>
        <FeedColumn>
          {loading ? (
            <Message>Loading polls from blockchain...</Message>
          ) : polls.length > 0 ? (
            polls.map((poll) => (
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
            <Message>No polls found. Create one to get started.</Message>
          )}
        </FeedColumn>
      </FeedWrapper>
    </PageContainer>
  );
}
