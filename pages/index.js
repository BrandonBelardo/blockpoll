import { useEffect, useState } from "react";
import PollCard from "@/components/PollCard";
import styled from "styled-components";
import { ethers } from "ethers";
import { useStateContext } from "../context/StateContext";
import PollFactoryABI from "../contracts/PollFactoryABI.json";

const contractAddress = "0x1A2B20B221B4BD2CD53fA7aC405C293E387E4582";

const FeedWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 5rem;
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
  const { blacklistedPolls } = useStateContext();

  useEffect(() => {
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

        // Get total poll count
        const pollCount = await pollContract.pollCount();
        const pollsArray = [];

        // Fetch each poll (in reverse order to show newest first)
        for (let i = pollCount - 1; i >= 0; i--) {
          if (blacklistedPolls.includes(i)) continue;

          try {
            // Get poll data
            const [question, options] = await pollContract.getPoll(i);
            
            // Get vote counts
            const votes = await pollContract.getVotes(i);
            
            pollsArray.push({
              id: i,
              question,
              options,
              votes: votes.map(v => v.toNumber()),
              // Placeholder values for UI
              comments: 0,
              likes: Math.floor(Math.random() * 100) // Random likes for now
            });
          } catch (error) {
            console.log(`Error fetching poll ${i}:`, error);
            // Skip polls that don't exist or caused errors
          }
        }

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
              initialLikes={poll.likes}
            />
          ))
        ) : (
          <Message>No polls found. Create one to get started.</Message>
        )}
      </FeedColumn>
    </FeedWrapper>
  );
}
