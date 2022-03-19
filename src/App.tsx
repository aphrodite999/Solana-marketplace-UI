import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import "./assets/styles/app.css"
import { Layout } from "./components/Layout"
import {
  LocalStorageValueTheme,
  LOCAL_STORAGE_KEY_THEME,
} from "./constants/local-storage"
import * as ROUTES from "./constants/routes"
import { AccountsProvider } from "./contexts/accounts"
import { CollectionsProvider } from "./contexts/collections"
import { ConnectionProvider } from "./contexts/connection"
import { WalletProvider } from "./contexts/wallet"
import { QuickViewContextProvider } from "./contexts/quick-view"
import { FullscreenModalContextProvider } from "./contexts/fullscreen-modal"
import {
  CollectionsView,
  FaqView,
  PressView,
  ItemView,
  WalletView,
  SoloProfileView,
  ResourceView,
  ResourceList,
  SearchResultsView,
  AuthenticateView,
  BidState,
  NFTList
} from "./views"
import { NotFoundView } from "./views/404"
import { FeedbackView } from "./views/feedback"
import { FavouriteListView } from "./views/favourite-list"
import { HomeView } from "./views/home"
import { SoloHomeView } from "./views/solo-home"
import { SoloView } from "./views/solo"
import { SoloSettingsView } from "./views/solo-settings"
import { ExploreView } from "./views/explore"
import { SoloCreationContextProvider } from "./contexts/solo-creation"
import { ArtCreateView } from "./views/artCreate"
import { AudioContextProvider } from "./contexts/audio"
import { CustomThemeContextProvider } from "./contexts/custom-theme"
import { SoloProfileContextProvider } from "./contexts/solo-profile"
import { MessageInbox } from "./components/Jabber/MessageInbox"
import { JabberContextProvider } from "./contexts/jabber"
import { MintCalendar } from "./views/mintCalender"
import { LaunchPadContextProvider } from "./contexts/launchpad"
import { LaunchPadHome } from "./components/LaunchPad/LaunchPadHome"
import { DomainListingContextProvider } from "./contexts/domainListings"
import { DomainItem } from "./components/DomainItem"


function App() {
  const setTheme = (themeName: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, themeName)
    document.documentElement.className = themeName
  }

  // Immediately invoked function to default the theme to dark while we don't have a theme switcher
  ;(function () {
    setTheme(LocalStorageValueTheme.DARK)
  })()

  return (
    <>
      <Router>
        <DomainListingContextProvider>
          <LaunchPadContextProvider>
            <JabberContextProvider>
              <AudioContextProvider>
                <SoloCreationContextProvider>
                  <SoloProfileContextProvider>
                    <CustomThemeContextProvider>
                      <FullscreenModalContextProvider>
                        <QuickViewContextProvider>
                          <CollectionsProvider>
                            <ConnectionProvider>
                              <WalletProvider>
                                <AccountsProvider>
                                  <Layout>
                                    <Switch>
                                      <Route
                                        path={`${ROUTES.COLLECTIONS}/:collectionName?`}
                                        component={CollectionsView}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.WALLET}
                                        children={<WalletView />}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.WALLET_SOLO}
                                        children={<WalletView />}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.FAQ}
                                        children={<FaqView />}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.SOLO_FAQ}
                                        children={<FaqView />}
                                      />
                                      <Route
                                        exact
                                        path={`${ROUTES.INBOX}/:recipient?`}
                                        component={MessageInbox}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.MINT_CALENDAR}
                                        component={MintCalendar}
                                      />
                                      <Route
                                        exact
                                        path={`${ROUTES.LAUNCHPAD}/:projectName`}
                                        component={LaunchPadHome}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.PRESS}
                                        children={<PressView />}
                                      />
                                      <Route
                                        exact
                                        path={`${ROUTES.ITEM}/:collection?/:mint`}
                                        children={<ItemView />}
                                      />
                                      <Route
                                        exact
                                        path={`${ROUTES.DOMAIN_ITEM}/:domainName?`}
                                        component={DomainItem}
                                      />
                                      <Route
                                        exact
                                        path={`${ROUTES.SOLO_ITEM}/:collection?/:mint`}
                                        children={<ItemView />}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.HOME}
                                        component={HomeView}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.EXPLORE}
                                        component={ExploreView}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.SOLO}
                                        component={SoloHomeView}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.SOLO_BROWSE}
                                        component={SoloView}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.SEARCH_RESULTS}
                                        component={SearchResultsView}
                                      />
                                      <Route
                                        exact
                                        path={ROUTES.AUTHENTICATE_ACCOUNT}
                                        component={AuthenticateView}
                                      />

                                    <Route
                                      exact
                                      path={ROUTES.SOLO_SETTINGS}
                                      component={SoloSettingsView}
                                    />
                                    <Route exact path={ROUTES.MINT} component={ArtCreateView} />
                                    <Route
                                      exact
                                      path={`${ROUTES.SOLOPROFILE}/:artist`}
                                      children={<SoloProfileView />}
                                    />
                                    <Route
                                      exact
                                      path={ROUTES.FAVOURITE_LIST}
                                      component={FavouriteListView}
                                    />
                                    <Route
                                      exact
                                      path={ROUTES.FAVOURITE_LIST_SOLO}
                                      component={FavouriteListView}
                                    />
                                    <Route
                                      exact
                                      path={ROUTES.FEEDBACK}
                                      children={<FeedbackView />}
                                    />
                                    <Route exact path={ROUTES.BLOG} children={<ResourceList category="Blog"/>} />
                                    <Route
                                      exact
                                      path={`${ROUTES.BLOG}/:slug`}
                                      children={<ResourceView />}
                                    />
                                    <Route exact path={ROUTES.GUIDES} children={<ResourceList category="Guides"/>} />
                                    <Route
                                      exact
                                      path={`${ROUTES.GUIDES}/:slug`}
                                      children={<ResourceView />}
                                    />
                                    <Route exact path={ROUTES.NEWS} children={<ResourceList category="News"/>} />
                                    <Route
                                      exact
                                      path={`${ROUTES.NEWS}/:slug`}
                                      children={<ResourceView />}
                                    />
                                    <Route exact path={ROUTES.SUPPORT} children={<ResourceList category="Support"/>} />
                                    <Route
                                      exact
                                      path={`${ROUTES.SUPPORT}/:slug`}
                                      children={<ResourceView />}
                                    />
                                    <Route
                                      exact
                                      path={ROUTES.BID}
                                      children={<BidState />}
                                    />
                                    <Route
                                      exact
                                      path={ROUTES.LIST}
                                      children={<NFTList />}
                                    />
                                    <Route component={NotFoundView} />
                                    <Route
                                      exact
                                      path={`${ROUTES.ITEM}/:mint`}
                                      children={<ItemView />}
                                    />
                                  </Switch>
                                </Layout>
                              </AccountsProvider>
                            </WalletProvider>
                          </ConnectionProvider>
                        </CollectionsProvider>
                      </QuickViewContextProvider>
                    </FullscreenModalContextProvider>
                  </CustomThemeContextProvider>
                </SoloProfileContextProvider>
              </SoloCreationContextProvider>
            </AudioContextProvider>
          </JabberContextProvider>
        </LaunchPadContextProvider>
        </DomainListingContextProvider>
      </Router>
    </>
  )
}

export default App
