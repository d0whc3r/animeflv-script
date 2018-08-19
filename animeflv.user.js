// ==UserScript==
// @name         Animeflv pending episodes
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Get pending episodes in following series
// @author       d0whc3r
// @copyright 2018, d0whc3r (https://github.com/d0whc3r)
// @license MIT
// @match        https://animeflv.net/perfil/*/siguiendo
// @grant        none
// @require https://momentjs.com/downloads/moment.js
// ==/UserScript==

(function() {
    'use strict';

    function parseInfo(data) {
        const result = /<script type="text\/javascript">([\s\S]+?)(var anime_info[\s\S]+?)<\/script>/.exec(data);
        const variables = result[2]
        .replace(/\n/g, '')
        .replace(/  /g, '')
        .match(/(var (.*) = (.*))+/g);
        const info = {};
        variables
            .map((cont) => cont.match(/var (.*) = (.*);/))
            .forEach((cont) => {
            let name = cont[1];
            let value = cont[2];
            info[name] = JSON.parse(value);
        });
        return info;
    }

    function getAllSeries() {
        const series = $('ul.ListAnimes.Rows li').toArray();
        series.forEach((serie) => {
            const title = $('article > h3.Title a', serie);
            let url = title[0].href;
            $.ajax({
                url,
                async: true,
                cache: true,
                dataType: 'html',
                method: 'GET',
                success: function(data) {
                    let info = parseInfo(data);
                    const nextDate = moment(info.anime_info[3]);
                    const lastEpisode = parseInt(info.episodes[0][0]);
                    const totalEpisodes = info.episodes.length;
                    const lastSeen = parseInt(info.last_seen);
                    if (lastEpisode !== lastSeen) {
                        title.attr({style: 'color: red'});
                        const text = title.text();
                        title.text(`${text} [${lastEpisode - lastSeen}/${totalEpisodes}]`);
                    } else if (moment().dayOfYear() === nextDate.dayOfYear()) {
                        title.attr({style: 'color: green'});
                    }
                },
            });

        });
    }

    function init() {
        getAllSeries();
    }

    init();
})();
