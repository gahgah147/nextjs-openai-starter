import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
export default function TokenTopup(){
    const handleClick = async() =>{
        await fetch(`/api/addTokens`,{
            method: 'POST',
        });
    };
    return (
        <div>
            <h1>
                this is the Token Topup
                <button className="btn" onClick={handleClick}>ADD TOKENS</button>
            </h1>
        </div>
    )
}

TokenTopup.getLayout = function getLayout(page,pageProps){
    return <AppLayout {...pageProps}>{page}</AppLayout>
}

export const getServerSideProps = withPageAuthRequired(() => {
    return {
        props:{},
    };
});