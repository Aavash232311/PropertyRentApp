import ReactDOM from 'react-dom/client'
import App from './App.tsx';
import './index.css'
import { AuthProvider } from './Components/auth/auth.tsx';
import Services from './Components/auth/uservice.ts';
import EmailConform from './Components/auth/emai.tsx';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';
import SignUp from './Components/auth/signup.tsx';
import Login from './Components/auth/login.tsx';
import Property from './Components/public/LocalAdminActions/Property.tsx';
import Profile from './Components/auth/profile.tsx';
import AdminEssential from './Components/Admin/Essential.tsx';
import { HighlightProperty } from './Components/Admin/Highlight.tsx';
import MapSearchHaversineRadii from './Components/public/Useable/MapSearch.tsx';
import ResultPage from './Components/public/Result.tsx';
import ViewProperty from './Components/public/ViewProperty.tsx';
import EditCompoenentProperty from './Components/public/LocalAdminActions/EditProperty.tsx';
import AdminUserEdit from "./Components/Admin/User.tsx";
import AdminLogs from './Components/Admin/Logs.tsx';
import ForgotPassword from './Components/auth/password.tsx';
import UserProfile from './Components/public/UserProfile.tsx';
import Info from './Components/Admin/Info.tsx';
import About from './Components/public/About.tsx';
export let adminRoute = [
  {
    path: "/admin-essentail",
    element: <AdminEssential />,
    allowedRoles: ["superuser"]
  },
  {
    path: "highlight-property-home-page",
    element: <HighlightProperty />,
    allowedRoles: ["superuser"]
  },
  {
    path: "user-admin",
    element: <AdminUserEdit />,
    allowedRoles: ["superuser"]
  },
  {
    path: "logs-lang",
    element: <AdminLogs />,
    allowedRoles: ["superuser"]
  },
  {
    path: "info-about",
    element: <Info />,
    allowedRoles: ["superuser"]
  }
];
//   allowedRoles: [] allow anonymous
export let router = [
  {
    path: "/",
    element: <App />,
    allowedRoles: [],
  },
  {
    path: "/map-search",
    element: <MapSearchHaversineRadii />,
    allowedRoles: []
  },
  {
    path: "/property-search",
    element: <ResultPage />,
    allowedRoles: []
  },
  {
    path: "/property-view",
    element: <ViewProperty />,
    allowedRoles: []
  },
  {
    path: "/signup-user",
    element: <SignUp />,
    allowedRoles: [],
  },
  {
    path: "/conform-email",
    element: <EmailConform />,
    allowedRoles: [],
  },
  {
    path: "about",
    element: <About />,
    allowedRoles: [],
  },
  {
    path: "/user-login",
    element: <Login />,
    allowedRoles: [],
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    allowedRoles: [],
  },
  {
    path: "/UserProfile",
    element: <UserProfile />,
    allowedRoles: [],
  },
  {
    path: "/user-property",
    element: <Property />,
    allowedRoles: ["Client", "superuser"]
  },
  {
    path: "/user-profile",
    element: <Profile />,
    allowedRoles: ["Client", "superuser"]
  },
  {
    path: "edit-property",
    element: <EditCompoenentProperty />,
    allowedRoles: ["Client", "superuser"]
  }
];
adminRoute.map((i: any) => {
  router.push(i);
})

// (RBAC) FOR UI, API IS SECURE AND INDEPENDENT OF CLIENT SIDE
var services = new Services();
const rt = localStorage.getItem("refreshToken");
const at = localStorage.getItem("authToken");
if (at != null && rt != null) {
  const refresh = () => {
    services
      .refreshToken()
      .then((dat) => {
        const { accessToken, refreshToken } = dat;
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      })
      .catch((err) => {
        console.error("Failed to refresh token: ", err);
      });
  };
  refresh();
  // lets add a mechanism to refresh out token on the interval of 36000s = 1hr
  // we can't exactly do 1 hr because
  // nothing in this world is real time even the light
  setInterval(refresh, 60000 * 15);
}
// RBAC
let fliter = router.filter((i) => {
  const roleArray: string | string[] = i.allowedRoles;
  const role: string | null = localStorage.getItem("permissionClass") || null;
  if (roleArray.length === 0) return true; // no restrictions
  if (role == null) return;
  const findIndex = roleArray.indexOf(role);
  if (findIndex >= 0) return true;
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <AuthProvider>
    <RouterProvider router={createBrowserRouter(fliter)} />
  </AuthProvider>
  // </React.StrictMode>,
)
