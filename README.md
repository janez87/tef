# Task Execution Framework

## Requirements
* [CrowdSearcher][cs-git]
* [node-bunyan][bunyan] installed globally using `npm install -g bunyan`

## Installation
    git clone git clone http://crowdsearcher.search-computing.org/gitlab/crowdsearcher/tef.git TEF
    cd TEF
    npm install -d

## Configuration
All the configuration are stored in the `config/configuration.json` file.
Can be overridden by creating a `config/override.json` file to store needed configuration.

## To run
    npm start

## Problems
Contatc us!

- [Riccardo Volonterio][volox]
- [Andrea Mauri][janez]


[cs-git]: http://crowdsearcher.search-computing.org/ "CrowdSearcher repository"
[cs-doc]: http://crowdsearcher.search-computing.org/software "CrowdSearcher documentation"
[bunyan]: https://github.com/trentm/node-bunyan "Bunyan logger"
[mongo]: http://www.mongodb.org "MongoDB"
[volox]: <mailto:riccardo.volonterio@polimi.it> "Riccardo Volonterio"
[janez]: <mailto:andrea.mauri@polimi.it> "Andrea Mauri"