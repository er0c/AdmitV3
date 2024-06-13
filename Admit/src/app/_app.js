import GlobalContext from "./GlobalContext";

function MyApp({ Component, pageProps }) {
    return (
      <GlobalContext.Provider>
        <Component {...pageProps}/>
      </GlobalContext.Provider>
    );
  }

export default MyApp;
