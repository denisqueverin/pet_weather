import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import debounce from 'lodash.debounce';

import { AutoComplitte, LoadGeoNameCity } from '../../redux/actions';
import { AutoComplSelector, cityNameSelector } from '../../redux/selectors';

import styles from './styles/index.module.css';

// eslint-disable-next-line no-unused-expressions
'use strict';

const LABELS = {
  ERROR: 'To search for a city, enter at least 4 characters',
  ENTERING_CITY: 'Entering a city',
  SEARCH: 'Search',
}

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const cityName = useSelector(cityNameSelector);
  const cityList = useSelector(AutoComplSelector);

  const [ isOpen, setIsOpen ] = useState(false);
  const [ value, setValue ] = useState('');
  const [ isErorImp, setIsErorImp ] = useState(false);

  const inputClickHandler = () => {
    setIsOpen(!isOpen);
  };

  const itemClickHandler = (name: string) => {
    setValue(name);
    setIsOpen(!isOpen);
  }

  const updateCity = (value: string) => {
    dispatch(AutoComplitte(value))
  }

  const debounceOnChange = useCallback(
    debounce(updateCity, 300),
    [],
  )

  const changeCityValue = (value: string) => {
    setValue(value)
    if (value.length > 3) {
      debounceOnChange(value)
      setIsErorImp(false)
    }
  }

  const getGeoCityName = () => {
    dispatch(LoadGeoNameCity())
    setValue(cityName?.name)
  }

  const renderError = (error: boolean) => {
    if (!error) {
      return null;
    }

    return (
      <p
        className={ styles.eror_imp }
      >
        {LABELS.ERROR}
      </p>
    )
  }

  const renderCity = (name: string, icon: string, temp: number) => {
    if (name === '') {
      return <div className={ styles.wrapper_top_geo_temp } />;
    }

    const renderIcon = () => icon && (
      <img
        alt="icon"
        src={ `http://openweathermap.org/img/wn/${icon}@2x.png` }
        style={{
          width: '5vh', height: '5vh', marginTop: '10px', marginLeft: '10px',
        }}
      />
    )

    const mathTemp = `${Math.round(Number(temp))}`

    return (
      <div className={ styles.wrapper_top_geo_temp }>
        <div className={ styles.icon_top_geo_temp } />
        <p className={ styles.text_top_geo_temp }>
          {name.split(',')[0]}
        </p>
        { renderIcon() }
        <p className={ styles.text_top_geo_temp }>
          { mathTemp }
          &deg;
        </p>
      </div>
    )
  }

  const renderList = () => (
    (value.length > 3) && isOpen && cityList[0]?.name
      ? cityList.map(el => (
        <li
          key={ el.key }
          className={ styles.autocomplete_item }
          onClick={ () => itemClickHandler(el.name) }
        >
          {el.name}
        </li>
      ))
      : null
  );

  const renderValues = () => (
    value.length > 3 ? (
    // @ts-ignore
      <Link
        className={ styles.link_none }
        to={ `/${value.split(',')[0]}` }
      >
        <button className={ styles.btn_entry_sity }>
          { LABELS.SEARCH }
        </button>
      </Link>
    ) : (
      <button
        onClick={ () => setIsErorImp(true) }
        className={ styles.btn_entry_sity }
      >
        { LABELS.SEARCH }
      </button>
    )
  );

  return (
    <div>
      { renderCity(cityName?.name, cityName?.icon, cityName?.temp) }
      <div className={ styles.wrapper_home }>
        <div className={ styles.wrapper_input }>
          <input
            value={ value }
            onClick={ inputClickHandler }
            onChange={ e => changeCityValue(e.target.value) }
            type="input"
            className={ styles.city_input }
            placeholder={ LABELS.ENTERING_CITY }
          />
          <ul
            className={ styles.autocomplete }
          >
            { renderList() }
          </ul>
          { renderError(isErorImp) }
        </div>
        { renderValues() }
        <button
          onClick={ () => getGeoCityName() }
          className={ styles.btn_geoposition }
        />
      </div>
    </div>
  )
}

export { Home }
