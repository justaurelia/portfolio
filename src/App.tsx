import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { landingRoutes } from "./routes/landing-routes";

const router = createBrowserRouter([...landingRoutes]);

function App() {
  return (
    <main className="h-full dark:bg-gray-800 p-0">
        <RouterProvider router={router} />
    </main>
  );
}

export default App;
