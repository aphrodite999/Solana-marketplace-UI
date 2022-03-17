import { cssNumber } from "jquery";
import { useEffect, useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { Page } from "../../components/Page";
import dayjs from "dayjs"
import { Helmet } from "react-helmet";

export const ResourceView = ({ category = '' }) => {
  const history = useHistory();
  const params = useParams();
  const [error, setError] = useState(false);
  const [post, setPost] = useState();
  const location = useLocation();

  useEffect(() => {
    const slug = location.pathname.split('/').pop()
    const getPost = async () => {
      try {
        // @ts-ignore
        const res = await fetch(`https://blog.digitaleyes.market/wp-json/wp/v2/posts/?slug=${slug}&_embed`);
        const post = await res.json();
        setPost(post[0]);
      } catch {
        console.log('no posts to load?')
      }
    }
    getPost();
  },[]);

  return (
    <>
      <Helmet>
        {/* @ts-ignore */}
        <title>{post && post.title.rendered}</title>
        {/* @ts-ignore */}
        <meta name="description" content={post && post.excerpt.rendered} />
      </Helmet>
      <Page className="md:max-w-5xl mx-auto sm:px-6 lg:px-8 py-16" title="Resource Item">
        <div className="sm:pt-4 sm:px-4 sm:block sm:p-0">
          <div className="text-center">
            <h2 className="text-3xl tracking-tight font-extrabold text-white sm:text-4xl mb-0">
              {/* @ts-ignore */}
              { post && post.title.rendered }
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-gray-500 sm:mt-4 text-base">
              {/* @ts-ignore */}
              { post && dayjs(post.date).format('MMMM D, YYYY') }
            </p>
          </div>
          
          <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:max-w-none wp">

          {post && (
            <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
              <div className="flex-shrink-0">
                {/* @ts-ignore */}
                { post && post['_embedded']['wp:featuredmedia'] && (
                  <img className="h-auto w-full object-cover" src={post['_embedded']['wp:featuredmedia']['0']['source_url']} alt={post['_embedded']['wp:featuredmedia']['0']['alt_text']}/>
                )}
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="mt-3 text-base text-gray-400">
                    {/* @ts-ignore */}
                    <div dangerouslySetInnerHTML={{__html: post.content.rendered}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </Page>
    </>
  );
};
