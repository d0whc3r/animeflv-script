// ==UserScript==
// @author d0whc3r
// @namespace     https://openuserjs.org/users/d0whc3r
// @name          Animeflv pending episodes
// @description   Get pending episodes in following series
// @copyright     2018, d0whc3r (https://openuserjs.org/users/d0whc3r)
// @license       MIT
// @version       0.1.2
// @include       https://animeflv.net/perfil/*/siguiendo*
// @include       https://animeflv.net/perfil/*/favoritos*
// @include       https://animeflv.net/perfil/*/lista_espera*
// @grant none
// @require https://momentjs.com/downloads/moment.js
// ==/UserScript==

// ==OpenUserJS==
// @author d0whc3r
// ==/OpenUserJS==

(function () {
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
                success: function (data) {
                    let info = parseInfo(data);
                    const nextDate = info.anime_info[3] && moment(info.anime_info[3]);
                    const lastEpisode = parseInt(info.episodes[0][0]);
                    const totalEpisodes = info.episodes.length;
                    const lastSeen = parseInt(info.last_seen);
                    if (lastEpisode !== lastSeen) {
                        title.attr({
                            style: 'color: red'
                        });
                        const text = title.text();
                        title.text(`${text} [${lastEpisode - lastSeen}/${totalEpisodes}]`);
                    } else if (nextDate && moment().dayOfYear() === nextDate.dayOfYear()) {
                        title.attr({
                            style: 'color: green'
                        });
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
