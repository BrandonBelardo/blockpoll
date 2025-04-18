import { useRouter } from 'next/router';
import styled from 'styled-components';

const PageWrapper = styled.div`
    padding: 5rem;
`;

export default function PollDetail() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PageWrapper>
      <h1>Poll ID: {id}</h1>
      <p>Comments would be included here.</p>
    </PageWrapper>
  );
}