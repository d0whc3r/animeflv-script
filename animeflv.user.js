// ==UserScript==
// @name         Animeflv pending episodes
// @author       d0whc3r
// @namespace    https://github.com/d0whc3r/animeflv-script
// @description  Get pending episodes in following series
// @copyright    2025, d0whc3r (https://openuserjs.org/users/d0whc3r)
// @license      ISC
// @version      0.2.0

// @homepageURL  https://github.com/d0whc3r/animeflv-script
// @supportURL   https://github.com/d0whc3r/animeflv-script/issues
// @downloadURL  https://github.com/d0whc3r/animeflv-script/raw/refs/heads/master/animeflv.user.js
// @updateURL    https://github.com/d0whc3r/animeflv-script/raw/refs/heads/master/animeflv.user.js

// @include      https://www*.animeflv.net/perfil/*/siguiendo*
// @include      https://www*.animeflv.net/perfil/*/favoritos*
// @include      https://www*.animeflv.net/perfil/*/lista_espera*
// @include      https://animeflv.net/perfil/*/siguiendo*
// @include      https://animeflv.net/perfil/*/favoritos*
// @include      https://animeflv.net/perfil/*/lista_espera*

// @icon         https://www.google.com/s2/favicons?sz=64&domain=animeflv.net
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'

  function extractVariables(script) {
    const context = {}
    const variablePattern = /var\s+(\w+)\s+=\s+([\s\S]+?);/g
    let match
    while ((match = variablePattern.exec(script)) !== null) {
      context[match[1]] = eval(match[2])
    }
    return context
  }

  function getDayOfYear(date) {
    const newDate = new Date(date)
    const startOfYear = new Date(newDate.getFullYear(), 0, 1)
    const differenceInTime = newDate - startOfYear
    const dayOfYear = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)) + 1

    return dayOfYear
  }

  function parseScript(text) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    const scriptContent = Array.from(doc.querySelectorAll('script'))
      .filter(
        (script) =>
          !script.getAttribute('src') &&
          !script.getAttribute('type') &&
          script.textContent.includes(' anime_info '),
      )
      .map((s) => s.textContent)
      .pop()

    const info = extractVariables(scriptContent)

    const nextDate = info.anime_info[3] && new Date(info.anime_info[3])
    const lastEpisode = info.episodes[0][0]
    const totalEpisodes = info.episodes.length
    const lastSeen = info.last_seen
    if (lastEpisode !== lastSeen) {
      title.style.color = 'red'
      title.textContent = `${title.textContent} [${lastEpisode - lastSeen}/${totalEpisodes}]`
    } else if (nextDate && getDayOfYear(nextDate) === getDayOfYear(new Date())) {
      title.style.color = 'green'
    }
  }

  function parseSerie(serie) {
    const title = serie.querySelector('article > h3.Title a')
    let url = title.href
    fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'force-cache',
    })
      .then((response) => response.text())
      .then((text) => {
        parseScript(text)
      })
  }

  function getAllSeries() {
    const series = document.querySelectorAll('ul.ListAnimes.Rows li')
    series.forEach((serie) => parseSerie(serie))
  }

  getAllSeries()
})()
