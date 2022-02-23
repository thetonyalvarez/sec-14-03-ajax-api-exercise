// http://api.tvmaze.com/search/shows?q=<search query>
// http://api.tvmaze.com/shows/<show id>/episodes

// Example:
// http://api.tvmaze.com/search/shows?q=joker
// http://api.tvmaze.com/shows/1139/episodes

const searchShowsApi = "http://api.tvmaze.com/search/shows";
const showsApi = "http://api.tvmaze.com/shows";

const missing_image = "https://tinyurl.com/tv-missing";

/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
const searchShows = async (query) => {
	let res = await axios.get(searchShowsApi, { params: { q: query } });

	let shows = res.data.map((item) => {
		let { id, name, summary, image } = item.show;
		return {
			id,
			name,
			summary,
			image: image ? image.original : missing_image,
		};
	});

	return shows;
};

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

const populateShows = (shows) => {
	const $showsList = $("#shows-list");
	$showsList.empty();

	for (let show of shows) {
		let $item = $(
			`<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
        <div class="card" data-show-id="${show.id}">
          <img class="card-img-top" src="${show.image}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">${show.summary}</p>
          </div>
          <button class="btn btn-primary show-episodes">Episodes</button>
        </div>
      </div>`
		);

		$showsList.append($item);
	}
};

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on(
	"submit",
	(handleSearch = async (evt) => {
		evt.preventDefault();

		let query = $("#search-query").val();
		if (!query) return;

		$("#episodes-area").hide();

		let shows = await searchShows(query);

		populateShows(shows);
	})
);

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

const getEpisodes = async (id) => {
	// get episodes from tvmaze
	let res = await axios.get(showsApi + "/" + id + "/episodes");
	let episodes = res.data.map((result) => {
		let { id, name, season, number } = result;
		return {
			id,
			name,
			season,
			number,
		};
	});

	//       you can get this by making GET request to
	//       http://api.tvmaze.com/shows/SHOW-ID-HERE/episodes

	// return array-of-episode-info, as described in docstring above

	return episodes;
};

const populateEpisodes = async (episodes) => {
	const $episodesList = $("#episodes-list");
	$episodesList.empty();

	for (let episode of episodes) {
		let $episode = $(
			`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`
		);

		$episodesList.append($episode);
	}
	$("#episodes-area").show();
};

$("#shows-list").on(
	"click",
	".show-episodes",
	(handleEpisodeClick = async (e) => {
		let showId = e.target.closest(".Show").dataset.showId;
		let episodes = await getEpisodes(showId);
		populateEpisodes(episodes);
	})
);
