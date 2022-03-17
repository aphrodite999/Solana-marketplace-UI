import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Page } from "../../components/Page";
import * as ROUTES from "../../constants/routes";
import {
  BASE_URL_COLLECTIONS_RETRIEVER,
  BASE_URL_OFFERS_RETRIEVER,
  COLLECTIONS_RETRIEVER_QUERY_PARAM,
  GET_SOLO_USER_NO_AUTH,
  GET_SOLO_USER_NO_AUTH_QUERY_PARAM,
} from "../../constants/urls";
import { ErrorView } from "../error";

export const ResourceList = ({ category = '' }) => {
  const history = useHistory();
  const params = useParams();
  const [error, setError] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const res = await fetch(`https://blog.digitaleyes.market/wp-json/wp/v2/posts?category_slug=${category.toLowerCase()}&_embed`);
        const posts = await res.json();
        setPosts(posts);
      } catch {
        console.log('no posts to load?')
      }
    }
    getPosts();
  },[]);

  const goToResource = (slug:string, postId:number) => {
    history.push({
      pathname: `/${category.toLowerCase()}/${slug}`,
      state: { postId: postId }
    })
  }

  return (
    <Page className="md:max-w-7xl mx-auto sm:px-6 lg:px-8 py-16" title="Resource Item">
      <div className="flex items-center justify-center sm:pt-4 sm:px-4 sm:block sm:p-0">
        <div className="text-center">
          <h2 className="text-3xl tracking-tight font-extrabold text-white sm:text-4xl">
            { category }
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 sm:mt-4">

          </p>
        </div>
        
        <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">

        { posts.map((post:any, idx) => (
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden" onClick={() => goToResource(post.slug, post.id)}>
            <div className="flex-shrink-0">
              {/* @ts-ignore */}
              { post._embedded['wp:featuredmedia'] && (
                <img className="h-48 w-full object-cover" src={post._embedded['wp:featuredmedia']['0'].source_url} alt={post._embedded['wp:featuredmedia']['0'].alt_text}/>
              )}
            </div>
            <div className="flex-1 bg-gray-900 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue">
                  <a href="#" className="hover:underline">
                    { category }
                  </a>
                </p>
                <a href="#" className="block mt-2">
                  <h2 className="text-xl font-semibold text-gray-300">
                    { post.title.rendered }
                  </h2>
                  <div className="mt-3 text-base text-gray-500">
                    <div dangerouslySetInnerHTML={{__html: post.excerpt.rendered}}></div>
                  </div>
                </a>
              </div>
            </div>
            </div>
          ))
        }
      
      </div>
    </div>
    </Page>
  );
};
