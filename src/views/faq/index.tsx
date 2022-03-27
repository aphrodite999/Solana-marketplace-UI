import React from "react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import type { WP_REST_API_Post } from "wp-types";
import { Page } from "../../components/Page";
import { Helmet } from "react-helmet";
import parse, { domToReact } from 'html-react-parser';
import { isTag } from 'domhandler/lib/node';

const FAQContent = () => {
  const [openTab, setOpenTab] = React.useState(1);
  const faqLiClass = `xl:p-8 lg:p-8 md:p-8 sm:p-8 p-4`;

  const history = useHistory();
  const params = useParams();
  const [error, setError] = useState(false);
  const [post, setPost] = useState<WP_REST_API_Post>();

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(
          `https://blog.digitaleyes.market/wp-json/wp/v2/pages/56?&_embed`
        );
        const post = await res.json();
        setPost(post);
      } catch {
        console.log("no posts to load?");
      }
    };
    getPost();
  }, []);

  return (
    <>
      {!!post && (
        <div className="flex items-center justify-center sm:pt-4 sm:px-4 sm:block sm:p-0">
          <div className="mt-4 max-w-lg mx-auto grid gap-5 lg:max-w-none wp">
            
            <div className="text-center">
              <h2 className="text-3xl tracking-tight font-extrabold text-white sm:text-4xl mb-0">
                {/* @ts-ignore */}
                {post.title.rendered}
              </h2>
            </div>
            
            <div className="flex flex-wrap max-w-7xl mx-auto mt-3 py-6 px-4">
              <div className="w-full">
                <div className="mt-3 text-base text-gray-500">
                  <div dangerouslySetInnerHTML={{ __html: post.content.rendered }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const FaqView = () => {
  const [seo, setSeo] = useState('');

  useEffect(() => {
    const getSeo = async () => {
      try {
        const head = await fetch(
          `https://blog.digitaleyes.market/wp-json/rankmath/v1/getHead?url=https://blog.digitaleyes.market/faqs`
        )
        const seo = await head.json();
        const seoUpdatedUrls = seo.head.replaceAll(`blog.digitaleyes.market`, `digitaleyes.market`);
        setSeo(seoUpdatedUrls)
      } catch {
        console.log('seo error')
      }
    }
    getSeo()
  },[])

  return (
    <>
      {seo && (
        <Helmet>
          <meta name="test"></meta>
          {parse(seo, {
            replace: domNode => {
              if (isTag(domNode)) {
                const { attribs, children, name } = domNode;
                if( domNode.type === 'script' && domNode.attribs.type == 'application/ld+json' ) {
                  const schema = domNode.children[0] as any;
                  return (
                    <script type="application/ld+json">{`
                      ${ schema.data }
                    `}</script>
                  )
                }
              }
            }
          })}
        </Helmet>
      )}
      <Page className="md:max-w-5xl mx-auto sm:px-6 lg:px-8 py-16" title="Resource Item">
        <FAQContent />
      </Page>
    </>
  );
};
