#!/usr/bin/env node

const argv = require('yargs').argv;
const axios = require('axios');
const distanceInWordsToNow = require('date-fns/distance_in_words_to_now');

const [ firstPackage, secondPackage ] = argv._;

if(!firstPackage || !secondPackage) {
  console.log('Please specify package');
  return;
}

console.log('You are comparing', firstPackage, secondPackage);

// Stats to compare
// name, version, description, rating, author, created, modified, downloads, stars, issues, repository, dependencies

const getPackageDetails = package => {
  const url = `https://api.npms.io/v2/package/${package}`;
  return axios.get(url)
    .then(res => {
      if(res.status !== 200) return Promise.reject(res.data.message);
      return res.data;
    })
    .then(data => {
      const package = mapResponseToPackage(data);
      console.log(package);
    })
    .catch(err => {
      console.log(err);
    });
}

const mapResponseToPackage = response => {
  const { metadata: { name, version, description, date, author, links, dependencies },
          npm, github } = response.collected;
  
  const [ daily, weekly, monthly ] = npm.downloads.map(data => data.count);

  const downloads = { daily, weekly, monthly }
  
  const package = { name, version, description, modified: distanceInWordsToNow(date), author: author.name,
                    repository: links.repository, dependencies: Object.keys(dependencies).length,
                    stars: github.starsCount, issues: github.issues.openCount,
                    downloads, rating: formatRating(response.score.final) };
  
  return package;
}

const formatRating = rating => {
  return parseFloat(Math.round(rating*1000)/100).toFixed(2);
}

getPackageDetails(firstPackage)
