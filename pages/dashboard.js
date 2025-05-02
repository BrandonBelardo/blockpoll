// This page is the dashboard page that displays the user's polls and comments
// It is accessible from the navbar and can only be used if the user is connected to their wallet
// The user can hide polls from the main feed by clicking the hide button as well as unhide them
// This is a substitute for deleting polls since it is not possible to delete polls from the blockchain
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import PollCard from '../components/PollCard';
import { ethers } from 'ethers';
import { useStateContext } from '../context/StateContext';
import PollFactoryABI from '../contracts/PollFactoryABI.json';
import { getComments, getLikesCount, getBlacklistedPolls, addToBlacklist, removeFromBlacklist } from '../backend/Database';
import { FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

const contractAddress = "0x1A2B20B221B4BD2CD53fA7aC405C293E387E4582";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const DashboardHeader = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const DashboardWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  gap: 3rem;
`;

const Section = styled.div`
  margin-bottom: 3rem;
  width: 45%;
  max-width: 550px;
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

const CommentCard = styled.div`
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

const PollContainer = styled.div`
  position: relative;
`;

const HideButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: rgb(160, 160, 160);
  cursor: pointer;
  z-index: 10;
  font-size: 1.1rem;
  opacity: 0.6;
  transition: opacity 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    opacity: 1;
    color: rgb(226, 85, 85);
  }
`;

const ConfirmDialog = styled.div`
  position: absolute;
  top: 40px;
  right: 10px;
  background-color: rgb(36, 36, 36);
  border: 1px solid rgb(48, 48, 48);
  border-radius: 8px;
  padding: 12px;
  width: 220px;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const ConfirmText = styled.p`
  color: white;
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const ConfirmButton = styled.button`
  background-color: rgb(226, 85, 85);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  flex: 1;

  &:hover {
    background-color: rgb(215, 65, 65);
  }
`;

const CancelButton = styled.button`
  background-color: rgb(48, 48, 48);
  color: rgb(200, 200, 200);
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  flex: 1;

  &:hover {
    background-color: rgb(60, 60, 60);
  }
`;

export default function Dashboard() {
    const [myPolls, setMyPolls] = useState([]);
    const [myComments, setMyComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmingHide, setConfirmingHide] = useState(null);
    const [blacklistedPolls, setBlacklistedPolls] = useState([]);
    const { walletAddress } = useStateContext();

    // Fetch the blacklisted polls from Firestore
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

    useEffect(() => {
        if (!walletAddress) {
            setLoading(false);
            return;
        }

        if (blacklistedPolls === null) {
            return; // Wait until blacklisted polls are loaded
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
                        // Check if poll is blacklisted using the local array
                        const isHidden = blacklistedPolls.includes(i.toString());

                        const poll = {
                            id: i,
                            question,
                            options,
                            votes: votes.map(v => v.toNumber()),
                            comments: comments.length,
                            initialLikes: likes,
                            isHidden
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
    }, [walletAddress, blacklistedPolls]);

    const handleHideClick = (pollId) => {
        setConfirmingHide(pollId);
    };

    const toggleHidePoll = async (pollId) => {
        try {
            const poll = myPolls.find(p => p.id === pollId);
            const pollIdStr = pollId.toString();

            // If the poll is already hidden, unhide it
            if (poll && poll.isHidden) {
                await removeFromBlacklist(pollId);
                // Update local state immediately
                setBlacklistedPolls(blacklistedPolls.filter(id => id !== pollIdStr));

            // Otherwise hide it
            } else {
                await addToBlacklist(pollId);
                setBlacklistedPolls([...blacklistedPolls, pollIdStr]);
            }

            // Update the poll in the myPolls state
            setMyPolls(myPolls.map(p => {
                if (p.id === pollId) {
                    return { ...p, isHidden: !poll.isHidden };
                }
                return p;
            }));

        } catch (error) {
            console.error("Error toggling poll blacklist status:", error);
        }

        setConfirmingHide(null);
    };

    const cancelHide = () => {
        setConfirmingHide(null);
    };

    return (
        <PageContainer>
            <DashboardHeader>Dashboard</DashboardHeader>

            {!walletAddress ? (
                <Message>Connect your MetaMask wallet to view your dashboard</Message>
            ) : (
                <DashboardWrapper>
                    {/* My Polls Section (left column) */}
                    <Section>
                        <SectionTitle>My Polls</SectionTitle>
                        {loading ? (
                            <Message>Loading your polls...</Message>
                        ) : myPolls.length > 0 ? (
                            myPolls.map((poll) => (
                                <PollContainer key={poll.id}>
                                    <HideButton
                                        onClick={() => handleHideClick(poll.id)}
                                        title={poll.isHidden ? "Unhide poll" : "Hide poll"}
                                    >
                                        <FaEyeSlash />
                                        {poll.isHidden ? " Unhide" : " Hide"}
                                    </HideButton>

                                    {confirmingHide === poll.id && (
                                        <ConfirmDialog>
                                            <ConfirmText>
                                                {poll.isHidden
                                                    ? "Are you sure you want to unhide this poll from the main feed?"
                                                    : "Are you sure you want to hide this poll from the main feed?"}
                                            </ConfirmText>
                                            <ButtonGroup>
                                                <ConfirmButton onClick={() => toggleHidePoll(poll.id)}>
                                                    {poll.isHidden ? "Unhide" : "Hide"}
                                                </ConfirmButton>
                                                <CancelButton onClick={cancelHide}>Cancel</CancelButton>
                                            </ButtonGroup>
                                        </ConfirmDialog>
                                    )}

                                    <PollCard
                                        id={poll.id}
                                        question={poll.question}
                                        options={poll.options}
                                        votes={poll.votes}
                                        comments={poll.comments}
                                        initialLikes={poll.initialLikes}
                                    />
                                </PollContainer>
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
                                <CommentCard key={comment.id}>
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
                                </CommentCard>
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
                </DashboardWrapper>
            )}
        </PageContainer>
    );
}