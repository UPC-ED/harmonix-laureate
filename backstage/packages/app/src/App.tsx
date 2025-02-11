import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core-components';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { AppCatalogPage } from '@aws/plugin-aws-apps-for-backstage';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { OPAHomePage, customerTheme, awsTheme, opaTheme } from '@aws/plugin-aws-apps-demo-for-backstage';
import { darkTheme, lightTheme } from '@backstage/theme';
import { CssBaseline, ThemeProvider } from '@material-ui/core';

const app = createApp({
  apis,
  components: {
    SignInPage: props => {
      return (
        <SignInPage
          {...props}
          auto
          providers={[
            {
              id: 'github',
              title: 'GitHub',
              message: 'Sign in using GitHub',
              apiRef: githubAuthApiRef,
            },
          ]}
        />
      );
    },
  },
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
  themes: [
    {
      id: 'customerTheme',
      title: 'CUSTOMER',
      variant: 'light',
      Provider: ({ children }) => (
        <ThemeProvider theme={customerTheme}>
          <CssBaseline>{children}</CssBaseline>
        </ThemeProvider>
      ),
    },
    {
      id: 'light',
      title: 'Light',
      variant: 'light',
      Provider: ({ children }) => (
        <ThemeProvider theme={lightTheme}>
          <CssBaseline>{children}</CssBaseline>
        </ThemeProvider>
      ),
    },
    {
      id: 'dark',
      title: 'Dark',
      variant: 'dark',
      Provider: ({ children }) => (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline>{children}</CssBaseline>
        </ThemeProvider>
      ),
    },
    {
      id: 'awsTheme',
      title: 'AWS',
      variant: 'light',
      Provider: ({ children }) => (
        <ThemeProvider theme={awsTheme}>
          <CssBaseline>{children}</CssBaseline>
        </ThemeProvider>
      ),
    },
    {
      id: 'opaTheme',
      title: 'OPA',
      variant: 'light',
      Provider: ({ children }) => (
        <ThemeProvider theme={opaTheme}>
          <CssBaseline>{children}</CssBaseline>
        </ThemeProvider>
      ),
    },
  ]
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/home" element={<OPAHomePage />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={
      <ScaffolderPage
        groups={[
          {
            title: "AWS Environments and Environment Providers",
            filter: entity =>
              (entity?.metadata?.tags?.includes('environment-provider') || entity?.metadata?.tags?.includes('aws-environment')) ?? false,
          },
          {
            title: "AWS Resources",
            filter: entity =>
              entity?.metadata?.tags?.includes('aws-resource') ?? false,
          },
        ]}
      />
    } />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/aws-apps-search-page" element={<CatalogIndexPage />}>
      <AppCatalogPage kind="all" />
    </Route>
    <Route path="/aws-apps-search-page/environments" element={<CatalogIndexPage />}>
      <AppCatalogPage kind="awsenvironment" />
    </Route>
    <Route path="/aws-apps-search-page/providers" element={<CatalogIndexPage />}>
      <AppCatalogPage kind="awsenvironmentprovider" />
    </Route>
    <Route path="/aws-apps-search-page/apps" element={<CatalogIndexPage />}>
      <AppCatalogPage kind="component" />
    </Route>
    <Route path="/aws-apps-search-page/resources" element={<CatalogIndexPage />}>
      <AppCatalogPage kind="resource" />
    </Route>
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);
