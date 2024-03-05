import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [seriesSuggestions, setSeriesSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false); // New state for controlling visibility of suggestions

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 2) {
        fetchSuggestions();
      } else {
        setMovieSuggestions([]);
        setSeriesSuggestions([]);
        setShowSuggestions(false); // Hide suggestions when search term is cleared
      }
    }, 500); // Debounce time in milliseconds

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchSuggestions = async () => {
    try {
      const apiKey = import.meta.env.VITE_omdbapikey;
      // const apiKey = process.env.VITE_omdbapikey;
      // console.log(process.env.VITE_omdbapikey);
      const movieResponse = await axios.get(
        `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}&type=movie`
      );
      const seriesResponse = await axios.get(
        `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}&type=series`
      );

      const isMovieResponseValid = movieResponse.data.Response === "True";
      const isSeriesResponseValid = seriesResponse.data.Response === "True";

      if (isMovieResponseValid && isSeriesResponseValid) {
        setMovieSuggestions(movieResponse.data.Search.slice(0, 3));
        setSeriesSuggestions(seriesResponse.data.Search.slice(0, 3));
        setShowSuggestions(true); // Show suggestions when there is a response
      } else {
        setMovieSuggestions([]);
        setSeriesSuggestions([]);
        setShowSuggestions(true); // Show suggestions when there is no response

        let movieErrorMessage = "";
        let seriesErrorMessage = "";

        if (!isMovieResponseValid) {
          movieErrorMessage = movieResponse.data.Error;
        }

        if (!isSeriesResponseValid) {
          seriesErrorMessage = seriesResponse.data.Error;
        }

        setMovieSuggestions([{ Title: movieErrorMessage }]);
        setSeriesSuggestions([{ Title: seriesErrorMessage }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const highlightMatchedWords = (title: string) => {
    const words = searchTerm.split(" ");
    let highlightedTitle = title;

    words.forEach((word) => {
      const regex = new RegExp(word, "gi");
      highlightedTitle = highlightedTitle.replace(
        regex,
        `<strong>${word}</strong>`
      );
    });

    return highlightedTitle;
  };

  return (
    <div className="shadow-lg rounded-lg overflow-hidden bg-white">
      <input
        id="searchbox"
        className="text-xl block w-full appearance-none bg-white placeholder-gray-400 px-4 py-3 rounded-lg outline-none"
        placeholder="Search for movie"
        value={searchTerm}
        onChange={handleChange}
      />
      {showSuggestions && (
        <div
          id="suggestions"
          className="px-2 py-2 border-t text-sm text-gray-800"
        >
          <div className="mb-3">
            <h3 className="text-xs text-gray-600 pl-2 py-1">Movies</h3>
            <ul>
              {movieSuggestions.map((movie: any) => (
                <li key={movie.imdbID}>
                  <a
                    href="#"
                    className="block hover:bg-gray-200 rounded px-2 py-1"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatchedWords(movie.Title),
                    }}
                  />
                </li>
              ))}
            </ul>
            <h3 className="text-xs text-gray-600 pl-2 py-1">TV Shows</h3>
            <ul>
              {seriesSuggestions.map((series: any) => (
                <li key={series.imdbID}>
                  <a
                    href="#"
                    className="block hover:bg-gray-200 rounded px-2 py-1"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatchedWords(series.Title),
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
