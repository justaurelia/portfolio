import ingredient_img from "../assets/images/Ingredients.jpg";
import ingredient_sm from "../assets/images/Ingredients-sm.png"
import bill_img from "../assets/images/Bills.jpg";
import bill_sm from "../assets/images/Bills-sm.png";
import supplier_img from "../assets/images/Suppliers.png";
import supplier_sm from "../assets/images/Suppliers-sm.png";
import recipe_img from "../assets/images/Recipes.png";
import recipe_sm from "../assets/images/Recipes-sm.png";
import product_img from "../assets/images/Products.png";
import product_sm from "../assets/images/Products-sm.png";
import production_img from "../assets/images/Production.png";
import production_sm from "../assets/images/Production-sm.png";
import range_img from "../assets/images/Ranges.png";
import range_sm from "../assets/images/Ranges-sm.png";
import team_img from "../assets/images/Team.png";
import team_sm from "../assets/images/Team-sm.png";
import order_img from "../assets/images/Orders.png";
import order_sm from "../assets/images/Orders-sm.png";
import sales_img from "../assets/images/Sales.png";
import sales_sm from "../assets/images/Sales-sm.png";
import analysis_img from "../assets/images/Analysis.png";
import analysis_sm from "../assets/images/Analysis-sm.png";
// import account_img from "../assets/images/Accounting.png";
import ingredient_icon from "../assets/svg/features/ingredients.svg";
import bill_icon from "../assets/svg/features/bills.svg";
import supplier_icon from "../assets/svg/features/suppliers.svg";
import recipe_icon from "../assets/svg/features/recipes.svg";
import product_icon from "../assets/svg/features/products.svg";
import production_icon from "../assets/svg/features/production.svg";
import range_icon from "../assets/svg/features/ranges.svg";
import team_icon from "../assets/svg/features/teams.svg";
import order_icon from "../assets/svg/features/orders.svg";
import sales_icon from "../assets/svg/features/sales.svg";
import analysis_icon from "../assets/svg/features/analysis.svg";
// import account_icon from "../assets/svg/features/account.svg";

export const features = [
  {
    id: 1,
    title: "Ingredients",
    image: ingredient_img,
    icon: ingredient_icon,
    smImage: ingredient_sm,
    sub_title: "Stay stocked. Stay in control.",
    description:
      "Easily add, edit, or remove ingredients while keeping track of current and projected stock levels. Get instant low-stock alerts, add ingredients to orders in one click, and access purchase history and nutritional values. Automatically calculate costs with FIFO and streamline your inventory with CSV import/export.",
  },
  {
    id: 2,
    title: "Bills",
    image: bill_img,
    icon: bill_icon,
    smImage: bill_sm,
    sub_title: "Less paperwork. More precision.",
    description:
      "Add, edit, duplicate, or delete bills effortlessly. Scan bills with AI-powered auto-reading, track detailed purchase history, and monitor total spending over any period. Automate stock updates, keep ingredient costs accurate with FIFO, and export bills in CSV format—all while reducing errors and improving financial tracking.",
  },
  {
    id: 3,
    title: "Suppliers",
    image: supplier_img,
    icon: supplier_icon,
    smImage: supplier_sm,
    sub_title: "Stronger connections. Smoother orders.",
    description:
      "Add, edit, or remove supplier records in seconds. Access supplier portals with a single click, manage login credentials, and track purchase history effortlessly. Import and export supplier data via CSV, streamlining order management and simplifying supplier relations.",
  },
  {
    id: 4,
    title: "Recipes",
    image: recipe_img,
    icon: recipe_icon,
    smImage: recipe_sm,
    sub_title: "Precision meets flexibility.",
    description:
      "Add, edit, duplicate, or scan recipes with AI-powered auto-reading. Calculate recipes by total weight or ingredient weight, print customized versions, and track modification history. Import and export recipes via CSV, ensuring accuracy, efficiency, and seamless production management.",
  },
  {
    id: 5,
    title: "Products",
    image: product_img,
    icon: product_icon,
    smImage: product_sm,
    sub_title: "Customize. Optimize. Profit.",
    description:
      "Add, edit, duplicate, or modify products effortlessly. Create variations, calculate recipes based on product quantity, and print customized recipe sheets. Set margins in currency or percentage and mark seasonal products for easy tracking. Stay in control of pricing and profitability while streamlining product management.",
  },
  {
    id: 6,
    title: "Ranges",
    image: range_img,
    icon: range_icon,
    smImage: range_sm,
    sub_title: "Organized. Scalable. Profitable.",
    description:
      "Add, edit, duplicate, or remove product ranges with ease. Track costs and margins, plan your sales by day, and set validity periods for seasonal or limited-time offerings. Group products strategically to optimize sales and streamline production.",
  },
  {
    id: 7,
    title: "Production",
    image: production_img,
    icon: production_icon,
    smImage: production_sm,
    sub_title: "Plan. Assign. Optimize.",
    description:
      "Streamline weekly production with automated quantity calculations and task scheduling. Organize workflows into recipes (e.g., pâte à choux) and actions (e.g., piping éclairs). Assign tasks, track workload, and adjust schedules with drag-and-drop tiles. Stay ahead with color-coded urgency levels, real-time alerts for over/underproduction, and automatic stock updates at the end of day. Print and display the schedule for a seamless workflow.",
  },
  {
    id: 8,
    title: "Team",
    image: team_img,
    icon: team_icon,
    smImage: team_sm,
    sub_title: "Manage. Organize. Streamline.",
    description:
      "Easily add, edit, or remove team members while tracking schedules, absences, and delays. View a detailed visual planner to optimize task assignments based on availability. Keep operations smooth with centralized scheduling and clear internal communication.",
  },
  {
    id: 9,
    title: "Orders",
    image: order_img,
    icon: order_icon,
    smImage: order_sm,
    sub_title: "Track. Plan. Deliver.",
    description:
      "Easily add, edit, duplicate, or manage orders while linking them to specific clients. Define product details, quantities, and delivery or pickup dates with real-time status updates. Integrate orders into the production schedule, access detailed order history, and export data in CSV for seamless tracking.",
  },
  {
    id: 10,
    title: "Sales",
    image: sales_img,
    icon: sales_icon,
    smImage: sales_sm,
    sub_title: "Track. Adjust. Optimize.",
    description:
      "Record daily sales manually or via CSV import, adjust actual production vs. forecasts, and log unsold items to refine future planning. Automatically update stock levels based on sales and waste, ensuring accurate tracking, reduced losses, and better production decisions.",
  },
  {
    id: 11,
    title: "Analysis",
    image: analysis_img,
    icon: analysis_icon,
    smImage: analysis_sm,
    sub_title: "Insights that drive success.",
    description:
      "Access real-time dashboards with key data on sales, costs, and product performance. Generate detailed charts, track trends, and compare results across periods or events. Filter by category, product, or client, and export reports in CSV or PDF for deeper analysis. Make data-driven decisions to optimize sales, margins, and future planning.",
  },
  // {
  //   id: 12,
  //   title: "Accounting",
  //   image: account_img,
  //   icon: account_icon,
  //   sub_title: "",
  //   description: "",
  // },
];
