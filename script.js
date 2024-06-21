'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const renderError = function (message) {
  countriesContainer.insertAdjacentText('beforeend', message);
  // countriesContainer.style.opacity = 1;
};

const renderCountry = function (data, className = '') {
  const html = `
    <article class="country ${className}">
      <img class="country__img" src="${data.flag}" />
      <div class="country__data">
        <h3 class="country__name">${data.name}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👫</span>${(
          +data.population / 1000000
        ).toFixed(1)} million people</p>
        <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
        <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
      </div>
    </article>
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
};

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    // navigator.geolocation.getCurrentPosition(
    //   position => resolve(position),
    //   err => reject(err)
    // );
    navigator.geolocation.getCurrentPosition(resolve, reject); // é la stessa cosa scritta sopra ma semplificata
  });
};

getPosition().then(pos => console.log(pos));

const whereAmI = function () {
  getPosition()
    .then(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      return fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
      );
    })
    .then(response => {
      if (!response.ok)
        throw new Error(`Oopsie, something went wrong (${response.status})`);
      return response.json();
    })
    .then(data => {
      console.log(data);
      console.log(`You are in ${data.city}, ${data.countryName}`);
      return fetch(
        `https://countries-api-836d.onrender.com/countries/name/${data.countryName}`
      );
    })
    .then(res => {
      if (!res.ok) throw new Error(`Country not found (${res.status})`);
      return res.json();
    })
    .then(data => {
      console.log(data);
      if (data.length === 1) return renderCountry(data[0]);
      if (data.length === 2) return renderCountry(data[1]);
    })
    .catch(err => console.error(`${err.message}💥`))
    .finally((countriesContainer.style.opacity = 1));
};

btn.addEventListener('click', whereAmI);

///////////////////////////////////////

// OLD SCHOOL AJAX CALL
/*
  const renderCountry = function (data, className = '') {
    const languages = Object.values(data.languages);
    const currencies = Object.values(data.currencies);
    const html = `
    <article class="country ${className}">
    <img class="country__img" src= "${data.flags.svg}">
    <div class="country__data">
    <h3 class="country__name"> ${data.name.official}</h3>
    <h4 class="country__region">${data.region}</h4>
    <p class="country__row"><span>👫</span>${(
      data.population / 1000000
    ).toFixed(1)} million</p>         
    <p class="country__row"><span>🗣️</span>${languages[0]}</p>
    <p class="country__row"><span>💰</span>${currencies[0].name}</p>
    </div>
    </article>`;
    
    countriesContainer.insertAdjacentHTML('beforeend', html);
    countriesContainer.style.opacity = 1;
  };
  
  const getCountryAndNeighbour = function (country) {
    // Ajax call Country 1
    const request = new XMLHttpRequest();
    request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
    request.send();
    
    request.addEventListener('load', function () {
      const [data] = JSON.parse(this.responseText);
      console.log(data); //use this to study the data you want to use.
      
      // Render country 1
      renderCountry(data);
      
      // Get neighbour country (2)
      const neighbours = data.borders;
      
      if (!neighbours) return;
      
      // Ajax call Country 2
      neighbours.forEach(neighbour => {
        let request2 = new XMLHttpRequest();
        request2.open(
          'GET',
          `https://restcountries.com/v3.1/alpha/${neighbour}
          `
        );
        request2.send();
        request2.addEventListener('load', function () {
          const [data2] = JSON.parse(this.responseText);
          console.log(data2);
          
          renderCountry(data2, 'neighbour');
        });
      });
    });
  };

  // Sample countries whose details we want to display.
  getCountryAndNeighbour('usa');
  
  setTimeout(() => {
    console.log('1 second passed');
    setTimeout(() => {
      console.log('2 seconds passed');
      setTimeout(() => {
        console.log('3 seconds passed');
        setTimeout(() => {
          console.log('4 seconds passed');
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
  */
// NEW SCHOOL AJAX CALL

const getJSON = function (url, errorMsg = 'Something went wrong') {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);

    return response.json();
  });
};

const getCountryData = function (country) {
  // country 1
  getJSON(
    `https://countries-api-836d.onrender.com/countries/name/${country}`,
    'Country not found'
  )
    .then(data => {
      renderCountry(data[0]);
      const neighbour = data[0].borders?.[0];

      if (!neighbour) throw new Error('No neighbour found');

      // country 2
      return getJSON(
        `https://countries-api-836d.onrender.com/countries/alpha/${neighbour}`,
        'Country not found'
      );
    })
    .then(data => {
      renderCountry(data, 'neighbour');
    })
    .catch(err => {
      renderError(`Something went wrong 💥💥💥 ${err.message}. Try again!`);
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};

btn.addEventListener('click', function () {
  getCountryData('usa');
});

// const getCountryData = function (country) {
//   fetch(`https://restcountries.com/v3.1/name/${country}`)
//     .then(function (response) {
//       console.log(response);
//       return response.json(); // .json() ritorna una promessa alla quale dobbiamo attaccare di nuovo .then() in modo da leggere i dati
//     })
//     .then(function (data) {
//       console.log(data);
//       renderCountry(data[0]);
//     });
// };

/*
        ////////////////////////////////////////////////////////////////////////////////////
        
        Coding challenge #1
        
        const whereAmI = function (lat, lng) {
            fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
              )
                .then(response => {
                    if (!response.ok)
                        throw new Error(`Oopsie, something went wrong (${response.status})`);
                    return response.json();
                  })
                  .then(data => {
                      console.log(data);
      console.log(`You are in ${data.city}, ${data.countryName}`);
      return fetch(
        `https://countries-api-836d.onrender.com/countries/name/${data.countryName}`
      );
    })
    .then(res => {
      if (!res.ok) throw new Error(`Country not found (${res.status})`);
      return res.json();
    })
    .then(data => {
      console.log(data);
      if (data.length === 1) return renderCountry(data[0]);
      if (data.length === 2) return renderCountry(data[1]);
    })
    .catch(err => console.error(`${err.message}💥`))
    .finally((countriesContainer.style.opacity = 1));
};

whereAmI(52.508, 13.381);
whereAmI(19.037, 72.873);
whereAmI(-33.933, 18.474);

console.log('Test start');
setTimeout(() => console.log('0 sec timer'), 0);
Promise.resolve('Resolved promised 1').then(res => console.log(res)); //creo una promessa che si risolve immediatamentes

Promise.resolve('Resolved promise 2').then(res => {
  for (let i = 0; i < 1000000000; i++) {}
  console.log(res);
});
console.log('Test end');


const lotteryPromise = new Promise(function (resolve, reject) {
  console.log('Lottery draw is happening 🔮');

  setTimeout(function () {
    if (Math.random() >= 0.5) {
      resolve('You WIN 🏆🏆🏆');
    } else {
      reject(new Error('You lost your money 💸💸💸'));
    }
  }, 2000);
});

lotteryPromise.then(res => console.log(res)).catch(err => console.error(err)); // consumo la promessa

// Promisifying setTimeout
const wait = function (seconds) {
  return new Promise(function (resolve) {
    //il timer non puó fallire dunque non ho bisogno del parametro reject
    setTimeout(resolve, seconds * 1000);
  });
};

wait(1)
  .then(() => {
    console.log('1 second passed');
    return wait(1);
  })
  .then(() => {
    console.log('2 seconds passed');
    return wait(1);
  })
  .then(() => {
    console.log('3 seconds passed');
    return wait(1);
  })
  .then(() => console.log('4 seconds passed'));

setTimeout(() => {
  console.log('1 second passed');
  setTimeout(() => {
    console.log('2 seconds passed');
    setTimeout(() => {
      console.log('3 seconds passed');
      setTimeout(() => {
        console.log('4 seconds passed');
      }, 1000);
    }, 1000);
  }, 1000);
}, 1000);

Promise.resolve('abc').then(x => console.log(x));
Promise.reject(new Error('Problem!')).catch(x => console.error(x));*/

///////////////////////////////////////////////////////////////////////////////////////////////////

// Coding Challenge #2

/*const imgContainer = document.querySelector('.images');

const wait = function (seconds) {
  return new Promise(function (resolve) {
    //il timer non puó fallire dunque non ho bisogno del parametro reject
    setTimeout(resolve, seconds * 1000);
  });
};

const createImage = function (imgPath) {
  return new Promise(function (resolve, reject) {
    const img = document.createElement('img');

    img.src = imgPath;

    img.addEventListener('load', function () {
      imgContainer.append(img);
      resolve(img);
    });

    img.addEventListener('error', function () {
      reject(new Error('Image not found'));
    });
  });
};
let currentImg;
createImage('img/img-1.jpg')
  .then(img => {
    currentImg = img;
    console.log('Image loaded');
    return wait(2);
  })
  .then(() => {
    currentImg.style.display = 'none';
    return createImage('img/img-2.jpg');
  })
  .then(img => {
    currentImg = img;
    console.log('Image loaded');
    return wait(2);
  })
  .then(() => {
    currentImg.style.display = 'none';
  })
  .catch(err => console.error(err)); */

///////////////////////////////////////////////////////////////////

// ASYNC/AWAIT
/*
const getPosition = function () {
  return new Promise(function (resolve, reject) {
    // navigator.geolocation.getCurrentPosition(
    //   position => resolve(position),
    //   err => reject(err)
    // );
    navigator.geolocation.getCurrentPosition(resolve, reject); // é la stessa cosa scritta sopra ma semplificata
  });
};

const whereAmI = async function () {
  try {
    // Geolocation
    const pos = await getPosition();

    const { latitude: lat, longitude: lng } = pos.coords;

    // Reverse Geocoding
    const resGeo = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
    );
    if (!resGeo.ok) throw new Error('Problem getting location data');
    const dataGeo = await resGeo.json();

    // Country data
    const res = await fetch(
      ` https://countries-api-836d.onrender.com/countries/name/${dataGeo.countryName}`
    );
    if (!resGeo.ok) throw new Error('Problem getting location data');
    const data = await res.json();
    renderCountry(data[0]);

    return `You are in ${dataGeo.city}, ${dataGeo.countryName}`;
  } catch (err) {
    console.error(err);
    renderError(` ${err.message}`);

    // Reject promise returned from async function
    throw err;
  }
};

// const city = whereAmI();
// console.log(city);

// whereAmI()(
// .then(city => console.log(`2: ${city}`))
// .catch(err => console.error(`2: ${err.message}`))
// .finally(() => console.log('3: Finished getting location'));

console.log('1: Will get location');
(async function () {
  try {
    const city = await whereAmI();
    console.log(`2: ${city}`);
  } catch (error) {
    console.error(`2: ${err.message}`);
  }
  console.log('3: Finished getting location');
})();

const getJSON = function (url, errorMsg = 'Something went wrong') {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);

    return response.json();
  });
};

const get3Countries = async function (c1, c2, c3) {
  try {
    // const [data1] = await getJSON(
    //   ` https://countries-api-836d.onrender.com/countries/name/${c1}`
    // );
    // const [data2] = await getJSON(
    //   ` https://countries-api-836d.onrender.com/countries/name/${c2}`
    // );
    // const [data3] = await getJSON(
    //   ` https://countries-api-836d.onrender.com/countries/name/${c3}`
    // );

    const data = await Promise.all([
      getJSON(` https://countries-api-836d.onrender.com/countries/name/${c1}`),
      getJSON(` https://countries-api-836d.onrender.com/countries/name/${c2}`),
      getJSON(` https://countries-api-836d.onrender.com/countries/name/${c3}`),
    ]); // promise.all riceve un array e ritorna un array

    console.log(data.map(d => d[0].capital));
  } catch (err) {
    console.error(err);
  }
};

get3Countries('italy', 'portugal', 'spain');

const getJSON = function (url, errorMsg = 'Something went wrong') {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);

    return response.json();
  });
};

// Promise.race
// Riceve un array di promesse e ritorna una promessa la quale viene risolta non appena una delle promesse fatte é risolta (sia rifiutata che accettata)

(async function () {
  const res = await Promise.race([
    getJSON(`https://countries-api-836d.onrender.com/countries/name/italy`),
    getJSON(`https://countries-api-836d.onrender.com/countries/name/portugal`),
    getJSON(`https://countries-api-836d.onrender.com/countries/name/spain`),
  ]);
  console.log(res[0]);
})();

const timeout = function (sec) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error('Request took too long!'));
    }, sec * 1000);
  });
};

Promise.race([
  getJSON(`https://countries-api-836d.onrender.com/countries/name/tanzania`),
  timeout(5),
])
  .then(res => console.log(res[0]))
  .catch(err => console.error(err));

// Promise.allSettled
// riceve un array e ne restituisce un altro di promesse risolte (accettate o meno)
Promise.allSettled([
  Promise.resolve('success'),
  Promise.reject('ERROR'),
  Promise.resolve('success'),
]).then(res => console.log(res));

Promise.all([
  Promise.resolve('success'),
  Promise.reject('ERROR'),
  Promise.resolve('success'),
])
  .then(res => console.log(res))
  .catch(err => console.error(err));

// Promise.any [ES2021]
// riceve un array di promesse e ritorna la prima promessa risoluta (accettata)
Promise.any([
  Promise.resolve('success'),
  Promise.reject('ERROR'),
  Promise.resolve('success'),
])
  .then(res => console.log(res))
  .catch(err => console.error(err));
*/

////////////////////////////////////////////////////////////////////////

// Coding Challenge #3
// const imgContainer = document.querySelector('.images');
// const wait = function (seconds) {
//   return new Promise(function (resolve) {
//     //il timer non puó fallire dunque non ho bisogno del parametro reject
//     setTimeout(resolve, seconds * 1000);
//   });
// };

// const createImage = function (imgPath) {
//   return new Promise(function (resolve, reject) {
//     const img = document.createElement('img');

//     img.src = imgPath;

//     img.addEventListener('load', function () {
//       imgContainer.append(img);
//       resolve(img);
//     });

//     img.addEventListener('error', function () {
//       reject(new Error('Image not found'));
//     });
//   });
// };

// const loadNPause = async function () {
//   try {
//     // Load image 1
//     let img = await createImage('img/img-1.jpg');
//     console.log('Image 1 loaded');
//     await wait(2);
//     img.style.display = 'none';
//     // Load image 2
//     let img1 = await createImage('img/img-2.jpg');
//     console.log('Image 2 loaded');
//     await wait(2);
//     img1.style.display = 'none';
//   } catch (err) {
//     console.error(err);
//   }
// };

// loadNPause();

// const loadAll = async function (imgArr) {
//   try {
//     const imgs = imgArr.map(async img => await createImage(img));
//     const images = await Promise.all(imgs);
//     console.log(images);
//     images.forEach(img => img.classList.add('parallel'));
//   } catch (error) {
//     console.log(error);
//   }
// };

// loadAll(['img/img-1.jpg', 'img/img-2.jpg', 'img/img-3.jpg']);

// Coding Challenge #2
/*


const createImage = function (imgPath) {
  return new Promise(function (resolve, reject) {
    const img = document.createElement('img');

    img.src = imgPath;

    img.addEventListener('load', function () {
      imgContainer.append(img);
      resolve(img);
    });

    img.addEventListener('error', function () {
      reject(new Error('Image not found'));
    });
  });
};
let currentImg;
createImage('img/img-1.jpg')
  .then(img => {
    currentImg = img;
    console.log('Image loaded');
    return wait(2);
  })
  .then(() => {
    currentImg.style.display = 'none';
    return createImage('img/img-2.jpg');
  })
  .then(img => {
    currentImg = img;
    console.log('Image loaded');
    return wait(2);
  })
  .then(() => {
    currentImg.style.display = 'none';
  })
  .catch(err => console.error(err)); */
