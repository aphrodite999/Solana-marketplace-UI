import { ppid } from "process";
import { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom"
import { Page } from "../../components/Page";
import * as ROUTES from "../../constants/routes";
import dayjs from "dayjs"
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab"
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

  const Entities = require('html-entities').XmlEntities;
  const entities = new Entities();

  var theTab;

  if (category.toLocaleLowerCase() == 'creator guides'){
    theTab = 'creator';
  }else if(category.toLocaleLowerCase() == 'guides'){
    theTab = 'buy-sell';
  }else{
    theTab = 'none';
  }

  const tab = useTabState({
    selectedId: theTab,
  })


  useEffect(() => {
    const getPosts = async () => {
      try {
        var res = await fetch(`https://blog.digitaleyes.market/wp-json/wp/v2/posts?category_slug=${category.toLowerCase()}&_embed`);
        
        if(category.toLowerCase() == "guides"){
          res = await fetch(`https://blog.digitaleyes.market/wp-json/wp/v2/posts?category_slug=Buyer/Seller%20Guides&_embed`);
        }
        
        const posts = await res.json();
        setPosts(posts);
      } catch {
        console.log('no posts to load?')
      }
    }
    getPosts();
  },[]);

  const goToResource = (slug:string, postId:number) => {
    if (category.toLocaleLowerCase() == 'creator guides'){
      history.push({
        pathname: `/creator-guides/${slug}`,
        state: { postId: postId }
      })
    }else{
      history.push({
        pathname: `/${category.toLowerCase()}/${slug}`,
        state: { postId: postId }
      })
    }
  }

  const guidesTab = (tab:string) => {
    history.push({
      pathname: `/${tab}`,
    })
    window.location.reload();
  }

  return (
    <Page className="md:max-w-7xl mx-auto sm:px-6 lg:px-8 py-16" title="Resource Item">
      <div className="flex items-center justify-center sm:pt-4 sm:px-4 sm:block sm:p-0">
        <div className="mt-5 max-w-lg mx-auto lg:grid-cols-12 lg:max-w-none">
        <div className="text-center">
          <h2 className="text-3xl tracking-tight font-extrabold text-white sm:text-4xl">
            { category == "Creator Guides" && (
              "Guides"
            )}
            { category != "Creator Guides" && (
              category
            )}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 sm:mt-4">

          </p>
        </div>


        { (category == "Guides" || category == "Creator Guides") && (
            <div id="search-nav" className="flex justify-center mt-5">
              <TabList
                {...tab}
                aria-label="Search Tabs"
                className="px-5 text-sm md:text-lg"
              >
                {/**<Tab {...tab} className="px-5">
                  <p>Top</p>
                </Tab>*/}
                <Tab
                  {...tab}
                  id="buy-sell"
                  className="px-5"
                  onClick={() => guidesTab('guides')}
                >
                  <p>Buyer/Seller</p>
                </Tab>
                <Tab
                  {...tab}
                  id="creator"
                  className="px-5"
                  onClick={() => guidesTab('creator-guides')}
                >
                  <p>Creator</p>
                </Tab>
              </TabList>
            </div>
          )}

          <br></br>
          <br></br>


        { posts.map((post:any, idx) => (

          
          // <div className="flex flex-col rounded-lg shadow-lg overflow-hidden" onClick={() => goToResource(post.slug, post.id)}>
          //   <div className="flex-shrink-0">
          //     {/* @ts-ignore */}
          //     { post._embedded['wp:featuredmedia'] && (
          //       <img className="h-48 w-full object-cover" src={post._embedded['wp:featuredmedia']['0'].source_url} alt={post._embedded['wp:featuredmedia']['0'].alt_text}/>
          //     )}
          //   </div>
          //   <div className="flex-1 bg-gray-900 p-6 flex flex-col justify-between">
          //     <div className="flex-1">
          //       <p className="text-sm font-medium text-blue">
          //         <a href="#" className="hover:underline">
          //           { category }
          //         </a>
          //       </p>
          //       <a href="#" className="block mt-2">
          //         <h2 className="text-xl font-semibold text-gray-300">
          //           { post.title.rendered }
          //         </h2>
          //         <div className="mt-3 text-base text-gray-500">
          //           <div dangerouslySetInnerHTML={{__html: post.excerpt.rendered}}></div>
          //         </div>
          //       </a>
          //     </div>
          //   </div>
          //   </div>


          <div className="pl-10 pt-6 pr-10"  onClick={() => goToResource(post.slug, post.id)}>
            <div className=" w-full lg:max-w-full lg:flex">
              
              { post._embedded['wp:featuredmedia'] && (
                    <div className="h-48 lg:h-auto lg:w-48 mr-3 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden" style={{ backgroundPosition: 'center', backgroundImage: 'url(' + post._embedded['wp:featuredmedia']['0'].source_url + ')' }}  title="blogImage"></div>
              )}


              { !post._embedded['wp:featuredmedia'] && (
                    <div className="h-48 lg:h-auto lg:w-48 mr-3 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden" style={{ backgroundPosition: 'center', backgroundSize: '50% 50%', backgroundImage: 'url(/de-guide2.jpg)' }}  title="blogImage"></div>
              )}
              
              <div className="bg-gray-900 bg-opacity-50 rounded-b lg:w-full lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
                <div className="mb-8">
                    <a href="#" className="hover:underline text-sm text-blue-700 flex items-center">
                     { category }
                   </a>
                  <div className="text-gray-300 font-bold text-xl mb-2">{ entities.decode(post.title.rendered )}</div>
                  <p className="text-gray-500 text-base">
                    <div dangerouslySetInnerHTML={{__html: post.excerpt.rendered}}></div>
                  </p>
                </div>
                <div className="flex items-center">
                    <img className="w-8 h-8 rounded-full mr-4" src="/assets/logo/default-digitaleyes-icon.jpeg" alt="DE"/>
                  <div className="text-sm">
                    <p className="text-gray-500 leading-none">Digital Eyes</p>
                    <p className="text-gray-500">{ post && dayjs(post.date).format('MMM D') }</p>
                  </div>
                </div>
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
