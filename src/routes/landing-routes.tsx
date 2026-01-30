import PageNotFound from "../pages/404";
import LayoutClient from "../components/LayoutClient";
import Home from "../pages/home";
import CaseStudyPage from "../pages/CaseStudyPage";
import HorizontalTimeline from "../components/Timeline";

export const landingRoutes = [
  {
    path: "/",
    element: <LayoutClient><Home/></LayoutClient>,
  },
  {
    path: "/about",
    element: <LayoutClient><HorizontalTimeline/></LayoutClient>,
  },
  {
    path: "/case-studies/:name",
    element: <LayoutClient><CaseStudyPage /></LayoutClient>,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
];
