export async function getServerSideProps() {
    return {
      redirect: {
        destination: '/', 
        permanent: false, 
      },
    };
  }
  
  export default function Redirect() {
    return null; 
  }
  
