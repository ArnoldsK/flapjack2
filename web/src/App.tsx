import type { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { PageLayout } from "@web/components/PageLayout";
import { LandingPage } from "@web/pages/LandingPage";
import { RecapPage } from "@web/pages/RecapPage";
import { VideosPage } from "@web/pages/VideosPage";

const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recap" element={<RecapPage />} />
        <Route path="/videos" element={<VideosPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
