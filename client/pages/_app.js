import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';


const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  // This contains the "currentUser" information for the App Component
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  let pageProps = {};
  // Some pages we didn't define the "getInitialProps" function, so we have to check
  if (appContext.Component.getInitialProps) {
    // This contains the "currentUser" information that should be passed down to the Landing Page Component
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }
  // These will be returned as the parameters of "const AppComponent = (...) => { }" above
  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
