import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { RotateSpinner } from 'react-spinners-kit';
import { useDispatch, useSelector } from 'react-redux';
import groupBy from 'lodash.groupby';
import _ from 'lodash';

import { Link } from 'react-router-dom';
import {
  dayInfoSelector,
  dayLoadSelector,
  dayErrorSelector,
  weekInfoSelector,
  weekLoadSelector,
  weekErrorSelector,
  cityNameSelector,
} from '../../redux/selectors'
import { LoadTempCity, LoadWeekTemp } from '../../redux/actions'

import styles from './styles/index.module.css'

// eslint-disable-next-line no-unused-expressions
'use strict';

type Props = {}

const LABELS = {
  WEEK_TEMP: 'Week temp',
  M_S: 'm/s',
  WIND_SPEED: 'Wind speed:',
  HUMIDITY: 'Humidity',
  PRESSURE: 'Pressure:',
  ERROR: {
    OOPS: 'Oops, 404',
    LOOK: 'Look out the window',
  },
}

export const City: React.FC<Props> = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const [ isFlag, setIsFlag ] = useState<boolean>(true)

  const weatherDay = useSelector(dayInfoSelector)
  const loadDay = useSelector(dayLoadSelector)
  const errorDay = useSelector(dayErrorSelector)
  const cityName = useSelector(cityNameSelector)

  const weatherWeek = useSelector(weekInfoSelector)
  const loadWeek = useSelector(weekLoadSelector)
  const errorWeek = useSelector(weekErrorSelector)

  const weatherWeekGroup = groupBy(weatherWeek, (el: any) => el.dt)

  const responseWeather = Object.entries(weatherWeekGroup).reduce((acc, [ key, item ]: any) => {
    const maximus = _.maxBy(item, 'maxTemp')
    const minimus = _.minBy(item, 'minTemp')
    const windSpeed = _.meanBy(item, 'wind.speed')
    const windDeg = _.meanBy(item, 'wind.deg')
    const windGust = _.meanBy(item, 'wind.gust')

    return { ...acc, [key]: { max: maximus, min: minimus, wind: { speed: windSpeed, deg: windDeg, gust: windGust } } }
  }, {})

  useEffect(() => {
    dispatch(LoadTempCity(params.city))
    dispatch(LoadWeekTemp(params.city))
  }, [ params ])

  if (errorDay && errorWeek) {
    return (
      <div
        className={ styles.wrapper_error }
      >
        <div
          className={ styles.imageCloud }
        />
        <strong>{ LABELS.ERROR.OOPS }</strong>
        <strong>{ LABELS.ERROR.LOOK }</strong>
      </div>
    )
  }
  if (loadDay && loadWeek) {
    return (
      <div className={ styles.wrapper_spinner }>
        <RotateSpinner
          size={ 45 }
          color="#fff"
        />
      </div>
    )
  }

  const color = (temp: number) => {
    if (temp > 0) {
      return `rgba(255,0,0, ${0.02 * temp})`
    }
    return `rgba(0,0,255, ${0.02 * Math.abs(temp)})`
  }

  const renderColumn = (array: any) => (
    <>
      <tr>
        { array.map((el: any) => (
          <th key={ el.max.maxTemp } style={{ backgroundColor: color(el.max.maxTemp) }}>
            {Math.round(el.max.maxTemp)}
            &deg;
          </th>
        )) }
      </tr>
      <tr className={ styles.ths }>
        { array.map((el:any) => (
          <th key={ el.min.minTemp } style={{ backgroundColor: color(el.min.minTemp) }}>
            {Math.round(el.min.minTemp)}
            &deg;
          </th>
        ))}
      </tr>
    </>
  )

  const renderHeaderTable = (keys: string[]) => (
    <tr>
      {keys.map(el => (<th key={ el }>{el.slice(0, -5)}</th>))}
    </tr>
  )

  const renderDetalis = () => (
    <div
      className={ styles.details }
    >
      <p>
        { LABELS.PRESSURE }
        <span className={ styles.details_value }>{weatherDay?.pressure}</span>
      </p>
      <p>
        { LABELS.HUMIDITY }
        <span className={ styles.details_value }>
          {weatherDay?.humidity}
          {' '}
          %
        </span>
      </p>
      <p>
        { LABELS.WIND_SPEED }
        <span className={ styles.details_value }>
          {weatherDay?.speed}
          {' '}
          { LABELS.M_S }
        </span>
      </p>
    </div>
  )

  const buttonBack = () => (
    // @ts-ignore
    <Link
      to="/"
    >
      <button className={ styles.btn_week_temp }>
        Back
      </button>
    </Link>
  )

  const renderGeo = (name: string) => {
    if (!name) {
      return (
        <div className={ styles.wrapper_top_geo_temp } />
      )
    }

    return (
      <div className={ styles.wrapper_top_geo_temp }>
        <div className={ styles.icon_top_geo_temp } />
        <p className={ styles.text_top_geo_temp }>
          {cityName?.name.split(',')[0]}
        </p>
        {cityName?.icon && (
          <img
            alt="icon"
            src={ `http://openweathermap.org/img/wn/${cityName?.icon}@2x.png` }
            style={{
              width: '5vh', height: '5vh', marginTop: '10px', marginLeft: '10px',
            }}
          />
        )}
        <p className={ styles.text_top_geo_temp }>
          {Math.round(Number(cityName?.temp))}
          {' '}
          &deg;
        </p>
      </div>
    )
  }

  const weatherIcon = () => {
    if (!weatherDay?.icon) {
      return null
    }

    return (
      <img alt="icon" src={ `http://openweathermap.org/img/wn/${weatherDay?.icon}@2x.png` } />
    )
  }

  const renderTable = (flag: boolean) => {
    if (flag) {
      return null
    }

    return (
      <div
        className={ styles.wrapper_table }
      >
        <table className={ styles.table_wraper }>
          <thead>
            {renderHeaderTable(Object.keys(responseWeather))}
          </thead>
          <tbody>
            {renderColumn(Object.values(responseWeather))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      <div
        className={ styles.wrapper_button }
      >
        { renderGeo(cityName.name) }
        { buttonBack() }
      </div>
      <div className={ styles.wrapper_weathers }>
        <h1 className={ styles.lable_sity }>
          { params?.city.charAt(0).toUpperCase() }
          { params?.city.slice(1).toLowerCase() }
        </h1>
        <div className={ styles.iconTemp }>
          { weatherIcon() }
          <p className={ styles.temp }>
            {Math.round(Number(weatherDay?.temp))}
            &deg;
          </p>
        </div>
        <div
          className={ styles.detalis_wrapper }
        >
          { renderDetalis() }
        </div>
        <div
          className={ styles.btn_week_temp_wrapper }
        >
          <button
            onClick={ () => setIsFlag(!isFlag) }
            className={ styles.btn_week_temp }
          >
            { LABELS.WEEK_TEMP }
          </button>
        </div>
        { renderTable(isFlag) }
      </div>
    </div>
  )
}
