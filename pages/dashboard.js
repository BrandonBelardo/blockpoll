import styled from 'styled-components';
import PollCard from '../components/PollCard';

const DashboardWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  padding-top: 4rem;
`;

const Section = styled.div`
  margin-bottom: 3rem;
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

export default function Dashboard() {
  const myPolls = [
    {
      id: 1,
      question: 'What’s your favorite programming language?',
      options: ['JavaScript', 'Python', 'C++', 'Go'],
      comments: 5,
      likes: 12
    },
    {
      id: 2,
      question: 'How many languages do you speak?',
      options: ['1', '2', '3', '4', '5+'],
      comments: 10,
      likes: 20
    },
    {
      id: 3,
      question: 'Which feature should we add next?',
      options: ['Dark mode', 'Poll sharing link', 'UI Improvements', 'Other (Comment)'],
      comments: 30,
      likes: 59
    }
  ];

  return (
    <DashboardWrapper>
      <Section>
        <SectionTitle>My Polls</SectionTitle>
        {myPolls.map((poll) => (
          <PollCard
            key={poll.id}
            id={poll.id}
            question={poll.question}
            options={poll.options}
            comments={poll.comments}
            initialLikes={poll.likes}
          />
        ))}
      </Section>

      <Section>
        <SectionTitle>My Comments</SectionTitle>
        <Message>
          Messages will go here once implemented.
        </Message>
      </Section>
    </DashboardWrapper>
  );
}