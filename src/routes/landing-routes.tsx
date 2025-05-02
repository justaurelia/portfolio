import PageNotFound from "../pages/404";
import LayoutClient from "../components/LayoutClient";
import Home from "../pages/home";
import InConstruction from "../pages/InConstruction";
import HorizontalTimeline from "../pages/Timeline";

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
    path: "/work",
    element: <LayoutClient><InConstruction/></LayoutClient>,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
];
