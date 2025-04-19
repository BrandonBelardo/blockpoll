import PollCard from "@/components/PollCard";
import styled from "styled-components";

const FeedWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 5rem;
`;

const FeedColumn = styled.div`
  width: 100%;
  max-width: 600px;
`;


export default function Home() {
  // These are example polls to populate the UI before implementing backend
  const polls = [
    {
      id: 1,
      question: 'Which feature should we add next?',
      options: ['Dark mode', 'Poll sharing link', 'UI Improvements', 'Other (Comment)'],
      comments: 16,
      likes: 24
    },
    {
      id: 2,
      question: 'Which feature should we add next?',
      options: ['Dark mode', 'Poll sharing link', 'UI Improvements', 'Other (Comment)'],
      comments: 22,
      likes: 82
    },
    {
      id: 3,
      question: 'Which feature should we add next?',
      options: ['Dark mode', 'Poll sharing link', 'UI Improvements', 'Other (Comment)'],
      comments: 30,
      likes: 59
    },
    {
      id: 4,
      question: 'Where do you prefer to live?',
      options: ['City', 'Suburbs', 'Rural'],
      comments: 8,
      likes: 20
    }
  ];

  return (
    <FeedWrapper>
      <FeedColumn>
        {polls.map((poll, key) => (
          <PollCard
            key={key}
            id={poll.id}
            question={poll.question}
            options={poll.options}
            comments={poll.comments}
            initialLikes={poll.likes}
          />
        ))}
      </FeedColumn>
    </FeedWrapper>
  );
}
