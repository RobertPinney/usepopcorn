import { useState } from "react";
import { useMovies } from "./Utilities/useMovies";
import { useLocalStorageState } from "./Utilities/useLocalStorgageState";
import Box from "./Components/Box";
import ErrorMessage from "./Components/ErrorMessage";
import Loader from "./Components/Loader";
import Logo from "./Components/Logo";
import Main from "./Components/Main";
import MovieList from "./Components/MovieList";
import NavBar from "./Components/NavBar";
import NumResults from "./Components/NumResults";
import Search from "./Components/Search";
import WatchedMoviesList from "./Components/WatchedMoviesList";
import WatchedSummary from "./Components/WatchedSummary";
import MovieDetails from "./Components/MovieDetails";

export const KEY = "dbbf43ec";

export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	const { movies, isLoading, error } = useMovies(query);

	const [watched, setWatched] = useLocalStorageState([], "watched");

	function handleSelectMovie(id) {
		setSelectedId((selectedId) => (id === selectedId ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	return (
		<>
			<NavBar>
				<Logo />
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>
			<Main>
				<Box>
					{/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList
							movies={movies}
							onSelectMovie={handleSelectMovie}
						/>
					)}
					{error && <ErrorMessage message={error} />}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}
