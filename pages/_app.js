import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: #0a0a0a;
    color: #ededed;
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