import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { createGlobalStyle } from 'styled-components';
import { StateContext } from '@/context/StateContext';
import '../backend/Firebase';

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
        setIsClient(true);
    }, []);

    return (
        <StateContext>
            <GlobalStyle />
            {isClient && (
                <>
                    <Navbar />
                    <Component {...pageProps} />
                </>)}
        </StateContext>

    );
}