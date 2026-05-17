import { ContainerView } from "./Container"
import { TextView } from "./Text"
import { HeadingView } from "./Heading"
import { ImageView } from "./Image"
import { ButtonView } from "./Button"
import { GridView } from "./Grid" // TODO: Refactor Grid
import { DividerView } from "./Divider"
import { SpacerView } from "./Spacer"
import { NavbarView } from "./Navbar"
import { NavigationLinks } from "./NavigationLinks"
import { CardView } from "./ExampleCard"
import { HeroView } from "./themes/SophiaPlatanisioti/Hero"
import { SophiaHomepageView } from "./themes/SophiaPlatanisioti/SophiaHomepage"
import { SophiaPageAsideView } from "./themes/SophiaPlatanisioti/SophiaPageAside"
import { FooterView } from "./themes/SophiaPlatanisioti/Footer"
import { ArticlesView } from "./Articles"
import { SingleArticleView } from "./SingleArticle"
import { SophiaArticle } from "./themes/SophiaPlatanisioti/SophiaArticle"
import {
    ArticleTitle,
    ArticleCover,
    ArticleContent,
    ArticleAuthor,
    ArticleDate,
    ArticleCategories,
} from "./article"
import {
    HeroSection,
    FeaturesGrid,
    PrinciplesSection,
    UpdatesCarousel,
    FooterInfo,
} from "./themes/Meindesk"
import { MeindeskContainer } from "./themes/Meindesk/MeindeskContainer"
import { CollectionList, CollectionItem, CollectionField, RelatedItems, CollectionContainer } from "./collections"

// Map component names to their Static View counterparts
// If a component doesn't have a specific View version, it might be safe to use as is (if it handles missing context)
// or we need to refactor it. For now, matching critical components.

export const staticComponentMap: Record<string, React.ComponentType<any>> = {
    Container: ContainerView,
    Text: TextView,
    Heading: HeadingView,
    Image: ImageView,

    // Components that might need refactoring but checking if they work
    Button: ButtonView,
    Grid: GridView,
    Divider: DividerView,
    Spacer: SpacerView,

    // Complex components often wrap sub-components, so they might be fine if they just render standard tags.
    // If they use useNode internally, they will break.
    // Assuming for now user only used basic components in the test case.

    Navbar: NavbarView,
    NavigationLinks: NavigationLinks,
    Card: CardView,
    Hero: HeroView,
    SophiaHomepage: SophiaHomepageView,
    SophiaPageAside: SophiaPageAsideView,
    Footer: FooterView,
    Articles: ArticlesView,
    SingleArticle: SingleArticleView,
    SophiaArticle: SophiaArticle,

    ArticleTitle: ArticleTitle,
    ArticleCover: ArticleCover,
    ArticleContent: ArticleContent,
    ArticleAuthor: ArticleAuthor,
    ArticleDate: ArticleDate,
    ArticleCategories: ArticleCategories,

    HeroSection: HeroSection,
    FeaturesGrid: FeaturesGrid,
    PrinciplesSection: PrinciplesSection,
    UpdatesCarousel: UpdatesCarousel,
    FooterInfo: FooterInfo,
    MeindeskContainer: MeindeskContainer,

    CollectionList: CollectionList,
    CollectionItem: CollectionItem,
    CollectionField: CollectionField,
    RelatedItems: RelatedItems,
    CollectionContainer: CollectionContainer,
}
