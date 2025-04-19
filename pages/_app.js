import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`

  body {
    background:rgb(10, 10, 10);
    color:rgb(237, 237, 237);
    font-family: "Montserrat", sans-serif;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export default function MyApp({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Prevents styled-components hydration mismatch
    setIsClient(true);
  }, []);

  return (
    <>
      <GlobalStyle />
      {isClient && (
        <>
          <Navbar />
          <Component {...pageProps} />
        </>)}
    </>
  );
}