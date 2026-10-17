import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Predict } from './pages/Predict';
import { Batch } from './pages/Batch';
import { Insights } from './pages/Insights';
import { Models } from './pages/Models';
import { History } from './pages/History';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { NotFound } from './pages/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="predict" element={<Predict />} />
        <Route path="batch" element={<Batch />} />
        <Route path="insights" element={<Insights />} />
        <Route path="models" element={<Models />} />
        <Route path="history" element={<History />} />
        <Route path="about" element={<About />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
