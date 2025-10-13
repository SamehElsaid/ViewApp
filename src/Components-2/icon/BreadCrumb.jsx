import React from 'react';
import {
  Breadcrumbs,
  Typography,
  Link,
  Paper
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

const BreadcrumbComponent = () => {
  const router = useRouter();

  // Get the current path including query parameters
  const fullPath = router.asPath;
  
  // Extract just the path without query for building breadcrumbs
  const pathWithoutQuery = fullPath.split('?')[0];
  const pathSegments = pathWithoutQuery.split('/').filter(segment => segment);
  
  // Preserve the original query string
  const queryString = fullPath.includes('?') ? fullPath.substring(fullPath.indexOf('?')) : '';

  // Function to generate breadcrumb items
  const getBreadcrumbs = () => {
    // Start with Home
    const breadcrumbs = [
      { label: 'Home', path: '/' + queryString }
    ];

    // Build up path as we go
    let currentPath = '';

    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;

      const label = segment.charAt(0).toUpperCase() +
                   segment.slice(1).replace(/-/g, ' ');

      breadcrumbs.push({
        label,
        path: currentPath + queryString
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'transparent' }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return isLast ? (
            <Typography color="text.primary" key={index}>
              {breadcrumb.label}
            </Typography>
          ) : (
            <NextLink href={breadcrumb.path} passHref key={index}>
              <Link
                underline="hover"
                color="inherit"
              >
                {breadcrumb.label}
              </Link>
            </NextLink>
          );
        })}
      </Breadcrumbs>
    </Paper>
  );
};

export default BreadcrumbComponent;