import { Component } from 'react';
import store from 'store';

import { Alert, Empty, Layout, Pagination, Space, Spin } from 'antd';
import { format, parseISO } from 'date-fns';
import { Context } from '../GenresContext/GenresContext';

import MovieDbService from '../services/MovieDbService';
import Header from '../Header';
import Search from '../Search';
import CardList from '../CardList';

import './app.css';
import 'antd/dist/reset.css';

import outOfPosterImg from './Out_Of_Poster.jpg';

export default class App extends Component {
  state = {
    movies: [],
    ratedFilm: [],
    genresList: [],
    isLoading: true,
    isError: false,
    notFound: false,
    searchQuery: '',
    numberPage: 1,
    totalPages: 0,
    guestSessionId: '',
    tabPane: '1',
  };

  componentDidMount() {
    if (!store.get('guestSessionId')) {
      this.createGuestSession();
    } else {
      this.setState({
        guestSessionId: store.get('guestSessionId'),
      });
    }

    this.getGenresList();
    this.getPopularMovies();
  }

  static getDerivedStateFromError() {
    return { isError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(info.componentStack);
  }

  getGenresList = () => {
    const callMovieDbService = new MovieDbService();
    callMovieDbService
      .getGenersList()
      .then((body) => {
        this.setState({
          // eslint-disable-next-line react/no-unused-state
          genresList: [...body.genres],
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          notFound: false,
          isError: true,
        });
      });
  };

  createGuestSession = () => {
    const callMovieDbService = new MovieDbService();
    callMovieDbService
      .guestSession()
      .then((body) => {
        store.set('guestSessionId', `${body.guest_session_id}`);
        this.setState({
          // eslint-disable-next-line react/no-unused-state
          guestSessionId: body.guest_session_id,
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          notFound: false,
          isError: true,
        });
      });
  };

  searchMovies = () => {
    const { searchQuery, numberPage } = this.state;
    const callMovieDbService = new MovieDbService();
    this.setState({
      movies: [],
      isLoading: true,
      notFound: false,
      isError: false,
    });

    if (searchQuery === '') {
      this.getPopularMovies();
    } else {
      callMovieDbService
        .searchMovies(searchQuery, numberPage)
        .then((item) => {
          this.setState({
            totalPages: item.total_pages,
            numberPage,
          });
          if (item.results.length === 0) {
            this.setState({
              isLoading: false,
              notFound: true,
            });
          }
          item.results.forEach((elm) => {
            this.addItemToList(elm);
          });
        })
        .catch(() => {
          this.setState({
            isLoading: false,
            notFound: false,
            isError: true,
          });
        });
    }
  };

  getPopularMovies = () => {
    const { numberPage } = this.state;
    const callMovieDbService = new MovieDbService();
    this.setState({
      movies: [],
      isLoading: true,
      notFound: false,
      isError: false,
    });
    callMovieDbService
      .getPopularMovies(numberPage)
      .then((item) => {
        this.setState({
          // eslint-disable-next-line react/no-unused-state
          totalPages: item.total_pages,
          numberPage,
        });
        if (item.results.length === 0) {
          this.setState({
            isLoading: false,
            notFound: true,
          });
        }
        item.results.forEach((elm) => {
          this.addItemToList(elm);
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          notFound: false,
          isError: true,
        });
      });
  };

  getRatedMovies = () => {
    const { guestSessionId, numberPage } = this.state;
    const callMovieDbService = new MovieDbService();
    this.setState({
      ratedFilm: [],
      isLoading: true,
      notFound: false,
      isError: false,
    });
    callMovieDbService
      .getRatedMovies(guestSessionId, numberPage)
      .then((item) => {
        this.setState({
          totalPages: item.total_pages,
          numberPage,
        });
        if (item.results.length === 0) {
          this.setState({
            isLoading: false,
            notFound: true,
          });
        }
        item.results.forEach((elm) => {
          this.addRatedItemToList(elm);
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          notFound: false,
          isError: true,
        });
      });
  };

  searchQueryChange = (searchQuery) => {
    this.setState(
      {
        searchQuery,
        // eslint-disable-next-line react/no-unused-state
        numberPage: 1,
      },
      () => {
        this.searchMovies();
      }
    );
  };

  changeTab = (key) => {
    if (key === '2') {
      this.setState(
        {
          tabPane: key,
          numberPage: 1,
        },
        () => {
          this.getRatedMovies();
        }
      );
    } else {
      this.setState(
        {
          notFound: false,
          tabPane: key,
          numberPage: 1,
        },
        () => {
          this.getPopularMovies();
        }
      );
    }
  };

  changePage = (page) => {
    const { tabPane } = this.state;
    this.setState(
      {
        numberPage: page,
      },
      () => {
        if (tabPane === '1') {
          this.searchMovies();
        } else {
          this.getRatedMovies();
        }
      }
    );
  };

  addItemToList = (item) => {
    const newItem = this.createItem(item);

    this.setState(({ movies }) => {
      const newDataStream = [...movies, newItem];
      return {
        movies: newDataStream,
        isLoading: false,
      };
    });
  };

  addRatedItemToList = (item) => {
    const newItem = this.createItem(item);

    this.setState(({ ratedFilm }) => {
      const newDataStream = [...ratedFilm, newItem];
      return {
        ratedFilm: newDataStream,
        isLoading: false,
      };
    });
  };

  getGenresFilm = (genresIds) => {
    const filmGenres = [];
    const { genresList } = this.state;
    // eslint-disable-next-line prefer-const
    for (let genreId of genresIds) {
      // eslint-disable-next-line react/destructuring-assignment
      genresList.forEach((el) => {
        if (el.id === genreId) {
          filmGenres.push(el.name);
        }
      });
    }
    return filmGenres;
  };

  createItem = (item) => {
    const releaseDate = item.release_date ? format(parseISO(item.release_date), 'MMMM dd, yyyy') : 'no release date';
    const filmTitle = item.title || 'Movie title not specified';
    const overview = item.overview || 'Movie overview not specified';
    const popularity = item.vote_average || 0;
    const rating = store.get(`${item.id}`) || item.rating || 0;
    let posterURL = `${outOfPosterImg}`;
    if (item.poster_path) {
      posterURL = `https://image.tmdb.org/t/p/w200${item.poster_path}`;
    }
    const genres = this.getGenresFilm(item.genre_ids);

    return {
      id: item.id,
      filmTitle,
      posterURL,
      releaseDate,
      overview,
      popularity,
      rating,
      genres,
    };
  };

  onError = () => {
    this.setState({
      isLoading: false,
      isError: true,
    });
  };

  render() {
    const { Content } = Layout;
    const { movies, isLoading, isError, notFound, totalPages, numberPage, guestSessionId, tabPane, ratedFilm } =
      this.state;

    const contextValue = { movies, ratedFilm, tabPane, guestSessionId };

    const error = isError ? (
      <Alert message="Error" description="Что-то пошло не так. Но мы скоро все исправим :-)" type="error" showIcon />
    ) : null;
    const foundMovies = notFound ? <Empty /> : <CardList />;

    const spin = isLoading && !isError ? <Spin tip="Loading..." size="large" /> : null;

    const search = tabPane === '1' ? <Search searchQueryChange={this.searchQueryChange} /> : null;

    const pagination =
      totalPages > 0 && !isLoading ? (
        <Pagination
          defaultCurrent={1}
          current={numberPage}
          total={totalPages * 10}
          showSizeChanger={false}
          onChange={this.changePage}
        />
      ) : null;

    return (
      <div className="container">
        <Layout>
          <Context.Provider value={contextValue}>
            <Content>
              <Header changeTab={this.changeTab} />
              {search}
              <Space direction="vertical" align="center">
                {spin}
                {foundMovies}
                {error}
                {pagination}
              </Space>
            </Content>
          </Context.Provider>
        </Layout>
      </div>
    );
  }
}
