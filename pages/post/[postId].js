import { getSession, handleAuth, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import Markdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import PostsContext from "../../context/postsContenxt";
export default function Post(props) {

    console.log("PROPS",props);
    const router = useRouter();
    const [showDeleteConfirm,setShowDeleteConfirm] = useState(false);
    const {deletePost} = useContext(PostsContext);

    const handleDeleteConfirm = async() =>{
        try{
            const result = await fetch("/api/deletePost",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postId: props.id
                }),
            });
            const json = await result.json();
            if(json.success){
                deletePost(props.id);
                router.replace(`/post/new`);
            }
        }
        catch(e){
            console.error(e);
        }
    }

    return (
        <div className="overflow-auto h-full ">
            <div className="max-w-screen-sm mx-auto">
                <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
                    SEO title and meta description
                </div>
                <div className="p-4 my-2 border border-stone-200 rounded-md">
                    <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
                    <div className="mt-2">{props.metaDescription}</div>
                </div>
                <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
                    Keywords
                </div>
                <div className="flex flex-wrap pt-2 gap-1">
                    {props.keywords.split(",").map((keyword,i)=>(
                        <div key={i} className="p-2 rounded-full bg-slate-800 text-white">
                            <FontAwesomeIcon icon={faHashtag}/>{keyword}
                        </div>
                    ))}
                </div>
                <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
                    Blog post
                </div>

                 {/* <div dangerouslySetInnerHTML={{__html:props.postContent || ''}}/> */}
                <Markdown>
                    {props.postContent || ""}
                </Markdown>

                <div className="my-4">
                    {!showDeleteConfirm && (
                        <buttom className="btn bg-red-600 hover:bg-red-700" onClick={()=> setShowDeleteConfirm(true)}>
                            Delete post
                        </buttom>
                    )}
                    {!!showDeleteConfirm && (
                        <div className="p-2 bg-red-300 text-center">
                            <p>Are you sure you want to delete this post? This action is irreversible</p>
                            <div className="grid grid-cols-2">
                                <button onClick={() => setShowDeleteConfirm(false)} className="btn bg-stone-600 hover:bg-stone-700">cancel</button>
                                <button onClick={handleDeleteConfirm} className="btn bg-red-600 hover:bg-red-700">confirm delete</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

Post.getLayout = function getLayout(page,pageProps){
    return <AppLayout {...pageProps}>{page}</AppLayout>
}

export const getServerSideProps = withPageAuthRequired({
    async getServerSideProps(ctx){
        const userSession = await getSession(ctx.req,ctx.res);
        const client = await clientPromise;
        const db = client.db("BlogStandard");
        const user = await db.collection("users").findOne({
            auth0Id: userSession.user.sub
        });
        const post = await db.collection("posts").findOne({
            _id: new ObjectId(ctx.params.postId),
            userId: user._id
        })

        console.log(post);

        if(!post){
            return {
                redirect:{
                    destination: "/post/new",
                    permanent: false
                }
            }
        }

        return{
            props:{
                id:ctx.params.postId,
                postContent: post.postContent,
                title: post.title,
                metaDescription: post.metaDescription,
                keywords: post.keywords,
                postCreated: post.created.toString(),
                // ...props,
            }
        }
    }
});