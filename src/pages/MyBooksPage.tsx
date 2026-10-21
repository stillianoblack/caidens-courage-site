import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MyBooksLibrary from '../components/bookstore/MyBooksLibrary';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { STORY_BOOKS_PATH } from '../config/courageRoutes';

const MyBooksPage: React.FC = () => {
  useEffect(() => {
    document.title = 'My Books | Caiden Vale';
  }, []);

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header />
      <main className="cv-under-marvel-header mx-auto max-w-xl px-4 pb-16 sm:px-6" style={{ paddingTop: '150px' }}>
        <MyBooksLibrary />
        <p className="mt-6 text-sm text-navy-500">
          <Link to={STORY_BOOKS_PATH} className="font-semibold text-navy-600 underline-offset-2 hover:underline">
            Back to the bookstore
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default MyBooksPage;
