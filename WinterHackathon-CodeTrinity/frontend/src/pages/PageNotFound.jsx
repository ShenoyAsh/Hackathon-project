import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';

const PageNotFound = () => {
  return (
    <Container className="min-h-screen flex items-center justify-center py-12">
      <div className="text-center">
        <p className="text-sm font-semibold text-primary-600">404</p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Button
            as={Link}
            to="/"
            variant="primary"
            className="inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default PageNotFound;
