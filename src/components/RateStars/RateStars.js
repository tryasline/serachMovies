import React, { Component } from 'react';
import store from 'store';
import PropTypes from 'prop-types';
import { Rate } from 'antd';

import './RateStars.css';
import MovieDbService from '../services/MovieDbService';

export default class RateStars extends Component {
  state = {
    // eslint-disable-next-line react/destructuring-assignment
    ratingValue: store.get(`${this.props.id}`) || 0,
  };

  setMovieRating = (rate) => {
    const { guestSessionId, id } = this.props;
    const callMovieDbService = new MovieDbService();
    this.setState({
      ratingValue: rate,
    });
    if (rate === 0) callMovieDbService.deleteRateMovie(id, guestSessionId);
    callMovieDbService.setMovieRating(id, guestSessionId, rate);
    store.set(`${id}`, `${rate}`);
  };

  render() {
    const { ratingValue } = this.state;
    return (
      <Rate
        count={10}
        value={ratingValue}
        onChange={(rate) => {
          this.setMovieRating(rate);
        }}
      />
    );
  }
}
RateStars.defaultProps = {
  guestSessionId: '',
  id: 0,
};

RateStars.propTypes = {
  guestSessionId: PropTypes.string,
  id: PropTypes.number,
};
