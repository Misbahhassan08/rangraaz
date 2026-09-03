import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=30538b00"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=30538b00"; const StrictMode = __vite__cjsImport1_react["StrictMode"];
import __vite__cjsImport2_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=30538b00"; const createRoot = __vite__cjsImport2_reactDom_client["createRoot"];
import "/src/index.css?t=1755851497676";
import App from "/src/App.jsx?t=1755848236331";
import { createBrowserRouter, RouterProvider } from "/node_modules/.vite/deps/react-router-dom.js?v=30538b00";
import Home from "/src/pages/Home.jsx?t=1755851164846";
import Cart from "/src/pages/Cart.jsx";
import Allproducts from "/src/pages/Allproducts.jsx";
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
        fileName: "D:/Rangraaz/front-end/src/main.jsx",
        lineNumber: 13,
        columnNumber: 12
      }, this),
      children: [
        { index: true, element: /* @__PURE__ */ jsxDEV(Home, {}, void 0, false, {
          fileName: "D:/Rangraaz/front-end/src/main.jsx",
          lineNumber: 15,
          columnNumber: 27
        }, this) },
        { path: "/cart", element: /* @__PURE__ */ jsxDEV(Cart, {}, void 0, false, {
          fileName: "D:/Rangraaz/front-end/src/main.jsx",
          lineNumber: 16,
          columnNumber: 29
        }, this) },
        { path: "/allproducts", element: /* @__PURE__ */ jsxDEV(Allproducts, {}, void 0, false, {
          fileName: "D:/Rangraaz/front-end/src/main.jsx",
          lineNumber: 17,
          columnNumber: 36
        }, this) }
      ]
    }
  ]
);
const root = document.getElementById("root");
createRoot(root).render(
  /* @__PURE__ */ jsxDEV(RouterProvider, { router }, void 0, false, {
    fileName: "D:/Rangraaz/front-end/src/main.jsx",
    lineNumber: 26,
    columnNumber: 3
  }, this)
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBWWE7QUFaYixTQUFTQSxrQkFBa0I7QUFDM0IsU0FBU0Msa0JBQWtCO0FBQzNCLE9BQU87QUFDUCxPQUFPQyxTQUFTO0FBQ2hCLFNBQVNDLHFCQUFxQkMsc0JBQXNCO0FBQ3BELE9BQU9DLFVBQVU7QUFDakIsT0FBT0MsVUFBVTtBQUNqQixPQUFPQyxpQkFBaUI7QUFFdkIsTUFBTUMsU0FBU0w7QUFBQUEsRUFBb0I7QUFBQSxJQUNsQztBQUFBLE1BQ0VNLE1BQU07QUFBQSxNQUNOQyxTQUFTLHVCQUFDLFNBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUFJO0FBQUEsTUFDWkMsVUFBVTtBQUFBLFFBQ1QsRUFBRUMsT0FBTyxNQUFNRixTQUFTLHVCQUFDLFVBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUFLLEVBQUc7QUFBQSxRQUNoQyxFQUFFRCxNQUFNLFNBQVNDLFNBQVMsdUJBQUMsVUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQUssRUFBRztBQUFBLFFBQzVCLEVBQUVELE1BQU0sZ0JBQWdCQyxTQUFTLHVCQUFDLGlCQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBWSxFQUFHO0FBQUEsTUFBQztBQUFBLElBRzNEO0FBQUEsRUFBQztBQUNGO0FBRUQsTUFBTUcsT0FBT0MsU0FBU0MsZUFBZSxNQUFNO0FBRTNDZCxXQUFXWSxJQUFJLEVBQUVHO0FBQUFBLEVBQ2YsdUJBQUMsa0JBQWUsVUFBaEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUErQjtBQUNqQyIsIm5hbWVzIjpbIlN0cmljdE1vZGUiLCJjcmVhdGVSb290IiwiQXBwIiwiY3JlYXRlQnJvd3NlclJvdXRlciIsIlJvdXRlclByb3ZpZGVyIiwiSG9tZSIsIkNhcnQiLCJBbGxwcm9kdWN0cyIsInJvdXRlciIsInBhdGgiLCJlbGVtZW50IiwiY2hpbGRyZW4iLCJpbmRleCIsInJvb3QiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicmVuZGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIm1haW4uanN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0cmljdE1vZGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGNyZWF0ZVJvb3QgfSBmcm9tICdyZWFjdC1kb20vY2xpZW50J1xuaW1wb3J0ICcuL2luZGV4LmNzcydcbmltcG9ydCBBcHAgZnJvbSAnLi9BcHAuanN4J1xuaW1wb3J0IHsgY3JlYXRlQnJvd3NlclJvdXRlciwgUm91dGVyUHJvdmlkZXIgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJztcbmltcG9ydCBIb21lIGZyb20gJy4vUGFnZXMvSG9tZS5qc3gnO1xuaW1wb3J0IENhcnQgZnJvbSAnLi9wYWdlcy9DYXJ0LmpzeCc7XG5pbXBvcnQgQWxscHJvZHVjdHMgZnJvbSAnLi9wYWdlcy9BbGxwcm9kdWN0cy5qc3gnO1xuXG4gY29uc3Qgcm91dGVyID0gY3JlYXRlQnJvd3NlclJvdXRlcihbXG4gIHtcbiAgICBwYXRoOiBcIi9cIixcbiAgICBlbGVtZW50OiA8QXBwLz4sXG4gICAgIGNoaWxkcmVuOiBbXG4gICAgICB7IGluZGV4OiB0cnVlLCBlbGVtZW50OiA8SG9tZS8+IH0sXG4gICAgICB7IHBhdGg6IFwiL2NhcnRcIiwgZWxlbWVudDogPENhcnQvPiB9LFxuICAgICAgICAgICAgeyBwYXRoOiBcIi9hbGxwcm9kdWN0c1wiLCBlbGVtZW50OiA8QWxscHJvZHVjdHMvPiB9LFxuXG4gICAgXSxcbiAgfSxcbl0pO1xuXG5jb25zdCByb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb290XCIpO1xuXG5jcmVhdGVSb290KHJvb3QpLnJlbmRlcihcbiAgPFJvdXRlclByb3ZpZGVyIHJvdXRlcj17cm91dGVyfSAvPixcbik7XG5cbiJdLCJmaWxlIjoiRDovUmFuZ3JhYXovZnJvbnQtZW5kL3NyYy9tYWluLmpzeCJ9